<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class NotificationsController extends Controller
{
    /**
     * Display the notifications page with all user notifications
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        // Get notifications with filtering and pagination
        $perPage = min($request->get('per_page', 20), 100);
        $type = $request->get('type');
        $status = $request->get('status');
        $priority = $request->get('priority');

        $query = $user->notifications()
            ->when($type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->when($status, function ($query, $status) {
                if ($status === 'unread') {
                    $query->whereNull('read_at');
                } elseif ($status === 'read') {
                    $query->whereNotNull('read_at');
                }
            })
            ->when($priority, function ($query, $priority) {
                $query->where('data->priority', $priority);
            })
            ->orderBy('created_at', 'desc');

        $notifications = $query->paginate($perPage);

        // Transform notifications for frontend
        $transformedNotifications = $notifications->getCollection()->map(function ($notification) {
            return [
                'id' => $notification->id,
                'type' => $notification->type,
                'title' => $notification->data['title'] ?? 'Notification',
                'message' => $notification->data['message'] ?? '',
                'priority' => $notification->data['priority'] ?? 'normal',
                'category' => $notification->data['category'] ?? 'general',
                'action_url' => $notification->data['action_url'] ?? null,
                'action_text' => $notification->data['action_text'] ?? null,
                'icon' => $notification->data['icon'] ?? null,
                'severity' => $notification->data['severity'] ?? null,
                'sender' => $notification->data['sender_name'] ?? null,
                'is_read' => $notification->read_at !== null,
                'read_at' => $notification->read_at,
                'created_at' => $notification->created_at,
                'time_ago' => $notification->created_at->diffForHumans(),
                'formatted_date' => $notification->created_at->format('M j, Y g:i A'),
            ];
        });

        // Get notification statistics
        $stats = [
            'total' => $user->notifications()->count(),
            'unread' => $user->unreadNotifications()->count(),
            'read' => $user->notifications()->whereNotNull('read_at')->count(),
            'today' => $user->notifications()->whereDate('created_at', today())->count(),
            'this_week' => $user->notifications()->whereBetween('created_at', [
                now()->startOfWeek(),
                now()->endOfWeek()
            ])->count(),
            'by_priority' => [
                'urgent' => $user->notifications()->where('data->priority', 'urgent')->count(),
                'high' => $user->notifications()->where('data->priority', 'high')->count(),
                'normal' => $user->notifications()->where('data->priority', 'normal')->count(),
                'low' => $user->notifications()->where('data->priority', 'low')->count(),
            ],
            'by_category' => $user->notifications()
                ->selectRaw("JSON_UNQUOTE(JSON_EXTRACT(data, '$.category')) as category, COUNT(*) as count")
                ->groupBy('category')
                ->pluck('count', 'category')
                ->toArray(),
        ];

        // Get available filter options
        $filterOptions = [
            'types' => $user->notifications()
                ->distinct()
                ->pluck('type')
                ->filter()
                ->values()
                ->toArray(),
            'priorities' => ['urgent', 'high', 'normal', 'low'],
            'categories' => $user->notifications()
                ->selectRaw("DISTINCT JSON_UNQUOTE(JSON_EXTRACT(data, '$.category')) as category")
                ->pluck('category')
                ->filter()
                ->values()
                ->toArray(),
        ];

        return Inertia::render('notifications/index', [
            'notifications' => $transformedNotifications,
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'has_more' => $notifications->hasMorePages(),
                'from' => $notifications->firstItem(),
                'to' => $notifications->lastItem(),
            ],
            'stats' => $stats,
            'filterOptions' => $filterOptions,
            'currentFilters' => [
                'type' => $type,
                'status' => $status,
                'priority' => $priority,
                'per_page' => $perPage,
            ],
            'userPermissions' => [
                'canSendNotifications' => Gate::allows('send-notifications'),
                'canManageNotifications' => Gate::allows('manage-notifications'),
                'canViewAllNotifications' => Gate::allows('view-all-notifications'),
            ],
        ]);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead(Request $request, $notificationId)
    {
        $user = Auth::user();
        $notification = $user->notifications()->findOrFail($notificationId);

        if (!$notification->read_at) {
            $notification->markAsRead();
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read'
            ]);
        }

        return back()->with('success', 'Notification marked as read');
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        $user = Auth::user();
        $unreadCount = $user->unreadNotifications()->count();
        
        $user->unreadNotifications()->update(['read_at' => now()]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Marked {$unreadCount} notifications as read"
            ]);
        }

        return back()->with('success', "Marked {$unreadCount} notifications as read");
    }

    /**
     * Delete a notification
     */
    public function delete(Request $request, $notificationId)
    {
        $user = Auth::user();
        $notification = $user->notifications()->findOrFail($notificationId);

        $notification->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Notification deleted successfully'
            ]);
        }

        return back()->with('success', 'Notification deleted successfully');
    }

    /**
     * Get unread notification count for AJAX requests
     */
    public function getUnreadCount(Request $request)
    {
        $user = Auth::user();
        $count = $user->unreadNotifications()->count();

        return response()->json([
            'success' => true,
            'count' => $count
        ]);
    }

    /**
     * Show a specific notification
     */
    public function show(Request $request, $notificationId): Response
    {
        $user = Auth::user();
        $notification = $user->notifications()->findOrFail($notificationId);

        // Mark as read when viewing
        if (!$notification->read_at) {
            $notification->markAsRead();
        }

        $transformedNotification = [
            'id' => $notification->id,
            'type' => $notification->type,
            'title' => $notification->data['title'] ?? 'Notification',
            'message' => $notification->data['message'] ?? '',
            'priority' => $notification->data['priority'] ?? 'normal',
            'category' => $notification->data['category'] ?? 'general',
            'action_url' => $notification->data['action_url'] ?? null,
            'action_text' => $notification->data['action_text'] ?? null,
            'icon' => $notification->data['icon'] ?? null,
            'severity' => $notification->data['severity'] ?? null,
            'sender' => $notification->data['sender_name'] ?? null,
            'full_data' => $notification->data,
            'is_read' => $notification->read_at !== null,
            'read_at' => $notification->read_at,
            'created_at' => $notification->created_at,
            'time_ago' => $notification->created_at->diffForHumans(),
            'formatted_date' => $notification->created_at->format('M j, Y g:i A'),
        ];

        return Inertia::render('notifications/show', [
            'notification' => $transformedNotification,
        ]);
    }

    /**
     * Clear all read notifications
     */
    public function clearRead(Request $request)
    {
        $user = Auth::user();
        $deletedCount = $user->notifications()->whereNotNull('read_at')->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Cleared {$deletedCount} read notifications"
            ]);
        }

        return back()->with('success', "Cleared {$deletedCount} read notifications");
    }

    /**
     * Get notification preferences
     */
    public function getPreferences(Request $request)
    {
        $user = Auth::user();
        $preferences = $user->notification_preferences ?? [
            'email' => true,
            'sms' => false,
            'whatsapp' => false,
            'push' => true,
            'database' => true,
            'do_not_disturb' => false,
            'dnd_start' => '22:00',
            'dnd_end' => '08:00',
        ];

        return response()->json([
            'success' => true,
            'preferences' => $preferences
        ]);
    }

    /**
     * Update notification preferences
     */
    public function updatePreferences(Request $request)
    {
        $request->validate([
            'email' => 'boolean',
            'sms' => 'boolean',
            'whatsapp' => 'boolean',
            'push' => 'boolean',
            'database' => 'boolean',
            'do_not_disturb' => 'boolean',
            'dnd_start' => 'nullable|string',
            'dnd_end' => 'nullable|string',
        ]);

        $user = Auth::user();
        $user->update([
            'notification_preferences' => $request->only([
                'email', 'sms', 'whatsapp', 'push', 'database',
                'do_not_disturb', 'dnd_start', 'dnd_end'
            ])
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Notification preferences updated successfully'
            ]);
        }

        return back()->with('success', 'Notification preferences updated successfully');
    }
}
