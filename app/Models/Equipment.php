<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\SoftDeletes;

class Equipment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'facility_id',
        'department_id',
        'name',
        'code',
        'serial_number',
        'manufacturer',
        'model',
        'purchase_date',
        'warranty_expiry',
        'last_maintenance',
        'next_maintenance_due',
        'status',
        'specifications',
        'cost',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'warranty_expiry' => 'date',
        'last_maintenance' => 'date',
        'next_maintenance_due' => 'date',
        'cost' => 'decimal:2',
    ];

    // Accessors & Mutators
    protected function isAvailable(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'available'
        );
    }

    protected function needsMaintenance(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->next_maintenance_due <= now()->addDays(30)
        );
    }

    protected function isUnderWarranty(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->warranty_expiry && $this->warranty_expiry >= now()
        );
    }

    protected function age(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->purchase_date?->diffInYears(now())
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

    public function maintenanceHistory(): HasMany
    {
        return $this->hasMany(EquipmentMaintenanceRecord::class);
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeNeedingMaintenance($query)
    {
        return $query->where('next_maintenance_due', '<=', now()->addDays(30));
    }

    public function scopeAtFacility($query, int $facilityId)
    {
        return $query->where('facility_id', $facilityId);
    }

    public function scopeInDepartment($query, int $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    public function scopeByManufacturer($query, string $manufacturer)
    {
        return $query->where('manufacturer', $manufacturer);
    }

    // Methods
    public function scheduleMaintenance(\DateTime $date, string $type, ?string $notes = null): EquipmentMaintenanceRecord
    {
        if (!auth()->user()) {
            throw new \Exception('User must be authenticated to schedule maintenance.');
        }
        if ($this->status !== 'available') {
            throw new \Exception('Equipment must be available to schedule maintenance.');
        }

        return $this->maintenanceHistory()->create([
            'maintenance_date' => $date,
            'maintenance_type' => $type,
            'notes' => $notes,
            'scheduled_by' => auth()->id(),
            'status' => 'scheduled',
        ]);
    }

    public function updateStatus(string $status, ?string $notes = null): bool
    {
        return $this->update([
            'status' => $status,
            'notes' => $notes,
        ]);
    }
}
?>