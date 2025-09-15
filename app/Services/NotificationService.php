<?php
namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\NotificationTemplate;
use App\Models\NotificationPreference;
use App\Models\EmergencyBroadcast;
use App\Events\NotificationSent;
use App\Events\EmergencyBroadcastSent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;
use Pusher\Pusher;
use Twilio\Rest\Client;

class NotificationService
{
    private $twilio;
    private $pusher;

    public function __construct()
    {
        $this->twilio = new Client(
            config('services.twilio.sid'),
            config('services.twilio.token')
        );

        $this->pusher = new Pusher(
            config('broadcasting.connections.pusher.key'),
            config('broadcasting.connections.pusher.secret'),
            config('broadcasting.connections.pusher.app_id'),
            [
                'cluster' => config('broadcasting.connections.pusher.options.cluster'),
                'useTLS' => true,
            ]
        );
    }

    /**
     * Create a new notification with enhanced features
     *
     * @param array $data
     * @return Notification
     */
    public function create(array $data): Notification
    {
        $notification = Notification::create([
            'user_id' => $data['user_id'],
            'title' => $data['title'],
            'message' => $data['message'],
            'type' => $data['type'] ?? 'info',
            'read' => false,
            'data' => $data['data'] ?? null,
            'link' => $data['link'] ?? null,
        ]);

        // Enhanced broadcasting and SMS
        $this->broadcast($notification);

        // Send SMS for high priority notifications
        if (($data['priority'] ?? 'normal') === 'high' || ($data['type'] ?? '') === 'emergency') {
            $this->sendSms($notification);
        }

        return $notification;
    }

    /**
     * Send notification with AI-powered prioritization
     */
    public function sendNotification(User $user, array $notificationData): array
    {
        $priority = $this->calculatePriority($notificationData, $user);
        $deliveryMethods = $this->determineDeliveryMethods($user, $notificationData, $priority);

        $results = [];

        foreach ($deliveryMethods as $method) {
            try {
                $result = $this->sendViaMethod($user, $notificationData, $method, $priority);
                $results[$method] = $result;

                // Log successful delivery
                Log::info("Notification sent successfully", [
                    'user_id' => $user->id,
                    'method' => $method,
                    'priority' => $priority,
                    'type' => $notificationData['type'] ?? 'general'
                ]);

            } catch (\Exception $e) {
                $results[$method] = [
                    'success' => false,
                    'error' => $e->getMessage()
                ];

                Log::error("Notification delivery failed", [
                    'user_id' => $user->id,
                    'method' => $method,
                    'error' => $e->getMessage(),
                    'notification_data' => $notificationData
                ]);
            }
        }

        // Broadcast notification event
        broadcast(new NotificationSent($user, $notificationData, $results));

        return $results;
    }

    /**
     * Calculate notification priority using AI-like logic
     */
    private function calculatePriority(array $notificationData, User $user): string
    {
        $baseScore = 0;

        // Type-based scoring
        $typeScores = [
            'emergency_alert' => 100,
            'critical_patient' => 90,
            'incoming_call' => 80,
            'urgent_referral' => 70,
            'ambulance_dispatch' => 60,
            'chat_message' => 30,
            'system_update' => 20,
            'general' => 10
        ];

        $type = $notificationData['type'] ?? 'general';
        $baseScore += $typeScores[$type] ?? 10;

        // Time-based scoring (higher priority during work hours)
        $hour = now()->hour;
        if ($hour >= 8 && $hour <= 18) {
            $baseScore += 20;
        } elseif ($hour >= 19 && $hour <= 22) {
            $baseScore += 10;
        }

        // User role-based scoring
        $roleScores = [
            'super_admin' => 20,
            'hospital_admin' => 15,
            'dispatcher' => 15,
            'doctor' => 10,
            'nurse' => 5
        ];

        $baseScore += $roleScores[$user->role] ?? 0;

        // Keyword-based scoring
        $message = strtolower($notificationData['message'] ?? '');
        $urgentKeywords = ['emergency', 'urgent', 'critical', 'immediate', 'asap', 'stat'];

        foreach ($urgentKeywords as $keyword) {
            if (strpos($message, $keyword) !== false) {
                $baseScore += 30;
                break;
            }
        }

        // Recent activity scoring (reduce priority if user recently received many notifications)
        $recentNotifications = Cache::get("user_notifications_{$user->id}", 0);
        if ($recentNotifications > 5) {
            $baseScore -= 20;
        }

        // Determine priority level
        if ($baseScore >= 80) return 'critical';
        if ($baseScore >= 60) return 'high';
        if ($baseScore >= 40) return 'medium';
        return 'low';
    }

