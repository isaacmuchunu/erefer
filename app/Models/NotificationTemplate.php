<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'event_trigger',
        'subject',
        'template',
        'variables',
        'conditions',
        'is_active',
        'priority',
    ];

    protected $casts = [
        'variables' => 'array',
        'conditions' => 'array',
        'is_active' => 'boolean',
    ];
}

