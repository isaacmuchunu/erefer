<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\AuditLog;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class NotificationController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Get notifications for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $perPage = min($request->get('per_page', 20), 100);

            $query = $user->notifications()
                ->when($request->type, function ($query, $type) {
                    $query->where('type', $type);
                })
                ->when($request->status, function ($query, $status) {
                    if ($status === 'unread') {
                        $query->whereNull('read_at');
                    } elseif ($status === 'read') {
                        $query->whereNotNull('read_at');
                    }
                })
                ->when($request->priority, function ($query, $priority) {
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
                    'is_read' => $notification->read_at !== null,
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at,
                    'time_ago' => $notification->created_at->diffForHumans(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'notifications' => $transformedNotifications,
                    'pagination' => [
                        'current_page' => $notifications->currentPage(),
                        'last_page' => $notifications->lastPage(),
                        'per_page' => $notifications->perPage(),
                        'total' => $notifications->total(),
                        'has_more' => $notifications->hasMorePages(),
                    ],
                    'unread_count' => $user->unreadNotifications()->count(),
                ],
                'message' => 'Notifications retrieved successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching notifications: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch notifications',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $notificationId): JsonResponse
    {
        try {
            $user = Auth::user();
            $notification = $user->notifications()->findOrFail($notificationId);

            if (!$notification->read_at) {
                $notification->markAsRead();

                // Log the action
                AuditLog::logActivity(
                    'notification.read',
                    $notification,
                    [],
                    ['read_by' => $user->id],
                    "Notification marked as read",
                    'info',
                    ['notification', 'read']
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error marking notification as read: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as read',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $unreadCount = $user->unreadNotifications()->count();
            
            $user->unreadNotifications()->update(['read_at' => now()]);

            // Log the action
            AuditLog::logActivity(
                'notification.mark_all_read',
                null,
                [],
                [
                    'user_id' => $user->id,
                    'marked_count' => $unreadCount,
                ],
                "All notifications marked as read",
                'info',
                ['notification', 'bulk_read']
            );

            return response()->json([
                'success' => true,
                'message' => "Marked {$unreadCount} notifications as read"
            ]);

        } catch (\Exception $e) {
            \Log::error('Error marking all notifications as read: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark all notifications as read',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Delete a notification
     */
    public function delete(Request $request, $notificationId): JsonResponse
    {
        try {
            $user = Auth::user();
            $notification = $user->notifications()->findOrFail($notificationId);

            // Log before deletion
            AuditLog::logActivity(
                'notification.deleted',
                $notification,
                $notification->toArray(),
                ['deleted_by' => $user->id],
                "Notification deleted",
                'info',
                ['notification', 'deletion']
            );

            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notification deleted successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error deleting notification: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete notification',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Send a notification to users
     */
    public function send(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'recipients' => 'required|array',
                'recipients.*' => 'exists:users,id',
                'title' => 'required|string|max:255',
                'message' => 'required|string|max:1000',
                'type' => 'required|string|max:100',
                'priority' => 'in:low,normal,high,urgent',
                'category' => 'nullable|string|max:50',
                'action_url' => 'nullable|url',
                'action_text' => 'nullable|string|max:50',
                'icon' => 'nullable|string|max:50',
                'channels' => 'nullable|array',
                'channels.*' => 'in:database,email,sms,whatsapp,push',
                'schedule_at' => 'nullable|date|after:now',
            ]);

            $user = Auth::user();

            // Check permissions
            if (!Gate::allows('send-notifications')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to send notifications'
                ], 403);
            }

            $notificationData = [
                'title' => $request->title,
                'message' => $request->message,
                'type' => $request->type,
                'priority' => $request->priority ?? 'normal',
                'category' => $request->category ?? 'general',
                'action_url' => $request->action_url,
                'action_text' => $request->action_text,
                'icon' => $request->icon,
                'sender_id' => $user->id,
                'sender_name' => $user->full_name,
            ];

            $channels = $request->channels ?? ['database'];
            $scheduleAt = $request->schedule_at ? \Carbon\Carbon::parse($request->schedule_at) : null;

            $results = [];
            foreach ($request->recipients as $recipientId) {
                $result = $this->notificationService->send(
                    $recipientId,
                    $notificationData,
                    $channels,
                    $scheduleAt
                );
                $results[] = $result;
            }

            $successCount = collect($results)->where('success', true)->count();
            $failureCount = count($results) - $successCount;

            // Log the bulk send
            AuditLog::logActivity(
                'notification.bulk_sent',
                null,
                [],
                [
                    'sender_id' => $user->id,
                    'recipient_count' => count($request->recipients),
                    'success_count' => $successCount,
                    'failure_count' => $failureCount,
                    'notification_type' => $request->type,
                ],
                "Bulk notification sent to {$successCount} recipients",
                'info',
                ['notification', 'bulk_send']
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'sent_count' => $successCount,
                    'failed_count' => $failureCount,
                    'results' => $results,
                ],
                'message' => "Notification sent to {$successCount} recipients"
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error sending notification: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send notification',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get notification statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

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

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Notification statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching notification statistics: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch notification statistics',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
