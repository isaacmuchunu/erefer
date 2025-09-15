<?php

namespace App\Services;

use App\Models\SystemSetting;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Artisan;

class SystemService
{
    /**
     * Update a system setting
     */
    public function updateSetting(string $key, $value, string $type = 'string'): SystemSetting
    {
        $setting = SystemSetting::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'type' => $type,
            ]
        );

        // Clear cache for this setting
        Cache::forget("system_setting_{$key}");

        // Log the change
        AuditLog::logActivity(
            'system.setting.updated',
            $setting,
            [],
            ['key' => $key, 'value' => $value, 'type' => $type],
            "System setting '{$key}' updated",
            'info',
            ['system', 'settings']
        );

        return $setting;
    }

    /**
     * Get system health status
     */
    public function getSystemHealth(): array
    {
        $health = [
            'status' => 'healthy',
            'checks' => [],
            'timestamp' => now()->toISOString(),
        ];

        // Database check
        try {
            DB::connection()->getPdo();
            $health['checks']['database'] = [
                'status' => 'healthy',
                'message' => 'Database connection successful',
            ];
        } catch (\Exception $e) {
            $health['checks']['database'] = [
                'status' => 'unhealthy',
                'message' => 'Database connection failed: ' . $e->getMessage(),
            ];
            $health['status'] = 'unhealthy';
        }

        // Cache check
        try {
            Cache::put('health_check', 'test', 10);
            $value = Cache::get('health_check');
            if ($value === 'test') {
                $health['checks']['cache'] = [
                    'status' => 'healthy',
                    'message' => 'Cache is working',
                ];
            } else {
                throw new \Exception('Cache test failed');
            }
        } catch (\Exception $e) {
            $health['checks']['cache'] = [
                'status' => 'unhealthy',
                'message' => 'Cache failed: ' . $e->getMessage(),
            ];
            $health['status'] = 'degraded';
        }

        // Storage check
        try {
            $testFile = 'health_check_' . time() . '.txt';
            \Storage::disk('local')->put($testFile, 'test');
            \Storage::disk('local')->delete($testFile);
            $health['checks']['storage'] = [
                'status' => 'healthy',
                'message' => 'Storage is working',
            ];
        } catch (\Exception $e) {
            $health['checks']['storage'] = [
                'status' => 'unhealthy',
                'message' => 'Storage failed: ' . $e->getMessage(),
            ];
            $health['status'] = 'degraded';
        }

        // Queue check
        try {
            $queueSize = DB::table('jobs')->count();
            $failedJobs = DB::table('failed_jobs')->count();
            
            $health['checks']['queue'] = [
                'status' => $failedJobs > 10 ? 'degraded' : 'healthy',
                'message' => "Queue size: {$queueSize}, Failed jobs: {$failedJobs}",
                'metrics' => [
                    'pending_jobs' => $queueSize,
                    'failed_jobs' => $failedJobs,
                ],
            ];

            if ($failedJobs > 10) {
                $health['status'] = 'degraded';
            }
        } catch (\Exception $e) {
            $health['checks']['queue'] = [
                'status' => 'unknown',
                'message' => 'Queue check failed: ' . $e->getMessage(),
            ];
        }

        return $health;
    }

    /**
     * Toggle maintenance mode
     */
    public function toggleMaintenance(array $data): array
    {
        $action = $data['action'];
        $message = $data['message'] ?? 'System maintenance in progress';
        $duration = $data['duration'] ?? null;

        if ($action === 'enable') {
            // Enable maintenance mode
            Artisan::call('down', [
                '--message' => $message,
                '--retry' => 60,
            ]);

            $this->updateSetting('maintenance_mode', true, 'boolean');
            $this->updateSetting('maintenance_message', $message, 'string');
            
            if ($duration) {
                $this->updateSetting('maintenance_end_time', now()->addMinutes($duration)->toISOString(), 'string');
            }

            return [
                'enabled' => true,
                'message' => 'Maintenance mode enabled',
            ];
        } else {
            // Disable maintenance mode
            Artisan::call('up');

            $this->updateSetting('maintenance_mode', false, 'boolean');
            $this->updateSetting('maintenance_message', '', 'string');
            $this->updateSetting('maintenance_end_time', '', 'string');

            return [
                'enabled' => false,
                'message' => 'Maintenance mode disabled',
            ];
        }
    }

    /**
     * Get audit logs with filtering
     */
    public function getAuditLogs(array $filters = []): array
    {
        $query = AuditLog::with(['user', 'auditable']);

        // Apply filters
        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['action'])) {
            $query->where('action', 'like', '%' . $filters['action'] . '%');
        }

        if (isset($filters['level'])) {
            $query->where('level', $filters['level']);
        }

        if (isset($filters['tags'])) {
            $tags = is_array($filters['tags']) ? $filters['tags'] : [$filters['tags']];
            $query->whereJsonContains('tags', $tags);
        }

        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        $perPage = min($filters['per_page'] ?? 50, 100);
        $logs = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return [
            'logs' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
                'has_more' => $logs->hasMorePages(),
            ],
        ];
    }

    /**
     * Get system statistics
     */
    public function getSystemStats(): array
    {
        $stats = [
            'users' => [
                'total' => User::count(),
                'active' => User::where('is_active', true)->count(),
                'online' => User::where('last_seen_at', '>=', now()->subMinutes(5))->count(),
                'by_role' => User::selectRaw('role, COUNT(*) as count')
                    ->groupBy('role')
                    ->pluck('count', 'role')
                    ->toArray(),
            ],
            'system' => [
                'uptime' => $this->getSystemUptime(),
                'memory_usage' => $this->getMemoryUsage(),
                'disk_usage' => $this->getDiskUsage(),
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
            ],
            'database' => [
                'size' => $this->getDatabaseSize(),
                'tables' => $this->getTableCounts(),
            ],
            'performance' => [
                'average_response_time' => $this->getAverageResponseTime(),
                'cache_hit_rate' => $this->getCacheHitRate(),
                'queue_processing_rate' => $this->getQueueProcessingRate(),
            ],
        ];

        return $stats;
    }

    /**
     * Get system uptime
     */
    private function getSystemUptime(): string
    {
        $uptime = Cache::get('system_start_time', now());
        return $uptime->diffForHumans();
    }

    /**
     * Get memory usage
     */
    private function getMemoryUsage(): array
    {
        return [
            'current' => memory_get_usage(true),
            'peak' => memory_get_peak_usage(true),
            'limit' => ini_get('memory_limit'),
        ];
    }

    /**
     * Get disk usage
     */
    private function getDiskUsage(): array
    {
        $path = base_path();
        return [
            'free' => disk_free_space($path),
            'total' => disk_total_space($path),
            'used_percentage' => round((1 - disk_free_space($path) / disk_total_space($path)) * 100, 2),
        ];
    }

    /**
     * Get database size
     */
    private function getDatabaseSize(): string
    {
        try {
            $size = DB::select("SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS 'size' FROM information_schema.tables WHERE table_schema = ?", [config('database.connections.mysql.database')]);
            return $size[0]->size . ' MB';
        } catch (\Exception $e) {
            return 'Unknown';
        }
    }

    /**
     * Get table counts
     */
    private function getTableCounts(): array
    {
        $tables = [
            'users' => User::count(),
            'audit_logs' => AuditLog::count(),
        ];

        // Add other model counts as needed
        if (class_exists('\App\Models\Patient')) {
            $tables['patients'] = \App\Models\Patient::count();
        }

        if (class_exists('\App\Models\Referral')) {
            $tables['referrals'] = \App\Models\Referral::count();
        }

        return $tables;
    }

    /**
     * Get average response time (placeholder)
     */
    private function getAverageResponseTime(): string
    {
        // This would typically be calculated from logs or monitoring data
        return '150ms';
    }

    /**
     * Get cache hit rate (placeholder)
     */
    private function getCacheHitRate(): string
    {
        // This would typically be calculated from cache statistics
        return '85%';
    }

    /**
     * Get queue processing rate (placeholder)
     */
    private function getQueueProcessingRate(): string
    {
        // This would typically be calculated from queue statistics
        return '95%';
    }
}
