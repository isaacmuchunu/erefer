<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = auth()->user()
            ->notifications()
            ->when($request->unread_only, fn($q) => $q->whereNull('read_at'))
            ->when($request->type, fn($q, $type) => $q->where('type', $type))
            ->latest()
            ->paginate($request->per_page ?? 20);

        return response()->json($notifications);
    }

    public function markAsRead(DatabaseNotification $notification): JsonResponse
    {
        if ($notification->notifiable_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read'
        ]);
    }

    public function markAllAsRead(): JsonResponse
    {
        $count = auth()->user()
            ->unreadNotifications
            ->markAsRead();

        return response()->json([
            'message' => "Marked {$count} notifications as read"
        ]);
    }

    public function destroy(DatabaseNotification $notification): JsonResponse
    {
        if ($notification->notifiable_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted successfully'
        ]);
    }

    public function getUnreadCount(): JsonResponse
    {
        $count = auth()->user()->unreadNotifications()->count();

        return response()->json(['unread_count' => $count]);
    }

    public function preferences(Request $request): JsonResponse
    {
        if ($request->isMethod('GET')) {
            return response()->json([
                'preferences' => auth()->user()->notification_preferences ?? []
            ]);
        }

        $request->validate([
            'email_notifications' => 'boolean',
            'sms_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'referral_updates' => 'boolean',
            'emergency_alerts' => 'boolean',
            'system_updates' => 'boolean'
        ]);

        auth()->user()->update([
            'notification_preferences' => $request->validated()
        ]);

        return response()->json([
            'message' => 'Notification preferences updated successfully'
        ]);
    }
}
?>