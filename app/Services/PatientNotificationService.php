<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\PatientNotification;
use App\Models\Appointment;
use App\Models\PatientFollowUp;
use App\Models\NotificationTemplate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use Carbon\Carbon;

class PatientNotificationService
{
    private $smsService;
    private $emailService;
    private $whatsappService;
    private $pushNotificationService;
    private $aiService;

    public function __construct(
        SMSService $smsService,
        EmailService $emailService,
        WhatsAppService $whatsappService,
        PushNotificationService $pushNotificationService,
        AIService $aiService
    ) {
        $this->smsService = $smsService;
        $this->emailService = $emailService;
        $this->whatsappService = $whatsappService;
        $this->pushNotificationService = $pushNotificationService;
        $this->aiService = $aiService;
    }

    /**
     * Send appointment confirmation
     */
    public function sendAppointmentConfirmation(Appointment $appointment): PatientNotification
    {
        $template = NotificationTemplate::where('type', 'appointment_confirmation')->first();
        
        $templateData = [
            'patient_name' => $appointment->patient->full_name,
            'doctor_name' => $appointment->doctor->name,
            'facility_name' => $appointment->facility->name,
            'appointment_date' => $appointment->scheduled_at->format('F j, Y'),
            'appointment_time' => $appointment->scheduled_at->format('g:i A'),
            'appointment_type' => ucfirst($appointment->appointment_type),
            'duration' => $appointment->duration_minutes . ' minutes',
            'location' => $appointment->is_telemedicine ? 'Telemedicine' : $appointment->facility->address,
            'preparation_instructions' => $appointment->preparation_instructions,
            'meeting_link' => $appointment->meeting_link,
        ];

        return $this->createAndSendNotification([
            'patient_id' => $appointment->patient_id,
            'notifiable_type' => Appointment::class,
            'notifiable_id' => $appointment->id,
            'type' => 'appointment_confirmation',
            'title' => 'Appointment Confirmed',
            'template_id' => $template?->id,
            'template_data' => $templateData,
            'priority' => 'normal',
            'ai_optimized' => true,
        ]);
    }

    /**
     * Send appointment reminder
     */
    public function sendAppointmentReminder(Appointment $appointment, string $reminderType = '24_hour'): PatientNotification
    {
        $template = NotificationTemplate::where('type', "appointment_reminder_{$reminderType}")->first();
        
        $templateData = [
            'patient_name' => $appointment->patient->full_name,
            'doctor_name' => $appointment->doctor->name,
            'facility_name' => $appointment->facility->name,
            'appointment_date' => $appointment->scheduled_at->format('F j, Y'),
            'appointment_time' => $appointment->scheduled_at->format('g:i A'),
            'time_until' => $appointment->getTimeUntilAppointment(),
            'preparation_instructions' => $appointment->preparation_instructions,
            'meeting_link' => $appointment->meeting_link,
            'facility_phone' => $appointment->facility->phone,
        ];

        $priority = match($reminderType) {
            '1_hour' => 'high',
            '24_hour' => 'normal',
            '1_week' => 'low',
            default => 'normal',
        };

        return $this->createAndSendNotification([
            'patient_id' => $appointment->patient_id,
            'notifiable_type' => Appointment::class,
            'notifiable_id' => $appointment->id,
            'type' => "appointment_reminder_{$reminderType}",
            'title' => 'Appointment Reminder',
            'template_id' => $template?->id,
            'template_data' => $templateData,
            'priority' => $priority,
            'ai_optimized' => true,
        ]);
    }

    /**
     * Send follow-up reminder
     */
    public function sendFollowUpReminder(PatientFollowUp $followUp): PatientNotification
    {
        $template = NotificationTemplate::where('type', 'follow_up_reminder')->first();
        
        $templateData = [
            'patient_name' => $followUp->patient->full_name,
            'doctor_name' => $followUp->doctor->name,
            'follow_up_type' => ucfirst(str_replace('_', ' ', $followUp->follow_up_type)),
            'due_date' => $followUp->scheduled_date->format('F j, Y'),
            'instructions' => $followUp->instructions,
            'questions_count' => count($followUp->questions ?? []),
            'follow_up_link' => config('app.url') . "/patient/follow-up/{$followUp->id}",
        ];

        return $this->createAndSendNotification([
            'patient_id' => $followUp->patient_id,
            'notifiable_type' => PatientFollowUp::class,
            'notifiable_id' => $followUp->id,
            'type' => 'follow_up_reminder',
            'title' => 'Follow-up Reminder',
            'template_id' => $template?->id,
            'template_data' => $templateData,
            'priority' => $followUp->priority,
            'ai_optimized' => true,
        ]);
    }

