<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Patient;
use App\Models\Referral;
use App\Models\Facility;
use App\Models\Ambulance;
use App\Models\Equipment;
use App\Models\AuditLog;
use App\Models\UserSession;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class EnhancedDashboardController extends Controller
{
    /**
     * Redirect to appropriate dashboard based on user role
     */
    public function redirectToDashboard(Request $request)
    {
        $user = $request->user();
        $dashboardRoute = $user->getDashboardRoute();
        
        return redirect()->route($dashboardRoute);
    }

    /**
     * Super Admin Dashboard
     */
    public function superAdminDashboard(Request $request)
    {
        $this->authorize('viewSuperAdminDashboard', User::class);

        $stats = Cache::remember('super_admin_dashboard_stats', 300, function () {
            return [
                'system_overview' => $this->getSystemOverviewStats(),
                'user_analytics' => $this->getUserAnalytics(),
                'security_metrics' => $this->getSecurityMetrics(),
                'performance_data' => $this->getPerformanceData(),
                'recent_activities' => $this->getRecentActivities(),
            ];
        });

        return Inertia::render('dashboards/super-admin-dashboard', [
            'stats' => $stats,
            'user' => $request->user(),
            'realTimeData' => $this->getRealTimeSystemData(),
        ]);
    }

    /**
     * Hospital Admin Dashboard
     */
    public function hospitalAdminDashboard(Request $request)
    {
        $this->authorize('viewHospitalAdminDashboard', User::class);

        $user = $request->user();
        $facilityId = $user->facility_id;

        $stats = [
            'facility_overview' => $this->getFacilityOverviewStats($facilityId),
            'patient_metrics' => $this->getPatientMetrics($facilityId),
            'staff_analytics' => $this->getStaffAnalytics($facilityId),
            'resource_utilization' => $this->getResourceUtilization($facilityId),
            'quality_metrics' => $this->getQualityMetrics($facilityId),
        ];

        return Inertia::render('dashboards/hospital-admin-dashboard', [
            'stats' => $stats,
            'user' => $user,
            'facility' => $user->facility,
        ]);
    }

    /**
     * Doctor Dashboard
     */
    public function doctorDashboard(Request $request)
    {
        $this->authorize('viewDoctorDashboard', User::class);

        $user = $request->user();
        $doctor = $user->doctor;

        $stats = [
            'patient_queue' => $this->getDoctorPatientQueue($doctor),
            'appointments_today' => $this->getTodayAppointments($doctor),
            'pending_referrals' => $this->getPendingReferrals($doctor),
            'clinical_metrics' => $this->getClinicalMetrics($doctor),
            'recent_patients' => $this->getRecentPatients($doctor),
        ];

        return Inertia::render('dashboards/doctor-dashboard', [
            'stats' => $stats,
            'user' => $user,
            'doctor' => $doctor,
        ]);
    }

    /**
     * Nurse Dashboard
     */
    public function nurseDashboard(Request $request)
    {
        $this->authorize('viewNurseDashboard', User::class);

        $user = $request->user();
        $facilityId = $user->facility_id;

        $stats = [
            'patient_assignments' => $this->getNursePatientAssignments($user),
            'medication_rounds' => $this->getMedicationRounds($facilityId),
            'vital_signs_due' => $this->getVitalSignsDue($facilityId),
            'bed_management' => $this->getBedManagement($facilityId),
            'shift_summary' => $this->getShiftSummary($user),
        ];

        return Inertia::render('dashboards/nurse-dashboard', [
            'stats' => $stats,
            'user' => $user,
        ]);
    }

    /**
     * Dispatcher Dashboard
     */
    public function dispatcherDashboard(Request $request)
    {
        $this->authorize('viewDispatcherDashboard', User::class);

        $stats = [
            'active_calls' => $this->getActiveCalls(),
            'ambulance_status' => $this->getAmbulanceStatus(),
            'response_times' => $this->getResponseTimes(),
            'emergency_queue' => $this->getEmergencyQueue(),
            'resource_availability' => $this->getResourceAvailability(),
        ];

        return Inertia::render('dashboards/dispatcher-dashboard', [
            'stats' => $stats,
            'user' => $request->user(),
            'realTimeData' => $this->getRealTimeDispatchData(),
        ]);
    }

    /**
     * Ambulance Driver Dashboard
     */
    public function ambulanceDriverDashboard(Request $request)
    {
        $this->authorize('viewAmbulanceDriverDashboard', User::class);

        $user = $request->user();
        $ambulanceCrew = $user->ambulanceCrew;

        $stats = [
            'current_assignment' => $this->getCurrentAssignment($ambulanceCrew),
            'vehicle_status' => $this->getVehicleStatus($ambulanceCrew),
            'trip_history' => $this->getTripHistory($ambulanceCrew),
            'performance_metrics' => $this->getDriverPerformanceMetrics($ambulanceCrew),
        ];

        return Inertia::render('dashboards/ambulance-driver-dashboard', [
            'stats' => $stats,
            'user' => $user,
            'ambulanceCrew' => $ambulanceCrew,
        ]);
    }

    /**
     * Ambulance Paramedic Dashboard
     */
    public function ambulanceParamedicDashboard(Request $request)
    {
        $this->authorize('viewAmbulanceParamedicDashboard', User::class);

        $user = $request->user();
        $ambulanceCrew = $user->ambulanceCrew;

        $stats = [
            'current_assignment' => $this->getCurrentAssignment($ambulanceCrew),
            'patient_care_protocols' => $this->getPatientCareProtocols(),
            'medical_supplies' => $this->getMedicalSupplies($ambulanceCrew),
            'clinical_performance' => $this->getParamedicPerformanceMetrics($ambulanceCrew),
        ];

        return Inertia::render('dashboards/ambulance-paramedic-dashboard', [
            'stats' => $stats,
            'user' => $user,
            'ambulanceCrew' => $ambulanceCrew,
        ]);
    }

    /**
     * Patient Dashboard
     */
    public function patientDashboard(Request $request)
    {
        $this->authorize('viewPatientDashboard', User::class);

        $user = $request->user();
        $patient = $user->patient;

        $stats = [
            'upcoming_appointments' => $this->getPatientAppointments($patient),
            'referral_status' => $this->getPatientReferralStatus($patient),
            'medical_records' => $this->getPatientMedicalRecords($patient),
            'health_metrics' => $this->getPatientHealthMetrics($patient),
            'messages' => $this->getPatientMessages($patient),
        ];

        return Inertia::render('dashboards/patient-dashboard', [
            'stats' => $stats,
            'user' => $user,
            'patient' => $patient,
        ]);
    }

    // Helper methods for dashboard data

    private function getSystemOverviewStats(): array
    {
        return [
            'total_users' => User::count(),
            'active_users' => User::where('status', 'active')->count(),
            'total_facilities' => Facility::count(),
            'total_ambulances' => Ambulance::count(),
            'total_referrals' => Referral::count(),
            'pending_referrals' => Referral::where('status', 'pending')->count(),
            'system_uptime' => $this->getSystemUptime(),
            'database_size' => $this->getDatabaseSize(),
        ];
    }

    private function getUserAnalytics(): array
    {
        return [
            'users_by_role' => User::select('role', DB::raw('count(*) as count'))
                ->groupBy('role')
                ->pluck('count', 'role')
                ->toArray(),
            'active_sessions' => UserSession::active()->count(),
            'new_users_today' => User::whereDate('created_at', today())->count(),
            'login_activity' => $this->getLoginActivity(),
        ];
    }

    private function getSecurityMetrics(): array
    {
        return [
            'failed_logins_today' => User::where('failed_login_attempts', '>', 0)
                ->whereDate('updated_at', today())
                ->count(),
            'locked_accounts' => User::whereNotNull('locked_until')
                ->where('locked_until', '>', now())
                ->count(),
            'security_alerts' => AuditLog::where('severity', 'high')
                ->whereDate('created_at', today())
                ->count(),
            'audit_logs_today' => AuditLog::whereDate('created_at', today())->count(),
        ];
    }

    private function getPerformanceData(): array
    {
        return [
            'avg_response_time' => Cache::get('avg_response_time', 0),
            'database_queries' => Cache::get('database_queries', 0),
            'memory_usage' => $this->getMemoryUsage(),
            'cpu_usage' => Cache::get('cpu_usage', 0),
        ];
    }

    private function getRecentActivities(): array
    {
        return AuditLog::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user' => $log->user ? $log->user->full_name : 'System',
                    'action' => $log->action,
                    'description' => $log->description,
                    'created_at' => $log->created_at,
                    'severity' => $log->severity,
                ];
            })
            ->toArray();
    }

    private function getRealTimeSystemData(): array
    {
        return [
            'active_users_count' => UserSession::active()->recent()->count(),
            'system_status' => 'online',
            'alerts_count' => AuditLog::where('severity', 'high')
                ->whereDate('created_at', today())
                ->count(),
            'last_backup' => Cache::get('last_backup_time', now()->subHours(2)),
        ];
    }

    private function getFacilityOverviewStats($facilityId): array
    {
        if (!$facilityId) {
            return [];
        }

        return [
            'total_beds' => DB::table('beds')->where('facility_id', $facilityId)->count(),
            'occupied_beds' => DB::table('beds')
                ->where('facility_id', $facilityId)
                ->where('status', 'occupied')
                ->count(),
            'staff_count' => User::where('facility_id', $facilityId)->count(),
            'patients_today' => Referral::where('receiving_facility_id', $facilityId)
                ->whereDate('created_at', today())
                ->count(),
        ];
    }

    // Additional helper methods would be implemented here...
    private function getSystemUptime(): string
    {
        return Cache::get('system_uptime', '99.9%');
    }

    private function getDatabaseSize(): string
    {
        return Cache::get('database_size', '2.4 GB');
    }

    private function getMemoryUsage(): int
    {
        return (int) (memory_get_usage(true) / 1024 / 1024); // MB
    }

    private function getLoginActivity(): array
    {
        return Cache::remember('login_activity', 300, function () {
            return UserSession::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as logins')
            )
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('logins', 'date')
            ->toArray();
        });
    }

    // Placeholder methods - these would be fully implemented based on specific requirements
    private function getPatientMetrics($facilityId): array { return []; }
    private function getStaffAnalytics($facilityId): array { return []; }
    private function getResourceUtilization($facilityId): array { return []; }
    private function getQualityMetrics($facilityId): array { return []; }
    private function getDoctorPatientQueue($doctor): array { return []; }
    private function getTodayAppointments($doctor): array { return []; }
    private function getPendingReferrals($doctor): array { return []; }
    private function getClinicalMetrics($doctor): array { return []; }
    private function getRecentPatients($doctor): array { return []; }
    private function getNursePatientAssignments($user): array { return []; }
    private function getMedicationRounds($facilityId): array { return []; }
    private function getVitalSignsDue($facilityId): array { return []; }
    private function getBedManagement($facilityId): array { return []; }
    private function getShiftSummary($user): array { return []; }
    private function getActiveCalls(): array { return []; }
    private function getAmbulanceStatus(): array { return []; }
    private function getResponseTimes(): array { return []; }
    private function getEmergencyQueue(): array { return []; }
    private function getResourceAvailability(): array { return []; }
    private function getRealTimeDispatchData(): array { return []; }
    private function getCurrentAssignment($ambulanceCrew): array { return []; }
    private function getVehicleStatus($ambulanceCrew): array { return []; }
    private function getTripHistory($ambulanceCrew): array { return []; }
    private function getDriverPerformanceMetrics($ambulanceCrew): array { return []; }
    private function getPatientCareProtocols(): array { return []; }
    private function getMedicalSupplies($ambulanceCrew): array { return []; }
    private function getParamedicPerformanceMetrics($ambulanceCrew): array { return []; }
    private function getPatientAppointments($patient): array { return []; }
    private function getPatientReferralStatus($patient): array { return []; }
    private function getPatientMedicalRecords($patient): array { return []; }
    private function getPatientHealthMetrics($patient): array { return []; }
    private function getPatientMessages($patient): array { return []; }
}