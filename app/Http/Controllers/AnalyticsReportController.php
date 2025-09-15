<?php

namespace App\Http\Controllers;

use App\Models\AnalyticsReport;
use Illuminate\Http\Request;

class AnalyticsReportController extends Controller
{
    public function index(Request $request)
    {
        $reports = AnalyticsReport::query()
            ->when($request->boolean('active'), fn($q) => $q->where('is_active', true))
            ->orderByDesc('id')
            ->paginate(20);
        return response()->json($reports);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'report_name' => 'required|string|max:255',
            'report_type' => 'required|string|max:100',
            'description' => 'nullable|string',
            'report_configuration' => 'required|array',
            'schedule_configuration' => 'nullable|array',
            'output_format' => 'required|in:pdf,excel,csv,json',
            'recipients' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $data['created_by'] = $request->user()->id;

        $report = AnalyticsReport::create($data);
        return response()->json($report, 201);
    }

    public function show(AnalyticsReport $report)
    {
        return response()->json($report);
    }

    public function update(Request $request, AnalyticsReport $report)
    {
        $data = $request->validate([
            'report_name' => 'sometimes|string|max:255',
            'report_type' => 'sometimes|string|max:100',
            'description' => 'nullable|string',
            'report_configuration' => 'sometimes|array',
            'schedule_configuration' => 'nullable|array',
            'output_format' => 'sometimes|in:pdf,excel,csv,json',
            'recipients' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $report->update($data);
        return response()->json($report);
    }

    public function destroy(AnalyticsReport $report)
    {
        $report->delete();
        return response()->json(['message' => 'Deleted']);
    }
}

