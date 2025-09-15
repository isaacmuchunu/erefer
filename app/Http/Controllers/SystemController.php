<?php
namespace App\Http\Controllers;

use App\Models\SystemSetting;
use App\Services\SystemService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SystemController extends Controller
{
    public function __construct(
        private SystemService $systemService
    ) {}

    public function settings(Request $request): JsonResponse
    {
        $settings = SystemSetting::query()
            ->when($request->group, fn($q, $group) => $q->where('group', $group))
            ->when($request->public_only, fn($q) => $q->where('is_public', true))
            ->get()
            ->keyBy('key');

        return response()->json($settings);
    }

    public function updateSetting(Request $request): JsonResponse
    {
        $request->validate([
            'key' => 'required|string',
            'value' => 'required',
            'type' => 'nullable|in:string,integer,boolean,json'
        ]);

        $setting = $this->systemService->updateSetting(
            $request->key,
            $request->value,
            $request->type ?? 'string'
        );

        return response()->json([
            'message' => 'Setting updated successfully',
            'setting' => $setting
        ]);
    }

    public function systemHealth(): JsonResponse
    {
        $health = $this->systemService->getSystemHealth();

        return response()->json($health);
    }

    public function maintenance(Request $request): JsonResponse
    {
        $request->validate([
            'action' => 'required|in:enable,disable',
            'message' => 'nullable|string',
            'duration' => 'nullable|integer|min:1'
        ]);

        $result = $this->systemService->toggleMaintenance($request->validated());

        return response()->json([
            'message' => $result['message'],
            'maintenance_mode' => $result['enabled']
        ]);
    }

    public function auditLogs(Request $request): JsonResponse
    {
        $logs = $this->systemService->getAuditLogs($request->all());

        return response()->json($logs);
    }

    public function systemStats(): JsonResponse
    {
        $stats = $this->systemService->getSystemStats();

        return response()->json($stats);
    }
}
?>