    /**
     * Send medication reminder
     */
    public function sendMedicationReminder(Patient $patient, array $medicationData): PatientNotification
    {
        $template = NotificationTemplate::where('type', 'medication_reminder')->first();
        
        $templateData = [
            'patient_name' => $patient->full_name,
            'medication_name' => $medicationData['name'],
            'dosage' => $medicationData['dosage'],
            'time' => $medicationData['time'],
            'instructions' => $medicationData['instructions'] ?? '',
        ];

        return $this->createAndSendNotification([
            'patient_id' => $patient->id,
            'notifiable_type' => Patient::class,
            'notifiable_id' => $patient->id,
            'type' => 'medication_reminder',
            'title' => 'Medication Reminder',
            'template_id' => $template?->id,
            'template_data' => $templateData,
            'priority' => 'high',
            'ai_optimized' => true,
        ]);
    }

    /**
     * Send test results notification
     */
    public function sendTestResults(Patient $patient, array $resultsData): PatientNotification
    {
        $template = NotificationTemplate::where('type', 'test_results')->first();
        
        $templateData = [
            'patient_name' => $patient->full_name,
            'test_name' => $resultsData['test_name'],
            'doctor_name' => $resultsData['doctor_name'],
            'results_summary' => $resultsData['summary'],
            'next_steps' => $resultsData['next_steps'] ?? '',
            'results_link' => $resultsData['results_link'] ?? '',
        ];

        return $this->createAndSendNotification([
            'patient_id' => $patient->id,
            'notifiable_type' => Patient::class,
            'notifiable_id' => $patient->id,
            'type' => 'test_results',
            'title' => 'Test Results Available',
            'template_id' => $template?->id,
            'template_data' => $templateData,
            'priority' => $resultsData['priority'] ?? 'normal',
            'ai_optimized' => true,
        ]);
    }

    /**
     * Send emergency alert
     */
    public function sendEmergencyAlert(Patient $patient, string $message, array $metadata = []): PatientNotification
    {
        return $this->createAndSendNotification([
            'patient_id' => $patient->id,
            'notifiable_type' => Patient::class,
            'notifiable_id' => $patient->id,
            'type' => 'emergency_alert',
            'title' => 'Emergency Alert',
            'message' => $message,
            'priority' => 'urgent',
            'metadata' => $metadata,
            'ai_optimized' => false, // Emergency alerts should be sent immediately
        ], ['sms', 'push']); // Send via multiple channels for emergencies
    }

    /**
     * Create and send notification
     */
    private function createAndSendNotification(array $notificationData, array $channels = null): PatientNotification
    {
        $patient = Patient::find($notificationData['patient_id']);
        
        // Determine optimal channel(s)
        if (!$channels) {
            $channels = $this->determineOptimalChannels($patient, $notificationData);
        }

        // AI optimization
        if ($notificationData['ai_optimized'] ?? false) {
            $notificationData = $this->optimizeWithAI($notificationData, $patient);
        }

        // Create notification record
        $notification = PatientNotification::create(array_merge($notificationData, [
            'channel' => $channels[0], // Primary channel
            'status' => 'pending',
            'max_retries' => 3,
            'retry_count' => 0,
        ]));

        // Generate personalized message
        $message = $this->generateMessage($notification);
        $notification->update(['message' => $message]);

        // Send via primary channel
        $this->sendViaChannel($notification, $channels[0]);

        // Schedule backup channels if needed
        if (count($channels) > 1 && $notificationData['priority'] === 'urgent') {
            $this->scheduleBackupNotifications($notification, array_slice($channels, 1));
        }

        return $notification;
    }

    /**
     * Determine optimal communication channels
     */
    private function determineOptimalChannels(Patient $patient, array $notificationData): array
    {
        $channels = [];
        $preferences = $patient->communication_preferences ?? [];
        $priority = $notificationData['priority'] ?? 'normal';

        // Primary channel based on patient preference
        $preferredChannel = $preferences['preferred_channel'] ?? 'email';
        $channels[] = $preferredChannel;

        // Add backup channels for high priority notifications
        if (in_array($priority, ['high', 'urgent'])) {
            $backupChannels = ['sms', 'push', 'email', 'whatsapp'];
            foreach ($backupChannels as $channel) {
                if ($channel !== $preferredChannel && $this->isChannelAvailable($patient, $channel)) {
                    $channels[] = $channel;
                    if (count($channels) >= 3) break; // Limit to 3 channels max
                }
            }
        }

        return $channels;
    }

    /**
     * Check if communication channel is available for patient
     */
    private function isChannelAvailable(Patient $patient, string $channel): bool
    {
        return match($channel) {
            'email' => !empty($patient->email),
            'sms' => !empty($patient->phone),
            'whatsapp' => !empty($patient->whatsapp_number),
            'push' => $patient->push_notifications_enabled ?? false,
            default => false,
        };
    }

