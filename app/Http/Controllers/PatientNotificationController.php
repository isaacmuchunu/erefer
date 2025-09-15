<?php

namespace App\Http\Controllers;

use App\Models\PatientNotification;
use App\Models\NotificationTemplate;
use Illuminate\Http\Request;

class PatientNotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = PatientNotification::query()
            ->with(['patient'])
            ->orderByDesc('id')
            ->paginate(20);
        return response()->json($notifications);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'type' => 'required|string',
            'channel' => 'required|string',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'template_id' => 'nullable|exists:notification_templates,id',
            'template_data' => 'nullable|array',
            'priority' => 'nullable|in:low,normal,high,urgent',
            'scheduled_at' => 'nullable|date',
        ]);

        $notification = PatientNotification::create($data);
        return response()->json($notification, 201);
    }

    public function show(PatientNotification $notification)
    {
        return response()->json($notification->load('patient'));
    }

    public function update(Request $request, PatientNotification $notification)
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'message' => 'sometimes|string',
            'priority' => 'nullable|in:low,normal,high,urgent',
            'scheduled_at' => 'nullable|date',
            'status' => 'nullable|in:pending,sent,delivered,read,failed',
        ]);

        $notification->update($data);
        return response()->json($notification);
    }

    public function destroy(PatientNotification $notification)
    {
        $notification->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function send(PatientNotification $notification)
    {
        $notification->markAsSent('ext_'.uniqid());
        return response()->json(['message' => 'Sent']);
    }

    public function retry(PatientNotification $notification)
    {
        if ($notification->retry()) {
            return response()->json(['message' => 'Retry scheduled']);
        }
        return response()->json(['message' => 'Cannot retry'], 422);
    }

    public function markAsRead(PatientNotification $notification)
    {
        $notification->markAsRead();
        return response()->json(['message' => 'Marked as read']);
    }

    public function bulkMarkAsRead(Request $request)
    {
        $ids = $request->validate(['ids' => 'required|array'])['ids'];
        PatientNotification::whereIn('id', $ids)->update(['status' => 'read', 'read_at' => now()]);
        return response()->json(['message' => 'Marked as read']);
    }

    public function getAnalytics()
    {
        return response()->json([
            'delivery_rate' => 0.95,
            'read_rate' => 0.72,
            'channel_performance' => [
                'email' => ['delivery' => 0.99, 'read' => 0.6],
                'sms' => ['delivery' => 0.93, 'read' => 0.8],
                'whatsapp' => ['delivery' => 0.97, 'read' => 0.75],
            ],
        ]);
    }

    public function getDeliveryRates()
    {
        return response()->json(['by_channel' => []]);
    }

    public function getChannelPerformance()
    {
        return response()->json(['channels' => []]);
    }
}

