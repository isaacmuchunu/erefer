<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\SoftDeletes;

class Bed extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'facility_id',
        'department_id',
        'bed_type_id',
        'bed_number',
        'room_number',
        'status',
        'equipment',
        'notes',
        'last_occupied_at',
        'available_from',
    ];

    protected $casts = [
        'equipment' => 'array',
        'last_occupied_at' => 'datetime',
        'available_from' => 'datetime',
    ];

    // Accessors & Mutators
    protected function isAvailable(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'available' && 
                (!$this->available_from || $this->available_from <= now())
        );
    }

    protected function isOccupied(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'occupied'
        );
    }

    protected function fullBedNumber(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->room_number ? 
                "{$this->room_number}-{$this->bed_number}" : 
                $this->bed_number
        );
    }

    // Relationships
    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function bedType(): BelongsTo
    {
        return $this->belongsTo(BedType::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(BedReservation::class);
    }

    public function currentReservation(): HasOne
    {
        return $this->hasOne(BedReservation::class)
            ->where('status', 'active')
            ->where('reserved_until', '>', now());
    }

    public function reservationHistory(): HasMany
    {
        return $this->hasMany(BedReservation::class)
            ->orderBy('created_at', 'desc');
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available')
            ->where(function ($q) {
                $q->whereNull('available_from')
                  ->orWhere('available_from', '<=', now());
            });
    }

    public function scopeOccupied($query)
    {
        return $query->where('status', 'occupied');
    }

    public function scopeByType($query, int $bedTypeId)
    {
        return $query->where('bed_type_id', $bedTypeId);
    }

    public function scopeInDepartment($query, int $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    public function scopeAtFacility($query, int $facilityId)
    {
        return $query->where('facility_id', $facilityId);
    }

    public function scopeWithEquipment($query, string $equipment)
    {
        return $query->whereJsonContains('equipment', $equipment);
    }

    // Methods
    public function reserve(Patient $patient, \DateTime $until, string $reason = null): BedReservation
    {
        return $this->reservations()->create([
            'patient_id' => $patient->id,
            'reserved_by' => auth()->id(),
            'reserved_at' => now(),
            'reserved_until' => $until,
            'reason' => $reason,
            'status' => 'active',
        ]);
    }

    public function occupy(Patient $patient): bool
    {
        return $this->update([
            'status' => 'occupied',
            'last_occupied_at' => now(),
            'available_from' => null,
        ]);
    }

    public function makeAvailable(\DateTime $availableFrom = null): bool
    {
        return $this->update([
            'status' => 'available',
            'available_from' => $availableFrom,
        ]);
    }

    public function hasEquipment(string $equipment): bool
    {
        return in_array($equipment, $this->equipment ?? []);
    }

    public function isReserved(): bool
    {
        return $this->currentReservation()->exists();
    }
}
?>