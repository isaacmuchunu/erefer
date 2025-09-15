<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsReport extends Model
{
    use HasFactory;

    protected $table = 'analytics_reports';

    protected $fillable = [
        'report_name',
        'report_type',
        'description',
        'report_configuration',
        'schedule_configuration',
        'output_format',
        'created_by',
        'recipients',
        'is_active',
        'last_generated_at',
        'next_generation_at',
    ];

    protected $casts = [
        'report_configuration' => 'array',
        'schedule_configuration' => 'array',
        'recipients' => 'array',
        'is_active' => 'boolean',
        'last_generated_at' => 'datetime',
        'next_generation_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

