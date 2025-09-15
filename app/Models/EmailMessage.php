<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmailMessage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'message_id',
        'sender_id',
        'sender_email',
        'sender_name',
        'recipients',
        'subject',
        'body_html',
        'body_text',
        'attachments',
        'headers',
        'type',
        'status',
        'failure_reason',
        'campaign_id',
        'template_id',
        'referral_id',
        'sent_at',
        'delivered_at',
        'opened_at',
        'clicked_at',
        'open_count',
        'click_count',
    ];

    protected $casts = [
        'recipients' => 'array',
        'attachments' => 'array',
        'headers' => 'array',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'opened_at' => 'datetime',
        'clicked_at' => 'datetime',
    ];

    // Relationships
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(EmailCampaign::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(EmailTemplate::class);
    }

    public function referral(): BelongsTo
    {
        return $this->belongsTo(Referral::class);
    }

    public function emailAttachments(): HasMany
    {
        return $this->hasMany(EmailAttachment::class);
    }

    public function trackingEvents(): HasMany
    {
        return $this->hasMany(EmailTrackingEvent::class);
    }

    public function folders(): BelongsToMany
    {
        return $this->belongsToMany(EmailFolder::class, 'email_message_folders')
                    ->withPivot('user_id')
                    ->withTimestamps();
    }

    // Accessors
    protected function isOutbound(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->type === 'outbound'
        );
    }

    protected function isInbound(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->type === 'inbound'
        );
    }

    protected function isSent(): Attribute
    {
        return Attribute::make(
            get: fn () => in_array($this->status, ['sent', 'delivered'])
        );
    }

    protected function isDelivered(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'delivered'
        );
    }

    protected function isOpened(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->opened_at !== null
        );
    }

    protected function isClicked(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->clicked_at !== null
        );
    }

    protected function hasAttachments(): Attribute
    {
        return Attribute::make(
            get: fn () => !empty($this->attachments) || $this->emailAttachments()->exists()
        );
    }

    protected function recipientEmails(): Attribute
    {
        return Attribute::make(
            get: fn () => array_merge(
                $this->recipients['to'] ?? [],
                $this->recipients['cc'] ?? [],
                $this->recipients['bcc'] ?? []
            )
        );
    }

    protected function primaryRecipient(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->recipients['to'][0] ?? null
        );
    }

    // Scopes
    public function scopeOutbound($query)
    {
        return $query->where('type', 'outbound');
    }

    public function scopeInbound($query)
    {
        return $query->where('type', 'inbound');
    }

    public function scopeSent($query)
    {
        return $query->whereIn('status', ['sent', 'delivered']);
    }

    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    public function scopeFailed($query)
    {
        return $query->whereIn('status', ['failed', 'bounced']);
    }

    public function scopeOpened($query)
    {
        return $query->whereNotNull('opened_at');
    }

    public function scopeClicked($query)
    {
        return $query->whereNotNull('clicked_at');
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('sender_id', $userId)
              ->orWhereHas('folders', function ($folderQuery) use ($userId) {
                  $folderQuery->where('email_message_folders.user_id', $userId);
              });
        });
    }

    public function scopeInFolder($query, int $folderId, int $userId)
    {
        return $query->whereHas('folders', function ($q) use ($folderId, $userId) {
            $q->where('email_folders.id', $folderId)
              ->where('email_message_folders.user_id', $userId);
        });
    }

    public function scopeWithSubject($query, string $subject)
    {
        return $query->where('subject', 'like', "%{$subject}%");
    }

    public function scopeFromEmail($query, string $email)
    {
        return $query->where('sender_email', 'like', "%{$email}%");
    }

    public function scopeToEmail($query, string $email)
    {
        return $query->whereJsonContains('recipients->to', $email);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Methods
    public function markAsOpened(string $userAgent = null, string $ipAddress = null): void
    {
        if (!$this->opened_at) {
            $this->update(['opened_at' => now()]);
        }

        $this->increment('open_count');

        $this->trackingEvents()->create([
            'event_type' => 'opened',
            'recipient_email' => $this->primary_recipient,
            'event_data' => [
                'user_agent' => $userAgent,
                'ip_address' => $ipAddress,
            ],
            'user_agent' => $userAgent,
            'ip_address' => $ipAddress,
            'occurred_at' => now(),
        ]);
    }

    public function markAsClicked(string $url, string $userAgent = null, string $ipAddress = null): void
    {
        if (!$this->clicked_at) {
            $this->update(['clicked_at' => now()]);
        }

        $this->increment('click_count');

        $this->trackingEvents()->create([
            'event_type' => 'clicked',
            'recipient_email' => $this->primary_recipient,
            'event_data' => [
                'url' => $url,
                'user_agent' => $userAgent,
                'ip_address' => $ipAddress,
            ],
            'user_agent' => $userAgent,
            'ip_address' => $ipAddress,
            'occurred_at' => now(),
        ]);
    }

    public function markAsDelivered(): void
    {
        $this->update([
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);

        $this->trackingEvents()->create([
            'event_type' => 'delivered',
            'recipient_email' => $this->primary_recipient,
            'occurred_at' => now(),
        ]);
    }

    public function markAsFailed(string $reason): void
    {
        $this->update([
            'status' => 'failed',
            'failure_reason' => $reason,
        ]);

        $this->trackingEvents()->create([
            'event_type' => 'failed',
            'recipient_email' => $this->primary_recipient,
            'event_data' => ['reason' => $reason],
            'occurred_at' => now(),
        ]);
    }

    public function addToFolder(EmailFolder $folder, User $user): void
    {
        $this->folders()->syncWithoutDetaching([
            $folder->id => ['user_id' => $user->id]
        ]);
    }

    public function removeFromFolder(EmailFolder $folder, User $user): void
    {
        $this->folders()->wherePivot('user_id', $user->id)->detach($folder->id);
    }

    public function getTrackingPixelUrl(): string
    {
        return route('email.tracking.pixel', [
            'message' => $this->id,
            'token' => hash('sha256', $this->message_id . config('app.key'))
        ]);
    }

    public function getClickTrackingUrl(string $originalUrl): string
    {
        return route('email.tracking.click', [
            'message' => $this->id,
            'url' => base64_encode($originalUrl),
            'token' => hash('sha256', $this->message_id . $originalUrl . config('app.key'))
        ]);
    }

    public function canBeAccessedBy(User $user): bool
    {
        // Check if user is sender
        if ($this->sender_id === $user->id) {
            return true;
        }

        // Check if user has access through folders
        return $this->folders()
            ->wherePivot('user_id', $user->id)
            ->exists();
    }

    public function reply(array $data): self
    {
        return self::create([
            'sender_id' => $data['sender_id'],
            'sender_email' => $data['sender_email'],
            'sender_name' => $data['sender_name'] ?? null,
            'recipients' => [
                'to' => [$this->sender_email],
                'cc' => $data['cc'] ?? [],
                'bcc' => $data['bcc'] ?? []
            ],
            'subject' => 'Re: ' . $this->subject,
            'body_html' => $data['body_html'],
            'body_text' => $data['body_text'] ?? null,
            'type' => 'outbound',
            'status' => 'draft',
            'referral_id' => $this->referral_id,
        ]);
    }
}
