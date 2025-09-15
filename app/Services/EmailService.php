<?php

namespace App\Services;

use App\Models\EmailMessage;
use App\Models\EmailTemplate;
use App\Models\EmailFolder;
use App\Models\EmailAttachment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EmailService
{
    public function sendEmail(array $data): EmailMessage
    {
        // Create email message record
        $email = EmailMessage::create([
            'message_id' => Str::uuid(),
            'sender_id' => $data['sender_id'],
            'sender_email' => User::find($data['sender_id'])->email,
            'sender_name' => User::find($data['sender_id'])->full_name,
            'recipients' => $data['recipients'],
            'subject' => $data['subject'],
            'body_html' => $data['body_html'],
            'body_text' => $data['body_text'] ?? strip_tags($data['body_html']),
            'type' => 'outbound',
            'status' => isset($data['send_at']) ? 'scheduled' : 'queued',
            'template_id' => $data['template_id'] ?? null,
            'referral_id' => $data['referral_id'] ?? null,
        ]);

        // Handle attachments
        if (!empty($data['attachments'])) {
            foreach ($data['attachments'] as $file) {
                $this->attachFile($email, $file);
            }
        }

        // Add tracking pixels and click tracking
        $email->body_html = $this->addTrackingToHtml($email, $email->body_html);
        $email->save();

        // Send email immediately or schedule
        if (isset($data['send_at'])) {
            // Schedule email for later
            $this->scheduleEmail($email, $data['send_at']);
        } else {
            // Send immediately
            $this->dispatchEmail($email);
        }

        // Add to sender's sent folder
        $this->addToSentFolder($email);

        return $email;
    }

    public function replyToEmail(EmailMessage $originalEmail, array $data): EmailMessage
    {
        $sender = auth()->user();
        
        $replyData = [
            'sender_id' => $sender->id,
            'recipients' => [
                'to' => [$originalEmail->sender_email],
                'cc' => $data['cc'] ?? [],
                'bcc' => $data['bcc'] ?? []
            ],
            'subject' => 'Re: ' . preg_replace('/^Re:\s*/', '', $originalEmail->subject),
            'body_html' => $data['body_html'],
            'body_text' => $data['body_text'] ?? strip_tags($data['body_html']),
            'referral_id' => $originalEmail->referral_id,
        ];

        // Include original message if requested
        if ($data['include_original'] ?? true) {
            $replyData['body_html'] .= $this->buildOriginalMessageHtml($originalEmail);
        }

        return $this->sendEmail($replyData);
    }

    public function forwardEmail(EmailMessage $originalEmail, array $data): EmailMessage
    {
        $sender = auth()->user();
        
        $forwardData = [
            'sender_id' => $sender->id,
            'recipients' => [
                'to' => $data['to'],
                'cc' => $data['cc'] ?? [],
                'bcc' => $data['bcc'] ?? []
            ],
            'subject' => 'Fwd: ' . $originalEmail->subject,
            'body_html' => ($data['body_html'] ?? '') . $this->buildForwardedMessageHtml($originalEmail),
            'body_text' => $data['body_text'] ?? null,
            'referral_id' => $originalEmail->referral_id,
        ];

        $forwardedEmail = $this->sendEmail($forwardData);

        // Copy attachments from original email
        foreach ($originalEmail->emailAttachments as $attachment) {
            $this->copyAttachment($attachment, $forwardedEmail);
        }

        return $forwardedEmail;
    }

    public function receiveEmail(array $webhookData): EmailMessage
    {
        // Process incoming email from webhook (e.g., from email provider)
        $email = EmailMessage::create([
            'message_id' => $webhookData['message_id'],
            'sender_email' => $webhookData['from']['email'],
            'sender_name' => $webhookData['from']['name'] ?? null,
            'recipients' => [
                'to' => $webhookData['to'] ?? [],
                'cc' => $webhookData['cc'] ?? [],
                'bcc' => $webhookData['bcc'] ?? []
            ],
            'subject' => $webhookData['subject'],
            'body_html' => $webhookData['html'] ?? null,
            'body_text' => $webhookData['text'] ?? null,
            'headers' => $webhookData['headers'] ?? [],
            'type' => 'inbound',
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);

        // Handle attachments
        if (!empty($webhookData['attachments'])) {
            foreach ($webhookData['attachments'] as $attachmentData) {
                $this->createAttachmentFromWebhook($email, $attachmentData);
            }
        }

        // Add to inbox folders for recipients
        $this->addToInboxFolders($email);

        // Auto-assign to referral if email contains referral reference
        $this->autoAssignToReferral($email);

        return $email;
    }

    private function attachFile(EmailMessage $email, UploadedFile $file): EmailAttachment
    {
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('email-attachments', $filename, 'private');

        return EmailAttachment::create([
            'email_message_id' => $email->id,
            'filename' => $filename,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
            'storage_path' => $path,
        ]);
    }

    private function copyAttachment(EmailAttachment $originalAttachment, EmailMessage $newEmail): EmailAttachment
    {
        $newFilename = Str::uuid() . '.' . pathinfo($originalAttachment->original_filename, PATHINFO_EXTENSION);
        $newPath = 'email-attachments/' . $newFilename;

        // Copy file
        Storage::disk('private')->copy($originalAttachment->storage_path, $newPath);

        return EmailAttachment::create([
            'email_message_id' => $newEmail->id,
            'filename' => $newFilename,
            'original_filename' => $originalAttachment->original_filename,
            'mime_type' => $originalAttachment->mime_type,
            'size_bytes' => $originalAttachment->size_bytes,
            'storage_path' => $newPath,
        ]);
    }

    private function addTrackingToHtml(EmailMessage $email, string $html): string
    {
        // Add tracking pixel
        $trackingPixel = '<img src="' . $email->getTrackingPixelUrl() . '" width="1" height="1" style="display:none;" />';
        
        // Add click tracking to links
        $html = preg_replace_callback(
            '/<a\s+([^>]*href=["\']([^"\']+)["\'][^>]*)>/i',
            function ($matches) use ($email) {
                $originalUrl = $matches[2];
                $trackedUrl = $email->getClickTrackingUrl($originalUrl);
                return '<a ' . str_replace($originalUrl, $trackedUrl, $matches[1]) . '>';
            },
            $html
        );

        // Insert tracking pixel before closing body tag
        if (strpos($html, '</body>') !== false) {
            $html = str_replace('</body>', $trackingPixel . '</body>', $html);
        } else {
            $html .= $trackingPixel;
        }

        return $html;
    }

    private function buildOriginalMessageHtml(EmailMessage $originalEmail): string
    {
        return '<br><br><div style="border-left: 3px solid #ccc; padding-left: 10px; margin-top: 20px;">' .
               '<p><strong>From:</strong> ' . $originalEmail->sender_name . ' &lt;' . $originalEmail->sender_email . '&gt;</p>' .
               '<p><strong>Date:</strong> ' . $originalEmail->created_at->format('M j, Y \a\t g:i A') . '</p>' .
               '<p><strong>Subject:</strong> ' . $originalEmail->subject . '</p>' .
               '<br>' . $originalEmail->body_html . '</div>';
    }

    private function buildForwardedMessageHtml(EmailMessage $originalEmail): string
    {
        return '<br><br><div style="border: 1px solid #ccc; padding: 10px; margin-top: 20px;">' .
               '<p><strong>---------- Forwarded message ----------</strong></p>' .
               '<p><strong>From:</strong> ' . $originalEmail->sender_name . ' &lt;' . $originalEmail->sender_email . '&gt;</p>' .
               '<p><strong>Date:</strong> ' . $originalEmail->created_at->format('M j, Y \a\t g:i A') . '</p>' .
               '<p><strong>Subject:</strong> ' . $originalEmail->subject . '</p>' .
               '<p><strong>To:</strong> ' . implode(', ', $originalEmail->recipients['to'] ?? []) . '</p>' .
               '<br>' . $originalEmail->body_html . '</div>';
    }

    private function dispatchEmail(EmailMessage $email): void
    {
        // Queue email for sending
        Mail::queue(new \App\Mail\GenericEmail($email));
        
        $email->update([
            'status' => 'queued',
            'sent_at' => now()
        ]);
    }

    private function scheduleEmail(EmailMessage $email, string $sendAt): void
    {
        // Schedule email for later sending
        Mail::later(
            \Carbon\Carbon::parse($sendAt),
            new \App\Mail\GenericEmail($email)
        );
    }

    private function addToSentFolder(EmailMessage $email): void
    {
        $user = User::find($email->sender_id);
        $sentFolder = EmailFolder::where('user_id', $user->id)
            ->where('type', 'sent')
            ->first();

        if ($sentFolder) {
            $email->addToFolder($sentFolder, $user);
        }
    }

    private function addToInboxFolders(EmailMessage $email): void
    {
        $recipientEmails = $email->recipient_emails;
        
        foreach ($recipientEmails as $recipientEmail) {
            $user = User::where('email', $recipientEmail)->first();
            if ($user) {
                $inboxFolder = EmailFolder::where('user_id', $user->id)
                    ->where('type', 'inbox')
                    ->first();

                if ($inboxFolder) {
                    $email->addToFolder($inboxFolder, $user);
                }
            }
        }
    }

    private function autoAssignToReferral(EmailMessage $email): void
    {
        // Look for referral ID in subject or body
        $content = $email->subject . ' ' . $email->body_text;
        
        if (preg_match('/REF-(\d+)/', $content, $matches)) {
            $referralId = $matches[1];
            $referral = \App\Models\Referral::find($referralId);
            
            if ($referral) {
                $email->update(['referral_id' => $referral->id]);
            }
        }
    }

    private function createAttachmentFromWebhook(EmailMessage $email, array $attachmentData): EmailAttachment
    {
        $filename = Str::uuid() . '.' . pathinfo($attachmentData['filename'], PATHINFO_EXTENSION);
        $path = 'email-attachments/' . $filename;

        // Download and store attachment
        $content = base64_decode($attachmentData['content']);
        Storage::disk('private')->put($path, $content);

        return EmailAttachment::create([
            'email_message_id' => $email->id,
            'filename' => $filename,
            'original_filename' => $attachmentData['filename'],
            'mime_type' => $attachmentData['content_type'],
            'size_bytes' => strlen($content),
            'storage_path' => $path,
            'content_id' => $attachmentData['content_id'] ?? null,
            'is_inline' => $attachmentData['is_inline'] ?? false,
        ]);
    }

    public function getEmailStats(int $userId, int $days = 30): array
    {
        $user = User::find($userId);
        
        return [
            'total_sent' => EmailMessage::where('sender_id', $userId)->count(),
            'total_received' => EmailMessage::forUser($userId)->inbound()->count(),
            'recent_sent' => EmailMessage::where('sender_id', $userId)->recent($days)->count(),
            'recent_received' => EmailMessage::forUser($userId)->inbound()->recent($days)->count(),
            'open_rate' => $this->calculateOpenRate($userId, $days),
            'click_rate' => $this->calculateClickRate($userId, $days),
        ];
    }

    private function calculateOpenRate(int $userId, int $days): float
    {
        $sentEmails = EmailMessage::where('sender_id', $userId)->recent($days)->count();
        $openedEmails = EmailMessage::where('sender_id', $userId)->recent($days)->opened()->count();
        
        return $sentEmails > 0 ? ($openedEmails / $sentEmails) * 100 : 0;
    }

    private function calculateClickRate(int $userId, int $days): float
    {
        $sentEmails = EmailMessage::where('sender_id', $userId)->recent($days)->count();
        $clickedEmails = EmailMessage::where('sender_id', $userId)->recent($days)->clicked()->count();
        
        return $sentEmails > 0 ? ($clickedEmails / $sentEmails) * 100 : 0;
    }
}
