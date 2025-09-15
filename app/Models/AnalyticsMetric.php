<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class AnalyticsMetric extends Model
{
    use HasFactory;

    protected $fillable = [
        'metric_date',
        'metric_type',
        'metric_category',
        'value',
        'unit',
        'facility_id',
        'ambulance_id',
        'user_id',
        'dimensions',
        'metadata',
    ];

    protected $casts = [
        'metric_date' => 'date',
        'value' => 'decimal:4',
        'dimensions' => 'array',
        'metadata' => 'array',
    ];

    // Relationships
    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    public function ambulance(): BelongsTo
    {
        return $this->belongsTo(Ambulance::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeByType($query, string $type)
    {
        return $query->where('metric_type', $type);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('metric_category', $category);
    }

    public function scopeForFacility($query, int $facilityId)
    {
        return $query->where('facility_id', $facilityId);
    }

    public function scopeForAmbulance($query, int $ambulanceId)
    {
        return $query->where('ambulance_id', $ambulanceId);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeDateRange($query, Carbon $startDate, Carbon $endDate)
    {
        return $query->whereBetween('metric_date', [$startDate, $endDate]);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('metric_date', '>=', now()->subDays($days));
    }

    // Methods
    public static function recordMetric(array $data): self
    {
        return static::create([
            'metric_date' => $data['date'] ?? now()->toDateString(),
            'metric_type' => $data['type'],
            'metric_category' => $data['category'],
            'value' => $data['value'],
            'unit' => $data['unit'] ?? null,
            'facility_id' => $data['facility_id'] ?? null,
            'ambulance_id' => $data['ambulance_id'] ?? null,
            'user_id' => $data['user_id'] ?? null,
            'dimensions' => $data['dimensions'] ?? null,
            'metadata' => $data['metadata'] ?? null,
        ]);
    }

    public static function getAggregatedMetrics(string $type, string $aggregation = 'avg', array $filters = []): float
    {
        $query = static::where('metric_type', $type);

        // Apply filters
        if (isset($filters['facility_id'])) {
            $query->where('facility_id', $filters['facility_id']);
        }

        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->whereBetween('metric_date', [$filters['start_date'], $filters['end_date']]);
        }

        if (isset($filters['dimensions'])) {
            foreach ($filters['dimensions'] as $key => $value) {
                $query->whereJsonContains('dimensions->' . $key, $value);
            }
        }

        // Apply aggregation
        switch ($aggregation) {
            case 'sum':
                return $query->sum('value') ?? 0;
            case 'avg':
                return $query->avg('value') ?? 0;
            case 'min':
                return $query->min('value') ?? 0;
            case 'max':
                return $query->max('value') ?? 0;
            case 'count':
                return $query->count();
            default:
                return $query->avg('value') ?? 0;
        }
    }

    public static function getTrendData(string $type, int $days = 30, array $filters = []): array
    {
        $startDate = now()->subDays($days);
        $endDate = now();

        $query = static::where('metric_type', $type)
            ->whereBetween('metric_date', [$startDate, $endDate]);

        // Apply filters
        if (isset($filters['facility_id'])) {
            $query->where('facility_id', $filters['facility_id']);
        }

        return $query->selectRaw('metric_date, AVG(value) as avg_value, COUNT(*) as count')
            ->groupBy('metric_date')
            ->orderBy('metric_date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->metric_date->toDateString(),
                    'value' => round($item->avg_value, 2),
                    'count' => $item->count,
                ];
            })
            ->toArray();
    }

    public static function getPercentileValue(string $type, float $percentile, array $filters = []): float
    {
        $query = static::where('metric_type', $type);

        // Apply filters
        if (isset($filters['facility_id'])) {
            $query->where('facility_id', $filters['facility_id']);
        }

        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->whereBetween('metric_date', [$filters['start_date'], $filters['end_date']]);
        }

        $values = $query->pluck('value')->sort()->values();
        $count = $values->count();

        if ($count === 0) {
            return 0;
        }

        $index = ($percentile / 100) * ($count - 1);
        $lower = floor($index);
        $upper = ceil($index);

        if ($lower === $upper) {
            return $values[$lower] ?? 0;
        }

        $weight = $index - $lower;
        return ($values[$lower] * (1 - $weight)) + ($values[$upper] * $weight);
    }

    public static function detectOutliers(string $type, array $filters = [], float $threshold = 2.0): array
    {
        $query = static::where('metric_type', $type);

        // Apply filters
        if (isset($filters['facility_id'])) {
            $query->where('facility_id', $filters['facility_id']);
        }

        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->whereBetween('metric_date', [$filters['start_date'], $filters['end_date']]);
        }

        $metrics = $query->get();
        $values = $metrics->pluck('value');

        if ($values->count() < 3) {
            return [];
        }

        $mean = $values->avg();
        $stdDev = sqrt($values->map(fn($value) => pow($value - $mean, 2))->avg());

        $outliers = [];
        foreach ($metrics as $metric) {
            $zScore = $stdDev > 0 ? abs($metric->value - $mean) / $stdDev : 0;
            
            if ($zScore > $threshold) {
                $outliers[] = [
                    'metric' => $metric,
                    'z_score' => round($zScore, 2),
                    'deviation' => round($metric->value - $mean, 2),
                    'is_high' => $metric->value > $mean,
                ];
            }
        }

        return $outliers;
    }

    public function getDimension(string $key, $default = null)
    {
        return $this->dimensions[$key] ?? $default;
    }

    public function getMetadata(string $key, $default = null)
    {
        return $this->metadata[$key] ?? $default;
    }

    public function isOutlier(float $threshold = 2.0): bool
    {
        $siblings = static::where('metric_type', $this->metric_type)
            ->where('metric_date', '>=', $this->metric_date->subDays(30))
            ->where('metric_date', '<=', $this->metric_date->addDays(30))
            ->where('id', '!=', $this->id);

        if ($this->facility_id) {
            $siblings->where('facility_id', $this->facility_id);
        }

        $values = $siblings->pluck('value');

        if ($values->count() < 3) {
            return false;
        }

        $mean = $values->avg();
        $stdDev = sqrt($values->map(fn($value) => pow($value - $mean, 2))->avg());

        if ($stdDev == 0) {
            return false;
        }

        $zScore = abs($this->value - $mean) / $stdDev;
        return $zScore > $threshold;
    }

    public function getFormattedValue(): string
    {
        $value = $this->value;
        
        switch ($this->unit) {
            case 'percentage':
                return number_format($value, 1) . '%';
            case 'currency':
                return '$' . number_format($value, 2);
            case 'minutes':
                return number_format($value, 0) . ' min';
            case 'hours':
                return number_format($value, 1) . ' hrs';
            case 'count':
                return number_format($value, 0);
            default:
                return number_format($value, 2);
        }
    }

    public function getChangeFromPrevious(): ?float
    {
        $previousMetric = static::where('metric_type', $this->metric_type)
            ->where('metric_date', '<', $this->metric_date)
            ->when($this->facility_id, fn($q) => $q->where('facility_id', $this->facility_id))
            ->when($this->ambulance_id, fn($q) => $q->where('ambulance_id', $this->ambulance_id))
            ->when($this->user_id, fn($q) => $q->where('user_id', $this->user_id))
            ->orderBy('metric_date', 'desc')
            ->first();

        if (!$previousMetric || $previousMetric->value == 0) {
            return null;
        }

        return (($this->value - $previousMetric->value) / $previousMetric->value) * 100;
    }
}
