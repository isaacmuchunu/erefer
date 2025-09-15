<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Specialty extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'category',
        'emergency_specialty',
    ];

    protected $casts = [
        'emergency_specialty' => 'boolean',
    ];

    // Relationships
    public function facilities(): BelongsToMany
    {
        return $this->belongsToMany(Facility::class, 'facility_specialties')
            ->withPivot(['available_24_7', 'availability_hours', 'capacity'])
            ->withTimestamps();
    }

    public function doctors(): BelongsToMany
    {
        return $this->belongsToMany(Doctor::class, 'doctor_specialties')
            ->withPivot(['primary_specialty', 'years_of_experience_in_specialty', 'certifications'])
            ->withTimestamps();
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(Referral::class);
    }

    // Scopes
    public function scopeEmergency($query)
    {
        return $query->where('emergency_specialty', true);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeAvailableAt($query, int $facilityId)
    {
        return $query->whereHas('facilities', function ($q) use ($facilityId) {
            $q->where('facility_id', $facilityId);
        });
    }

    // Methods
    public function getAvailableFacilities(array $filters = [])
    {
        $query = $this->facilities()->with('facility');

        if (isset($filters['location'])) {
            $query->whereHas('facility', function ($q) use ($filters) {
                $q->nearby(
                    $filters['location']['lat'],
                    $filters['location']['lng'],
                    $filters['location']['radius'] ?? 50
                );
            });
        }

        if (isset($filters['available_24_7']) && $filters['available_24_7']) {
            $query->where('available_24_7', true);
        }

        return $query->get();
    }

    public function getReferralStats(int $days = 30): array
    {
        $referrals = $this->referrals()
            ->where('created_at', '>=', now()->subDays($days))
            ->get();

        return [
            'total' => $referrals->count(),
            'pending' => $referrals->where('status', 'pending')->count(),
            'accepted' => $referrals->where('status', 'accepted')->count(),
            'completed' => $referrals->where('status', 'completed')->count(),
            'rejected' => $referrals->where('status', 'rejected')->count(),
            'average_response_time' => $referrals->where('responded_at')
                ->avg(fn($r) => $r->responded_at?->diffInMinutes($r->referred_at)),
        ];
    }
}

?>