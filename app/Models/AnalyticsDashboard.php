<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsDashboard extends Model
{
    use HasFactory;

    protected $table = 'analytics_dashboards';

    protected $fillable = [
        'dashboard_name',
        'dashboard_type',
        'description',
        'widget_configuration',
        'filter_configuration',
        'access_permissions',
        'created_by',
        'is_public',
        'is_active',
        'view_count',
        'last_viewed_at',
    ];

    protected $casts = [
        'widget_configuration' => 'array',
        'filter_configuration' => 'array',
        'access_permissions' => 'array',
        'is_public' => 'boolean',
        'is_active' => 'boolean',
        'last_viewed_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

