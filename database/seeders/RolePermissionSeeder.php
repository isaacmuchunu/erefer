<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // User Management
            ['name' => 'View Users', 'slug' => 'users.view', 'category' => 'user_management', 'description' => 'View user listings and profiles'],
            ['name' => 'Create Users', 'slug' => 'users.create', 'category' => 'user_management', 'description' => 'Create new user accounts'],
            ['name' => 'Edit Users', 'slug' => 'users.edit', 'category' => 'user_management', 'description' => 'Modify user information'],
            ['name' => 'Delete Users', 'slug' => 'users.delete', 'category' => 'user_management', 'description' => 'Remove user accounts'],
            ['name' => 'Manage User Roles', 'slug' => 'users.roles', 'category' => 'user_management', 'description' => 'Assign and modify user roles'],
            ['name' => 'Reset User Passwords', 'slug' => 'users.password_reset', 'category' => 'user_management', 'description' => 'Reset user passwords'],
            ['name' => 'Bulk User Actions', 'slug' => 'users.bulk', 'category' => 'user_management', 'description' => 'Perform bulk operations on users'],

            // Patient Management
            ['name' => 'View Patients', 'slug' => 'patients.view', 'category' => 'patient_management', 'description' => 'View patient records and information'],
            ['name' => 'Create Patients', 'slug' => 'patients.create', 'category' => 'patient_management', 'description' => 'Register new patients'],
            ['name' => 'Edit Patients', 'slug' => 'patients.edit', 'category' => 'patient_management', 'description' => 'Modify patient information'],
            ['name' => 'Delete Patients', 'slug' => 'patients.delete', 'category' => 'patient_management', 'description' => 'Remove patient records'],
            ['name' => 'View Medical Records', 'slug' => 'patients.medical_records', 'category' => 'patient_management', 'description' => 'Access patient medical history'],
            ['name' => 'Manage Patient Documents', 'slug' => 'patients.documents', 'category' => 'patient_management', 'description' => 'Upload and manage patient documents'],

            // Referral Management
            ['name' => 'View Referrals', 'slug' => 'referrals.view', 'category' => 'referral_management', 'description' => 'View referral requests and status'],
            ['name' => 'Create Referrals', 'slug' => 'referrals.create', 'category' => 'referral_management', 'description' => 'Create new referral requests'],
            ['name' => 'Edit Referrals', 'slug' => 'referrals.edit', 'category' => 'referral_management', 'description' => 'Modify referral information'],
            ['name' => 'Delete Referrals', 'slug' => 'referrals.delete', 'category' => 'referral_management', 'description' => 'Cancel or remove referrals'],
            ['name' => 'Approve Referrals', 'slug' => 'referrals.approve', 'category' => 'referral_management', 'description' => 'Approve or reject referral requests'],
            ['name' => 'Track Referrals', 'slug' => 'referrals.track', 'category' => 'referral_management', 'description' => 'Monitor referral progress and status'],

            // Facility Management
            ['name' => 'View Facilities', 'slug' => 'facilities.view', 'category' => 'facility_management', 'description' => 'View facility information and status'],
            ['name' => 'Create Facilities', 'slug' => 'facilities.create', 'category' => 'facility_management', 'description' => 'Register new healthcare facilities'],
            ['name' => 'Edit Facilities', 'slug' => 'facilities.edit', 'category' => 'facility_management', 'description' => 'Modify facility information'],
            ['name' => 'Delete Facilities', 'slug' => 'facilities.delete', 'category' => 'facility_management', 'description' => 'Remove facility records'],
            ['name' => 'Manage Beds', 'slug' => 'facilities.beds', 'category' => 'facility_management', 'description' => 'Manage bed allocation and availability'],
            ['name' => 'Manage Equipment', 'slug' => 'facilities.equipment', 'category' => 'facility_management', 'description' => 'Track and manage medical equipment'],

            // Ambulance Management
            ['name' => 'View Ambulances', 'slug' => 'ambulances.view', 'category' => 'ambulance_management', 'description' => 'View ambulance fleet and status'],
            ['name' => 'Create Ambulances', 'slug' => 'ambulances.create', 'category' => 'ambulance_management', 'description' => 'Add new ambulances to fleet'],
            ['name' => 'Edit Ambulances', 'slug' => 'ambulances.edit', 'category' => 'ambulance_management', 'description' => 'Modify ambulance information'],
            ['name' => 'Delete Ambulances', 'slug' => 'ambulances.delete', 'category' => 'ambulance_management', 'description' => 'Remove ambulances from fleet'],
            ['name' => 'Dispatch Ambulances', 'slug' => 'ambulances.dispatch', 'category' => 'ambulance_management', 'description' => 'Dispatch ambulances for emergencies'],
            ['name' => 'Track Ambulances', 'slug' => 'ambulances.track', 'category' => 'ambulance_management', 'description' => 'Monitor ambulance location and status'],
            ['name' => 'Manage Crew', 'slug' => 'ambulances.crew', 'category' => 'ambulance_management', 'description' => 'Assign and manage ambulance crew'],

            // Emergency Management
            ['name' => 'Handle Emergencies', 'slug' => 'emergency.handle', 'category' => 'emergency_management', 'description' => 'Respond to emergency situations'],
            ['name' => 'Create Emergency Alerts', 'slug' => 'emergency.alerts', 'category' => 'emergency_management', 'description' => 'Create and broadcast emergency alerts'],
            ['name' => 'Coordinate Response', 'slug' => 'emergency.coordinate', 'category' => 'emergency_management', 'description' => 'Coordinate emergency response efforts'],

            // Communication
            ['name' => 'Send Messages', 'slug' => 'communication.send', 'category' => 'communication', 'description' => 'Send messages to users'],
            ['name' => 'View Messages', 'slug' => 'communication.view', 'category' => 'communication', 'description' => 'View and read messages'],
            ['name' => 'Broadcast Messages', 'slug' => 'communication.broadcast', 'category' => 'communication', 'description' => 'Send broadcast messages to multiple users'],
            ['name' => 'Manage Chat Rooms', 'slug' => 'communication.chat', 'category' => 'communication', 'description' => 'Create and manage chat rooms'],

            // Reporting & Analytics
            ['name' => 'View Reports', 'slug' => 'reports.view', 'category' => 'reporting', 'description' => 'Access system reports and analytics'],
            ['name' => 'Create Reports', 'slug' => 'reports.create', 'category' => 'reporting', 'description' => 'Generate custom reports'],
            ['name' => 'Export Data', 'slug' => 'reports.export', 'category' => 'reporting', 'description' => 'Export data and reports'],
            ['name' => 'View Analytics', 'slug' => 'analytics.view', 'category' => 'reporting', 'description' => 'Access advanced analytics and insights'],

            // System Administration
            ['name' => 'System Settings', 'slug' => 'system.settings', 'category' => 'system', 'description' => 'Modify system configuration'],
            ['name' => 'View System Logs', 'slug' => 'system.logs', 'category' => 'system', 'description' => 'Access system logs and audit trails'],
            ['name' => 'Manage Backups', 'slug' => 'system.backups', 'category' => 'system', 'description' => 'Create and manage system backups'],
            ['name' => 'System Maintenance', 'slug' => 'system.maintenance', 'category' => 'system', 'description' => 'Perform system maintenance tasks'],
            ['name' => 'Security Management', 'slug' => 'system.security', 'category' => 'system', 'description' => 'Manage security settings and policies'],

            // Personal
            ['name' => 'View Own Profile', 'slug' => 'profile.view', 'category' => 'personal', 'description' => 'View own user profile'],
            ['name' => 'Edit Own Profile', 'slug' => 'profile.edit', 'category' => 'personal', 'description' => 'Modify own profile information'],
            ['name' => 'Change Password', 'slug' => 'profile.password', 'category' => 'personal', 'description' => 'Change own password'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['slug' => $permission['slug']],
                $permission
            );
        }

        // Create roles with hierarchy levels
        $roles = [
            [
                'name' => 'Super Administrator',
                'slug' => 'super_admin',
                'description' => 'Complete system access with all permissions',
                'level' => 100,
                'color' => '#7C3AED',
                'icon' => 'Crown',
                'metadata' => ['dashboard' => 'super-admin', 'layout' => 'SuperAdminLayout']
            ],
            [
                'name' => 'Hospital Administrator',
                'slug' => 'hospital_admin',
                'description' => 'Hospital-level administrative access',
                'level' => 80,
                'color' => '#2563EB',
                'icon' => 'Building2',
                'metadata' => ['dashboard' => 'hospital-admin', 'layout' => 'HospitalAdminLayout']
            ],
            [
                'name' => 'Doctor',
                'slug' => 'doctor',
                'description' => 'Medical professional with patient care access',
                'level' => 60,
                'color' => '#059669',
                'icon' => 'Stethoscope',
                'metadata' => ['dashboard' => 'doctor', 'layout' => 'DoctorLayout']
            ],
            [
                'name' => 'Nurse',
                'slug' => 'nurse',
                'description' => 'Nursing staff with patient care support',
                'level' => 50,
                'color' => '#DC2626',
                'icon' => 'Heart',
                'metadata' => ['dashboard' => 'nurse', 'layout' => 'NurseLayout']
            ],
            [
                'name' => 'Dispatcher',
                'slug' => 'dispatcher',
                'description' => 'Emergency dispatch and coordination',
                'level' => 55,
                'color' => '#EA580C',
                'icon' => 'Radio',
                'metadata' => ['dashboard' => 'dispatcher', 'layout' => 'DispatcherLayout']
            ],
            [
                'name' => 'Ambulance Driver',
                'slug' => 'ambulance_driver',
                'description' => 'Ambulance vehicle operation',
                'level' => 30,
                'color' => '#D97706',
                'icon' => 'Truck',
                'metadata' => ['dashboard' => 'ambulance-driver', 'layout' => 'AmbulanceDriverLayout']
            ],
            [
                'name' => 'Ambulance Paramedic',
                'slug' => 'ambulance_paramedic',
                'description' => 'Emergency medical technician',
                'level' => 35,
                'color' => '#B45309',
                'icon' => 'Activity',
                'metadata' => ['dashboard' => 'ambulance-paramedic', 'layout' => 'AmbulanceDriverLayout']
            ],
            [
                'name' => 'Patient',
                'slug' => 'patient',
                'description' => 'Healthcare service recipient',
                'level' => 10,
                'color' => '#6366F1',
                'icon' => 'User',
                'metadata' => ['dashboard' => 'patient', 'layout' => 'PatientLayout']
            ],
        ];

        foreach ($roles as $roleData) {
            $role = Role::firstOrCreate(
                ['slug' => $roleData['slug']],
                $roleData
            );

            // Assign permissions based on role
            $this->assignPermissionsToRole($role);
        }
    }

    /**
     * Assign permissions to roles based on their level and function
     */
    private function assignPermissionsToRole(Role $role): void
    {
        $permissionSlugs = [];

        switch ($role->slug) {
            case 'super_admin':
                // Super admin gets all permissions
                $permissionSlugs = Permission::pluck('slug')->toArray();
                break;

            case 'hospital_admin':
                $permissionSlugs = [
                    // User management (limited)
                    'users.view', 'users.create', 'users.edit', 'users.roles', 'users.password_reset', 'users.bulk',
                    // Patient management
                    'patients.view', 'patients.create', 'patients.edit', 'patients.medical_records', 'patients.documents',
                    // Referral management
                    'referrals.view', 'referrals.create', 'referrals.edit', 'referrals.approve', 'referrals.track',
                    // Facility management
                    'facilities.view', 'facilities.edit', 'facilities.beds', 'facilities.equipment',
                    // Ambulance management
                    'ambulances.view', 'ambulances.edit', 'ambulances.dispatch', 'ambulances.track', 'ambulances.crew',
                    // Communication
                    'communication.send', 'communication.view', 'communication.broadcast', 'communication.chat',
                    // Reporting
                    'reports.view', 'reports.create', 'reports.export', 'analytics.view',
                    // Personal
                    'profile.view', 'profile.edit', 'profile.password',
                ];
                break;

            case 'doctor':
                $permissionSlugs = [
                    // Patient management
                    'patients.view', 'patients.create', 'patients.edit', 'patients.medical_records', 'patients.documents',
                    // Referral management
                    'referrals.view', 'referrals.create', 'referrals.edit', 'referrals.approve', 'referrals.track',
                    // Communication
                    'communication.send', 'communication.view', 'communication.chat',
                    // Reporting (limited)
                    'reports.view', 'reports.export',
                    // Personal
                    'profile.view', 'profile.edit', 'profile.password',
                ];
                break;

            case 'nurse':
                $permissionSlugs = [
                    // Patient management (limited)
                    'patients.view', 'patients.edit', 'patients.medical_records',
                    // Referral management (limited)
                    'referrals.view', 'referrals.track',
                    // Facility management (beds only)
                    'facilities.beds',
                    // Communication
                    'communication.send', 'communication.view', 'communication.chat',
                    // Personal
                    'profile.view', 'profile.edit', 'profile.password',
                ];
                break;

            case 'dispatcher':
                $permissionSlugs = [
                    // Ambulance management
                    'ambulances.view', 'ambulances.dispatch', 'ambulances.track', 'ambulances.crew',
                    // Emergency management
                    'emergency.handle', 'emergency.alerts', 'emergency.coordinate',
                    // Communication
                    'communication.send', 'communication.view', 'communication.broadcast', 'communication.chat',
                    // Referral tracking (for dispatch)
                    'referrals.view', 'referrals.track',
                    // Reporting (limited)
                    'reports.view',
                    // Personal
                    'profile.view', 'profile.edit', 'profile.password',
                ];
                break;

            case 'ambulance_driver':
            case 'ambulance_paramedic':
                $permissionSlugs = [
                    // Ambulance operations (limited)
                    'ambulances.view', 'ambulances.track',
                    // Emergency response
                    'emergency.handle',
                    // Communication
                    'communication.send', 'communication.view', 'communication.chat',
                    // Patient info (limited)
                    'patients.view',
                    // Personal
                    'profile.view', 'profile.edit', 'profile.password',
                ];
                break;

            case 'patient':
                $permissionSlugs = [
                    // Personal data only
                    'profile.view', 'profile.edit', 'profile.password',
                    // Own referrals
                    'referrals.view', 'referrals.track',
                    // Communication (limited)
                    'communication.send', 'communication.view',
                ];
                break;
        }

        if (!empty($permissionSlugs)) {
            $role->syncPermissions($permissionSlugs);
        }
    }
}