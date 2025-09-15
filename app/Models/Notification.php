<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\DatabaseNotification;

class Notification extends DatabaseNotification
{
    use HasFactory;

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function getDataAttribute($value)
    {
        return json_decode($value, true);
    }

    public function getPriorityAttribute()
    {
        return $this->data['priority'] ?? 'normal';
    }

    public function getActionUrlAttribute()
    {
        return $this->data['action_url'] ?? null;
    }

    public function isHighPriority(): bool
    {
        return in_array($this->priority, ['high', 'urgent']);
    }

    public function isReferralNotification(): bool
    {
        return str_contains($this->type, 'Referral');
    }

    public function isEmergencyNotification(): bool
    {
        return str_contains($this->type, 'Emergency');
    }
}
?>