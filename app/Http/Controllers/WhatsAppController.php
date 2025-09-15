<?php

namespace App\Http\Controllers;

use App\Models\WhatsAppConversation;
use App\Models\WhatsAppMessage;
use App\Models\WhatsAppBusinessAccount;
use App\Models\WhatsAppTemplate;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class WhatsAppController extends Controller
{
    private $whatsappService;

    public function __construct(WhatsAppService $whatsappService)
    {
        $this->whatsappService = $whatsappService;
    }

    /**
     * Display WhatsApp interface
     */
    public function index(Request $request): Response
    {
        $businessAccount = WhatsAppBusinessAccount::where('status', 'active')->first();
        
        if (!$businessAccount) {
            return Inertia::render('WhatsApp/Setup');
        }

        $conversations = WhatsAppConversation::forBusinessAccount($businessAccount->id)
            ->with(['assignedUser', 'labels'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->assigned_to, fn($q) => $q->assignedTo($request->assigned_to))
            ->when($request->unread_only, fn($q) => $q->unread())
            ->orderBy('last_message_at', 'desc')
            ->paginate(50);

        return Inertia::render('WhatsApp/Index', [
            'businessAccount' => $businessAccount,
            'conversations' => $conversations,
            'currentUser' => auth()->user(),
        ]);
    }

    /**
     * Show specific conversation
     */
    public function showConversation(WhatsAppConversation $conversation): Response
    {
        if (!$conversation->canBeAccessedBy(auth()->user())) {
            abort(403, 'You do not have access to this conversation');
        }

        // Mark conversation as read
        $conversation->markAsRead(auth()->user());

        // Load messages with pagination
        $messages = $conversation->messages()
            ->with(['sender'])
            ->latest('sent_at')
            ->paginate(50);

        return Inertia::render('WhatsApp/Conversation', [
            'conversation' => $conversation->load(['assignedUser', 'labels', 'referral']),
            'messages' => $messages,
            'templates' => WhatsAppTemplate::where('business_account_id', $conversation->business_account_id)
                ->where('status', 'approved')
                ->get(),
            'quickReplies' => auth()->user()->whatsappQuickReplies ?? [],
        ]);
    }

    /**
     * Send WhatsApp message
     */
    public function sendMessage(Request $request, WhatsAppConversation $conversation): JsonResponse
    {
        if (!$conversation->canBeAccessedBy(auth()->user())) {
            abort(403, 'You do not have access to this conversation');
        }

        $request->validate([
            'type' => 'required|in:text,image,video,audio,document,location,template',
            'content' => 'required|array',
            'template_id' => 'nullable|exists:whatsapp_templates,id',
        ]);

        $message = $this->whatsappService->sendMessage($conversation, [
            'type' => $request->type,
            'content' => $request->content,
            'template_id' => $request->template_id,
            'sender_id' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Message sent successfully',
            'whatsapp_message' => $message
        ]);
    }

    /**
     * Send template message
     */
    public function sendTemplate(Request $request, WhatsAppConversation $conversation): JsonResponse
    {
        if (!$conversation->canBeAccessedBy(auth()->user())) {
            abort(403, 'You do not have access to this conversation');
        }

        $request->validate([
            'template_id' => 'required|exists:whatsapp_templates,id',
            'variables' => 'nullable|array',
            'recipient_phone' => 'required|string',
        ]);

        $message = $this->whatsappService->sendTemplateMessage([
            'conversation_id' => $conversation->id,
            'template_id' => $request->template_id,
            'variables' => $request->variables ?? [],
            'recipient_phone' => $request->recipient_phone,
            'sender_id' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Template message sent successfully',
            'whatsapp_message' => $message
        ]);
    }

    /**
     * Upload and send media
     */
    public function sendMedia(Request $request, WhatsAppConversation $conversation): JsonResponse
    {
        if (!$conversation->canBeAccessedBy(auth()->user())) {
            abort(403, 'You do not have access to this conversation');
        }

        $request->validate([
            'file' => 'required|file|max:16384', // 16MB max
            'caption' => 'nullable|string|max:1024',
            'type' => 'required|in:image,video,audio,document',
        ]);

        $message = $this->whatsappService->sendMediaMessage($conversation, [
            'file' => $request->file('file'),
            'caption' => $request->caption,
            'type' => $request->type,
            'sender_id' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Media sent successfully',
            'whatsapp_message' => $message
        ]);
    }

    /**
     * Assign conversation to user
     */
    public function assignConversation(Request $request, WhatsAppConversation $conversation): JsonResponse
    {
        $request->validate([
            'user_id' => 'nullable|exists:users,id',
        ]);

        if ($request->user_id) {
            $user = \App\Models\User::find($request->user_id);
            $conversation->assignTo($user);
            $message = 'Conversation assigned successfully';
        } else {
            $conversation->unassign();
            $message = 'Conversation unassigned successfully';
        }

        return response()->json(['message' => $message]);
    }

    /**
     * Add label to conversation
     */
    public function addLabel(Request $request, WhatsAppConversation $conversation): JsonResponse
    {
        $request->validate([
            'label_id' => 'required|exists:whatsapp_contact_labels,id',
        ]);

        $label = \App\Models\WhatsAppContactLabel::find($request->label_id);
        $conversation->addLabel($label, auth()->user());

        return response()->json([
            'message' => 'Label added successfully'
        ]);
    }

    /**
     * Remove label from conversation
     */
    public function removeLabel(Request $request, WhatsAppConversation $conversation): JsonResponse
    {
        $request->validate([
            'label_id' => 'required|exists:whatsapp_contact_labels,id',
        ]);

        $label = \App\Models\WhatsAppContactLabel::find($request->label_id);
        $conversation->removeLabel($label);

        return response()->json([
            'message' => 'Label removed successfully'
        ]);
    }

    /**
     * Archive conversation
     */
    public function archiveConversation(WhatsAppConversation $conversation): JsonResponse
    {
        $conversation->archive();

        return response()->json([
            'message' => 'Conversation archived successfully'
        ]);
    }

    /**
     * Unarchive conversation
     */
    public function unarchiveConversation(WhatsAppConversation $conversation): JsonResponse
    {
        $conversation->unarchive();

        return response()->json([
            'message' => 'Conversation unarchived successfully'
        ]);
    }

    /**
     * Block conversation
     */
    public function blockConversation(WhatsAppConversation $conversation): JsonResponse
    {
        $conversation->block();

        return response()->json([
            'message' => 'Conversation blocked successfully'
        ]);
    }

    /**
     * Webhook handler for WhatsApp
     */
    public function webhook(Request $request): JsonResponse
    {
        // Verify webhook
        if ($request->isMethod('GET')) {
            return $this->verifyWebhook($request);
        }

        // Process webhook payload
        $this->whatsappService->processWebhook($request->all());

        return response()->json(['status' => 'success']);
    }

    /**
     * Verify WhatsApp webhook
     */
    private function verifyWebhook(Request $request): JsonResponse
    {
        $mode = $request->get('hub_mode');
        $token = $request->get('hub_verify_token');
        $challenge = $request->get('hub_challenge');

        $verifyToken = config('services.whatsapp.webhook_verify_token');

        if ($mode === 'subscribe' && $token === $verifyToken) {
            return response($challenge, 200);
        }

        return response('Forbidden', 403);
    }

    /**
     * Get conversation statistics
     */
    public function getStats(Request $request): JsonResponse
    {
        $businessAccountId = $request->get('business_account_id');
        $days = $request->get('days', 30);

        $stats = $this->whatsappService->getConversationStats($businessAccountId, $days);

        return response()->json($stats);
    }

    /**
     * Search conversations
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|min:2',
            'business_account_id' => 'required|exists:whatsapp_business_accounts,id',
        ]);

        $conversations = WhatsAppConversation::forBusinessAccount($request->business_account_id)
            ->where(function ($q) use ($request) {
                $q->where('contact_name', 'like', "%{$request->query}%")
                  ->orWhere('contact_phone', 'like', "%{$request->query}%")
                  ->orWhereHas('messages', function ($messageQuery) use ($request) {
                      $messageQuery->whereJsonContains('content->text', $request->query);
                  });
            })
            ->with(['assignedUser', 'labels'])
            ->orderBy('last_message_at', 'desc')
            ->paginate(50);

        return response()->json($conversations);
    }

    /**
     * Get templates
     */
    public function getTemplates(Request $request): JsonResponse
    {
        $businessAccountId = $request->get('business_account_id');
        
        $templates = WhatsAppTemplate::where('business_account_id', $businessAccountId)
            ->where('status', 'approved')
            ->orderBy('name')
            ->get();

        return response()->json($templates);
    }
}
