<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Referral;
use App\Models\Facility;
use App\Models\Ambulance;
use App\Models\Patient;
use App\Models\Appointment;

class RoleDashboardController extends Controller
{
    /**
     * Redirect user to appropriate dashboard based on their role
     */
    public function redirectToDashboard()
    {
        $user = auth()->user();
        
        return redirect()->route($this->getDashboardRoute($user->role));
    }

    /**
     * Get dashboard route name based on user role
     */
    private function getDashboardRoute(string $role): string
    {
        return match($role) {
            'super_admin' => 'dashboards.super-admin',
            'hospital_admin' => 'dashboards.hospital-admin',
            'doctor' => 'dashboards.doctor',
            'nurse' => 'dashboards.nurse',
            'dispatcher' => 'dashboards.dispatcher',
            'ambulance_driver' => 'dashboards.ambulance-driver',
            'ambulance_paramedic' => 'dashboards.ambulance-paramedic',
            'patient' => 'dashboards.patient',
            default => 'dashboard'
        };
    }

    /**
     * Super Admin Dashboard
     */
    public function superAdminDashboard()
    {
        $this->authorize('viewSuperAdminDashboard', User::class);
        
        return Inertia::render('dashboards/super-admin-dashboard', [
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Hospital Admin Dashboard
     */
    public function hospitalAdminDashboard()
    {
        $this->authorize('viewHospitalAdminDashboard', User::class);
        
        return Inertia::render('dashboards/hospital-admin-dashboard', [
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Doctor Dashboard
     */
    public function doctorDashboard()
    {
        $this->authorize('viewDoctorDashboard', User::class);
        
        return Inertia::render('dashboards/enhanced-doctor-dashboard', [
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Nurse Dashboard
     */
    public function nurseDashboard()
    {
        $this->authorize('viewNurseDashboard', User::class);
        
        return Inertia::render('dashboards/enhanced-nurse-dashboard', [
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Dispatcher Dashboard
     */
    public function dispatcherDashboard()
    {
        $this->authorize('viewDispatcherDashboard', User::class);
        
        return Inertia::render('dashboards/enhanced-dispatcher-dashboard', [
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Ambulance Driver Dashboard
     */
    public function ambulanceDriverDashboard()
    {
        $this->authorize('viewAmbulanceDriverDashboard', User::class);
        
        return Inertia::render('dashboards/ambulance-driver-dashboard', [
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Ambulance Paramedic Dashboard
     */
    public function ambulanceParamedicDashboard()
    {
        $this->authorize('viewAmbulanceParamedicDashboard', User::class);
        
        return Inertia::render('dashboards/ambulance-paramedic-dashboard', [
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Patient Dashboard
     */
    public function patientDashboard()
    {
        $this->authorize('viewPatientDashboard', User::class);
        
        return Inertia::render('dashboards/patient-dashboard', [
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Get dashboard data for API calls
     */
    public function getDashboardData(Request $request)
    {
        $user = auth()->user();
        
        // Common dashboard data
        $data = [
            'user' => $user,
            'timestamp' => now()->toISOString(),
        ];

        // Role-specific data
        switch ($user->role) {
            case 'super_admin':
                $data = array_merge($data, $this->getSuperAdminData());
                break;
            case 'hospital_admin':
                $data = array_merge($data, $this->getHospitalAdminData($user));
                break;
            case 'doctor':
                $data = array_merge($data, $this->getDoctorData($user));
                break;
            case 'nurse':
                $data = array_merge($data, $this->getNurseData($user));
                break;
            case 'dispatcher':
                $data = array_merge($data, $this->getDispatcherData($user));
                break;
            case 'ambulance_driver':
                $data = array_merge($data, $this->getAmbulanceDriverData($user));
                break;
            case 'ambulance_paramedic':
                $data = array_merge($data, $this->getAmbulanceParamedicData($user));
                break;
            case 'patient':
                $data = array_merge($data, $this->getPatientData($user));
                break;
        }

        return response()->json($data);
    }

    /**
     * Get Super Admin specific data
     */
    private function getSuperAdminData(): array
    {
        return [
            'total_users' => User::count(),
            'total_facilities' => Facility::count(),
            'total_referrals' => Referral::count(),
            'total_ambulances' => Ambulance::count(),
            'total_patients' => Patient::count(),
            'active_users' => User::where('status', 'active')->count(),
            'pending_referrals' => Referral::where('status', 'pending')->count(),
        ];
    }

    /**
     * Get Hospital Admin specific data
     */
    private function getHospitalAdminData(User $user): array
    {
        $facilityId = $user->facility_id;
        
        return [
            'facility_patients' => Patient::where('facility_id', $facilityId)->count(),
            'facility_referrals' => Referral::where('receiving_facility_id', $facilityId)->count(),
            'facility_staff' => User::where('facility_id', $facilityId)->count(),
            'pending_referrals' => Referral::where('receiving_facility_id', $facilityId)
                ->where('status', 'pending')->count(),
        ];
    }

    /**
     * Get Doctor specific data
     */
    private function getDoctorData(User $user): array
    {
        return [
            'my_patients' => Patient::where('primary_doctor_id', $user->id)->count(),
            'my_referrals' => Referral::where('referring_doctor_id', $user->id)->count(),
            'todays_appointments' => Appointment::where('doctor_id', $user->id)
                ->whereDate('appointment_date', today())->count(),
            'pending_consultations' => Referral::where('assigned_doctor_id', $user->id)
                ->where('status', 'pending')->count(),
        ];
    }

    /**
     * Get Nurse specific data
     */
    private function getNurseData(User $user): array
    {
        return [
            'assigned_patients' => Patient::where('assigned_nurse_id', $user->id)->count(),
            'ward_patients' => Patient::where('ward_id', $user->ward_id)->count(),
            'medication_schedules' => [], // Implement based on your medication model
            'vital_checks_due' => [], // Implement based on your vitals model
        ];
    }

    /**
     * Get Dispatcher specific data
     */
    private function getDispatcherData(User $user): array
    {
        return [
            'available_ambulances' => Ambulance::where('status', 'available')->count(),
            'active_dispatches' => Ambulance::where('status', 'dispatched')->count(),
            'emergency_calls' => [], // Implement based on your emergency calls model
            'response_times' => [], // Implement based on your tracking data
        ];
    }

    /**
     * Get Ambulance Driver specific data
     */
    private function getAmbulanceDriverData(User $user): array
    {
        return [
            'my_ambulance' => Ambulance::where('driver_id', $user->id)->first(),
            'todays_trips' => [], // Implement based on your trip model
            'fuel_level' => 85, // Implement based on vehicle tracking
            'maintenance_due' => [], // Implement based on maintenance schedule
        ];
    }

    /**
     * Get Ambulance Paramedic specific data
     */
    private function getAmbulanceParamedicData(User $user): array
    {
        return [
            'current_patient' => null, // Implement based on active transport
            'equipment_status' => [], // Implement based on equipment tracking
            'protocols_accessed' => [], // Implement based on protocol usage
            'medications_administered' => [], // Implement based on medication logs
        ];
    }

    /**
     * Get Patient specific data
     */
    private function getPatientData(User $user): array
    {
        $patient = Patient::where('user_id', $user->id)->first();
        
        if (!$patient) {
            return [];
        }

        return [
            'patient_record' => $patient,
            'upcoming_appointments' => Appointment::where('patient_id', $patient->id)
                ->where('appointment_date', '>=', today())->count(),
            'recent_referrals' => Referral::where('patient_id', $patient->id)
                ->latest()->take(5)->get(),
            'active_prescriptions' => [], // Implement based on prescription model
            'lab_results' => [], // Implement based on lab results model
        ];
    }
}