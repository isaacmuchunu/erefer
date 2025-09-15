<?php

namespace App\Http\Controllers;

use App\Models\AnalyticsDashboard;
use Illuminate\Http\Request;

class AnalyticsDashboardController extends Controller
{
    public function index(Request $request)
    {
        $dashboards = AnalyticsDashboard::query()
            ->when(!$request->user()->can('viewAny', AnalyticsDashboard::class), function($q) use ($request) {
                $q->where(function($q2) use ($request) {
                    $q2->where('is_public', true)
                       ->orWhere('created_by', $request->user()->id);
                });
            })
            ->orderByDesc('id')
            ->paginate(20);
        return response()->json($dashboards);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'dashboard_name' => 'required|string|max:255',
            'dashboard_type' => 'required|string|max:100',
            'description' => 'nullable|string',
            'widget_configuration' => 'required|array',
            'filter_configuration' => 'nullable|array',
            'access_permissions' => 'required|array',
            'is_public' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $data['created_by'] = $request->user()->id;

        $dashboard = AnalyticsDashboard::create($data);
        return response()->json($dashboard, 201);
    }

    public function show(AnalyticsDashboard $dashboard)
    {
        $dashboard->increment('view_count');
        $dashboard->update(['last_viewed_at' => now()]);
        return response()->json($dashboard);
    }

    public function update(Request $request, AnalyticsDashboard $dashboard)
    {
        $data = $request->validate([
            'dashboard_name' => 'sometimes|string|max:255',
            'dashboard_type' => 'sometimes|string|max:100',
            'description' => 'nullable|string',
            'widget_configuration' => 'sometimes|array',
            'filter_configuration' => 'nullable|array',
            'access_permissions' => 'sometimes|array',
            'is_public' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $dashboard->update($data);
        return response()->json($dashboard);
    }

    public function destroy(AnalyticsDashboard $dashboard)
    {
        $dashboard->delete();
        return response()->json(['message' => 'Deleted']);
    }
}

