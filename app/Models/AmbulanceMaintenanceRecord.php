<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AmbulanceMaintenanceRecord extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'ambulance_id',
        'maintenance_date',
        'maintenance_type',
        'status',
        'performed_by',
        'notes',
        'completion_date',
        'cost',
        'parts_used',
        'downtime_hours',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'maintenance_date' => 'datetime',
        'completion_date' => 'datetime',
        'cost' => 'decimal:2',
        'downtime_hours' => 'decimal:2',
        'parts_used' => 'array',
    ];

    /**
     * Get the ambulance that owns the maintenance record.
     */
    public function ambulance(): BelongsTo
    {
        return $this->belongsTo(Ambulance::class);
    }
}