<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class EmailCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'template_id',
        'recipients',
        'variables',
        'status',
        'scheduled_at',
        'sent_at',
        'total_recipients',
        'sent_count',
        'failed_count',
        'created_by',
    ];

    protected $casts = [
        'recipients' => 'array',
        'variables' => 'array',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    // Relationships
    public function template(): BelongsTo
    {
        return $this->belongsTo(EmailTemplate::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function emailMessages(): HasMany
    {
        return $this->hasMany(EmailMessage::class, 'campaign_id');
    }

    // Accessors
    protected function isDraft(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'draft'
        );
    }

    protected function isScheduled(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'scheduled'
        );
    }

    protected function isSending(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'sending'
        );
    }

    protected function isSent(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'sent'
        );
    }

    protected function isFailed(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'failed'
        );
    }

    protected function deliveryRate(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->total_recipients > 0 
                ? ($this->sent_count / $this->total_recipients) * 100 
                : 0
        );
    }

    protected function failureRate(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->total_recipients > 0 
                ? ($this->failed_count / $this->total_recipients) * 100 
                : 0
        );
    }

    // Scopes
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeSending($query)
    {
        return $query->where('status', 'sending');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('created_by', $userId);
    }

    public function scopeReadyToSend($query)
    {
        return $query->where('status', 'scheduled')
                    ->where('scheduled_at', '<=', now());
    }

    // Methods
    public function canBeEdited(): bool
    {
        return in_array($this->status, ['draft', 'scheduled']);
    }

    public function canBeDeleted(): bool
    {
        return in_array($this->status, ['draft', 'failed']);
    }

    public function canBeSent(): bool
    {
        return $this->status === 'draft' && !empty($this->recipients);
    }

    public function schedule(\DateTime $scheduledAt): bool
    {
        if (!$this->canBeSent()) {
            return false;
        }

        return $this->update([
            'status' => 'scheduled',
            'scheduled_at' => $scheduledAt,
        ]);
    }

    public function send(): bool
    {
        if (!$this->canBeSent() && !$this->is_scheduled) {
            return false;
        }

        $this->update([
            'status' => 'sending',
            'total_recipients' => count($this->recipients),
        ]);

        // Queue campaign for sending
        \App\Jobs\SendEmailCampaign::dispatch($this);

        return true;
    }

    public function markAsSent(): bool
    {
        return $this->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    public function markAsFailed(string $reason = null): bool
    {
        return $this->update([
            'status' => 'failed',
            'failure_reason' => $reason,
        ]);
    }

    public function incrementSentCount(): void
    {
        $this->increment('sent_count');
    }

    public function incrementFailedCount(): void
    {
        $this->increment('failed_count');
    }

    public function getProgress(): array
    {
        return [
            'total' => $this->total_recipients,
            'sent' => $this->sent_count,
            'failed' => $this->failed_count,
            'remaining' => $this->total_recipients - $this->sent_count - $this->failed_count,
            'percentage' => $this->total_recipients > 0 
                ? (($this->sent_count + $this->failed_count) / $this->total_recipients) * 100 
                : 0,
        ];
    }

    public function getStats(): array
    {
        $messages = $this->emailMessages()->get();
        
        return [
            'total_sent' => $this->sent_count,
            'total_failed' => $this->failed_count,
            'delivery_rate' => $this->delivery_rate,
            'failure_rate' => $this->failure_rate,
            'open_rate' => $messages->count() > 0 
                ? ($messages->where('opened_at', '!=', null)->count() / $messages->count()) * 100 
                : 0,
            'click_rate' => $messages->count() > 0 
                ? ($messages->where('clicked_at', '!=', null)->count() / $messages->count()) * 100 
                : 0,
            'unique_opens' => $messages->whereNotNull('opened_at')->count(),
            'unique_clicks' => $messages->whereNotNull('clicked_at')->count(),
            'total_opens' => $messages->sum('open_count'),
            'total_clicks' => $messages->sum('click_count'),
        ];
    }

    public function duplicate(string $newName = null): self
    {
        $newCampaign = $this->replicate();
        $newCampaign->name = $newName ?: $this->name . ' (Copy)';
        $newCampaign->status = 'draft';
        $newCampaign->scheduled_at = null;
        $newCampaign->sent_at = null;
        $newCampaign->total_recipients = 0;
        $newCampaign->sent_count = 0;
        $newCampaign->failed_count = 0;
        $newCampaign->save();

        return $newCampaign;
    }

    public function preview(array $sampleVariables = []): array
    {
        if (!$this->template) {
            return ['error' => 'No template associated with this campaign'];
        }

        $variables = array_merge($this->variables ?? [], $sampleVariables);
        return $this->template->render($variables);
    }
}
