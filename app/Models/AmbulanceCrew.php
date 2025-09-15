<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AmbulanceCrew extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'role',
        'license_number',
        'license_expiry',
        'certifications',
        'skills',
        'available',
        'shift_type',
        'availability_schedule'
    ];

    protected $casts = [
        'license_expiry' => 'date',
        'certifications' => 'array',
        'skills' => 'array',
        'available' => 'boolean',
        'availability_schedule' => 'array'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function dispatches(): HasMany
    {
        return $this->hasMany(AmbulanceDispatch::class, 'crew_members->id');
    }

    public function scopeAvailable($query)
    {
        return $query->where('available', true);
    }

    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    public function isLicenseValid(): bool
    {
        return $this->license_expiry > now();
    }

    public function isOnDuty(): bool
    {
        // Check if crew member is currently on duty based on shift schedule
        $currentHour = now()->hour;
        $currentDay = now()->dayOfWeek;
        
        $schedule = $this->availability_schedule[$currentDay] ?? null;
        
        if (!$schedule || !$schedule['working']) {
            return false;
        }
        
        return $currentHour >= $schedule['start_hour'] && $currentHour < $schedule['end_hour'];
    }
}

?>