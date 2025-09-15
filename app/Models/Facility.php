<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\SoftDeletes;

class Facility extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'type',
        'ownership',
        'description',
        'license_number',
        'license_expiry',
        'verification_status',
        'contact_info',
        'address',
        'total_beds',
        'available_beds',
        'operating_hours',
        'emergency_services',
        'ambulance_services',
        'accreditations',
        'rating',
        'rating_count',
        'status',
    ];

    protected $casts = [
        'license_expiry' => 'date',
        'contact_info' => 'array',
        'address' => 'array',
        'operating_hours' => 'array',
        'emergency_services' => 'boolean',
        'ambulance_services' => 'boolean',
        'accreditations' => 'array',
        'rating' => 'decimal:2',
    ];

    // Accessors & Mutators
    protected function isVerified(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->verification_status === 'verified'
        );
    }

    protected function occupancyRate(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->total_beds > 0 
                ? round((($this->total_beds - $this->available_beds) / $this->total_beds) * 100, 2)
                : 0
        );
    }

    protected function coordinates(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->address['coordinates'] ?? null
        );
    }

    // Relationships
    public function departments(): HasMany
    {
        return $this->hasMany(Department::class);
    }

    public function specialties(): BelongsToMany
    {
        return $this->belongsToMany(Specialty::class, 'facility_specialties')
            ->withPivot(['available_24_7', 'availability_hours', 'capacity'])
            ->withTimestamps();
    }

    public function doctors(): HasMany
    {
        return $this->hasMany(Doctor::class);
    }

    public function beds(): HasMany
    {
        return $this->hasMany(Bed::class);
    }

    public function ambulances(): HasMany
    {
        return $this->hasMany(Ambulance::class);
    }

    public function equipment(): HasMany
    {
        return $this->hasMany(Equipment::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function referralsReceived(): HasMany
    {
        return $this->hasMany(Referral::class, 'receiving_facility_id');
    }

    public function referralsSent(): HasMany
    {
        return $this->hasMany(Referral::class, 'referring_facility_id');
    }

    public function communications(): HasMany
    {
        return $this->hasMany(Communication::class, 'sender_facility_id');
    }

    // Scopes
    public function scopeVerified($query)
    {
        return $query->where('verification_status', 'verified');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeWithEmergencyServices($query)
    {
        return $query->where('emergency_services', true);
    }

    public function scopeWithAmbulanceServices($query)
    {
        return $query->where('ambulance_services', true);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeNearby($query, float $lat, float $lng, float $radiusKm = 50)
    {
        return $query->whereRaw("
            ST_Distance_Sphere(
                POINT(JSON_EXTRACT(address, '$.coordinates.lng'), JSON_EXTRACT(address, '$.coordinates.lat')),
                POINT(?, ?)
            ) <= ?
        ", [$lng, $lat, $radiusKm * 1000]);
    }

    public function scopeWithSpecialty($query, int $specialtyId)
    {
        return $query->whereHas('specialties', function ($q) use ($specialtyId) {
            $q->where('specialty_id', $specialtyId);
        });
    }

    public function scopeWithAvailableBeds($query, int $minBeds = 1)
    {
        return $query->where('available_beds', '>=', $minBeds);
    }

    public function scopeByCity($query, string $city)
    {
        return $query->whereRaw("JSON_EXTRACT(address, '$.city') = ?", [$city]);
    }

    public function scopeByState($query, string $state)
    {
        return $query->whereRaw("JSON_EXTRACT(address, '$.state') = ?", [$state]);
    }

    public function scopeHighCapacity($query, int $minBeds = 100)
    {
        return $query->where('total_beds', '>=', $minBeds);
    }

    public function scopeLowOccupancy($query, int $maxOccupancy = 75)
    {
        return $query->whereRaw('((total_beds - available_beds) / total_beds * 100) <= ?', [$maxOccupancy]);
    }

    public function scopeAcceptingReferrals($query)
    {
        return $query->where('status', 'active')
            ->where('available_beds', '>', 0);
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('type', 'like', "%{$search}%")
              ->orWhere('code', 'like', "%{$search}%")
              ->orWhereRaw("JSON_EXTRACT(address, '$.city') LIKE ?", ["%{$search}%"])
              ->orWhereRaw("JSON_EXTRACT(contact_info, '$.phone') LIKE ?", ["%{$search}%"]);
        });
    }

    // Methods
    public function updateBedCount(): void
    {
        $this->update([
            'available_beds' => $this->beds()->where('status', 'available')->count(),
            'total_beds' => $this->beds()->count(),
        ]);
    }

    public function hasSpecialty(int $specialtyId): bool
    {
        return $this->specialties()->where('specialty_id', $specialtyId)->exists();
    }

    public function getDistanceFrom(float $lat, float $lng): float
    {
        $coordinates = $this->coordinates;
        if (!$coordinates) return 0;

        return $this->haversineDistance(
            $lat, 
            $lng, 
            $coordinates['lat'], 
            $coordinates['lng']
        );
    }

    private function haversineDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371; // Earth's radius in kilometers
        
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        
        $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng/2) * sin($dLng/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        
        return $earthRadius * $c;
    }
}
?>