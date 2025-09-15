<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use App\Models\Facility;
use App\Models\Specialty;
use App\Services\AppointmentService;
use App\Services\NotificationService;
use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    private $appointmentService;
    private $notificationService;
    private $aiService;

    public function __construct(
        AppointmentService $appointmentService,
        NotificationService $notificationService,
        AIService $aiService
    ) {
        $this->appointmentService = $appointmentService;
        $this->notificationService = $notificationService;
        $this->aiService = $aiService;
    }

    /**
     * Display appointment dashboard
     */
    public function index(Request $request): Response
    {
        $query = Appointment::with(['patient', 'doctor', 'facility', 'specialty']);

        // Apply filters
        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->doctor_id) {
            $query->where('doctor_id', $request->doctor_id);
        }

        if ($request->facility_id) {
            $query->where('facility_id', $request->facility_id);
        }

        if ($request->date) {
            $query->whereDate('scheduled_at', $request->date);
        }

        if ($request->appointment_type) {
            $query->where('appointment_type', $request->appointment_type);
        }

        // Role-based filtering
        if (auth()->user()->hasRole('doctor')) {
            $query->where('doctor_id', auth()->id());
        } elseif (auth()->user()->hasRole('facility_admin')) {
            $query->where('facility_id', auth()->user()->facility_id);
        }

        $appointments = $query->orderBy('scheduled_at', 'desc')->paginate(20);

        // Get dashboard statistics
        $stats = $this->appointmentService->getDashboardStats($request->all());

        return Inertia::render('Appointments/Index', [
            'appointments' => $appointments,
            'stats' => $stats,
            'filters' => $request->only(['status', 'doctor_id', 'facility_id', 'date', 'appointment_type']),
            'doctors' => User::doctors()->get(['id', 'name']),
            'facilities' => Facility::all(['id', 'name']),
        ]);
    }

    /**
     * Show appointment creation form
     */
    public function create(Request $request): Response
    {
        $referralId = $request->referral_id;
        $patientId = $request->patient_id;

        $data = [
            'patients' => Patient::all(['id', 'first_name', 'last_name', 'phone', 'email']),
            'doctors' => User::doctors()->get(['id', 'name', 'specialty_id']),
            'facilities' => Facility::all(['id', 'name', 'type']),
            'specialties' => Specialty::all(['id', 'name']),
        ];

        if ($referralId) {
            $data['referral'] = \App\Models\Referral::with(['patient', 'receivingFacility', 'specialty'])
                ->findOrFail($referralId);
        }

        if ($patientId) {
            $data['selectedPatient'] = Patient::findOrFail($patientId);
        }

        return Inertia::render('Appointments/Create', $data);
    }

    /**
     * Store new appointment
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:users,id',
            'facility_id' => 'required|exists:facilities,id',
            'specialty_id' => 'nullable|exists:specialties,id',
            'appointment_type' => 'required|in:consultation,follow_up,procedure,emergency,telemedicine',
            'scheduled_at' => 'required|date|after:now',
            'duration_minutes' => 'required|integer|min:15|max:480',
            'reason' => 'required|string|max:1000',
            'notes' => 'nullable|string|max:2000',
            'priority' => 'required|in:low,normal,high,urgent',
            'is_telemedicine' => 'boolean',
            'referral_id' => 'nullable|exists:referrals,id',
            'preparation_instructions' => 'nullable|string|max:1000',
        ]);

        try {
            DB::beginTransaction();

            // Check doctor availability
            $isAvailable = $this->appointmentService->checkDoctorAvailability(
                $request->doctor_id,
                Carbon::parse($request->scheduled_at),
                $request->duration_minutes
            );

            if (!$isAvailable) {
                return response()->json([
                    'message' => 'Doctor is not available at the selected time',
                    'errors' => ['scheduled_at' => ['Time slot not available']]
                ], 422);
            }

            // Generate appointment number
            $appointmentNumber = $this->generateAppointmentNumber();

            // Create appointment
            $appointment = Appointment::create([
                'appointment_number' => $appointmentNumber,
                'patient_id' => $request->patient_id,
                'doctor_id' => $request->doctor_id,
                'facility_id' => $request->facility_id,
                'specialty_id' => $request->specialty_id,
                'referral_id' => $request->referral_id,
                'appointment_type' => $request->appointment_type,
                'scheduled_at' => $request->scheduled_at,
                'duration_minutes' => $request->duration_minutes,
                'status' => 'scheduled',
                'priority' => $request->priority,
                'reason' => $request->reason,
                'notes' => $request->notes,
                'preparation_instructions' => $request->preparation_instructions,
                'is_telemedicine' => $request->boolean('is_telemedicine'),
            ]);

            // Generate meeting link for telemedicine
            if ($appointment->is_telemedicine) {
                $appointment->generateMeetingLink();
            }

            // Calculate AI risk score
            $appointment->calculateRiskScore();

            // Generate AI recommendations
            $appointment->generateAIRecommendations();

            // Send confirmation notifications
            $this->notificationService->sendAppointmentConfirmation($appointment);

            // Schedule reminder notifications
            $this->appointmentService->scheduleReminders($appointment);

            DB::commit();

            Log::info('Appointment created', [
                'appointment_id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'doctor_id' => $appointment->doctor_id,
                'created_by' => auth()->id(),
            ]);

            return response()->json([
                'message' => 'Appointment created successfully',
                'appointment' => $appointment->load(['patient', 'doctor', 'facility']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create appointment', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Failed to create appointment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show appointment details
     */
    public function show(Appointment $appointment): Response
    {
        $appointment->load([
            'patient',
            'doctor',
            'facility',
            'specialty',
            'referral',
            'notifications' => fn($q) => $q->orderBy('created_at', 'desc'),
            'followUps' => fn($q) => $q->orderBy('scheduled_date', 'desc'),
            'telemedicineSession',
            'prescriptions',
        ]);

        return Inertia::render('Appointments/Show', [
            'appointment' => $appointment,
            'canEdit' => auth()->user()->can('update', $appointment),
            'canCancel' => auth()->user()->can('cancel', $appointment),
        ]);
    }

    /**
     * Update appointment
     */
    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        $request->validate([
            'scheduled_at' => 'sometimes|date|after:now',
            'duration_minutes' => 'sometimes|integer|min:15|max:480',
            'reason' => 'sometimes|string|max:1000',
            'notes' => 'sometimes|string|max:2000',
            'priority' => 'sometimes|in:low,normal,high,urgent',
            'preparation_instructions' => 'nullable|string|max:1000',
        ]);

        try {
            // Check if appointment can be updated
            if (!$appointment->can_be_rescheduled && $request->has('scheduled_at')) {
                return response()->json([
                    'message' => 'Appointment cannot be rescheduled at this time',
                ], 422);
            }

            // Check doctor availability if time is being changed
            if ($request->has('scheduled_at')) {
                $isAvailable = $this->appointmentService->checkDoctorAvailability(
                    $appointment->doctor_id,
                    Carbon::parse($request->scheduled_at),
                    $request->duration_minutes ?? $appointment->duration_minutes,
                    $appointment->id
                );

                if (!$isAvailable) {
                    return response()->json([
                        'message' => 'Doctor is not available at the selected time',
                        'errors' => ['scheduled_at' => ['Time slot not available']]
                    ], 422);
                }
            }

            $appointment->update($request->only([
                'scheduled_at',
                'duration_minutes',
                'reason',
                'notes',
                'priority',
                'preparation_instructions',
            ]));

            // Send update notification if time changed
            if ($request->has('scheduled_at')) {
                $this->notificationService->sendAppointmentRescheduled($appointment);
            }

            return response()->json([
                'message' => 'Appointment updated successfully',
                'appointment' => $appointment->fresh(['patient', 'doctor', 'facility']),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update appointment', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to update appointment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel appointment
     */
    public function cancel(Request $request, Appointment $appointment): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        try {
            if (!$appointment->can_be_cancelled) {
                return response()->json([
                    'message' => 'Appointment cannot be cancelled at this time',
                ], 422);
            }

            $appointment->cancel($request->reason, auth()->id());

            // Send cancellation notification
            $this->notificationService->sendAppointmentCancelled($appointment, $request->reason);

            return response()->json([
                'message' => 'Appointment cancelled successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to cancel appointment', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to cancel appointment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Confirm appointment
     */
    public function confirm(Appointment $appointment): JsonResponse
    {
        try {
            if (!$appointment->confirm()) {
                return response()->json([
                    'message' => 'Appointment cannot be confirmed',
                ], 422);
            }

            return response()->json([
                'message' => 'Appointment confirmed successfully',
                'appointment' => $appointment->fresh(),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to confirm appointment', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to confirm appointment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check in patient
     */
    public function checkIn(Appointment $appointment): JsonResponse
    {
        try {
            if (!$appointment->checkIn()) {
                return response()->json([
                    'message' => 'Patient cannot be checked in',
                ], 422);
            }

            return response()->json([
                'message' => 'Patient checked in successfully',
                'appointment' => $appointment->fresh(),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to check in patient', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to check in patient',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Start appointment
     */
    public function start(Appointment $appointment): JsonResponse
    {
        try {
            if (!$appointment->start()) {
                return response()->json([
                    'message' => 'Appointment cannot be started',
                ], 422);
            }

            // Start telemedicine session if applicable
            if ($appointment->is_telemedicine && $appointment->telemedicineSession) {
                $appointment->telemedicineSession->start();
            }

            return response()->json([
                'message' => 'Appointment started successfully',
                'appointment' => $appointment->fresh(['telemedicineSession']),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to start appointment', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to start appointment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Complete appointment
     */
    public function complete(Request $request, Appointment $appointment): JsonResponse
    {
        $request->validate([
            'doctor_notes' => 'required|string',
            'diagnosis' => 'nullable|string',
            'treatment_plan' => 'nullable|string',
            'follow_up_required' => 'boolean',
            'follow_up_date' => 'nullable|date|after:now',
            'next_appointment_recommended' => 'boolean',
            'prescriptions' => 'nullable|array',
        ]);

        try {
            DB::beginTransaction();

            if (!$appointment->complete($request->all())) {
                return response()->json([
                    'message' => 'Appointment cannot be completed',
                ], 422);
            }

            // End telemedicine session if applicable
            if ($appointment->is_telemedicine && $appointment->telemedicineSession) {
                $appointment->telemedicineSession->end($request->all());
            }

            // Create follow-up if required
            if ($request->boolean('follow_up_required') && $request->follow_up_date) {
                $this->appointmentService->createFollowUp($appointment, [
                    'scheduled_date' => $request->follow_up_date,
                    'follow_up_type' => 'post_appointment',
                    'automated' => false,
                ]);
            }

            // Send completion notification
            $this->notificationService->sendAppointmentCompleted($appointment);

            DB::commit();

            return response()->json([
                'message' => 'Appointment completed successfully',
                'appointment' => $appointment->fresh(),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to complete appointment', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to complete appointment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get doctor availability
     */
    public function getDoctorAvailability(Request $request): JsonResponse
    {
        $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'duration' => 'required|integer|min:15|max:480',
        ]);

        try {
            $availability = $this->appointmentService->getDoctorAvailability(
                $request->doctor_id,
                Carbon::parse($request->date),
                $request->duration
            );

            return response()->json([
                'availability' => $availability,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get availability',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get appointment calendar
     */
    public function calendar(Request $request): JsonResponse
    {
        $start = Carbon::parse($request->start ?? now()->startOfMonth());
        $end = Carbon::parse($request->end ?? now()->endOfMonth());

        $query = Appointment::with(['patient', 'doctor'])
            ->whereBetween('scheduled_at', [$start, $end]);

        // Role-based filtering
        if (auth()->user()->hasRole('doctor')) {
            $query->where('doctor_id', auth()->id());
        } elseif (auth()->user()->hasRole('facility_admin')) {
            $query->where('facility_id', auth()->user()->facility_id);
        }

        $appointments = $query->get()->map(function ($appointment) {
            return [
                'id' => $appointment->id,
                'title' => $appointment->patient->full_name,
                'start' => $appointment->scheduled_at->toISOString(),
                'end' => $appointment->estimated_end_time->toISOString(),
                'color' => $appointment->getStatusColor(),
                'extendedProps' => [
                    'appointment_number' => $appointment->appointment_number,
                    'patient_name' => $appointment->patient->full_name,
                    'doctor_name' => $appointment->doctor->name,
                    'status' => $appointment->status,
                    'type' => $appointment->appointment_type,
                    'is_telemedicine' => $appointment->is_telemedicine,
                ],
            ];
        });

        return response()->json($appointments);
    }

    /**
     * Generate unique appointment number
     */
    private function generateAppointmentNumber(): string
    {
        $prefix = 'APT';
        $date = now()->format('Ymd');
        $sequence = Appointment::whereDate('created_at', today())->count() + 1;
        
        return sprintf('%s-%s-%04d', $prefix, $date, $sequence);
    }
}
