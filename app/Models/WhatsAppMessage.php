<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\SoftDeletes;

class WhatsAppMessage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'conversation_id',
        'message_id',
        'wamid',
        'direction',
        'type',
        'content',
        'status',
        'error_message',
        'template_id',
        'sender_id',
        'sent_at',
        'delivered_at',
        'read_at',
        'metadata',
    ];

    protected $casts = [
        'content' => 'array',
        'metadata' => 'array',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
    ];

    // Relationships
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(WhatsAppConversation::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(WhatsAppTemplate::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function media(): HasMany
    {
        return $this->hasMany(WhatsAppMedia::class, 'message_id');
    }

    // Accessors
    protected function isInbound(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->direction === 'inbound'
        );
    }

    protected function isOutbound(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->direction === 'outbound'
        );
    }

    protected function isSent(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'sent'
        );
    }

    protected function isDelivered(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'delivered'
        );
    }

    protected function isRead(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'read'
        );
    }

    protected function isFailed(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'failed'
        );
    }

    protected function hasMedia(): Attribute
    {
        return Attribute::make(
            get: fn () => in_array($this->type, ['image', 'video', 'audio', 'document']) || $this->media()->exists()
        );
    }

    protected function messageText(): Attribute
    {
        return Attribute::make(
            get: fn () => match ($this->type) {
                'text' => $this->content['text'] ?? '',
                'image', 'video', 'audio', 'document' => $this->content['caption'] ?? '',
                'location' => $this->content['name'] ?? 'Location shared',
                'contact' => 'Contact shared',
                'template' => $this->getTemplateText(),
                default => 'Message',
            }
        );
    }

    // Scopes
    public function scopeInbound($query)
    {
        return $query->where('direction', 'inbound');
    }

    public function scopeOutbound($query)
    {
        return $query->where('direction', 'outbound');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    public function scopeRead($query)
    {
        return $query->where('status', 'read');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeWithMedia($query)
    {
        return $query->whereIn('type', ['image', 'video', 'audio', 'document']);
    }

    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('created_at', '>=', now()->subHours($hours));
    }

    // Methods
    public function markAsDelivered(): void
    {
        $this->update([
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);
    }

    public function markAsRead(): void
    {
        $this->update([
            'status' => 'read',
            'read_at' => now(),
        ]);
    }

    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
        ]);
    }

    public function getTemplateText(): string
    {
        if (!$this->template) {
            return 'Template message';
        }

        // Simple template rendering - in production you'd want more sophisticated logic
        $text = $this->template->name;
        
        if (!empty($this->content['variables'])) {
            foreach ($this->content['variables'] as $index => $variable) {
                $text = str_replace("{{$index}}", $variable, $text);
            }
        }

        return $text;
    }

    public function getMediaUrl(): ?string
    {
        if (!$this->has_media) {
            return null;
        }

        $mediaRecord = $this->media()->first();
        if ($mediaRecord && $mediaRecord->storage_path) {
            return route('whatsapp.media.download', $mediaRecord->id);
        }

        return $this->content['media_url'] ?? null;
    }

    public function getMediaThumbnail(): ?string
    {
        if ($this->type !== 'image') {
            return null;
        }

        $mediaRecord = $this->media()->first();
        if ($mediaRecord) {
            return route('whatsapp.media.thumbnail', $mediaRecord->id);
        }

        return null;
    }

    public function canBeDeletedBy(User $user): bool
    {
        // Only sender can delete their own messages within 24 hours
        if ($this->sender_id !== $user->id) {
            return false;
        }

        if ($this->created_at < now()->subHours(24)) {
            return false;
        }

        return true;
    }

    public function getStatusIcon(): string
    {
        return match ($this->status) {
            'sent' => 'fa-check',
            'delivered' => 'fa-check-double',
            'read' => 'fa-check-double text-blue-500',
            'failed' => 'fa-exclamation-triangle text-red-500',
            default => 'fa-clock',
        };
    }

    public function getTypeIcon(): string
    {
        return match ($this->type) {
            'text' => 'fa-comment',
            'image' => 'fa-image',
            'video' => 'fa-video',
            'audio' => 'fa-microphone',
            'document' => 'fa-file',
            'location' => 'fa-map-marker-alt',
            'contact' => 'fa-address-card',
            'template' => 'fa-template',
            default => 'fa-message',
        };
    }

    public function toArray(): array
    {
        return array_merge(parent::toArray(), [
            'message_text' => $this->message_text,
            'has_media' => $this->has_media,
            'media_url' => $this->getMediaUrl(),
            'media_thumbnail' => $this->getMediaThumbnail(),
            'status_icon' => $this->getStatusIcon(),
            'type_icon' => $this->getTypeIcon(),
            'is_inbound' => $this->is_inbound,
            'is_outbound' => $this->is_outbound,
            'is_sent' => $this->is_sent,
            'is_delivered' => $this->is_delivered,
            'is_read' => $this->is_read,
            'is_failed' => $this->is_failed,
        ]);
    }
}
