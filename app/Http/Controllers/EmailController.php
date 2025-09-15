<?php

namespace App\Http\Controllers;

use App\Models\EmailMessage;
use App\Models\EmailFolder;
use App\Models\EmailTemplate;
use App\Models\EmailContact;
use App\Services\EmailService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EmailController extends Controller
{
    private $emailService;

    public function __construct(EmailService $emailService)
    {
        $this->emailService = $emailService;
    }

    /**
     * Display email interface
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();
        
        // Get user's folders
        $folders = EmailFolder::where('user_id', $user->id)
            ->orderBy('sort_order')
            ->get();

        // Get emails for current folder
        $folderId = $request->get('folder', $folders->where('type', 'inbox')->first()?->id);
        $currentFolder = $folders->find($folderId);

        $emails = EmailMessage::forUser($user->id)
            ->when($folderId, fn($q) => $q->inFolder($folderId, $user->id))
            ->with(['sender', 'emailAttachments'])
            ->latest('created_at')
            ->paginate(50);

        // Get unread counts for folders
        $folderCounts = [];
        foreach ($folders as $folder) {
            $folderCounts[$folder->id] = EmailMessage::forUser($user->id)
                ->inFolder($folder->id, $user->id)
                ->where('status', '!=', 'read')
                ->count();
        }

        return Inertia::render('emails/index', [
            'folders' => $folders,
            'currentFolder' => $currentFolder,
            'emails' => $emails,
            'folderCounts' => $folderCounts,
            'user' => $user,
        ]);
    }

    /**
     * Show specific email
     */
    public function show(EmailMessage $email): Response
    {
        $user = auth()->user();

        if (!$email->canBeAccessedBy($user)) {
            abort(403, 'You do not have access to this email');
        }

        // Mark as read if it's an inbound email
        if ($email->type === 'inbound' && !$email->is_opened) {
            $email->markAsOpened(
                request()->header('User-Agent'),
                request()->ip()
            );
        }

        return Inertia::render('emails/show', [
            'email' => $email->load([
                'sender',
                'emailAttachments',
                'trackingEvents',
                'referral'
            ]),
            'canReply' => $email->type === 'inbound',
        ]);
    }

    /**
     * Compose new email
     */
    public function compose(Request $request): Response
    {
        $user = auth()->user();
        
        // Get user's contacts and templates
        $contacts = EmailContact::where('user_id', $user->id)
            ->orderBy('name')
            ->get();

        $templates = EmailTemplate::where('is_active', true)
            ->orderBy('name')
            ->get();

        // Pre-fill data if provided
        $prefill = [
            'to' => $request->get('to'),
            'subject' => $request->get('subject'),
            'referral_id' => $request->get('referral_id'),
        ];

        return Inertia::render('emails/compose', [
            'contacts' => $contacts,
            'templates' => $templates,
            'prefill' => $prefill,
            'user' => $user,
        ]);
    }

    /**
     * Send email
     */
    public function send(Request $request): JsonResponse
    {
        $request->validate([
            'to' => 'required|array|min:1',
            'to.*' => 'email',
            'cc' => 'nullable|array',
            'cc.*' => 'email',
            'bcc' => 'nullable|array',
            'bcc.*' => 'email',
            'subject' => 'required|string|max:255',
            'body_html' => 'required|string',
            'body_text' => 'nullable|string',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240', // 10MB max
            'template_id' => 'nullable|exists:email_templates,id',
            'referral_id' => 'nullable|exists:referrals,id',
            'send_at' => 'nullable|date|after:now',
        ]);

        $email = $this->emailService->sendEmail([
            'sender_id' => auth()->id(),
            'recipients' => [
                'to' => $request->to,
                'cc' => $request->cc ?? [],
                'bcc' => $request->bcc ?? [],
            ],
            'subject' => $request->subject,
            'body_html' => $request->body_html,
            'body_text' => $request->body_text,
            'attachments' => $request->file('attachments', []),
            'template_id' => $request->template_id,
            'referral_id' => $request->referral_id,
            'send_at' => $request->send_at,
        ]);

        return response()->json([
            'message' => $request->send_at ? 'Email scheduled successfully' : 'Email sent successfully',
            'email' => $email
        ]);
    }

    /**
     * Reply to email
     */
    public function reply(Request $request, EmailMessage $email): JsonResponse
    {
        if (!$email->canBeAccessedBy(auth()->user())) {
            abort(403, 'You do not have access to this email');
        }

        $request->validate([
            'body_html' => 'required|string',
            'body_text' => 'nullable|string',
            'include_original' => 'boolean',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240',
        ]);

        $reply = $this->emailService->replyToEmail($email, [
            'body_html' => $request->body_html,
            'body_text' => $request->body_text,
            'include_original' => $request->include_original ?? true,
            'attachments' => $request->file('attachments', []),
        ]);

        return response()->json([
            'message' => 'Reply sent successfully',
            'email' => $reply
        ]);
    }

    /**
     * Forward email
     */
    public function forward(Request $request, EmailMessage $email): JsonResponse
    {
        if (!$email->canBeAccessedBy(auth()->user())) {
            abort(403, 'You do not have access to this email');
        }

        $request->validate([
            'to' => 'required|array|min:1',
            'to.*' => 'email',
            'cc' => 'nullable|array',
            'cc.*' => 'email',
            'body_html' => 'nullable|string',
            'body_text' => 'nullable|string',
        ]);

        $forwarded = $this->emailService->forwardEmail($email, [
            'to' => $request->to,
            'cc' => $request->cc ?? [],
            'body_html' => $request->body_html,
            'body_text' => $request->body_text,
        ]);

        return response()->json([
            'message' => 'Email forwarded successfully',
            'email' => $forwarded
        ]);
    }

    /**
     * Move email to folder
     */
    public function moveToFolder(Request $request, EmailMessage $email): JsonResponse
    {
        $user = auth()->user();

        if (!$email->canBeAccessedBy($user)) {
            abort(403, 'You do not have access to this email');
        }

        $request->validate([
            'folder_id' => 'required|exists:email_folders,id',
        ]);

        $folder = EmailFolder::where('id', $request->folder_id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $email->addToFolder($folder, $user);

        return response()->json([
            'message' => 'Email moved to folder successfully'
        ]);
    }

    /**
     * Delete email
     */
    public function delete(EmailMessage $email): JsonResponse
    {
        $user = auth()->user();

        if (!$email->canBeAccessedBy($user)) {
            abort(403, 'You do not have access to this email');
        }

        // Move to trash folder instead of hard delete
        $trashFolder = EmailFolder::where('user_id', $user->id)
            ->where('type', 'trash')
            ->first();

        if ($trashFolder) {
            $email->addToFolder($trashFolder, $user);
        }

        return response()->json([
            'message' => 'Email moved to trash'
        ]);
    }

    /**
     * Get email tracking pixel
     */
    public function trackingPixel(Request $request, EmailMessage $email): \Illuminate\Http\Response
    {
        $token = $request->get('token');
        $expectedToken = hash('sha256', $email->message_id . config('app.key'));

        if ($token === $expectedToken) {
            $email->markAsOpened(
                $request->header('User-Agent'),
                $request->ip()
            );
        }

        // Return 1x1 transparent pixel
        $pixel = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        
        return response($pixel)
            ->header('Content-Type', 'image/gif')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }

    /**
     * Track email clicks
     */
    public function trackClick(Request $request, EmailMessage $email): \Illuminate\Http\RedirectResponse
    {
        $token = $request->get('token');
        $encodedUrl = $request->get('url');
        $originalUrl = base64_decode($encodedUrl);
        
        $expectedToken = hash('sha256', $email->message_id . $originalUrl . config('app.key'));

        if ($token === $expectedToken) {
            $email->markAsClicked(
                $originalUrl,
                $request->header('User-Agent'),
                $request->ip()
            );
        }

        return redirect($originalUrl);
    }

    /**
     * Search emails
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|min:2',
            'folder_id' => 'nullable|exists:email_folders,id',
            'from' => 'nullable|email',
            'to' => 'nullable|email',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        $user = auth()->user();
        $query = $request->get('query');

        $emails = EmailMessage::forUser($user->id)
            ->when($request->folder_id, fn($q) => $q->inFolder($request->folder_id, $user->id))
            ->when($request->from, fn($q) => $q->fromEmail($request->from))
            ->when($request->to, fn($q) => $q->toEmail($request->to))
            ->when($request->date_from, fn($q) => $q->where('created_at', '>=', $request->date_from))
            ->when($request->date_to, fn($q) => $q->where('created_at', '<=', $request->date_to))
            ->where(function ($q) use ($query) {
                $q->withSubject($query)
                  ->orWhere('body_text', 'like', "%{$query}%")
                  ->orWhere('body_html', 'like', "%{$query}%");
            })
            ->with(['sender', 'emailAttachments'])
            ->latest('created_at')
            ->paginate(50);

        return response()->json($emails);
    }

    /**
     * Get email statistics
     */
    public function getStats(Request $request): JsonResponse
    {
        $user = auth()->user();
        $days = $request->get('days', 30);

        $stats = [
            'total_sent' => EmailMessage::forUser($user->id)->outbound()->count(),
            'total_received' => EmailMessage::forUser($user->id)->inbound()->count(),
            'total_opened' => EmailMessage::forUser($user->id)->opened()->count(),
            'total_clicked' => EmailMessage::forUser($user->id)->clicked()->count(),
            'recent_sent' => EmailMessage::forUser($user->id)->outbound()->recent($days)->count(),
            'recent_received' => EmailMessage::forUser($user->id)->inbound()->recent($days)->count(),
        ];

        return response()->json($stats);
    }
}
