<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsAppAutomationRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_account_id',
        'name',
        'description',
        'triggers',
        'actions',
        'is_active',
        'execution_count',
        'last_executed_at',
        'created_by',
    ];

    protected $casts = [
        'triggers' => 'array',
        'actions' => 'array',
        'is_active' => 'boolean',
        'last_executed_at' => 'datetime',
    ];

    // Relationships
    public function businessAccount(): BelongsTo
    {
        return $this->belongsTo(WhatsAppBusinessAccount::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForBusinessAccount($query, int $businessAccountId)
    {
        return $query->where('business_account_id', $businessAccountId);
    }
}
