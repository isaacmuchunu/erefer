<?php

use Illuminate\Support\Facades\Route;

use Inertia\Inertia;

use App\Http\Controllers\ReferralController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\AmbulanceController;
use App\Http\Controllers\BedController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\KnowledgeBaseController;
use App\Http\Controllers\MessagesController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\DispatcherDashboardController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\WhatsAppController;
use App\Http\Controllers\ChatController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Default Laravel routes for web interface (if needed)
Route::get('/', function () {
    return Inertia::render('welcome', [
        'message' => 'Welcome to E-Referral System',
        'version' => '1.0.0',
    ]);
})->name('home');

// Health check route
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toISOString(),
        'uptime' => now()->diffInSeconds(app('startTime') ?? now())
    ]);
})->name('health');

// File download routes (for documents, reports, etc.)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/download/referral-document/{document}', [ReferralController::class, 'downloadDocument'])
        ->name('download.referral-document');
    Route::get('/download/report/{filename}', [ReportController::class, 'downloadReport'])
        ->name('download.report');
    Route::get('/download/patient-document/{document}', [PatientController::class, 'downloadDocument'])
        ->name('download.patient-document');
});

Route::middleware('auth')->group(function () {
    // Default dashboard - redirects to role-specific dashboard
    Route::get('/dashboard', [App\Http\Controllers\RoleDashboardController::class, 'redirectToDashboard'])
        ->name('dashboard');

    // Role-based Dashboard Routes
    Route::prefix('dashboards')->name('dashboards.')->group(function () {
        // Super Admin Dashboard
        Route::get('/super-admin', [App\Http\Controllers\RoleDashboardController::class, 'superAdminDashboard'])
            ->name('super-admin');

        // Hospital Admin Dashboard
        Route::get('/hospital-admin', [App\Http\Controllers\RoleDashboardController::class, 'hospitalAdminDashboard'])
            ->name('hospital-admin');

        // Doctor Dashboard
        Route::get('/doctor', [App\Http\Controllers\RoleDashboardController::class, 'doctorDashboard'])
            ->name('doctor');

        // Nurse Dashboard
        Route::get('/nurse', [App\Http\Controllers\RoleDashboardController::class, 'nurseDashboard'])
            ->name('nurse');

        // Dispatcher Dashboard
        Route::get('/dispatcher', [App\Http\Controllers\RoleDashboardController::class, 'dispatcherDashboard'])
            ->name('dispatcher');

        // Ambulance Driver Dashboard
        Route::get('/ambulance-driver', [App\Http\Controllers\RoleDashboardController::class, 'ambulanceDriverDashboard'])
            ->name('ambulance-driver');

        // Ambulance Paramedic Dashboard
        Route::get('/ambulance-paramedic', [App\Http\Controllers\RoleDashboardController::class, 'ambulanceParamedicDashboard'])
            ->name('ambulance-paramedic');

        // Patient Dashboard
        Route::get('/patient', [App\Http\Controllers\RoleDashboardController::class, 'patientDashboard'])
            ->name('patient');

        // Dashboard API endpoints
        Route::get('/api/data', [App\Http\Controllers\RoleDashboardController::class, 'getDashboardData'])
            ->name('api.data');
    });

    // Legacy dashboard routes (keep for backward compatibility)
    Route::get('/admin/dashboard', function () {
        return redirect()->route('dashboards.super-admin');
    })->name('admin.dashboard');

    Route::get('/doctor/dashboard', function () {
        return redirect()->route('dashboards.doctor');
    })->name('doctor.dashboard');

    Route::get('/patient/dashboard', function () {
        return redirect()->route('dashboards.patient');
    })->name('patient.dashboard');

    // Operations route
    Route::get('/operations', function () {
        return Inertia::render('operations/index');
    })->name('operations.index');

    // Messages routes
    Route::get('/messages', [App\Http\Controllers\MessagesController::class, 'index'])->name('messages.index');

    // Notifications routes
    Route::get('/notifications', [App\Http\Controllers\NotificationsController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/{notification}', [App\Http\Controllers\NotificationsController::class, 'show'])->name('notifications.show');
    Route::post('/notifications/{notification}/read', [App\Http\Controllers\NotificationsController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/mark-all-read', [App\Http\Controllers\NotificationsController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::delete('/notifications/{notification}', [App\Http\Controllers\NotificationsController::class, 'delete'])->name('notifications.delete');

    // Dispatcher Dashboard routes (restricted to dispatcher role)
    Route::middleware(['role:dispatcher'])->group(function () {
        Route::get('/dispatcher-dashboard', [App\Http\Controllers\DispatcherDashboardController::class, 'index'])->name('dispatcher.dashboard');
    });

    // Communications routes
    Route::get('/communications', function () {
        return Inertia::render('communications/index');
    })->name('communications.index');

    // Email routes
    Route::prefix('emails')->name('emails.')->group(function () {
        Route::get('/', [App\Http\Controllers\EmailController::class, 'index'])->name('index');
        Route::get('/compose', [App\Http\Controllers\EmailController::class, 'compose'])->name('compose');
        Route::post('/send', [App\Http\Controllers\EmailController::class, 'send'])->name('send');
        Route::get('/{email}', [App\Http\Controllers\EmailController::class, 'show'])->name('show');
        Route::post('/{email}/reply', [App\Http\Controllers\EmailController::class, 'reply'])->name('reply');
        Route::post('/{email}/forward', [App\Http\Controllers\EmailController::class, 'forward'])->name('forward');
        Route::post('/{email}/move', [App\Http\Controllers\EmailController::class, 'moveToFolder'])->name('move');
        Route::delete('/{email}', [App\Http\Controllers\EmailController::class, 'delete'])->name('delete');
        Route::get('/search', [App\Http\Controllers\EmailController::class, 'search'])->name('search');
        Route::get('/stats', [App\Http\Controllers\EmailController::class, 'getStats'])->name('stats');
    });

    // Email tracking routes
    Route::get('/email/tracking/pixel/{email}', [App\Http\Controllers\EmailController::class, 'trackingPixel'])->name('email.tracking.pixel');
    Route::get('/email/tracking/click/{email}', [App\Http\Controllers\EmailController::class, 'trackClick'])->name('email.tracking.click');

    // WhatsApp routes
    Route::prefix('whatsapp')->name('whatsapp.')->group(function () {
        Route::get('/', [App\Http\Controllers\WhatsAppController::class, 'index'])->name('index');
        Route::get('/conversations/{conversation}', [App\Http\Controllers\WhatsAppController::class, 'showConversation'])->name('conversation.show');
        Route::post('/conversations/{conversation}/messages', [App\Http\Controllers\WhatsAppController::class, 'sendMessage'])->name('message.send');
        Route::post('/conversations/{conversation}/template', [App\Http\Controllers\WhatsAppController::class, 'sendTemplate'])->name('template.send');
        Route::post('/conversations/{conversation}/media', [App\Http\Controllers\WhatsAppController::class, 'sendMedia'])->name('media.send');
        Route::post('/conversations/{conversation}/assign', [App\Http\Controllers\WhatsAppController::class, 'assignConversation'])->name('conversation.assign');
        Route::post('/conversations/{conversation}/labels', [App\Http\Controllers\WhatsAppController::class, 'addLabel'])->name('label.add');
        Route::delete('/conversations/{conversation}/labels', [App\Http\Controllers\WhatsAppController::class, 'removeLabel'])->name('label.remove');
        Route::post('/conversations/{conversation}/archive', [App\Http\Controllers\WhatsAppController::class, 'archiveConversation'])->name('conversation.archive');
        Route::post('/conversations/{conversation}/unarchive', [App\Http\Controllers\WhatsAppController::class, 'unarchiveConversation'])->name('conversation.unarchive');
        Route::post('/conversations/{conversation}/block', [App\Http\Controllers\WhatsAppController::class, 'blockConversation'])->name('conversation.block');
        Route::get('/search', [App\Http\Controllers\WhatsAppController::class, 'search'])->name('search');
        Route::get('/templates', [App\Http\Controllers\WhatsAppController::class, 'getTemplates'])->name('templates');
        Route::get('/stats', [App\Http\Controllers\WhatsAppController::class, 'getStats'])->name('stats');
    });

    // WhatsApp webhook
    Route::match(['get', 'post'], '/whatsapp/webhook', [App\Http\Controllers\WhatsAppController::class, 'webhook'])->name('whatsapp.webhook');

    // Enhanced Chat routes
    Route::prefix('chat')->name('chat.')->group(function () {
        Route::get('/', [App\Http\Controllers\ChatController::class, 'index'])->name('index');
        Route::post('/rooms', [App\Http\Controllers\ChatController::class, 'store'])->name('rooms.store');
        Route::get('/rooms/{chatRoom}', [App\Http\Controllers\ChatController::class, 'show'])->name('rooms.show');
        Route::post('/rooms/{chatRoom}/messages', [App\Http\Controllers\ChatController::class, 'sendMessage'])->name('messages.send');
        Route::post('/rooms/{chatRoom}/files', [App\Http\Controllers\ChatController::class, 'shareFile'])->name('files.share');
        Route::post('/rooms/{chatRoom}/voice', [App\Http\Controllers\ChatController::class, 'sendVoiceMessage'])->name('voice.send');
        Route::post('/rooms/{chatRoom}/typing', [App\Http\Controllers\ChatController::class, 'updateTyping'])->name('typing.update');
        Route::post('/rooms/{chatRoom}/call', [App\Http\Controllers\ChatController::class, 'initiateCall'])->name('call.initiate');
        Route::post('/messages/{message}/reactions', [App\Http\Controllers\ChatController::class, 'addReaction'])->name('messages.reactions.add');
        Route::delete('/messages/{message}/reactions', [App\Http\Controllers\ChatController::class, 'removeReaction'])->name('messages.reactions.remove');
        Route::put('/messages/{message}', [App\Http\Controllers\ChatController::class, 'editMessage'])->name('messages.edit');
        Route::delete('/messages/{message}', [App\Http\Controllers\ChatController::class, 'deleteMessage'])->name('messages.delete');
        Route::post('/rooms/{chatRoom}/participants', [App\Http\Controllers\ChatController::class, 'addParticipant'])->name('participants.add');
        Route::delete('/rooms/{chatRoom}/participants', [App\Http\Controllers\ChatController::class, 'removeParticipant'])->name('participants.remove');
        Route::post('/rooms/{chatRoom}/archive', [App\Http\Controllers\ChatController::class, 'archive'])->name('rooms.archive');
        Route::get('/rooms/{chatRoom}/stats', [App\Http\Controllers\ChatController::class, 'getStats'])->name('rooms.stats');
    });

    // Video Call routes
    Route::prefix('calls')->name('calls.')->group(function () {
        Route::post('/end/{call}', [App\Http\Controllers\ChatController::class, 'endCall'])->name('end');
        Route::get('/join/{call}', function(\App\Models\VideoCall $call) {
            return Inertia::render('calls/join', ['call' => $call]);
        })->name('join');
    });
});



// Test route for debugging authentication
Route::get('/test-auth', function () {
    $user = \App\Models\User::where('email', 'isaacmuchunu@gmail.com')->first();

    if (!$user) {
        return response()->json(['error' => 'User not found']);
    }

    $passwordCheck = \Illuminate\Support\Facades\Hash::check('Kukus@1993', $user->password);

    return response()->json([
        'user_exists' => true,
        'email' => $user->email,
        'role' => $user->role,
        'password_valid' => $passwordCheck,
        'user_status' => $user->status,
        'email_verified' => $user->email_verified_at ? true : false,
    ]);
});

// Test login route
Route::post('/test-login', function (\Illuminate\Http\Request $request) {
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (\Illuminate\Support\Facades\Auth::attempt($credentials)) {
        $request->session()->regenerate();
        $user = \Illuminate\Support\Facades\Auth::user();

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
                'name' => $user->first_name . ' ' . $user->last_name,
            ],
            'redirect' => in_array($user->role, ['super_admin', 'hospital_admin'])
                ? '/admin/dashboard'
                : '/dashboard'
        ]);
    }

    return response()->json([
        'success' => false,
        'message' => 'Invalid credentials'
    ], 401);
});

// Test login page
Route::get('/test-login-page', function () {
    return Inertia::render('test-login');
});

// Admin Routes (Separate from main authenticated routes)
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    // Admin Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('admin/dashboard', [
            'auth' => ['user' => auth()->user()],
            'stats' => [
                'total_users' => \App\Models\User::count(),
                'total_referrals' => \App\Models\Referral::count(),
                'total_facilities' => \App\Models\Facility::count(),
                'total_ambulances' => \App\Models\Ambulance::count(),
            ]
        ]);
    })->name('dashboard');

    // User Management
    Route::resource('users', UserManagementController::class);
    Route::post('users/{user}/reset-password', [UserManagementController::class, 'resetPassword'])->name('users.reset-password');
    Route::patch('users/{user}/status', [UserManagementController::class, 'updateStatus'])->name('users.update-status');
    Route::post('users/bulk-action', [UserManagementController::class, 'bulkAction'])->name('users.bulk-action');
    Route::get('users/export', [UserManagementController::class, 'export'])->name('users.export');
    Route::post('users/import', [UserManagementController::class, 'import'])->name('users.import');

    // Facility Management
    Route::prefix('facilities')->name('facilities.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('admin/facilities/index', [
                'facilities' => \App\Models\Facility::withCount(['users'])->paginate(20)
            ]);
        })->name('index');
    });

    // System Settings
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('admin/settings/index');
        })->name('index');

        Route::get('/email', function () {
            return Inertia::render('admin/settings/email');
        })->name('email');

        Route::get('/whatsapp', function () {
            return Inertia::render('admin/settings/whatsapp');
        })->name('whatsapp');
    });

    // Communication Management
    Route::prefix('communications')->name('communications.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('admin/communications/index', [
                'email_stats' => [
                    'total_sent' => \App\Models\EmailMessage::where('type', 'outbound')->count(),
                    'total_received' => \App\Models\EmailMessage::where('type', 'inbound')->count(),
                ],
                'whatsapp_stats' => [
                    'total_conversations' => \App\Models\WhatsAppConversation::count(),
                    'active_conversations' => \App\Models\WhatsAppConversation::where('status', 'active')->count(),
                ]
            ]);
        })->name('index');
    });

    // Reports and Analytics
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('admin/reports/index');
        })->name('index');
    });

    Route::get('/test-layout', function () {
        return Inertia::render('test-layout');
    })->name('test-layout');

    // Referrals routes
    Route::get('/referrals', function () { return Inertia::render('referrals/index'); })->name('referrals.index');
    Route::get('/referrals/create', function () { return Inertia::render('referrals/create'); })->name('referrals.create');
    Route::get('/referrals/{referral}/edit', function () { return Inertia::render('referrals/edit'); })->name('referrals.edit');
    Route::get('/referrals/{referral}', function () { return Inertia::render('referrals/show'); })->name('referrals.show');

    // Patients routes
    Route::get('/patients', function () { return Inertia::render('patients/index'); })->name('patients.index');
    Route::get('/patients/create', function () { return Inertia::render('patients/create'); })->name('patients.create');
    Route::get('/patients/{patient}/edit', function () { return Inertia::render('patients/edit'); })->name('patients.edit');
    Route::get('/patients/{patient}', function () { return Inertia::render('patients/show'); })->name('patients.show');

    // Facilities routes
    Route::get('/facilities', function () { return Inertia::render('facilities/index'); })->name('facilities.index');
    Route::get('/facilities/create', function () { return Inertia::render('facilities/create'); })->name('facilities.create');
    Route::get('/facilities/{facility}/edit', function () { return Inertia::render('facilities/edit'); })->name('facilities.edit');
    Route::get('/facilities/{facility}', function () { return Inertia::render('facilities/show'); })->name('facilities.show');

    // Doctors routes
    Route::get('/doctors', function () { return Inertia::render('doctors/index'); })->name('doctors.index');
    Route::get('/doctors/create', function () { return Inertia::render('doctors/create'); })->name('doctors.create');
    Route::get('/doctors/{doctor}/edit', function () { return Inertia::render('doctors/edit'); })->name('doctors.edit');
    Route::get('/doctors/{doctor}', function () { return Inertia::render('doctors/show'); })->name('doctors.show');

    // Departments routes
    Route::get('/departments', function () { return Inertia::render('departments/index'); })->name('departments.index');
    Route::get('/departments/create', function () { return Inertia::render('departments/create'); })->name('departments.create');
    Route::get('/departments/{department}/edit', function () { return Inertia::render('departments/edit'); })->name('departments.edit');
    Route::get('/departments/{department}', function () { return Inertia::render('departments/show'); })->name('departments.show');

    // Beds routes
    Route::get('/beds', function () { return Inertia::render('beds/index'); })->name('beds.index');
    Route::get('/beds/create', function () { return Inertia::render('beds/create'); })->name('beds.create');
    Route::get('/beds/{bed}/edit', [BedController::class, 'edit'])->name('beds.edit');
    Route::get('/beds/{bed}', function () { return Inertia::render('beds/show'); })->name('beds.show');

    // Ambulances routes
    Route::get('/ambulances', function () { return Inertia::render('ambulances/index'); })->name('ambulances.index');
    Route::get('/ambulances/create', function () { return Inertia::render('ambulances/create'); })->name('ambulances.create');
    Route::get('/ambulances/{ambulance}/edit', [AmbulanceController::class, 'edit'])->name('ambulances.edit');
    Route::get('/ambulances/{ambulance}', function () { return Inertia::render('ambulances/show'); })->name('ambulances.show');

    // Equipment routes
    Route::get('/equipment', function () { return Inertia::render('equipment/index'); })->name('equipment.index');
    Route::get('/equipment/create', function () { return Inertia::render('equipment/create'); })->name('equipment.create');
    Route::get('/equipment/{equipment}/edit', [EquipmentController::class, 'edit'])->name('equipment.edit');
    Route::get('/equipment/{equipment}', function () { return Inertia::render('equipment/show'); })->name('equipment.show');

    // Appointments routes
    Route::get('/appointments', function () { return Inertia::render('appointments/index'); })->name('appointments.index');
    Route::get('/appointments/create', function () { return Inertia::render('appointments/create'); })->name('appointments.create');
    Route::get('/appointments/{appointment}/edit', function () { return Inertia::render('appointments/edit'); })->name('appointments.edit');
    Route::get('/appointments/{appointment}', function () { return Inertia::render('appointments/show'); })->name('appointments.show');

    // Additional Messages routes
    Route::get('/messages/create', function () { return Inertia::render('messages/create'); })->name('messages.create');
    Route::get('/messages/{message}', [App\Http\Controllers\MessagesController::class, 'show'])->name('messages.show');

    // Emergency routes
    Route::get('/emergency', function () { return Inertia::render('emergency/index'); })->name('emergency.index');
    Route::get('/emergency/call', function () { return Inertia::render('emergency/call'); })->name('emergency.call');

    // Reports routes
    Route::get('/reports', function () { return Inertia::render('reports/index'); })->name('reports.index');
    Route::get('/reports/create', function () { return Inertia::render('reports/create'); })->name('reports.create');
    Route::get('/reports/{report}', function () { return Inertia::render('reports/show'); })->name('reports.show');

    // Analytics route
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics');



    // Knowledge Base route
    Route::get('/knowledge-base', [KnowledgeBaseController::class, 'index'])->name('knowledge-base');

    // Help and Support routes
    Route::get('/help', function () { return Inertia::render('help/index'); })->name('help.index');
    Route::get('/status', function () { return Inertia::render('status/index'); })->name('status.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