    /**
     * Optimize notification with AI
     */
    private function optimizeWithAI(array $notificationData, Patient $patient): array
    {
        try {
            // Get AI recommendations for timing
            $optimalTiming = $this->aiService->getOptimalNotificationTiming($patient, $notificationData['type']);
            
            if ($optimalTiming) {
                $notificationData['scheduled_at'] = $optimalTiming;
            }

            // Get AI score for message effectiveness
            $aiScore = $this->aiService->scoreNotificationEffectiveness($notificationData, $patient);
            $notificationData['ai_score'] = $aiScore;

            // Get personalization data
            $personalizationData = $this->aiService->getPersonalizationData($patient, $notificationData['type']);
            $notificationData['personalization_data'] = $personalizationData;

            $notificationData['ai_optimized'] = true;

        } catch (\Exception $e) {
            Log::warning('AI optimization failed for notification', [
                'patient_id' => $patient->id,
                'type' => $notificationData['type'],
                'error' => $e->getMessage(),
            ]);
        }

        return $notificationData;
    }

    /**
     * Generate personalized message
     */
    private function generateMessage(PatientNotification $notification): string
    {
        if ($notification->template) {
            $message = $notification->template->content;
            
            // Replace template variables
            foreach ($notification->template_data ?? [] as $key => $value) {
                $message = str_replace("{{$key}}", $value, $message);
            }
        } else {
            $message = $notification->message ?? 'You have a new notification from your healthcare provider.';
        }

        // Apply AI personalization
        if ($notification->ai_optimized) {
            $message = $notification->personalizeMessage();
        }

        return $message;
    }

    /**
     * Send notification via specific channel
     */
    private function sendViaChannel(PatientNotification $notification, string $channel): void
    {
        try {
            $result = match($channel) {
                'email' => $this->emailService->send($notification),
                'sms' => $this->smsService->send($notification),
                'whatsapp' => $this->whatsappService->send($notification),
                'push' => $this->pushNotificationService->send($notification),
                default => throw new \InvalidArgumentException("Unsupported channel: {$channel}"),
            };

            if ($result['success']) {
                $notification->markAsSent($result['external_id'] ?? null);
                $notification->calculateCost();
            } else {
                $notification->markAsFailed($result['error'] ?? 'Unknown error');
            }

        } catch (\Exception $e) {
            Log::error('Failed to send notification', [
                'notification_id' => $notification->id,
                'channel' => $channel,
                'error' => $e->getMessage(),
            ]);

            $notification->markAsFailed($e->getMessage());
        }
    }

    /**
     * Schedule backup notifications
     */
    private function scheduleBackupNotifications(PatientNotification $primaryNotification, array $backupChannels): void
    {
        foreach ($backupChannels as $index => $channel) {
            $delay = ($index + 1) * 5; // 5, 10, 15 minutes delay
            
            Queue::later(
                now()->addMinutes($delay),
                new \App\Jobs\SendBackupNotification($primaryNotification->id, $channel)
            );
        }
    }

    /**
     * Process pending notifications
     */
    public function processPendingNotifications(): void
    {
        $pendingNotifications = PatientNotification::pending()
            ->where(function ($query) {
                $query->whereNull('scheduled_at')
                      ->orWhere('scheduled_at', '<=', now());
            })
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'asc')
            ->limit(100)
            ->get();

        foreach ($pendingNotifications as $notification) {
            $this->sendViaChannel($notification, $notification->channel);
        }
    }

    /**
     * Retry failed notifications
     */
    public function retryFailedNotifications(): void
    {
        $failedNotifications = PatientNotification::canRetry()
            ->where('failed_at', '<', now()->subMinutes(5))
            ->orderBy('priority', 'desc')
            ->limit(50)
            ->get();

        foreach ($failedNotifications as $notification) {
            if ($notification->retry()) {
                $this->sendViaChannel($notification, $notification->channel);
            }
        }
    }

    /**
     * Get notification analytics
     */
    public function getAnalytics(array $filters = []): array
    {
        $query = PatientNotification::query();

        if (isset($filters['start_date'])) {
            $query->where('created_at', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date'])) {
            $query->where('created_at', '<=', $filters['end_date']);
        }

        if (isset($filters['channel'])) {
            $query->where('channel', $filters['channel']);
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        $total = $query->count();
        $sent = (clone $query)->where('status', 'sent')->count();
        $delivered = (clone $query)->where('status', 'delivered')->count();
        $read = (clone $query)->where('status', 'read')->count();
        $failed = (clone $query)->where('status', 'failed')->count();

        $deliveryRate = $total > 0 ? ($delivered / $total) * 100 : 0;
        $readRate = $delivered > 0 ? ($read / $delivered) * 100 : 0;
        $failureRate = $total > 0 ? ($failed / $total) * 100 : 0;

        return [
            'total_notifications' => $total,
            'sent' => $sent,
            'delivered' => $delivered,
            'read' => $read,
            'failed' => $failed,
            'delivery_rate' => round($deliveryRate, 2),
            'read_rate' => round($readRate, 2),
            'failure_rate' => round($failureRate, 2),
            'by_channel' => $query->selectRaw('channel, COUNT(*) as count')
                                 ->groupBy('channel')
                                 ->pluck('count', 'channel'),
            'by_type' => $query->selectRaw('type, COUNT(*) as count')
                              ->groupBy('type')
                              ->pluck('count', 'type'),
        ];
    }
}
