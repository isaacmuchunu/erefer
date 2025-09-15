<?php

namespace App\Services;

use App\Models\PatientNotification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class WhatsAppService
{
    private $apiUrl;
    private $accessToken;
    private $phoneNumberId;
    private $businessAccountId;

    public function __construct()
    {
        $this->apiUrl = config('services.whatsapp.api_url', 'https://graph.facebook.com/v18.0');
        $this->accessToken = config('services.whatsapp.access_token');
        $this->phoneNumberId = config('services.whatsapp.phone_number_id');
        $this->businessAccountId = config('services.whatsapp.business_account_id');
    }

    /**
     * Send WhatsApp message
     */
    public function send(PatientNotification $notification): array
    {
        try {
            $patient = $notification->patient;
            $whatsappNumber = $this->formatPhoneNumber($patient->whatsapp_number ?? $patient->phone);

            if (!$whatsappNumber) {
                throw new \Exception('No valid WhatsApp number found for patient');
            }

            // Check if patient has opted in to WhatsApp
            if (!$this->hasOptedIn($whatsappNumber)) {
                throw new \Exception('Patient has not opted in to WhatsApp notifications');
            }

            $messageData = $this->prepareMessage($notification, $whatsappNumber);
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->accessToken,
                'Content-Type' => 'application/json',
            ])->post("{$this->apiUrl}/{$this->phoneNumberId}/messages", $messageData);

            if ($response->successful()) {
                $responseData = $response->json();
                
                return [
                    'success' => true,
                    'external_id' => $responseData['messages'][0]['id'] ?? null,
                    'response' => $responseData,
                ];
            } else {
                $error = $response->json()['error'] ?? 'Unknown error';
                throw new \Exception("WhatsApp API error: " . json_encode($error));
            }

        } catch (\Exception $e) {
            Log::error('WhatsApp send failed', [
                'notification_id' => $notification->id,
                'patient_id' => $notification->patient_id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Prepare message data based on notification type
     */
    private function prepareMessage(PatientNotification $notification, string $whatsappNumber): array
    {
        $baseMessage = [
            'messaging_product' => 'whatsapp',
            'to' => $whatsappNumber,
        ];

        // Use template for structured notifications
        if ($this->shouldUseTemplate($notification)) {
            return array_merge($baseMessage, $this->prepareTemplateMessage($notification));
        }

        // Use text message for simple notifications
        return array_merge($baseMessage, [
            'type' => 'text',
            'text' => [
                'body' => $notification->personalizeMessage(),
            ],
        ]);
    }

    /**
     * Check if notification should use WhatsApp template
     */
    private function shouldUseTemplate(PatientNotification $notification): bool
    {
        $templateTypes = [
            'appointment_confirmation',
            'appointment_reminder_24_hour',
            'appointment_reminder_1_hour',
            'test_results',
            'medication_reminder',
        ];

        return in_array($notification->type, $templateTypes) && 
               $this->hasApprovedTemplate($notification->type);
    }

    /**
     * Prepare WhatsApp template message
     */
    private function prepareTemplateMessage(PatientNotification $notification): array
    {
        $templateName = $this->getTemplateName($notification->type);
        $templateData = $notification->template_data ?? [];

        $message = [
            'type' => 'template',
            'template' => [
                'name' => $templateName,
                'language' => [
                    'code' => $notification->patient->preferred_language ?? 'en',
                ],
            ],
        ];

        // Add template parameters
        $parameters = $this->buildTemplateParameters($notification->type, $templateData);
        if (!empty($parameters)) {
            $message['template']['components'] = [
                [
                    'type' => 'body',
                    'parameters' => $parameters,
                ],
            ];
        }

        // Add buttons for interactive templates
        $buttons = $this->buildTemplateButtons($notification);
        if (!empty($buttons)) {
            $message['template']['components'][] = [
                'type' => 'button',
                'parameters' => $buttons,
            ];
        }

        return $message;
    }

    /**
     * Build template parameters
     */
    private function buildTemplateParameters(string $type, array $templateData): array
    {
        $parameters = [];

        switch ($type) {
            case 'appointment_confirmation':
            case 'appointment_reminder_24_hour':
            case 'appointment_reminder_1_hour':
                $parameters = [
                    ['type' => 'text', 'text' => $templateData['patient_name'] ?? ''],
                    ['type' => 'text', 'text' => $templateData['doctor_name'] ?? ''],
                    ['type' => 'text', 'text' => $templateData['appointment_date'] ?? ''],
                    ['type' => 'text', 'text' => $templateData['appointment_time'] ?? ''],
                    ['type' => 'text', 'text' => $templateData['facility_name'] ?? ''],
                ];
                break;

            case 'medication_reminder':
                $parameters = [
                    ['type' => 'text', 'text' => $templateData['patient_name'] ?? ''],
                    ['type' => 'text', 'text' => $templateData['medication_name'] ?? ''],
                    ['type' => 'text', 'text' => $templateData['dosage'] ?? ''],
                    ['type' => 'text', 'text' => $templateData['time'] ?? ''],
                ];
                break;

            case 'test_results':
                $parameters = [
                    ['type' => 'text', 'text' => $templateData['patient_name'] ?? ''],
                    ['type' => 'text', 'text' => $templateData['test_name'] ?? ''],
                    ['type' => 'text', 'text' => $templateData['doctor_name'] ?? ''],
                ];
                break;
        }

        return $parameters;
    }

    /**
     * Build template buttons
     */
    private function buildTemplateButtons(PatientNotification $notification): array
    {
        $buttons = [];

        switch ($notification->type) {
            case 'appointment_confirmation':
            case 'appointment_reminder_24_hour':
                $buttons = [
                    [
                        'type' => 'url',
                        'text' => config('app.url') . "/appointments/{$notification->notifiable_id}/confirm",
                    ],
                ];
                break;

            case 'test_results':
                if (isset($notification->template_data['results_link'])) {
                    $buttons = [
                        [
                            'type' => 'url',
                            'text' => $notification->template_data['results_link'],
                        ],
                    ];
                }
                break;
        }

        return $buttons;
    }

    /**
     * Get WhatsApp template name
     */
    private function getTemplateName(string $notificationType): string
    {
        $templateMap = [
            'appointment_confirmation' => 'appointment_confirmation',
            'appointment_reminder_24_hour' => 'appointment_reminder_24h',
            'appointment_reminder_1_hour' => 'appointment_reminder_1h',
            'medication_reminder' => 'medication_reminder',
            'test_results' => 'test_results_available',
            'follow_up_reminder' => 'follow_up_reminder',
        ];

        return $templateMap[$notificationType] ?? 'general_notification';
    }

    /**
     * Check if template is approved
     */
    private function hasApprovedTemplate(string $notificationType): bool
    {
        $cacheKey = "whatsapp_template_approved_{$notificationType}";
        
        return Cache::remember($cacheKey, 3600, function () use ($notificationType) {
            try {
                $templateName = $this->getTemplateName($notificationType);
                
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $this->accessToken,
                ])->get("{$this->apiUrl}/{$this->businessAccountId}/message_templates", [
                    'name' => $templateName,
                ]);

                if ($response->successful()) {
                    $templates = $response->json()['data'] ?? [];
                    foreach ($templates as $template) {
                        if ($template['name'] === $templateName && $template['status'] === 'APPROVED') {
                            return true;
                        }
                    }
                }

                return false;

            } catch (\Exception $e) {
                Log::warning('Failed to check WhatsApp template status', [
                    'template' => $notificationType,
                    'error' => $e->getMessage(),
                ]);
                return false;
            }
        });
    }

    /**
     * Check if patient has opted in to WhatsApp
     */
    private function hasOptedIn(string $whatsappNumber): bool
    {
        // Check opt-in status from database or cache
        $cacheKey = "whatsapp_optin_{$whatsappNumber}";
        
        return Cache::remember($cacheKey, 86400, function () use ($whatsappNumber) {
            // In a real implementation, you would check your opt-in database
            // For now, we'll assume patients are opted in if they have a WhatsApp number
            return true;
        });
    }

    /**
     * Format phone number for WhatsApp
     */
    private function formatPhoneNumber(string $phoneNumber): ?string
    {
        // Remove all non-numeric characters
        $cleaned = preg_replace('/[^0-9]/', '', $phoneNumber);
        
        if (empty($cleaned)) {
            return null;
        }

        // Add country code if missing (assuming US +1 for this example)
        if (strlen($cleaned) === 10) {
            $cleaned = '1' . $cleaned;
        }

        // Ensure it starts with country code
        if (!str_starts_with($cleaned, '1') && strlen($cleaned) === 11) {
            // Already has country code
        } elseif (strlen($cleaned) < 10) {
            return null; // Invalid number
        }

        return $cleaned;
    }

    /**
     * Handle webhook for message status updates
     */
    public function handleWebhook(array $webhookData): void
    {
        try {
            if (!isset($webhookData['entry'])) {
                return;
            }

            foreach ($webhookData['entry'] as $entry) {
                if (!isset($entry['changes'])) {
                    continue;
                }

                foreach ($entry['changes'] as $change) {
                    if ($change['field'] !== 'messages') {
                        continue;
                    }

                    $value = $change['value'] ?? [];
                    
                    // Handle status updates
                    if (isset($value['statuses'])) {
                        $this->handleStatusUpdates($value['statuses']);
                    }

                    // Handle incoming messages (for two-way communication)
                    if (isset($value['messages'])) {
                        $this->handleIncomingMessages($value['messages']);
                    }
                }
            }

        } catch (\Exception $e) {
            Log::error('WhatsApp webhook processing failed', [
                'error' => $e->getMessage(),
                'webhook_data' => $webhookData,
            ]);
        }
    }

    /**
     * Handle message status updates
     */
    private function handleStatusUpdates(array $statuses): void
    {
        foreach ($statuses as $status) {
            $messageId = $status['id'] ?? null;
            $statusType = $status['status'] ?? null;

            if (!$messageId || !$statusType) {
                continue;
            }

            $notification = PatientNotification::where('external_id', $messageId)->first();
            
            if (!$notification) {
                continue;
            }

            $metadata = [
                'timestamp' => $status['timestamp'] ?? null,
                'recipient_id' => $status['recipient_id'] ?? null,
            ];

            // Add error information if present
            if (isset($status['errors'])) {
                $metadata['errors'] = $status['errors'];
            }

            $notification->updateExternalStatus($statusType, $metadata);
        }
    }

    /**
     * Handle incoming messages
     */
    private function handleIncomingMessages(array $messages): void
    {
        foreach ($messages as $message) {
            $from = $message['from'] ?? null;
            $messageBody = $message['text']['body'] ?? null;
            $messageType = $message['type'] ?? 'text';

            if (!$from || !$messageBody) {
                continue;
            }

            // Find patient by WhatsApp number
            $patient = \App\Models\Patient::where('whatsapp_number', $from)
                ->orWhere('phone', $from)
                ->first();

            if (!$patient) {
                continue;
            }

            // Process the incoming message
            $this->processIncomingMessage($patient, $messageBody, $messageType, $message);
        }
    }

    /**
     * Process incoming message from patient
     */
    private function processIncomingMessage(\App\Models\Patient $patient, string $messageBody, string $messageType, array $messageData): void
    {
        try {
            // Log the incoming message
            Log::info('WhatsApp message received', [
                'patient_id' => $patient->id,
                'message' => $messageBody,
                'type' => $messageType,
            ]);

            // Check for common responses
            $lowerMessage = strtolower(trim($messageBody));

            // Handle appointment confirmations
            if (in_array($lowerMessage, ['yes', 'confirm', 'confirmed', 'ok'])) {
                $this->handleAppointmentConfirmation($patient);
            }

            // Handle appointment cancellations
            if (in_array($lowerMessage, ['no', 'cancel', 'cancelled', 'reschedule'])) {
                $this->handleAppointmentCancellation($patient, $messageBody);
            }

            // Handle follow-up responses
            if (str_contains($lowerMessage, 'follow') || str_contains($lowerMessage, 'update')) {
                $this->handleFollowUpResponse($patient, $messageBody);
            }

            // Handle medication confirmations
            if (str_contains($lowerMessage, 'taken') || str_contains($lowerMessage, 'medication')) {
                $this->handleMedicationConfirmation($patient, $messageBody);
            }

            // Store the message for healthcare provider review
            \App\Models\PatientMessage::create([
                'patient_id' => $patient->id,
                'channel' => 'whatsapp',
                'direction' => 'inbound',
                'message' => $messageBody,
                'message_type' => $messageType,
                'external_id' => $messageData['id'] ?? null,
                'metadata' => $messageData,
                'received_at' => now(),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to process incoming WhatsApp message', [
                'patient_id' => $patient->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle appointment confirmation via WhatsApp
     */
    private function handleAppointmentConfirmation(\App\Models\Patient $patient): void
    {
        $upcomingAppointment = \App\Models\Appointment::where('patient_id', $patient->id)
            ->where('status', 'scheduled')
            ->where('scheduled_at', '>', now())
            ->orderBy('scheduled_at')
            ->first();

        if ($upcomingAppointment) {
            $upcomingAppointment->confirm();
            
            // Send confirmation response
            $this->sendConfirmationResponse($patient, $upcomingAppointment);
        }
    }

    /**
     * Send confirmation response
     */
    private function sendConfirmationResponse(\App\Models\Patient $patient, \App\Models\Appointment $appointment): void
    {
        $message = "Thank you for confirming your appointment with Dr. {$appointment->doctor->name} on {$appointment->scheduled_at->format('F j, Y')} at {$appointment->scheduled_at->format('g:i A')}. We look forward to seeing you!";

        $this->sendSimpleMessage($patient->whatsapp_number ?? $patient->phone, $message);
    }

    /**
     * Send simple text message
     */
    public function sendSimpleMessage(string $whatsappNumber, string $message): array
    {
        try {
            $formattedNumber = $this->formatPhoneNumber($whatsappNumber);
            
            if (!$formattedNumber) {
                throw new \Exception('Invalid WhatsApp number');
            }

            $messageData = [
                'messaging_product' => 'whatsapp',
                'to' => $formattedNumber,
                'type' => 'text',
                'text' => [
                    'body' => $message,
                ],
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->accessToken,
                'Content-Type' => 'application/json',
            ])->post("{$this->apiUrl}/{$this->phoneNumberId}/messages", $messageData);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'response' => $response->json(),
                ];
            } else {
                throw new \Exception('WhatsApp API error: ' . $response->body());
            }

        } catch (\Exception $e) {
            Log::error('Failed to send simple WhatsApp message', [
                'number' => $whatsappNumber,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get delivery analytics
     */
    public function getAnalytics(\DateTime $startDate, \DateTime $endDate): array
    {
        $notifications = PatientNotification::where('channel', 'whatsapp')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        $total = $notifications->count();
        $sent = $notifications->where('status', 'sent')->count();
        $delivered = $notifications->where('status', 'delivered')->count();
        $read = $notifications->where('status', 'read')->count();
        $failed = $notifications->where('status', 'failed')->count();

        return [
            'total' => $total,
            'sent' => $sent,
            'delivered' => $delivered,
            'read' => $read,
            'failed' => $failed,
            'delivery_rate' => $total > 0 ? ($delivered / $total) * 100 : 0,
            'read_rate' => $delivered > 0 ? ($read / $delivered) * 100 : 0,
            'failure_rate' => $total > 0 ? ($failed / $total) * 100 : 0,
            'total_cost' => $notifications->sum('cost'),
        ];
    }
}
