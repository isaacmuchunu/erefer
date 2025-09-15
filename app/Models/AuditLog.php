<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'model_type',
        'model_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'additional_data',
        'url',
        'method',
        'description',
        'severity',
        'tags'
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'additional_data' => 'array',
        'tags' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function auditable(): MorphTo
    {
        return $this->morphTo('model');
    }

    public function scopeForModel($query, $modelType, $modelId = null)
    {
        $query->where('model_type', $modelType);
        
        if ($modelId) {
            $query->where('model_id', $modelId);
        }
        
        return $query;
    }

    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeBySeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function getChangedFields(): array
    {
        if (!$this->old_values || !$this->new_values) {
            return [];
        }

        $changed = [];

        foreach ($this->new_values as $field => $newValue) {
            $oldValue = $this->old_values[$field] ?? null;

            if ($oldValue !== $newValue) {
                $changed[$field] = [
                    'old' => $oldValue,
                    'new' => $newValue
                ];
            }
        }

        return $changed;
    }

    // Static methods for logging specific activities
    public static function logActivity(
        string $action,
        $model = null,
        array $oldValues = [],
        array $newValues = [],
        string $description = null,
        string $severity = 'info',
        array $tags = []
    ): self {
        $user = auth()->user();
        $request = request();

        return self::create([
            'user_id' => $user?->id,
            'action' => $action,
            'model_type' => $model ? get_class($model) : null,
            'model_id' => $model?->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'url' => $request?->fullUrl(),
            'method' => $request?->method(),
            'description' => $description,
            'severity' => $severity,
            'tags' => $tags,
        ]);
    }

    public static function logPatientAccess(Patient $patient, string $action = 'viewed'): self
    {
        return self::logActivity(
            "patient.{$action}",
            $patient,
            [],
            [],
            "Patient {$patient->full_name} was {$action}",
            'info',
            ['patient_access', 'privacy_sensitive']
        );
    }

    public static function logSecurityEvent(string $event, string $description, string $severity = 'warning'): self
    {
        return self::logActivity(
            "security.{$event}",
            null,
            [],
            [],
            $description,
            $severity,
            ['security', 'access_control']
        );
    }
}
?>