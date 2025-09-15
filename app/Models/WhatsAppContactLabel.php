<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class WhatsAppContactLabel extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_account_id',
        'name',
        'color',
        'description',
    ];

    // Relationships
    public function businessAccount(): BelongsTo
    {
        return $this->belongsTo(WhatsAppBusinessAccount::class);
    }

    public function conversations(): BelongsToMany
    {
        return $this->belongsToMany(WhatsAppConversation::class, 'whatsapp_conversation_labels', 'label_id', 'conversation_id')
                    ->withPivot('applied_by')
                    ->withTimestamps();
    }

    // Scopes
    public function scopeForBusinessAccount($query, int $businessAccountId)
    {
        return $query->where('business_account_id', $businessAccountId);
    }

    // Methods
    public function getConversationCount(): int
    {
        return $this->conversations()->count();
    }
}
