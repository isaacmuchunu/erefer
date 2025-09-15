<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppConversation;
use App\Models\WhatsAppMessage;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class WhatsAppController extends Controller
{
    /**
     * Get WhatsApp conversations for the authenticated user
     */
    public function conversations(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Check if user can access WhatsApp communications
            if (!Gate::allows('access-communication-system')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to access WhatsApp conversations'
                ], 403);
            }

            // Get conversations based on user role and facility
            $query = WhatsAppConversation::query()
                ->with([
                    'assignedUser:id,first_name,last_name,role',
                    'messages' => function ($query) {
                        $query->latest()->limit(1);
                    }
                ])
                ->withCount('messages');

            // Apply role-based filtering
            if (!in_array($user->role, ['super_admin', 'hospital_admin'])) {
                $query->where('assigned_to', $user->id);
            }

            $conversations = $query
                ->when($request->search, function ($query, $search) {
                    $query->where('contact_name', 'like', "%{$search}%")
                          ->orWhere('contact_phone', 'like', "%{$search}%");
                })
                ->when($request->status, function ($query, $status) {
                    $query->where('status', $status);
                })
                ->when($request->assigned_to, function ($query, $assignedTo) {
                    $query->where('assigned_to', $assignedTo);
                })
                ->orderBy('last_message_at', 'desc')
                ->paginate($request->per_page ?? 20);

            // Transform the data for frontend consumption
            $conversations->getCollection()->transform(function ($conversation) {
                $lastMessage = $conversation->messages->first();
                return [
                    'id' => $conversation->id,
                    'contact' => [
                        'name' => $conversation->contact_name,
                        'phone' => $conversation->contact_phone,
                        'avatar' => $conversation->contact_profile['avatar'] ?? '/images/avatars/whatsapp-default.png',
                    ],
                    'status' => $conversation->status,
                    'assignedTo' => $conversation->assignedUser ? [
                        'id' => $conversation->assignedUser->id,
                        'name' => $conversation->assignedUser->full_name,
                        'role' => $conversation->assignedUser->role,
                    ] : null,
                    'lastMessage' => $lastMessage ? [
                        'id' => $lastMessage->id,
                        'content' => $lastMessage->content,
                        'type' => $lastMessage->type,
                        'direction' => $lastMessage->direction,
                        'timestamp' => $lastMessage->created_at->diffForHumans(),
                        'created_at' => $lastMessage->created_at,
                    ] : null,
                    'unreadCount' => $conversation->unread_count,
                    'messagesCount' => $conversation->messages_count,
                    'labels' => $conversation->labels ?? [],
                    'isArchived' => $conversation->is_archived,
                    'createdAt' => $conversation->created_at,
                    'updatedAt' => $conversation->updated_at,
                ];
            });

            // Log the access
            AuditLog::logActivity(
                'whatsapp.conversations.accessed',
                null,
                [],
                [],
                "User accessed WhatsApp conversations",
                'info',
                ['communication', 'whatsapp']
            );

            return response()->json([
                'success' => true,
                'data' => $conversations->items(),
                'meta' => [
                    'current_page' => $conversations->currentPage(),
                    'last_page' => $conversations->lastPage(),
                    'per_page' => $conversations->perPage(),
                    'total' => $conversations->total(),
                ],
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching WhatsApp conversations: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch WhatsApp conversations',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get a specific WhatsApp conversation with messages
     */
    public function conversation(Request $request, WhatsAppConversation $conversation): JsonResponse
    {
        try {
            $user = Auth::user();

            // Check if user can access this conversation
            if (!$conversation->canUserAccess($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to access this conversation'
                ], 403);
            }

            // Load messages with pagination
            $messages = $conversation->messages()
                ->with(['sender:id,first_name,last_name,avatar', 'attachments'])
                ->latest()
                ->paginate($request->per_page ?? 50);

            // Mark messages as read
            $conversation->markAsRead($user);

            // Log the access
            AuditLog::logActivity(
                'whatsapp.conversation.accessed',
                $conversation,
                [],
                [],
                "User accessed WhatsApp conversation with {$conversation->contact->name}",
                'info',
                ['communication', 'whatsapp', 'access']
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'conversation' => $conversation->load(['contact', 'assignedTo']),
                    'messages' => $messages,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching WhatsApp conversation: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch WhatsApp conversation',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Send a WhatsApp message
     */
    public function sendMessage(Request $request, WhatsAppConversation $conversation): JsonResponse
    {
        try {
            $request->validate([
                'content' => 'required|string|max:4096',
                'type' => 'in:text,image,document,audio,video',
                'template_id' => 'nullable|exists:whatsapp_templates,id',
                'attachments' => 'nullable|array',
                'attachments.*' => 'file|max:10240', // 10MB max
            ]);

            $user = Auth::user();

            // Check if user can send messages in this conversation
            if (!$conversation->canUserAccess($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to send messages in this conversation'
                ], 403);
            }

            // Create the message
            $message = $conversation->messages()->create([
                'content' => $request->content,
                'type' => $request->type ?? 'text',
                'direction' => 'outbound',
                'sender_id' => $user->id,
                'template_id' => $request->template_id,
                'status' => 'pending',
                'metadata' => [
                    'user_agent' => $request->userAgent(),
                    'ip_address' => $request->ip(),
                ],
            ]);

            // Handle attachments if any
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('whatsapp/attachments', 'public');
                    $message->attachments()->create([
                        'filename' => $file->getClientOriginalName(),
                        'path' => $path,
                        'size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                    ]);
                }
            }

            // Update conversation
            $conversation->update([
                'last_message_at' => now(),
                'last_message_id' => $message->id,
            ]);

            // TODO: Send via WhatsApp API
            // $this->sendViaWhatsAppAPI($message);

            // Log the message
            AuditLog::logActivity(
                'whatsapp.message.sent',
                $message,
                [],
                $message->toArray(),
                "WhatsApp message sent to {$conversation->contact->name}",
                'info',
                ['communication', 'whatsapp', 'message']
            );

            return response()->json([
                'success' => true,
                'data' => $message->load(['sender', 'attachments']),
                'message' => 'Message sent successfully'
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error sending WhatsApp message: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get WhatsApp templates
     */
    public function templates(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!Gate::allows('access-communication-system')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to access WhatsApp templates'
                ], 403);
            }

            // Mock templates for now - replace with actual template management
            $templates = [
                [
                    'id' => 1,
                    'name' => 'appointment_reminder',
                    'category' => 'appointment',
                    'language' => 'en',
                    'content' => 'Hello {{patient_name}}, this is a reminder for your appointment on {{appointment_date}} at {{appointment_time}}.',
                    'variables' => ['patient_name', 'appointment_date', 'appointment_time'],
                    'status' => 'approved',
                ],
                [
                    'id' => 2,
                    'name' => 'referral_update',
                    'category' => 'referral',
                    'language' => 'en',
                    'content' => 'Your referral to {{facility_name}} has been {{status}}. Reference: {{referral_id}}',
                    'variables' => ['facility_name', 'status', 'referral_id'],
                    'status' => 'approved',
                ],
                [
                    'id' => 3,
                    'name' => 'emergency_alert',
                    'category' => 'emergency',
                    'language' => 'en',
                    'content' => 'EMERGENCY: {{alert_type}} at {{location}}. Please respond immediately.',
                    'variables' => ['alert_type', 'location'],
                    'status' => 'approved',
                ],
            ];

            return response()->json([
                'success' => true,
                'data' => $templates,
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching WhatsApp templates: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch templates',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }



    /**
     * Get conversation messages
     */
    public function getMessages(Request $request, WhatsAppConversation $conversation): JsonResponse
    {
        try {
            $user = Auth::user();

            // Check permissions
            if (!Gate::allows('access-communication-system')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to view WhatsApp messages'
                ], 403);
            }

            // Check if user can access this conversation
            if (!in_array($user->role, ['super_admin', 'hospital_admin']) &&
                $conversation->assigned_to !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to view messages in this conversation'
                ], 403);
            }

            $perPage = min($request->get('per_page', 50), 100);

            $messages = $conversation->messages()
                ->orderBy('received_at', 'desc')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'conversation' => $conversation,
                    'messages' => $messages->items(),
                    'pagination' => [
                        'current_page' => $messages->currentPage(),
                        'last_page' => $messages->lastPage(),
                        'per_page' => $messages->perPage(),
                        'total' => $messages->total(),
                        'has_more' => $messages->hasMorePages(),
                    ],
                ],
                'message' => 'Messages retrieved successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching WhatsApp messages: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch messages',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Process WhatsApp webhook
     */
    public function webhook(Request $request): JsonResponse
    {
        try {
            // Verify webhook (for GET requests)
            if ($request->isMethod('GET')) {
                $mode = $request->get('hub_mode');
                $token = $request->get('hub_verify_token');
                $challenge = $request->get('hub_challenge');

                if ($mode === 'subscribe' && $token === config('services.whatsapp.webhook_verify_token')) {
                    return response($challenge, 200);
                } else {
                    return response('Forbidden', 403);
                }
            }

            // Process webhook data (for POST requests)
            $whatsappService = app(\App\Services\WhatsAppService::class);
            $result = $whatsappService->processWebhook($request->all());

            // Log webhook processing
            AuditLog::logActivity(
                'whatsapp.webhook.processed',
                null,
                [],
                [
                    'processed_count' => $result['processed'] ?? 0,
                    'success' => $result['success'],
                ],
                "WhatsApp webhook processed",
                'info',
                ['communication', 'whatsapp', 'webhook']
            );

            return response()->json([
                'success' => true,
                'message' => 'Webhook processed successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error processing WhatsApp webhook: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to process webhook',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

}
