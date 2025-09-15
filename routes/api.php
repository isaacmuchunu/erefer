<?php
// routes/api.php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FacilityController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\BedController;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\AmbulanceController;
use App\Http\Controllers\EmergencyController;
use App\Http\Controllers\CommunicationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SpecialtyController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SystemController;
use App\Http\Controllers\FeedbackController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes (no authentication required)
Route::prefix('v1')->group(function () {
    
    // Authentication routes
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login'])->name('auth.login');
        Route::post('register', [AuthController::class, 'register'])->name('auth.register');
        Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->name('auth.forgot-password');
        Route::post('reset-password', [AuthController::class, 'resetPassword'])->name('auth.reset-password');
        Route::post('verify-email', [AuthController::class, 'verifyEmail'])->name('auth.verify-email');
        Route::post('resend-verification', [AuthController::class, 'resendVerification'])->name('auth.resend-verification');
    });

    // Public facility information
    Route::prefix('public')->group(function () {
        Route::get('facilities', [FacilityController::class, 'publicIndex'])->name('public.facilities.index');
        Route::get('facilities/{facility}', [FacilityController::class, 'publicShow'])->name('public.facilities.show');
        Route::get('specialties', [SpecialtyController::class, 'publicIndex'])->name('public.specialties.index');
        Route::get('emergency-status', [EmergencyController::class, 'publicStatus'])->name('public.emergency.status');
    });

    // System health check
    Route::get('health', [SystemController::class, 'publicHealth'])->name('system.health');
});

