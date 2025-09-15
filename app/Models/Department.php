<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'facility_id',
        'name',
        'code',
        'description',
        'services_offered',
        'equipment_available',
        'head_of_department',
        'status',
    ];

    protected $casts = [
        'services_offered' => 'array',
        'equipment_available' => 'array',
    ];

    // Relationships
    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    public function headOfDepartment(): BelongsTo
    {
        return $this->belongsTo(User::class, 'head_of_department');
    }

    public function beds(): HasMany
    {
        return $this->hasMany(Bed::class);
    }

    public function equipment(): HasMany
    {
        return $this->hasMany(Equipment::class);
    }

    public function doctors(): BelongsToMany
    {
        return $this->belongsToMany(Doctor::class, 'doctor_departments');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeAtFacility($query, int $facilityId)
    {
        return $query->where('facility_id', $facilityId);
    }

    // Methods
    public function getAvailableBeds(): int
    {
        return $this->beds()->available()->count();
    }

    public function getTotalBeds(): int
    {
        return $this->beds()->count();
    }

    public function getOccupancyRate(): float
    {
        $total = $this->getTotalBeds();
        if ($total === 0) return 0;

        $occupied = $this->beds()->occupied()->count();
        return round(($occupied / $total) * 100, 2);
    }
}
?>