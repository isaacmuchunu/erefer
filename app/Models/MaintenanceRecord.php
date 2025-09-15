<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'equipment_id',
        'maintenance_type',
        'scheduled_date',
        'completed_date',
        'performed_by',
        'description',
        'cost',
        'parts_used',
        'next_maintenance_due',
        'status',
        'notes'
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'completed_date' => 'date',
        'next_maintenance_due' => 'date',
        'cost' => 'decimal:2',
        'parts_used' => 'array'
    ];

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeOverdue($query)
    {
        return $query->where('scheduled_date', '<', now())->where('status', 'pending');
    }

    public function isOverdue(): bool
    {
        return $this->scheduled_date < now() && $this->status === 'pending';
    }

    public function getDaysOverdue(): int
    {
        if (!$this->isOverdue()) {
            return 0;
        }
        
        return now()->diffInDays($this->scheduled_date);
    }
}

?>