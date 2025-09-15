<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FacilitySpecialty extends Model
{
    use HasFactory;

    protected $fillable = [
        'facility_id',
        'specialty_id',
        'available_24_7',
        'availability_hours',
        'capacity'
    ];

    protected $casts = [
        'available_24_7' => 'boolean',
        'availability_hours' => 'array'
    ];

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    public function specialty(): BelongsTo
    {
        return $this->belongsTo(Specialty::class);
    }

    public function isAvailableNow(): bool
    {
        if ($this->available_24_7) {
            return true;
        }

        $currentHour = now()->hour;
        $currentDay = now()->dayOfWeek;
        
        $hours = $this->availability_hours[$currentDay] ?? null;
        
        if (!$hours || !$hours['available']) {
            return false;
        }
        
        return $currentHour >= $hours['start_hour'] && $currentHour < $hours['end_hour'];
    }
}


?>