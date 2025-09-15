<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmergencyAlert extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'alert_code',
        'type',
        'severity',
        'title',
        'description',
        'affected_areas',
        'affected_facilities',
        'created_by',
        'alert_start',
        'alert_end',
        'status',
        'response_actions',
        'resolution_notes',
    ];

    protected $casts = [
        'affected_areas' => 'array',
        'affected_facilities' => 'array',
        'alert_start' => 'datetime',
        'alert_end' => 'datetime',
        'response_actions' => 'array',
    ];

    // Accessors & Mutators
    protected function isActive(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'active' && 
                $this->alert_start <= now() && 
                (!$this->alert_end || $this->alert_end >= now())
        );
    }

    protected function duration(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->alert_end?->diffInMinutes($this->alert_start)
        );
    }

    protected function isCritical(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->severity === 'critical'
        );
    }

    // Relationships
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where('alert_start', '<=', now())
            ->where(function ($q) {
                $q->whereNull('alert_end')
                  ->orWhere('alert_end', '>=', now());
            });
    }

    public function scopeCritical($query)
    {
        return $query->where('severity', 'critical');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeAffectingFacility($query, int $facilityId)
    {
        return $query->whereJsonContains('affected_facilities', $facilityId);
    }

    // Methods
    public function resolve(string $notes = null): bool
    {
        return $this->update([
            'status' => 'resolved',
            'alert_end' => now(),
            'resolution_notes' => $notes,
        ]);
    }

    public function affectsFacility(int $facilityId): bool
    {
        return in_array($facilityId, $this->affected_facilities ?? []);
    }

    public function generateAlertCode(): string
    {
        $typeCode = match($this->type) {
            'mass_casualty' => 'MC',
            'disaster' => 'DS',
            'epidemic' => 'EP',
            'facility_emergency' => 'FE',
            'system_wide' => 'SW',
            default => 'AL',
        };

        $date = now()->format('Ymd');
        $sequence = static::whereDate('created_at', today())->count() + 1;
        
        return sprintf("%s%s%03d", $typeCode, $date, $sequence);
    }
}

?>
