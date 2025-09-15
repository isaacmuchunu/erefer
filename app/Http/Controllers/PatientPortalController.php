<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Appointment;
use App\Models\PatientFollowUp;
use App\Models\PatientNotification;
use App\Services\PatientNotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PatientPortalController extends Controller
{
    private $notificationService;

    public function __construct(PatientNotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
        $this->middleware('auth:patient');
    }

    /**
     * Patient dashboard
     */
    public function dashboard(): Response
    {
        $patient = Auth::guard('patient')->user();

        // Get upcoming appointments
        $upcomingAppointments = Appointment::where('patient_id', $patient->id)
            ->with(['doctor', 'facility', 'specialty'])
            ->upcoming()
            ->orderBy('scheduled_at')
            ->limit(5)
            ->get();

        // Get pending follow-ups
        $pendingFollowUps = PatientFollowUp::where('patient_id', $patient->id)
            ->pending()
            ->orderBy('scheduled_date')
            ->limit(5)
            ->get();

        // Get recent notifications
        $recentNotifications = PatientNotification::where('patient_id', $patient->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Calculate health metrics
        $healthMetrics = [
            'last_visit' => Appointment::where('patient_id', $patient->id)
                ->where('status', 'completed')
                ->orderBy('completed_at', 'desc')
                ->value('completed_at'),
            'next_appointment' => $upcomingAppointments->first()?->scheduled_at,
            'active_prescriptions' => $patient->prescriptions()->active()->count(),
            'pending_follow_ups' => $pendingFollowUps->count(),
            'unread_messages' => $recentNotifications->whereNull('read_at')->count(),
        ];

        // Quick actions based on patient permissions
        $quickActions = [
            'can_book_appointment' => true,
            'can_message_doctor' => true,
            'can_view_records' => true,
            'can_manage_prescriptions' => true,
        ];

        return Inertia::render('PatientPortal/Dashboard', [
            'patient' => $patient,
            'upcomingAppointments' => $upcomingAppointments,
            'pendingFollowUps' => $pendingFollowUps,
            'recentNotifications' => $recentNotifications,
            'healthMetrics' => $healthMetrics,
            'quickActions' => $quickActions,
        ]);
    }

    /**
     * Patient profile
     */
    public function profile(): Response
    {
        $patient = Auth::guard('patient')->user();

        return Inertia::render('PatientPortal/Profile', [
            'patient' => $patient,
        ]);
    }

    /**
     * Update patient profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $patient = Auth::guard('patient')->user();

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:patients,email,' . $patient->id,
            'phone' => 'required|string|max:20',
            'date_of_birth' => 'required|date',
            'address' => 'nullable|string|max:500',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'communication_preferences' => 'nullable|array',
        ]);

        $patient->update($request->only([
            'first_name',
            'last_name',
            'email',
            'phone',
            'date_of_birth',
            'address',
            'emergency_contact_name',
            'emergency_contact_phone',
            'communication_preferences',
        ]));

        return response()->json([
            'message' => 'Profile updated successfully',
            'patient' => $patient->fresh(),
        ]);
    }

    /**
     * Patient appointments
     */
    public function appointments(Request $request): Response
    {
        $patient = Auth::guard('patient')->user();

        $query = Appointment::where('patient_id', $patient->id)
            ->with(['doctor', 'facility', 'specialty']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->date_from) {
            $query->whereDate('scheduled_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('scheduled_at', '<=', $request->date_to);
        }

        $appointments = $query->orderBy('scheduled_at', 'desc')->paginate(20);

        return Inertia::render('PatientPortal/Appointments', [
            'appointments' => $appointments,
            'filters' => $request->only(['status', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Show specific appointment
     */
    public function showAppointment(Appointment $appointment): Response
    {
        $patient = Auth::guard('patient')->user();

        if ($appointment->patient_id !== $patient->id) {
            abort(403);
        }

        $appointment->load([
            'doctor',
            'facility',
            'specialty',
            'referral',
            'telemedicineSession',
            'prescriptions',
        ]);

        return Inertia::render('PatientPortal/AppointmentDetails', [
            'appointment' => $appointment,
        ]);
    }

    /**
     * Patient follow-ups
     */
    public function followUps(): Response
    {
        $patient = Auth::guard('patient')->user();

        $followUps = PatientFollowUp::where('patient_id', $patient->id)
            ->with(['doctor', 'appointment'])
            ->orderBy('scheduled_date', 'desc')
            ->paginate(20);

        return Inertia::render('PatientPortal/FollowUps', [
            'followUps' => $followUps,
        ]);
    }

    /**
     * Show specific follow-up
     */
    public function showFollowUp(PatientFollowUp $followUp): Response
    {
        $patient = Auth::guard('patient')->user();

        if ($followUp->patient_id !== $patient->id) {
            abort(403);
        }

        $followUp->load(['doctor', 'appointment']);

        return Inertia::render('PatientPortal/FollowUpDetails', [
            'followUp' => $followUp,
        ]);
    }

    /**
     * Respond to follow-up
     */
    public function respondToFollowUp(Request $request, PatientFollowUp $followUp): JsonResponse
    {
        $patient = Auth::guard('patient')->user();

        if ($followUp->patient_id !== $patient->id) {
            abort(403);
        }

        $request->validate([
            'responses' => 'required|array',
            'additional_notes' => 'nullable|string|max:1000',
        ]);

        $followUp->complete([
            'patient_responses' => $request->responses,
            'additional_notes' => $request->additional_notes,
        ]);

        return response()->json([
            'message' => 'Follow-up completed successfully',
            'followUp' => $followUp->fresh(),
        ]);
    }

    /**
     * Patient notifications
     */
    public function notifications(Request $request): Response|JsonResponse
    {
        $patient = Auth::guard('patient')->user();

        $query = PatientNotification::where('patient_id', $patient->id);

        if ($request->unread_only) {
            $query->whereNull('read_at');
        }

        $notifications = $query->orderBy('created_at', 'desc')
            ->paginate($request->limit ?? 20);

        $unreadCount = PatientNotification::where('patient_id', $patient->id)
            ->whereNull('read_at')
            ->count();

        if ($request->expectsJson()) {
            return response()->json([
                'notifications' => $notifications,
                'unread_count' => $unreadCount,
            ]);
        }

        return Inertia::render('PatientPortal/Notifications', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    /**
     * Mark notifications as read
     */
    public function markNotificationsAsRead(Request $request): JsonResponse
    {
        $patient = Auth::guard('patient')->user();

        $request->validate([
            'notification_ids' => 'required|array',
            'notification_ids.*' => 'integer|exists:patient_notifications,id',
        ]);

        PatientNotification::where('patient_id', $patient->id)
            ->whereIn('id', $request->notification_ids)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'message' => 'Notifications marked as read',
        ]);
    }

    /**
     * Update notification preferences
     */
    public function updateNotificationPreferences(Request $request): JsonResponse
    {
        $patient = Auth::guard('patient')->user();

        $request->validate([
            'email_notifications' => 'boolean',
            'sms_notifications' => 'boolean',
            'whatsapp_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'appointment_reminders' => 'boolean',
            'follow_up_reminders' => 'boolean',
            'medication_reminders' => 'boolean',
            'test_results' => 'boolean',
            'preferred_channel' => 'required|in:email,sms,whatsapp,push',
            'quiet_hours_start' => 'nullable|date_format:H:i',
            'quiet_hours_end' => 'nullable|date_format:H:i',
        ]);

        $preferences = $request->only([
            'email_notifications',
            'sms_notifications',
            'whatsapp_notifications',
            'push_notifications',
            'appointment_reminders',
            'follow_up_reminders',
            'medication_reminders',
            'test_results',
            'preferred_channel',
            'quiet_hours_start',
            'quiet_hours_end',
        ]);

        $patient->update(['communication_preferences' => $preferences]);

        return response()->json([
            'message' => 'Notification preferences updated successfully',
        ]);
    }

    /**
     * Patient medical records
     */
    public function medicalRecords(): Response
    {
        $patient = Auth::guard('patient')->user();

        $records = $patient->medicalRecords()
            ->with(['doctor', 'facility'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('PatientPortal/MedicalRecords', [
            'records' => $records,
        ]);
    }

    /**
     * Patient prescriptions
     */
    public function prescriptions(): Response
    {
        $patient = Auth::guard('patient')->user();

        $prescriptions = $patient->prescriptions()
            ->with(['doctor', 'appointment'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('PatientPortal/Prescriptions', [
            'prescriptions' => $prescriptions,
        ]);
    }

    /**
     * Patient messages
     */
    public function messages(): Response
    {
        $patient = Auth::guard('patient')->user();

        $conversations = $patient->conversations()
            ->with(['participants', 'lastMessage'])
            ->orderBy('updated_at', 'desc')
            ->paginate(20);

        return Inertia::render('PatientPortal/Messages', [
            'conversations' => $conversations,
        ]);
    }

    /**
     * Send message
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $patient = Auth::guard('patient')->user();

        $request->validate([
            'recipient_id' => 'required|exists:users,id',
            'message' => 'required|string|max:1000',
            'conversation_id' => 'nullable|exists:conversations,id',
        ]);

        // Create or find conversation
        $conversation = $patient->findOrCreateConversation($request->recipient_id);

        // Send message
        $message = $conversation->messages()->create([
            'sender_id' => $patient->id,
            'sender_type' => 'patient',
            'message' => $request->message,
            'sent_at' => now(),
        ]);

        return response()->json([
            'message' => 'Message sent successfully',
            'conversation' => $conversation->fresh(['participants', 'lastMessage']),
        ]);
    }
}
