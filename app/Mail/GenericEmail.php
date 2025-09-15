<?php

namespace App\Mail;

use App\Models\EmailMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

class GenericEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public EmailMessage $emailMessage;

    /**
     * Create a new message instance.
     */
    public function __construct(EmailMessage $emailMessage)
    {
        $this->emailMessage = $emailMessage;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $recipients = $this->emailMessage->recipients;
        
        $envelope = Envelope::make(
            from: new Address(
                $this->emailMessage->sender_email,
                $this->emailMessage->sender_name
            ),
            subject: $this->emailMessage->subject,
        );

        // Add recipients
        if (!empty($recipients['to'])) {
            $envelope->to($recipients['to']);
        }

        if (!empty($recipients['cc'])) {
            $envelope->cc($recipients['cc']);
        }

        if (!empty($recipients['bcc'])) {
            $envelope->bcc($recipients['bcc']);
        }

        return $envelope;
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            html: 'emails.generic-html',
            text: 'emails.generic-text',
            with: [
                'emailMessage' => $this->emailMessage,
                'bodyHtml' => $this->emailMessage->body_html,
                'bodyText' => $this->emailMessage->body_text,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $attachments = [];

        foreach ($this->emailMessage->emailAttachments as $attachment) {
            $attachments[] = Attachment::fromStorageDisk('private', $attachment->storage_path)
                ->as($attachment->original_filename)
                ->withMime($attachment->mime_type);
        }

        return $attachments;
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        $this->emailMessage->markAsFailed($exception->getMessage());
    }
}
