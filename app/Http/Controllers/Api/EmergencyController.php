<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmergencyBroadcast;
use App\Models\User;
use App\Models\AuditLog;
use App\Services\NotificationService;
use App\Services\WhatsAppService;
use App\Events\EmergencyBroadcastSent;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class EmergencyController extends Controller
{
    protected $notificationService;
    protected $whatsappService;

    public function __construct(NotificationService $notificationService, WhatsAppService $whatsappService)
    {
        $this->notificationService = $notificationService;
        $this->whatsappService = $whatsappService;
    }

    /**
     * Send emergency broadcast to all relevant users
     */
    public function sendEmergencyBroadcast(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'message' => 'required|string|max:1000',
                'severity' => 'required|in:low,medium,high,critical',
                'type' => 'required|in:medical_emergency,system_alert,security_alert,weather_alert,evacuation',
                'target_roles' => 'nullable|array',
                'target_roles.*' => 'in:super_admin,hospital_admin,doctor,nurse,dispatcher,ambulance_driver,ambulance_paramedic',
                'target_facilities' => 'nullable|array',
                'target_facilities.*' => 'exists:facilities,id',
                'channels' => 'required|array',
                'channels.*' => 'in:database,email,sms,whatsapp,push,voice',
                'expires_at' => 'nullable|date|after:now',
            ]);

            $user = Auth::user();

            // Check permissions
            if (!Gate::allows('send-emergency-broadcasts')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to send emergency broadcasts'
                ], 403);
            }

            // Create emergency broadcast record
            $broadcast = EmergencyBroadcast::create([
                'title' => $request->title,
                'message' => $request->message,
                'severity' => $request->severity,
                'type' => $request->type,
                'sent_by' => $user->id,
                'target_roles' => $request->target_roles ?? [],
                'target_facilities' => $request->target_facilities ?? [],
                'channels' => $request->channels,
                'expires_at' => $request->expires_at,
                'status' => 'sending',
                'metadata' => [
                    'user_agent' => $request->userAgent(),
                    'ip_address' => $request->ip(),
                    'timestamp' => now()->toISOString(),
                ],
            ]);

            // Determine target users
            $targetUsers = $this->getTargetUsers($request->target_roles, $request->target_facilities);

            // Prepare notification data
            $notificationData = [
                'title' => $request->title,
                'message' => $request->message,
                'type' => 'emergency_broadcast',
                'priority' => 'urgent',
                'category' => 'emergency',
                'severity' => $request->severity,
                'broadcast_type' => $request->type,
                'icon' => 'emergency',
                'sender_id' => $user->id,
                'sender_name' => $user->full_name,
                'broadcast_id' => $broadcast->id,
            ];

            // Send to all target users
            $results = [];
            $successCount = 0;
            $failureCount = 0;

            foreach ($targetUsers as $targetUser) {
                try {
                    $result = $this->notificationService->send(
                        $targetUser->id,
                        $notificationData,
                        $request->channels
                    );

                    $results[] = [
                        'user_id' => $targetUser->id,
                        'user_name' => $targetUser->full_name,
                        'result' => $result,
                    ];

                    if ($result['success']) {
                        $successCount++;
                    } else {
                        $failureCount++;
                    }

                } catch (\Exception $e) {
                    $results[] = [
                        'user_id' => $targetUser->id,
                        'user_name' => $targetUser->full_name,
                        'result' => ['success' => false, 'error' => $e->getMessage()],
                    ];
                    $failureCount++;
                }
            }

            // Update broadcast status
            $broadcast->update([
                'status' => 'sent',
                'sent_at' => now(),
                'recipient_count' => count($targetUsers),
                'success_count' => $successCount,
                'failure_count' => $failureCount,
                'delivery_results' => $results,
            ]);

            // Broadcast the emergency event
            broadcast(new EmergencyBroadcastSent($broadcast, $user))->toOthers();

            // Log the emergency broadcast
            AuditLog::logActivity(
                'emergency.broadcast.sent',
                $broadcast,
                [],
                [
                    'severity' => $request->severity,
                    'type' => $request->type,
                    'recipient_count' => count($targetUsers),
                    'success_count' => $successCount,
                    'failure_count' => $failureCount,
                    'channels' => $request->channels,
                ],
                "Emergency broadcast '{$request->title}' sent to {$successCount} recipients",
                'critical',
                ['emergency', 'broadcast', 'communication']
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'broadcast' => $broadcast,
                    'recipient_count' => count($targetUsers),
                    'success_count' => $successCount,
                    'failure_count' => $failureCount,
                    'results' => $results,
                ],
                'message' => "Emergency broadcast sent to {$successCount} recipients"
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error sending emergency broadcast: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send emergency broadcast',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Send urgent medical alert
     */
    public function sendUrgentMedicalAlert(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'patient_id' => 'required|exists:patients,id',
                'condition' => 'required|string|max:500',
                'location' => 'required|string|max:255',
                'priority' => 'required|in:urgent,critical,life_threatening',
                'required_specialties' => 'nullable|array',
                'required_specialties.*' => 'string',
                'estimated_arrival' => 'nullable|date|after:now',
            ]);

            $user = Auth::user();

            // Check permissions
            if (!Gate::allows('send-medical-alerts')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to send medical alerts'
                ], 403);
            }

            $patient = \App\Models\Patient::findOrFail($request->patient_id);

            // Determine target medical staff
            $targetRoles = ['doctor', 'nurse'];
            if ($request->priority === 'life_threatening') {
                $targetRoles = array_merge($targetRoles, ['hospital_admin', 'dispatcher']);
            }

            $targetUsers = User::whereIn('role', $targetRoles)
                ->where('is_active', true)
                ->get();

            // Create alert message
            $alertTitle = "URGENT MEDICAL ALERT - {$request->priority}";
            $alertMessage = "Patient: {$patient->full_name}\n";
            $alertMessage .= "Condition: {$request->condition}\n";
            $alertMessage .= "Location: {$request->location}\n";
            if ($request->estimated_arrival) {
                $alertMessage .= "ETA: {$request->estimated_arrival}\n";
            }
            if ($request->required_specialties) {
                $alertMessage .= "Required Specialties: " . implode(', ', $request->required_specialties);
            }

            // Send emergency broadcast
            $broadcastRequest = new Request([
                'title' => $alertTitle,
                'message' => $alertMessage,
                'severity' => $request->priority === 'life_threatening' ? 'critical' : 'high',
                'type' => 'medical_emergency',
                'target_roles' => $targetRoles,
                'channels' => ['database', 'push', 'sms'],
            ]);

            return $this->sendEmergencyBroadcast($broadcastRequest);

        } catch (\Exception $e) {
            \Log::error('Error sending urgent medical alert: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send urgent medical alert',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get emergency broadcast history
     */
    public function getBroadcastHistory(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            // Check permissions
            if (!Gate::allows('view-emergency-broadcasts')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to view emergency broadcasts'
                ], 403);
            }

            $perPage = min($request->get('per_page', 20), 100);

            $broadcasts = EmergencyBroadcast::with('sender')
                ->when($request->type, function ($query, $type) {
                    $query->where('type', $type);
                })
                ->when($request->severity, function ($query, $severity) {
                    $query->where('severity', $severity);
                })
                ->when($request->status, function ($query, $status) {
                    $query->where('status', $status);
                })
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'broadcasts' => $broadcasts->items(),
                    'pagination' => [
                        'current_page' => $broadcasts->currentPage(),
                        'last_page' => $broadcasts->lastPage(),
                        'per_page' => $broadcasts->perPage(),
                        'total' => $broadcasts->total(),
                        'has_more' => $broadcasts->hasMorePages(),
                    ],
                ],
                'message' => 'Emergency broadcast history retrieved successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching emergency broadcast history: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch emergency broadcast history',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get target users based on roles and facilities
     */
    private function getTargetUsers(?array $targetRoles = null, ?array $targetFacilities = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = User::where('is_active', true);

        if ($targetRoles) {
            $query->whereIn('role', $targetRoles);
        }

        if ($targetFacilities) {
            $query->whereIn('facility_id', $targetFacilities);
        }

        // If no specific targeting, send to all medical staff
        if (!$targetRoles && !$targetFacilities) {
            $query->whereIn('role', ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'dispatcher']);
        }

        return $query->get();
    }
}