// Protected routes (authentication required)
Route::prefix('v1')->middleware(['auth:sanctum', 'verified', 'audit'])->group(function () {
    
    // Authentication management
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout'])->name('auth.logout');
        Route::get('profile', [AuthController::class, 'profile'])->name('auth.profile');
        Route::put('profile', [AuthController::class, 'updateProfile'])->name('auth.update-profile');
        Route::post('change-password', [AuthController::class, 'changePassword'])->name('auth.change-password');
        Route::post('enable-2fa', [AuthController::class, 'enableTwoFactor'])->name('auth.enable-2fa');
        Route::post('disable-2fa', [AuthController::class, 'disableTwoFactor'])->name('auth.disable-2fa');
    });

    // User management routes (Admin only)
    Route::prefix('users')->middleware(['admin'])->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\UserManagementController::class, 'index'])->name('api.users.index');
        Route::post('/', [\App\Http\Controllers\Admin\UserManagementController::class, 'store'])->name('api.users.store');
        Route::get('stats', function() {
            return response()->json([
                'total' => \App\Models\User::count(),
                'active' => \App\Models\User::where('status', 'active')->count(),
                'inactive' => \App\Models\User::where('status', 'inactive')->count(),
                'suspended' => \App\Models\User::where('status', 'suspended')->count(),
                'by_role' => \App\Models\User::selectRaw('role, count(*) as count')
                    ->groupBy('role')
                    ->pluck('count', 'role')
                    ->toArray(),
            ]);
        })->name('api.users.stats');
        Route::get('export', [\App\Http\Controllers\Admin\UserManagementController::class, 'export'])->name('api.users.export');
        Route::post('import', [\App\Http\Controllers\Admin\UserManagementController::class, 'import'])->name('api.users.import');
        Route::post('bulk-action', [\App\Http\Controllers\Admin\UserManagementController::class, 'bulkAction'])->name('api.users.bulk-action');
        Route::get('{user}', [\App\Http\Controllers\Admin\UserManagementController::class, 'show'])->name('api.users.show');
        Route::put('{user}', [\App\Http\Controllers\Admin\UserManagementController::class, 'update'])->name('api.users.update');
        Route::delete('{user}', [\App\Http\Controllers\Admin\UserManagementController::class, 'destroy'])->name('api.users.destroy');
        Route::patch('{user}/status', [\App\Http\Controllers\Admin\UserManagementController::class, 'updateStatus'])->name('api.users.update-status');
        Route::post('{user}/reset-password', [\App\Http\Controllers\Admin\UserManagementController::class, 'resetPassword'])->name('api.users.reset-password');
    });

    // Dashboard routes
    Route::prefix('dashboard')->group(function () {
        Route::get('overview', [DashboardController::class, 'overview'])->name('dashboard.overview');
        Route::get('referral-stats', [DashboardController::class, 'referralStats'])->name('dashboard.referral-stats');
        Route::get('capacity-status', [DashboardController::class, 'capacityStatus'])->name('dashboard.capacity-status');
        Route::get('real-time-alerts', [DashboardController::class, 'realTimeAlerts'])->name('dashboard.alerts');
    });

    // Facility management routes
    Route::prefix('facilities')->group(function () {
        Route::get('/', [FacilityController::class, 'index'])->name('facilities.index');
        Route::post('/', [FacilityController::class, 'store'])
            ->middleware('can:create,App\Models\Facility')
            ->name('facilities.store');
        Route::get('{facility}', [FacilityController::class, 'show'])->name('facilities.show');
        Route::put('{facility}', [FacilityController::class, 'update'])
            ->middleware('can:update,facility')
            ->name('facilities.update');
        Route::delete('{facility}', [FacilityController::class, 'destroy'])
            ->middleware('can:delete,facility')
            ->name('facilities.destroy');
        
        // Special facility actions
        Route::get('stats', [FacilityController::class, 'stats'])->name('facilities.stats');
        Route::post('{facility}/verify', [FacilityController::class, 'verify'])
            ->middleware('role:super_admin')
            ->name('facilities.verify');
        Route::get('{facility}/availability', [FacilityController::class, 'availability'])
            ->name('facilities.availability');
        Route::get('{facility}/departments', [FacilityController::class, 'departments'])
            ->name('facilities.departments');
        Route::get('{facility}/doctors', [FacilityController::class, 'doctors'])
            ->name('facilities.doctors');
        Route::get('{facility}/beds', [FacilityController::class, 'beds'])
            ->name('facilities.beds');
        Route::get('{facility}/ambulances', [FacilityController::class, 'ambulances'])
            ->name('facilities.ambulances');
    });

    // Doctor management routes
    Route::prefix('doctors')->group(function () {
        Route::get('/', [DoctorController::class, 'index'])->name('doctors.index');
        Route::post('/', [DoctorController::class, 'store'])
            ->middleware('can:create,App\Models\Doctor')
            ->name('doctors.store');
        Route::get('{doctor}', [DoctorController::class, 'show'])->name('doctors.show');
        Route::put('{doctor}', [DoctorController::class, 'update'])
            ->middleware('can:update,doctor')
            ->name('doctors.update');
        Route::delete('{doctor}', [DoctorController::class, 'destroy'])
            ->middleware('can:delete,doctor')
            ->name('doctors.destroy');
        
        // Doctor specific actions
        Route::get('stats', [DoctorController::class, 'stats'])->name('doctors.stats');
        Route::get('{doctor}/availability', [DoctorController::class, 'availability'])
            ->name('doctors.availability');
        Route::put('{doctor}/schedule', [DoctorController::class, 'updateSchedule'])
            ->middleware('can:update,doctor')
            ->name('doctors.update-schedule');
        Route::get('{doctor}/referrals', [DoctorController::class, 'referrals'])
            ->name('doctors.referrals');
        Route::get('{doctor}/statistics', [DoctorController::class, 'statistics'])
            ->name('doctors.statistics');
    });

    // Patient management routes
    Route::prefix('patients')->middleware(['role:super_admin,hospital_admin,doctor,nurse,patient'])->group(function () {
        Route::get('/', [PatientController::class, 'index'])->name('patients.index');
        Route::post('/', [PatientController::class, 'store'])
            ->middleware(['role:super_admin,hospital_admin,doctor,nurse'])
            ->name('patients.store');
        Route::get('find-by-mrn', [PatientController::class, 'findByMRN'])->name('patients.find-by-mrn');
        Route::get('{patient}', [PatientController::class, 'show'])->name('patients.show');
        Route::put('{patient}', [PatientController::class, 'update'])->name('patients.update');
        Route::delete('{patient}', [PatientController::class, 'destroy'])
            ->middleware(['role:super_admin'])
            ->name('patients.destroy');
        
        // Patient specific actions
        Route::get('stats', [PatientController::class, 'stats'])->name('patients.stats');
        Route::get('{patient}/medical-history', [PatientController::class, 'medicalHistory'])
            ->name('patients.medical-history');
        Route::get('{patient}/referrals', [PatientController::class, 'referrals'])
            ->name('patients.referrals');
        Route::post('{patient}/upload-document', [PatientController::class, 'uploadDocument'])
            ->name('patients.upload-document');
    });

    // Department management routes
    Route::prefix('departments')->group(function () {
        Route::get('/', [DepartmentController::class, 'index'])->name('departments.index');
        Route::post('/', [DepartmentController::class, 'store'])->name('departments.store');
        Route::get('/{department}', [DepartmentController::class, 'show'])->name('departments.show');
        Route::put('/{department}', [DepartmentController::class, 'update'])->name('departments.update');
        Route::delete('/{department}', [DepartmentController::class, 'destroy'])->name('departments.destroy');
        Route::get('stats', [DepartmentController::class, 'stats'])->name('departments.stats');
    });

    // Bed management routes
    Route::prefix('beds')->group(function () {
        Route::get('/', [BedController::class, 'index'])->name('beds.index');
        Route::post('/', [BedController::class, 'store'])
            ->middleware('can:create,App\Models\Bed')
            ->name('beds.store');
        Route::get('stats', [BedController::class, 'stats'])->name('beds.stats');
        Route::get('availability', [BedController::class, 'availability'])->name('beds.availability');
        Route::get('{bed}', [BedController::class, 'show'])->name('beds.show');
        Route::put('{bed}', [BedController::class, 'update'])
            ->middleware('can:update,bed')
            ->name('beds.update');
        Route::delete('{bed}', [BedController::class, 'destroy'])
            ->middleware('can:delete,bed')
            ->name('beds.destroy');
        
        // Bed specific actions
        Route::post('{bed}/reserve', [BedController::class, 'reserve'])
            ->name('beds.reserve');
        Route::put('{bed}/status', [BedController::class, 'updateStatus'])
            ->name('beds.update-status');
    });

    // Bed reservations
    Route::prefix('bed-reservations')->group(function () {
        Route::get('/', [BedController::class, 'reservations'])->name('bed-reservations.index');
        Route::delete('{reservation}', [BedController::class, 'cancelReservation'])
            ->name('bed-reservations.cancel');
        Route::put('{reservation}/confirm', [BedController::class, 'confirmReservation'])
            ->name('bed-reservations.confirm');
    });

    // Referral management routes
    Route::prefix('referrals')->middleware(['role:super_admin,hospital_admin,doctor,nurse,dispatcher,ambulance_driver,ambulance_paramedic,patient'])->group(function () {
        Route::get('/', [ReferralController::class, 'index'])->name('referrals.index');
        Route::post('/', [ReferralController::class, 'store'])
            ->middleware('can:create,App\Models\Referral')
            ->name('referrals.store');
        Route::get('stats', [ReferralController::class, 'stats'])->name('referrals.stats');
        Route::get('find-suitable-facilities', [ReferralController::class, 'findSuitableFacilities'])
            ->name('referrals.find-facilities');
        Route::get('{referral}', [ReferralController::class, 'show'])->name('referrals.show');
        Route::put('{referral}', [ReferralController::class, 'update'])
            ->middleware('can:update,referral')
            ->name('referrals.update');
        Route::delete('{referral}', [ReferralController::class, 'destroy'])
            ->middleware('can:delete,referral')
            ->name('referrals.destroy');
        
        // Referral workflow actions
        Route::post('{referral}/accept', [ReferralController::class, 'accept'])
            ->name('referrals.accept');
        Route::post('{referral}/reject', [ReferralController::class, 'reject'])
            ->name('referrals.reject');
        Route::post('{referral}/complete', [ReferralController::class, 'complete'])
            ->name('referrals.complete');
        Route::post('{referral}/cancel', [ReferralController::class, 'cancel'])
            ->name('referrals.cancel');
        
        // Document management
        Route::post('{referral}/upload-document', [ReferralController::class, 'uploadDocument'])
            ->name('referrals.upload-document');
        Route::delete('{referral}/documents/{document}', [ReferralController::class, 'deleteDocument'])
            ->name('referrals.delete-document');
        
        // Status tracking
        Route::post('{referral}/update-status', [ReferralController::class, 'updateStatus'])
            ->name('referrals.update-status');
        Route::get('{referral}/timeline', [ReferralController::class, 'timeline'])
            ->name('referrals.timeline');
    });

    // Ambulance management routes
    Route::prefix('ambulances')->middleware(['ambulance'])->group(function () {
        Route::get('/', [AmbulanceController::class, 'index'])->name('ambulances.index');
        Route::post('/', [AmbulanceController::class, 'store'])
            ->middleware('can:create,App\Models\Ambulance')
            ->name('ambulances.store');
        Route::get('nearby', [AmbulanceController::class, 'nearbyAmbulances'])
            ->name('ambulances.nearby');
        Route::get('stats', [AmbulanceController::class, 'stats'])->name('ambulances.stats');
        Route::get('{ambulance}', [AmbulanceController::class, 'show'])->name('ambulances.show');
        Route::put('{ambulance}', [AmbulanceController::class, 'update'])
            ->middleware('can:update,ambulance')
            ->name('ambulances.update');
        Route::delete('{ambulance}', [AmbulanceController::class, 'destroy'])
            ->middleware('can:delete,ambulance')
            ->name('ambulances.destroy');
        
        // Ambulance operations
        Route::post('dispatch', [AmbulanceController::class, 'dispatch'])
            ->middleware('role:dispatcher|hospital_admin')
            ->name('ambulances.dispatch');
        Route::put('{ambulance}/location', [AmbulanceController::class, 'updateLocation'])
            ->name('ambulances.update-location');
        Route::put('{ambulance}/status', [AmbulanceController::class, 'updateStatus'])
            ->name('ambulances.update-status');

        // Enhanced tracking features
        Route::get('tracking-data', [AmbulanceController::class, 'getTrackingData'])
            ->name('ambulances.tracking-data');
        Route::get('{ambulance}/location-history', [AmbulanceController::class, 'getLocationHistory'])
            ->name('ambulances.location-history');
        Route::get('{ambulance}/performance-metrics', [AmbulanceController::class, 'getPerformanceMetrics'])
            ->name('ambulances.performance-metrics');
        Route::post('find-optimal', [AmbulanceController::class, 'findOptimalAmbulance'])
            ->name('ambulances.find-optimal');
        Route::post('optimize-route', [AmbulanceController::class, 'getOptimizedRoute'])
            ->name('ambulances.optimize-route');
    });

    // Enhanced Communication System Routes
    Route::prefix('chat')->group(function () {
        Route::get('/', [ChatController::class, 'index'])->name('chat.index');
        Route::post('/', [ChatController::class, 'store'])->name('chat.store');
        Route::get('{chatRoom}', [ChatController::class, 'show'])->name('chat.show');
        Route::delete('{chatRoom}', [ChatController::class, 'archive'])->name('chat.archive');
        Route::get('{chatRoom}/stats', [ChatController::class, 'getStats'])->name('chat.stats');

        // Chat room participants
        Route::get('{chatRoom}/participants', [ChatController::class, 'getParticipants'])->name('chat.participants');
        Route::post('{chatRoom}/participants', [ChatController::class, 'addParticipant'])->name('chat.add-participant');
        Route::delete('{chatRoom}/participants', [ChatController::class, 'removeParticipant'])->name('chat.remove-participant');

        // Messages
        Route::post('{chatRoom}/messages', [ChatController::class, 'sendMessage'])->name('chat.send-message');
        Route::post('{chatRoom}/share-file', [ChatController::class, 'shareFile'])->name('chat.share-file');
        Route::post('{chatRoom}/voice-message', [ChatController::class, 'sendVoiceMessage'])->name('chat.voice-message');
        Route::post('{chatRoom}/typing', [ChatController::class, 'updateTyping'])->name('chat.typing');

        // Message actions
        Route::put('messages/{message}', [ChatController::class, 'editMessage'])->name('chat.edit-message');
        Route::delete('messages/{message}', [ChatController::class, 'deleteMessage'])->name('chat.delete-message');
        Route::post('messages/{message}/reactions', [ChatController::class, 'addReaction'])->name('chat.add-reaction');
        Route::delete('messages/{message}/reactions', [ChatController::class, 'removeReaction'])->name('chat.remove-reaction');

        // Video/Voice calls
        Route::post('{chatRoom}/calls', [ChatController::class, 'initiateCall'])->name('chat.initiate-call');
        Route::delete('calls/{call}', [ChatController::class, 'endCall'])->name('chat.end-call');
    });

    // Advanced Analytics & Reporting Routes
    Route::prefix('analytics')->group(function () {
        Route::get('/', [AnalyticsController::class, 'getAnalytics'])->name('analytics.data');
        Route::get('dashboard', [AnalyticsController::class, 'index'])->name('analytics.dashboard');

        // Predictive Analytics
        Route::get('predictive-insights', [AnalyticsController::class, 'getPredictiveInsights'])->name('analytics.predictive');
        Route::post('detect-anomalies', [AnalyticsController::class, 'detectAnomalies'])->name('analytics.anomalies');
        Route::get('decision-support', [AnalyticsController::class, 'getDecisionSupport'])->name('analytics.decision-support');

        // Performance & Benchmarks
        Route::get('performance-benchmarks', [AnalyticsController::class, 'getPerformanceBenchmarks'])->name('analytics.benchmarks');
        Route::get('optimization-recommendations', [AnalyticsController::class, 'getOptimizationRecommendations'])->name('analytics.optimization');

        // Reports
        Route::post('generate-report', [AnalyticsController::class, 'generateReport'])->name('analytics.generate-report');
        Route::get('reports', [AnalyticsReportController::class, 'index'])->name('analytics.reports.index');
        Route::post('reports', [AnalyticsReportController::class, 'store'])->name('analytics.reports.store');
        Route::get('reports/{report}', [AnalyticsReportController::class, 'show'])->name('analytics.reports.show');
        Route::put('reports/{report}', [AnalyticsReportController::class, 'update'])->name('analytics.reports.update');
        Route::delete('reports/{report}', [AnalyticsReportController::class, 'destroy'])->name('analytics.reports.destroy');

        // Dashboards
        Route::get('dashboards', [AnalyticsDashboardController::class, 'index'])->name('analytics.dashboards.index');
        Route::post('dashboards', [AnalyticsDashboardController::class, 'store'])->name('analytics.dashboards.store');
        Route::get('dashboards/{dashboard}', [AnalyticsDashboardController::class, 'show'])->name('analytics.dashboards.show');
        Route::put('dashboards/{dashboard}', [AnalyticsDashboardController::class, 'update'])->name('analytics.dashboards.update');
        Route::delete('dashboards/{dashboard}', [AnalyticsDashboardController::class, 'destroy'])->name('analytics.dashboards.destroy');
    });

    // Equipment Management Routes
    Route::prefix('equipment')->group(function () {
        Route::get('/', [EquipmentController::class, 'index'])->name('equipment.index');
        Route::post('/', [EquipmentController::class, 'store'])->name('equipment.store');
        Route::get('{equipment}', [EquipmentController::class, 'show'])->name('equipment.show');
        Route::put('{equipment}', [EquipmentController::class, 'update'])->name('equipment.update');
        Route::delete('{equipment}', [EquipmentController::class, 'destroy'])->name('equipment.destroy');

        // Equipment status management
        Route::patch('{equipment}/status', [EquipmentController::class, 'updateStatus'])->name('equipment.update-status');
        Route::post('{equipment}/take-out-of-service', [EquipmentController::class, 'takeOutOfService'])->name('equipment.out-of-service');
        Route::post('{equipment}/return-to-service', [EquipmentController::class, 'returnToService'])->name('equipment.return-to-service');

        // Equipment usage tracking
        Route::post('{equipment}/usage', [EquipmentController::class, 'recordUsage'])->name('equipment.record-usage');
        Route::get('{equipment}/usage-history', [EquipmentController::class, 'getUsageHistory'])->name('equipment.usage-history');
        Route::get('{equipment}/statistics', [EquipmentController::class, 'getStatistics'])->name('equipment.statistics');

        // Equipment maintenance
        Route::get('maintenance/schedule', [EquipmentMaintenanceController::class, 'schedule'])->name('equipment.maintenance.schedule');
        Route::post('maintenance/schedule', [EquipmentMaintenanceController::class, 'scheduleMaintenance'])->name('equipment.maintenance.schedule-maintenance');
        Route::get('maintenance/alerts', [EquipmentMaintenanceController::class, 'getMaintenanceAlerts'])->name('equipment.maintenance.alerts');
        Route::post('maintenance/{maintenanceRecord}/start', [EquipmentMaintenanceController::class, 'startMaintenance'])->name('equipment.maintenance.start');
        Route::post('maintenance/{maintenanceRecord}/complete', [EquipmentMaintenanceController::class, 'completeMaintenance'])->name('equipment.maintenance.complete');
        Route::post('maintenance/{maintenanceRecord}/cancel', [EquipmentMaintenanceController::class, 'cancelMaintenance'])->name('equipment.maintenance.cancel');

        // Equipment calibration
        Route::post('{equipment}/calibration', [EquipmentController::class, 'performCalibration'])->name('equipment.calibration');
        Route::get('{equipment}/calibration-history', [EquipmentController::class, 'getCalibrationHistory'])->name('equipment.calibration-history');

        // Equipment inspection
        Route::post('{equipment}/inspection', [EquipmentController::class, 'performInspection'])->name('equipment.inspection');
        Route::get('{equipment}/inspection-history', [EquipmentController::class, 'getInspectionHistory'])->name('equipment.inspection-history');
    });

    // Ambulance Dispatch Routes
    Route::prefix('ambulances')->group(function () {
        Route::get('/', [AmbulanceController::class, 'index'])->name('ambulances.index');
        Route::post('/', [AmbulanceController::class, 'store'])->name('ambulances.store');
        Route::get('{ambulance}', [AmbulanceController::class, 'show'])->name('ambulances.show');
        Route::put('{ambulance}', [AmbulanceController::class, 'update'])->name('ambulances.update');
        Route::delete('{ambulance}', [AmbulanceController::class, 'destroy'])->name('ambulances.destroy');

        // Ambulance status and location
        Route::patch('{ambulance}/status', [AmbulanceController::class, 'updateStatus'])->name('ambulances.status.update');
        Route::post('{ambulance}/location', [AmbulanceController::class, 'updateLocation'])->name('ambulances.location.update');
        Route::get('{ambulance}/location-history', [AmbulanceController::class, 'getLocationHistory'])->name('ambulances.location-history');

        // Ambulance availability
        Route::get('available', [AmbulanceController::class, 'getAvailable'])->name('ambulances.available');
        Route::get('nearby', [AmbulanceController::class, 'getNearby'])->name('ambulances.nearby');

        // Dispatch management
        Route::prefix('dispatch')->group(function () {
            Route::get('/', [AmbulanceDispatchController::class, 'index'])->name('ambulances.dispatch.index');
            Route::post('/', [AmbulanceDispatchController::class, 'store'])->name('ambulances.dispatch.store');
            Route::get('active', [AmbulanceDispatchController::class, 'getActiveDispatches'])->name('ambulances.dispatch.active');
            Route::get('analytics', [AmbulanceDispatchController::class, 'analytics'])->name('ambulances.dispatch.analytics');
            Route::get('{dispatch}', [AmbulanceDispatchController::class, 'show'])->name('ambulances.dispatch.show');

            // Dispatch status updates
            Route::patch('{dispatch}/status', [AmbulanceDispatchController::class, 'updateStatus'])->name('ambulances.dispatch.update-status');
            Route::post('{dispatch}/location', [AmbulanceDispatchController::class, 'updateLocation'])->name('ambulances.dispatch.update-location');
            Route::post('{dispatch}/patient-care', [AmbulanceDispatchController::class, 'recordPatientCare'])->name('ambulances.dispatch.patient-care');
        });

        // Crew management
        Route::get('{ambulance}/crew', [AmbulanceController::class, 'getCrew'])->name('ambulances.crew');
        Route::post('{ambulance}/crew', [AmbulanceController::class, 'assignCrew'])->name('ambulances.assign-crew');
        Route::delete('{ambulance}/crew/{user}', [AmbulanceController::class, 'removeCrew'])->name('ambulances.remove-crew');

        // Performance metrics
        Route::get('{ambulance}/performance', [AmbulanceController::class, 'getPerformanceMetrics'])->name('ambulances.performance');
        Route::get('{ambulance}/utilization', [AmbulanceController::class, 'getUtilizationRate'])->name('ambulances.utilization');
    });

    // Mobile App Specific Routes
    Route::prefix('mobile')->group(function () {
        // Authentication
        Route::post('login', [MobileAuthController::class, 'login'])->name('mobile.login');
        Route::post('logout', [MobileAuthController::class, 'logout'])->name('mobile.logout')->middleware('auth:sanctum');
        Route::post('refresh', [MobileAuthController::class, 'refresh'])->name('mobile.refresh')->middleware('auth:sanctum');
        Route::get('profile', [MobileAuthController::class, 'profile'])->name('mobile.profile')->middleware('auth:sanctum');

        // Biometric authentication
        Route::post('biometric/register', [MobileAuthController::class, 'registerBiometric'])->name('mobile.biometric.register')->middleware('auth:sanctum');
        Route::post('biometric/login', [MobileAuthController::class, 'biometricLogin'])->name('mobile.biometric.login');
        Route::delete('biometric/revoke', [MobileAuthController::class, 'revokeBiometric'])->name('mobile.biometric.revoke')->middleware('auth:sanctum');

        // Device management
        Route::post('devices/register', [MobileDeviceController::class, 'register'])->name('mobile.devices.register')->middleware('auth:sanctum');
        Route::delete('devices/{device}', [MobileDeviceController::class, 'unregister'])->name('mobile.devices.unregister')->middleware('auth:sanctum');

        // Offline sync
        Route::post('sync/upload', [MobileSyncController::class, 'uploadData'])->name('mobile.sync.upload')->middleware('auth:sanctum');
        Route::get('sync/download', [MobileSyncController::class, 'downloadData'])->name('mobile.sync.download')->middleware('auth:sanctum');
        Route::get('sync/status', [MobileSyncController::class, 'getSyncStatus'])->name('mobile.sync.status')->middleware('auth:sanctum');

        // Location tracking
        Route::post('location/update', [MobileLocationController::class, 'updateLocation'])->name('mobile.location.update')->middleware('auth:sanctum');
        Route::get('location/history', [MobileLocationController::class, 'getHistory'])->name('mobile.location.history')->middleware('auth:sanctum');

        // Quick actions for mobile
        Route::get('dashboard', [MobileDashboardController::class, 'index'])->name('mobile.dashboard')->middleware('auth:sanctum');
        Route::get('referrals/quick', [MobileReferralController::class, 'getQuickReferrals'])->name('mobile.referrals.quick')->middleware('auth:sanctum');
        Route::get('ambulances/nearby', [MobileAmbulanceController::class, 'getNearby'])->name('mobile.ambulances.nearby')->middleware('auth:sanctum');
        Route::get('patients/search', [MobilePatientController::class, 'search'])->name('mobile.patients.search')->middleware('auth:sanctum');

        // Emergency features
        Route::post('emergency/alert', [MobileEmergencyController::class, 'sendAlert'])->name('mobile.emergency.alert')->middleware('auth:sanctum');
        Route::get('emergency/contacts', [MobileEmergencyController::class, 'getContacts'])->name('mobile.emergency.contacts')->middleware('auth:sanctum');

        // Voice-to-text
        Route::post('voice/transcribe', [MobileVoiceController::class, 'transcribe'])->name('mobile.voice.transcribe')->middleware('auth:sanctum');

        // File uploads
        Route::post('files/upload', [MobileFileController::class, 'upload'])->name('mobile.files.upload')->middleware('auth:sanctum');
        Route::get('files/{file}/download', [MobileFileController::class, 'download'])->name('mobile.files.download')->middleware('auth:sanctum');
    });

    // Appointment Management Routes
    Route::prefix('appointments')->group(function () {
        Route::get('/', [AppointmentController::class, 'index'])->name('appointments.index');
        Route::post('/', [AppointmentController::class, 'store'])->name('appointments.store');
        Route::get('calendar', [AppointmentController::class, 'calendar'])->name('appointments.calendar');
        Route::get('availability', [AppointmentController::class, 'getDoctorAvailability'])->name('appointments.availability');
        Route::get('{appointment}', [AppointmentController::class, 'show'])->name('appointments.show');
        Route::put('{appointment}', [AppointmentController::class, 'update'])->name('appointments.update');
        Route::delete('{appointment}', [AppointmentController::class, 'destroy'])->name('appointments.destroy');

        // Appointment actions
        Route::post('{appointment}/confirm', [AppointmentController::class, 'confirm'])->name('appointments.confirm');
        Route::post('{appointment}/cancel', [AppointmentController::class, 'cancel'])->name('appointments.cancel');
        Route::post('{appointment}/check-in', [AppointmentController::class, 'checkIn'])->name('appointments.check-in');
        Route::post('{appointment}/start', [AppointmentController::class, 'start'])->name('appointments.start');
        Route::post('{appointment}/complete', [AppointmentController::class, 'complete'])->name('appointments.complete');
        Route::post('{appointment}/reschedule', [AppointmentController::class, 'reschedule'])->name('appointments.reschedule');

        // Appointment reminders
        Route::post('{appointment}/send-reminder', [AppointmentController::class, 'sendReminder'])->name('appointments.send-reminder');
        Route::get('{appointment}/reminders', [AppointmentController::class, 'getReminders'])->name('appointments.reminders');
    });

    // Patient Notification Routes
    Route::prefix('patient-notifications')->middleware(['role:super_admin,hospital_admin,doctor,nurse,dispatcher'])->group(function () {
        Route::get('/', [PatientNotificationController::class, 'index'])->name('patient-notifications.index');
        Route::post('/', [PatientNotificationController::class, 'store'])->name('patient-notifications.store');
        Route::get('{notification}', [PatientNotificationController::class, 'show'])->name('patient-notifications.show');
        Route::put('{notification}', [PatientNotificationController::class, 'update'])->name('patient-notifications.update');
        Route::delete('{notification}', [PatientNotificationController::class, 'destroy'])->name('patient-notifications.destroy');

        // Notification actions
        Route::post('{notification}/send', [PatientNotificationController::class, 'send'])->name('notifications.send');
        Route::post('{notification}/retry', [PatientNotificationController::class, 'retry'])->name('notifications.retry');
        Route::post('{notification}/mark-read', [PatientNotificationController::class, 'markAsRead'])->name('notifications.mark-read');
        Route::post('bulk/mark-read', [PatientNotificationController::class, 'bulkMarkAsRead'])->name('notifications.bulk-mark-read');

        // Notification analytics
        Route::get('analytics/overview', [PatientNotificationController::class, 'getAnalytics'])->name('notifications.analytics');
        Route::get('analytics/delivery-rates', [PatientNotificationController::class, 'getDeliveryRates'])->name('notifications.delivery-rates');
        Route::get('analytics/channel-performance', [PatientNotificationController::class, 'getChannelPerformance'])->name('notifications.channel-performance');

        // Notification templates
        Route::get('templates', [NotificationTemplateController::class, 'index'])->name('notification-templates.index');
        Route::post('templates', [NotificationTemplateController::class, 'store'])->name('notification-templates.store');
        Route::get('templates/{template}', [NotificationTemplateController::class, 'show'])->name('notification-templates.show');
        Route::put('templates/{template}', [NotificationTemplateController::class, 'update'])->name('notification-templates.update');
        Route::delete('templates/{template}', [NotificationTemplateController::class, 'destroy'])->name('notification-templates.destroy');

        // Webhook endpoints
        Route::post('webhooks/whatsapp', [WhatsAppWebhookController::class, 'handle'])->name('webhooks.whatsapp');
        Route::post('webhooks/sms', [SMSWebhookController::class, 'handle'])->name('webhooks.sms');
        Route::post('webhooks/email', [EmailWebhookController::class, 'handle'])->name('webhooks.email');
    });

    // Patient Follow-up Routes
    Route::prefix('follow-ups')->group(function () {
        Route::get('/', [PatientFollowUpController::class, 'index'])->name('follow-ups.index');
        Route::post('/', [PatientFollowUpController::class, 'store'])->name('follow-ups.store');
        Route::get('{followUp}', [PatientFollowUpController::class, 'show'])->name('follow-ups.show');
        Route::put('{followUp}', [PatientFollowUpController::class, 'update'])->name('follow-ups.update');
        Route::delete('{followUp}', [PatientFollowUpController::class, 'destroy'])->name('follow-ups.destroy');

        // Follow-up actions
        Route::post('{followUp}/complete', [PatientFollowUpController::class, 'complete'])->name('follow-ups.complete');
        Route::post('{followUp}/send-reminder', [PatientFollowUpController::class, 'sendReminder'])->name('follow-ups.send-reminder');
        Route::post('{followUp}/escalate', [PatientFollowUpController::class, 'escalate'])->name('follow-ups.escalate');
        Route::post('{followUp}/schedule-next', [PatientFollowUpController::class, 'scheduleNext'])->name('follow-ups.schedule-next');

        // Follow-up analytics
        Route::get('analytics/compliance', [PatientFollowUpController::class, 'getComplianceAnalytics'])->name('follow-ups.compliance-analytics');
        Route::get('analytics/outcomes', [PatientFollowUpController::class, 'getOutcomeAnalytics'])->name('follow-ups.outcome-analytics');

        // AI-powered features
        Route::post('{followUp}/generate-questions', [PatientFollowUpController::class, 'generateAIQuestions'])->name('follow-ups.generate-questions');
        Route::post('{followUp}/analyze-responses', [PatientFollowUpController::class, 'analyzeResponses'])->name('follow-ups.analyze-responses');
    });

    // Telemedicine Routes
    Route::prefix('telemedicine')->group(function () {
        Route::get('sessions', [TelemedicineController::class, 'index'])->name('telemedicine.sessions.index');
        Route::post('sessions', [TelemedicineController::class, 'createSession'])->name('telemedicine.sessions.store');
        Route::get('sessions/{session}', [TelemedicineController::class, 'show'])->name('telemedicine.sessions.show');
        Route::put('sessions/{session}', [TelemedicineController::class, 'update'])->name('telemedicine.sessions.update');

        // Session management
        Route::post('sessions/{session}/start', [TelemedicineController::class, 'startSession'])->name('telemedicine.sessions.start');
        Route::post('sessions/{session}/end', [TelemedicineController::class, 'endSession'])->name('telemedicine.sessions.end');
        Route::post('sessions/{session}/join', [TelemedicineController::class, 'joinSession'])->name('telemedicine.sessions.join');

        // Session features
        Route::post('sessions/{session}/chat', [TelemedicineController::class, 'sendChatMessage'])->name('telemedicine.sessions.chat');
        Route::get('sessions/{session}/chat', [TelemedicineController::class, 'getChatHistory'])->name('telemedicine.sessions.chat-history');
        Route::post('sessions/{session}/share-file', [TelemedicineController::class, 'shareFile'])->name('telemedicine.sessions.share-file');
        Route::post('sessions/{session}/record', [TelemedicineController::class, 'toggleRecording'])->name('telemedicine.sessions.record');

        // Technical monitoring
        Route::post('sessions/{session}/quality', [TelemedicineController::class, 'reportQuality'])->name('telemedicine.sessions.quality');
        Route::post('sessions/{session}/technical-issue', [TelemedicineController::class, 'reportTechnicalIssue'])->name('telemedicine.sessions.technical-issue');

        // Analytics
        Route::get('analytics/usage', [TelemedicineController::class, 'getUsageAnalytics'])->name('telemedicine.analytics.usage');
        Route::get('analytics/quality', [TelemedicineController::class, 'getQualityAnalytics'])->name('telemedicine.analytics.quality');
    });

    // Patient Portal Routes
    Route::prefix('patient')->middleware('auth:sanctum')->group(function () {
        Route::get('dashboard', [PatientPortalController::class, 'dashboard'])->name('patient.dashboard');
        Route::get('profile', [PatientPortalController::class, 'profile'])->name('patient.profile');
        Route::put('profile', [PatientPortalController::class, 'updateProfile'])->name('patient.update-profile');

        // Patient appointments
        Route::get('appointments', [PatientPortalController::class, 'appointments'])->name('patient.appointments');
        Route::post('appointments', [PatientPortalController::class, 'bookAppointment'])->name('patient.book-appointment');
        Route::get('appointments/{appointment}', [PatientPortalController::class, 'showAppointment'])->name('patient.show-appointment');

        // Patient follow-ups
        Route::get('follow-ups', [PatientPortalController::class, 'followUps'])->name('patient.follow-ups');
        Route::get('follow-ups/{followUp}', [PatientPortalController::class, 'showFollowUp'])->name('patient.show-follow-up');
        Route::post('follow-ups/{followUp}/respond', [PatientPortalController::class, 'respondToFollowUp'])->name('patient.respond-follow-up');

        // Patient notifications
        Route::get('notifications', [PatientPortalController::class, 'notifications'])->name('patient.notifications');
        Route::post('notifications/mark-read', [PatientPortalController::class, 'markNotificationsAsRead'])->name('patient.mark-notifications-read');
        Route::put('notifications/preferences', [PatientPortalController::class, 'updateNotificationPreferences'])->name('patient.notification-preferences');

        // Patient medical records
        Route::get('medical-records', [PatientPortalController::class, 'medicalRecords'])->name('patient.medical-records');
        Route::get('medical-records/{record}', [PatientPortalController::class, 'showMedicalRecord'])->name('patient.show-medical-record');
        Route::get('medical-records/{record}/download', [PatientPortalController::class, 'downloadMedicalRecord'])->name('patient.download-medical-record');

        // Patient prescriptions
        Route::get('prescriptions', [PatientPortalController::class, 'prescriptions'])->name('patient.prescriptions');
        Route::get('prescriptions/{prescription}', [PatientPortalController::class, 'showPrescription'])->name('patient.show-prescription');

        // Patient messages
        Route::get('messages', [PatientPortalController::class, 'messages'])->name('patient.messages');
        Route::post('messages', [PatientPortalController::class, 'sendMessage'])->name('patient.send-message');
        Route::get('messages/{conversation}', [PatientPortalController::class, 'showConversation'])->name('patient.show-conversation');
    });
    });

    // Ambulance dispatches
    Route::prefix('dispatches')->group(function () {
        Route::get('/', [AmbulanceController::class, 'dispatches'])->name('dispatches.index');
        Route::get('{dispatch}', [AmbulanceController::class, 'showDispatch'])->name('dispatches.show');
        Route::put('{dispatch}/status', [AmbulanceController::class, 'updateDispatchStatus'])
            ->name('dispatches.update-status');
        Route::post('{dispatch}/update-patient-condition', [AmbulanceController::class, 'updatePatientCondition'])
            ->name('dispatches.update-patient-condition');
    });

    // Emergency management routes
    Route::prefix('emergency')->group(function () {
        Route::get('alerts', [EmergencyController::class, 'alerts'])->name('emergency.alerts');
        Route::post('alerts', [EmergencyController::class, 'createAlert'])
            ->middleware('role:hospital_admin|super_admin|dispatcher')
            ->name('emergency.create-alert');
        Route::put('alerts/{alert}', [EmergencyController::class, 'updateAlert'])
            ->middleware('role:hospital_admin|super_admin|dispatcher')
            ->name('emergency.update-alert');
        
        // Mass casualty management
        Route::post('mass-casualty-protocol', [EmergencyController::class, 'massCasualtyProtocol'])
            ->middleware('role:hospital_admin|super_admin|dispatcher')
            ->name('emergency.mass-casualty');
        Route::post('resource-mobilization', [EmergencyController::class, 'resourceMobilization'])
            ->middleware('role:hospital_admin|super_admin|dispatcher')
            ->name('emergency.resource-mobilization');
        
        // Emergency contacts
        Route::get('contacts', [EmergencyController::class, 'emergencyContacts'])
            ->name('emergency.contacts');
    });

    // Communication routes
    Route::prefix('communications')->group(function () {
        Route::get('/', [CommunicationController::class, 'index'])->name('communications.index');
        Route::post('/', [CommunicationController::class, 'store'])->name('communications.store');
        Route::get('{communication}', [CommunicationController::class, 'show'])->name('communications.show');
        Route::put('{communication}/read', [CommunicationController::class, 'markAsRead'])
            ->name('communications.mark-read');
        Route::post('mark-all-read', [CommunicationController::class, 'markAllAsRead'])
            ->name('communications.mark-all-read');
        
        // Broadcasting
        Route::post('broadcast', [CommunicationController::class, 'broadcast'])
            ->middleware('role:hospital_admin|super_admin|dispatcher')
            ->name('communications.broadcast');
        
        // Conversations
        Route::get('conversations', [CommunicationController::class, 'getConversation'])
            ->name('communications.conversation');
    });

    // Chat API routes
    Route::prefix('chat')->middleware(['role:super_admin,hospital_admin,doctor,nurse,dispatcher,ambulance_driver,ambulance_paramedic'])->group(function () {
        Route::get('rooms', [\App\Http\Controllers\Api\ChatRoomController::class, 'index'])->name('api.chat.rooms.index');
        Route::post('rooms', [\App\Http\Controllers\Api\ChatRoomController::class, 'store'])->name('api.chat.rooms.store');
        Route::get('rooms/{chatRoom}', [\App\Http\Controllers\Api\ChatRoomController::class, 'show'])->name('api.chat.rooms.show');

        // Message management
        Route::post('rooms/{chatRoom}/messages', [\App\Http\Controllers\Api\ChatRoomController::class, 'sendMessage'])->name('api.chat.send-message');
        Route::post('rooms/{chatRoom}/typing', [\App\Http\Controllers\Api\ChatRoomController::class, 'sendTypingIndicator'])->name('api.chat.typing');
        Route::post('rooms/{chatRoom}/mark-read', [\App\Http\Controllers\Api\ChatRoomController::class, 'markAsRead'])->name('api.chat.mark-read');

        // Participant management
        Route::post('rooms/{chatRoom}/participants', [\App\Http\Controllers\Api\ChatRoomController::class, 'addParticipants'])->name('api.chat.add-participants');
        Route::delete('rooms/{chatRoom}/participants', [\App\Http\Controllers\Api\ChatRoomController::class, 'removeParticipants'])->name('api.chat.remove-participants');

        // File sharing
        Route::post('rooms/{chatRoom}/files', [\App\Http\Controllers\Api\ChatFileController::class, 'shareFile'])->name('api.chat.share-file');
        Route::get('messages/{message}/files/{attachment}/download', [\App\Http\Controllers\Api\ChatFileController::class, 'downloadFile'])->name('api.chat.download-file');
        Route::get('messages/{message}/files/{attachment}/preview', [\App\Http\Controllers\Api\ChatFileController::class, 'previewFile'])->name('api.chat.preview-file');
        Route::delete('messages/{message}/files/{attachment}', [\App\Http\Controllers\Api\ChatFileController::class, 'deleteFile'])->name('api.chat.delete-file');

        // Group chat management
        Route::post('groups', [\App\Http\Controllers\Api\GroupChatController::class, 'createGroup'])->name('api.chat.create-group');
        Route::put('groups/{chatRoom}', [\App\Http\Controllers\Api\GroupChatController::class, 'updateGroup'])->name('api.chat.update-group');
        Route::post('groups/{chatRoom}/promote', [\App\Http\Controllers\Api\GroupChatController::class, 'promoteToAdmin'])->name('api.chat.promote-admin');
        Route::post('groups/{chatRoom}/leave', [\App\Http\Controllers\Api\GroupChatController::class, 'leaveGroup'])->name('api.chat.leave-group');
    });

    // Video Call API routes
    Route::prefix('video-calls')->middleware(['role:super_admin,hospital_admin,doctor,nurse,dispatcher,ambulance_driver,ambulance_paramedic'])->group(function () {
        Route::post('/', [\App\Http\Controllers\Api\VideoCallController::class, 'initiateCall'])->name('api.video-calls.initiate');
        Route::post('{videoCall}/join', [\App\Http\Controllers\Api\VideoCallController::class, 'joinCall'])->name('api.video-calls.join');
        Route::post('{videoCall}/end', [\App\Http\Controllers\Api\VideoCallController::class, 'endCall'])->name('api.video-calls.end');

        // Screen sharing
        Route::post('{videoCall}/screen-sharing/start', [\App\Http\Controllers\Api\ScreenSharingController::class, 'startScreenSharing'])->name('api.video-calls.screen-sharing.start');
        Route::post('{videoCall}/screen-sharing/stop', [\App\Http\Controllers\Api\ScreenSharingController::class, 'stopScreenSharing'])->name('api.video-calls.screen-sharing.stop');
        Route::get('{videoCall}/screen-sharing/status', [\App\Http\Controllers\Api\ScreenSharingController::class, 'getScreenSharingStatus'])->name('api.video-calls.screen-sharing.status');
        Route::post('{videoCall}/screen-sharing/request-permission', [\App\Http\Controllers\Api\ScreenSharingController::class, 'requestScreenSharingPermission'])->name('api.video-calls.screen-sharing.request');
        Route::post('{videoCall}/screen-sharing/grant-permission', [\App\Http\Controllers\Api\ScreenSharingController::class, 'grantScreenSharingPermission'])->name('api.video-calls.screen-sharing.grant');
    });

    // WhatsApp API routes
    Route::prefix('whatsapp')->middleware(['role:super_admin,hospital_admin,doctor,nurse,dispatcher,ambulance_driver,ambulance_paramedic'])->group(function () {
        Route::get('conversations', [\App\Http\Controllers\Api\WhatsAppController::class, 'conversations'])->name('api.whatsapp.conversations');
        Route::get('conversations/{conversation}', [\App\Http\Controllers\Api\WhatsAppController::class, 'conversation'])->name('api.whatsapp.conversation');
        Route::get('conversations/{conversation}/messages', [\App\Http\Controllers\Api\WhatsAppController::class, 'getMessages'])->name('api.whatsapp.messages');
        Route::post('conversations/{conversation}/messages', [\App\Http\Controllers\Api\WhatsAppController::class, 'sendMessage'])->name('api.whatsapp.send-message');
        Route::get('templates', [\App\Http\Controllers\Api\WhatsAppController::class, 'templates'])->name('api.whatsapp.templates');
    });

    // WhatsApp webhook (no authentication required)
    Route::match(['get', 'post'], 'whatsapp/webhook', [\App\Http\Controllers\Api\WhatsAppController::class, 'webhook'])->name('api.whatsapp.webhook');

    // Notification API routes
    Route::prefix('notifications')->middleware(['role:super_admin,hospital_admin,doctor,nurse,dispatcher,ambulance_driver,ambulance_paramedic'])->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\NotificationController::class, 'index'])->name('api.notifications.index');
        Route::post('/{notification}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead'])->name('api.notifications.read');
        Route::post('/mark-all-read', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead'])->name('api.notifications.mark-all-read');
        Route::delete('/{notification}', [\App\Http\Controllers\Api\NotificationController::class, 'delete'])->name('api.notifications.delete');
        Route::post('/send', [\App\Http\Controllers\Api\NotificationController::class, 'send'])->name('api.notifications.send');
        Route::get('/statistics', [\App\Http\Controllers\Api\NotificationController::class, 'statistics'])->name('api.notifications.statistics');
    });

    // Emergency Communication API routes
    Route::prefix('emergency')->middleware(['role:super_admin,hospital_admin,doctor,nurse,dispatcher'])->group(function () {
        Route::post('/broadcast', [\App\Http\Controllers\Api\EmergencyController::class, 'sendEmergencyBroadcast'])->name('api.emergency.broadcast');
        Route::post('/medical-alert', [\App\Http\Controllers\Api\EmergencyController::class, 'sendUrgentMedicalAlert'])->name('api.emergency.medical-alert');
        Route::get('/broadcasts', [\App\Http\Controllers\Api\EmergencyController::class, 'getBroadcastHistory'])->name('api.emergency.broadcasts');
    });

    // Dispatcher Dashboard API routes (restricted to dispatcher role)
    Route::prefix('dispatcher')->middleware(['role:dispatcher'])->group(function () {
        Route::get('/dashboard/updates', [\App\Http\Controllers\DispatcherDashboardController::class, 'getUpdates'])->name('api.dispatcher.dashboard.updates');
        Route::post('/quick-dispatch', [\App\Http\Controllers\DispatcherDashboardController::class, 'quickDispatch'])->name('api.dispatcher.quick-dispatch');
    });

    // Specialty routes
    Route::prefix('specialties')->group(function () {
        Route::get('/', [SpecialtyController::class, 'index'])->name('specialties.index');
        Route::post('/', [SpecialtyController::class, 'store'])
            ->middleware('role:super_admin')
            ->name('specialties.store');
        Route::get('{specialty}', [SpecialtyController::class, 'show'])->name('specialties.show');
        Route::put('{specialty}', [SpecialtyController::class, 'update'])
            ->middleware('role:super_admin')
            ->name('specialties.update');
        Route::delete('{specialty}', [SpecialtyController::class, 'destroy'])
            ->middleware('role:super_admin')
            ->name('specialties.destroy');
        
        Route::get('{specialty}/facilities', [SpecialtyController::class, 'availableFacilities'])
            ->name('specialties.facilities');
    });

    // Equipment management routes
    Route::prefix('equipment')->group(function () {
        Route::get('/', [EquipmentController::class, 'index'])->name('equipment.index');
        Route::post('/', [EquipmentController::class, 'store'])
            ->middleware('can:create,App\Models\Equipment')
            ->name('equipment.store');
        Route::get('stats', [EquipmentController::class, 'stats'])->name('equipment.stats');
        Route::get('maintenance-calendar', [EquipmentController::class, 'maintenanceCalendar'])
            ->name('equipment.maintenance-calendar');
        Route::get('{equipment}', [EquipmentController::class, 'show'])->name('equipment.show');
        Route::put('{equipment}', [EquipmentController::class, 'update'])
            ->middleware('can:update,equipment')
            ->name('equipment.update');
        Route::delete('{equipment}', [EquipmentController::class, 'destroy'])
            ->middleware('can:delete,equipment')
            ->name('equipment.destroy');
        
        // Equipment operations
        Route::put('{equipment}/status', [EquipmentController::class, 'updateStatus'])
            ->name('equipment.update-status');
        Route::post('{equipment}/maintenance', [EquipmentController::class, 'scheduleMaintenance'])
            ->name('equipment.schedule-maintenance');
    });

    // System Notification routes
    Route::prefix('system-notifications')->middleware(['role:super_admin,hospital_admin,doctor,nurse,dispatcher,ambulance_driver,ambulance_paramedic'])->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('system-notifications.index');
        Route::get('unread-count', [NotificationController::class, 'getUnreadCount'])
            ->name('system-notifications.unread-count');
        Route::put('{notification}/read', [NotificationController::class, 'markAsRead'])
            ->name('system-notifications.mark-read');
        Route::post('mark-all-read', [NotificationController::class, 'markAllAsRead'])
            ->name('system-notifications.mark-all-read');
        Route::delete('{notification}', [NotificationController::class, 'destroy'])
            ->name('notifications.destroy');

        // Notification preferences
        Route::get('preferences', [NotificationController::class, 'preferences'])
            ->name('notifications.preferences');
        Route::put('preferences', [NotificationController::class, 'preferences'])
            ->name('notifications.update-preferences');
    });

    // Feedback routes
    Route::prefix('feedback')->group(function () {
        Route::get('/', [FeedbackController::class, 'index'])->name('feedback.index');
        Route::post('/', [FeedbackController::class, 'store'])->name('feedback.store');
        Route::get('{feedback}', [FeedbackController::class, 'show'])->name('feedback.show');
        
        // Rating summaries
        Route::get('facilities/{facility}/ratings', [FeedbackController::class, 'facilityRatings'])
            ->name('feedback.facility-ratings');
        Route::get('doctors/{doctor}/ratings', [FeedbackController::class, 'doctorRatings'])
            ->name('feedback.doctor-ratings');
    });

    // Reporting routes
    Route::prefix('reports')->group(function () {
        Route::get('referral-metrics', [ReportController::class, 'referralMetrics'])
            ->name('reports.referral-metrics');
        Route::get('capacity-utilization', [ReportController::class, 'capacityUtilization'])
            ->name('reports.capacity-utilization');
        Route::get('response-time-analysis', [ReportController::class, 'responseTimeAnalysis'])
            ->name('reports.response-time');
        Route::get('facility-performance', [ReportController::class, 'facilityPerformance'])
            ->name('reports.facility-performance');
        Route::get('ambulance-utilization', [ReportController::class, 'ambulanceUtilization'])
            ->name('reports.ambulance-utilization');
        Route::get('quality-metrics', [ReportController::class, 'qualityMetrics'])
            ->name('reports.quality-metrics');
        
        // Export functionality
        Route::post('export', [ReportController::class, 'exportReport'])
            ->name('reports.export');
    });

    // System administration routes (Super Admin only)
    Route::prefix('system')->middleware('role:super_admin')->group(function () {
        Route::get('settings', [SystemController::class, 'settings'])->name('system.settings');
        Route::put('settings', [SystemController::class, 'updateSetting'])->name('system.update-setting');
        Route::get('health', [SystemController::class, 'systemHealth'])->name('system.health-detailed');
        Route::post('maintenance', [SystemController::class, 'maintenance'])->name('system.maintenance');
        Route::get('audit-logs', [SystemController::class, 'auditLogs'])->name('system.audit-logs');
        Route::get('stats', [SystemController::class, 'systemStats'])->name('system.stats');
        
        // User management
        Route::get('users', [SystemController::class, 'users'])->name('system.users');
        Route::post('users/{user}/suspend', [SystemController::class, 'suspendUser'])->name('system.suspend-user');
        Route::post('users/{user}/activate', [SystemController::class, 'activateUser'])->name('system.activate-user');
    });

// Webhook routes (for external integrations)
Route::prefix('webhooks')->group(function () {
    Route::post('ambulance-location/{ambulance}', [AmbulanceController::class, 'locationWebhook'])
        ->middleware('webhook.verify')
        ->name('webhooks.ambulance-location');
    Route::post('emergency-alert', [EmergencyController::class, 'alertWebhook'])
        ->middleware('webhook.verify')
        ->name('webhooks.emergency-alert');
});
