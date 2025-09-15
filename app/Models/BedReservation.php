<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BedReservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'bed_id',
        'patient_id',
        'reserved_by',
        'reserved_at',
        'reserved_until',
        'status',
        'reason'
    ];

    protected $casts = [
        'reserved_at' => 'datetime',
        'reserved_until' => 'datetime'
    ];

    public function bed(): BelongsTo
    {
        return $this->belongsTo(Bed::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function reservedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reserved_by');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expired');
    }

    public function isExpired(): bool
    {
        return $this->reserved_until < now() && $this->status === 'active';
    }

    public function markAsExpired(): void
    {
        $this->update(['status' => 'expired']);
    }
}

?>