    /**
     * Determine delivery methods based on priority and user preferences
     */
    private function determineDeliveryMethods(User $user, array $notificationData, string $priority): array
    {
        $methods = [];
        $type = $notificationData['type'] ?? 'general';

        // Check do-not-disturb settings
        if ($this->isUserInDoNotDisturb($user) && $priority !== 'critical') {
            return ['in_app']; // Only in-app notifications during DND
        }

        // Critical priority - use all available methods
        if ($priority === 'critical') {
            $methods = ['push', 'sms', 'email', 'in_app'];

            // Add voice call for emergency alerts
            if ($type === 'emergency_alert') {
                $methods[] = 'voice';
            }
        }
        // High priority - use push, SMS, and in-app
        elseif ($priority === 'high') {
            $methods = ['push', 'sms', 'in_app'];
        }
        // Medium priority - use push and in-app
        elseif ($priority === 'medium') {
            $methods = ['push', 'in_app'];
        }
        // Low priority - use only in-app
        else {
            $methods = ['in_app'];
        }

        // Ensure at least in-app notification
        if (empty($methods)) {
            $methods = ['in_app'];
        }

        return array_unique($methods);
    }

    /**
     * Send notification via specific method
     */
    private function sendViaMethod(User $user, array $data, string $method, string $priority): array
    {
        switch ($method) {
            case 'email':
                return $this->sendEmailNotification($user, $data);

            case 'sms':
                return $this->sendSmsNotification($user, $data);

            case 'push':
                return $this->sendPushNotification($user, $data, $priority);

            case 'in_app':
                return $this->sendInAppNotification($user, $data);

            case 'voice':
                return $this->sendVoiceNotification($user, $data);

            default:
                throw new \InvalidArgumentException("Unsupported delivery method: {$method}");
        }
    }

    /**
     * Mark a notification as read
     *
     * @param Notification $notification
     * @return Notification
     */
    public function markAsRead(Notification $notification): Notification
    {
        $notification->update([
            'read' => true,
            'read_at' => now(),
        ]);

        return $notification->fresh();
    }

