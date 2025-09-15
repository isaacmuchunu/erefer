<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\SoftDeletes;

class Communication extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'referral_id',
        'sender_id',
        'receiver_id',
        'sender_facility_id',
        'receiver_facility_id',
        'type',
        'subject',
        'message',
        'attachments',
        'priority',
        'is_read',
        'read_at',
        'requires_response',
        'response_deadline',
    ];

    protected $casts = [
        'attachments' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'requires_response' => 'boolean',
        'response_deadline' => 'datetime',
    ];

    // Accessors & Mutators
    protected function isUnread(): Attribute
    {
        return Attribute::make(
            get: fn () => !$this->is_read
        );
    }

    protected function isUrgent(): Attribute
    {
        return Attribute::make(
            get: fn () => in_array($this->priority, ['high', 'urgent'])
        );
    }

    protected function isOverdue(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->requires_response && 
                $this->response_deadline && 
                $this->response_deadline < now() && 
                !$this->is_read
        );
    }

    // Relationships
    public function referral(): BelongsTo
    {
        return $this->belongsTo(Referral::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function senderFacility(): BelongsTo
    {
        return $this->belongsTo(Facility::class, 'sender_facility_id');
    }

    public function receiverFacility(): BelongsTo
    {
        return $this->belongsTo(Facility::class, 'receiver_facility_id');
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeUrgent($query)
    {
        return $query->whereIn('priority', ['high', 'urgent']);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('receiver_id', $userId)
            ->orWhere('sender_id', $userId);
    }

    public function scopeForFacility($query, int $facilityId)
    {
        return $query->where('sender_facility_id', $facilityId)
            ->orWhere('receiver_facility_id', $facilityId);
    }

    public function scopeOverdue($query)
    {
        return $query->where('requires_response', true)
            ->where('response_deadline', '<', now())
            ->where('is_read', false);
    }

    // Methods
    public function markAsRead(): bool
    {
        return $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    public function hasAttachments(): bool
    {
        return !empty($this->attachments);
    }
}
?>