    /**
     * Mark all notifications as read for a user
     *
     * @param User $user
     * @return int
     */
    public function markAllAsRead(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * Delete a notification
     *
     * @param Notification $notification
     * @return bool
     */
    public function delete(Notification $notification): bool
    {
        return $notification->delete();
    }

    /**
     * Get unread notification count for a user
     *
     * @param User $user
     * @return int
     */
    public function getUnreadCount(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->where('read', false)
            ->count();
    }

    /**
     * Send a notification to multiple users
     *
     * @param array $userIds
     * @param array $data
     * @return int
     */
    public function sendToMultipleUsers(array $userIds, array $data): int
    {
        $count = 0;
        foreach ($userIds as $userId) {
            $notificationData = array_merge($data, ['user_id' => $userId]);
            $this->create($notificationData);
            $count++;
        }

        return $count;
    }

    /**
     * Send a notification to all users with a specific role
     *
     * @param string $role
     * @param array $data
     * @return int
     */
    public function sendToRole(string $role, array $data): int
    {
        $users = User::whereHas('roles', function ($query) use ($role) {
            $query->where('name', $role);
        })->get();

        $count = 0;
        foreach ($users as $user) {
            $notificationData = array_merge($data, ['user_id' => $user->id]);
            $this->create($notificationData);
            $count++;
        }

        return $count;
    }

    /**
     * Send a notification to all users in a specific facility
     *
     * @param int $facilityId
     * @param array $data
     * @return int
     */
    public function sendToFacility(int $facilityId, array $data): int
    {
        $users = User::where('facility_id', $facilityId)->get();

        $count = 0;
        foreach ($users as $user) {
            $notificationData = array_merge($data, ['user_id' => $user->id]);
            $this->create($notificationData);
            $count++;
        }

        return $count;
    }

    /**
     * Broadcast notification via Pusher
     *
     * @param Notification $notification
     * @return void
     */
    public function broadcast(Notification $notification): void
    {
        $pusher = new Pusher(env('PUSHER_APP_KEY'), env('PUSHER_APP_SECRET'), env('PUSHER_APP_ID'), [
            'cluster' => env('PUSHER_APP_CLUSTER'),
            'useTLS' => true
        ]);

        $pusher->trigger("user-{$notification->user_id}", 'new-notification', ['notification' => $notification]);
    }

    /**
     * Send SMS notification via Twilio
     *
     * @param Notification $notification
     * @return void
     */
    public function sendSms(Notification $notification): void
    {
        $user = User::find($notification->user_id);
        if (!$user->phone) return;

        $twilio = new Client(env('TWILIO_SID'), env('TWILIO_AUTH_TOKEN'));

        $twilio->messages->create(
            $user->phone,
            [
                'from' => env('TWILIO_PHONE_NUMBER'),
                'body' => "{$notification->title}: {$notification->message}"
            ]
        );
    }

    /**
     * Send email notification
     */
    private function sendEmailNotification(User $user, array $data): array
    {
        try {
            if (!$user->email) {
                throw new \Exception('User has no email address');
            }

            // Use Laravel's mail system
            Mail::send('emails.notification', $data, function ($message) use ($user, $data) {
                $message->to($user->email, $user->full_name)
                        ->subject($data['title'] ?? 'Notification');
            });

            return ['success' => true, 'method' => 'email'];

        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send SMS notification
     */
    private function sendSmsNotification(User $user, array $data): array
    {
        try {
            if (!$user->phone) {
                throw new \Exception('User has no phone number');
            }

            $message = $data['title'] . ': ' . $data['message'];

            $this->twilio->messages->create(
                $user->phone,
                [
                    'from' => config('services.twilio.phone_number'),
                    'body' => $message
                ]
            );

            return ['success' => true, 'method' => 'sms'];

        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send push notification
     */
    private function sendPushNotification(User $user, array $data, string $priority): array
    {
        try {
            $pushData = [
                'title' => $data['title'],
                'body' => $data['message'],
                'icon' => $data['icon'] ?? '/images/notification-icon.png',
                'click_action' => $data['action_url'] ?? '/',
                'priority' => $priority,
                'badge' => $this->getUnreadCount($user),
            ];

            // Broadcast via Pusher
            $this->pusher->trigger(
                "user-{$user->id}",
                'push-notification',
                $pushData
            );

            return ['success' => true, 'method' => 'push'];

        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send in-app notification
     */
    private function sendInAppNotification(User $user, array $data): array
    {
        try {
            $notification = $user->notifications()->create([
                'id' => \Str::uuid(),
                'type' => $data['type'] ?? 'general',
                'data' => $data,
                'read_at' => null,
            ]);

            // Broadcast real-time notification
            broadcast(new NotificationSent($user, $notification))->toOthers();

            return ['success' => true, 'method' => 'in_app', 'notification_id' => $notification->id];

        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send voice notification (placeholder)
     */
    private function sendVoiceNotification(User $user, array $data): array
    {
        try {
            // This would integrate with a voice calling service
            // For now, just log the attempt
            Log::info('Voice notification would be sent', [
                'user_id' => $user->id,
                'phone' => $user->phone,
                'message' => $data['message'],
            ]);

            return ['success' => true, 'method' => 'voice', 'note' => 'Voice notification logged'];

        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Check if user is in do-not-disturb mode
     */
    private function isUserInDoNotDisturb(User $user): bool
    {
        $preferences = $user->notification_preferences ?? [];
        $dndEnabled = $preferences['do_not_disturb'] ?? false;

        if (!$dndEnabled) {
            return false;
        }

        // Check DND schedule
        $dndStart = $preferences['dnd_start'] ?? '22:00';
        $dndEnd = $preferences['dnd_end'] ?? '08:00';
        $currentTime = now()->format('H:i');

        // Handle overnight DND (e.g., 22:00 to 08:00)
        if ($dndStart > $dndEnd) {
            return $currentTime >= $dndStart || $currentTime <= $dndEnd;
        }

        // Handle same-day DND (e.g., 12:00 to 14:00)
        return $currentTime >= $dndStart && $currentTime <= $dndEnd;
    }

    /**
     * Send notification via multiple channels with enhanced logic
     */
    public function send($userId, array $data, array $channels = ['database'], ?\Carbon\Carbon $scheduleAt = null): array
    {
        try {
            $user = User::find($userId);
            if (!$user) {
                throw new \Exception("User with ID {$userId} not found");
            }

            // Use the enhanced notification system
            $results = $this->sendNotification($user, $data);

            return [
                'success' => collect($results)->contains('success', true),
                'results' => $results,
                'user_id' => $userId,
            ];

        } catch (\Exception $e) {
            Log::error('Notification send failed: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'user_id' => $userId,
            ];
        }
    }

}