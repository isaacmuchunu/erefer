import React from 'react';
import { usePage } from '@inertiajs/react';

interface User {
    id: number;
    role: string;
    first_name: string;
    last_name: string;
    email: string;
    facility_id?: number;
}

interface RoleGuardProps {
    children: React.ReactNode;
    roles?: string[];
    permissions?: string[];
    fallback?: React.ReactNode;
    requireAll?: boolean;
}

interface PageProps {
    auth: {
        user: User;
    };
}

/**
 * RoleGuard component for conditional rendering based on user roles and permissions
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
    children,
    roles = [],
    permissions = [],
    fallback = null,
    requireAll = false
}) => {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    if (!user) {
        return <>{fallback}</>;
    }

    // Check roles
    const hasRole = roles.length === 0 || roles.includes(user.role);

    // For now, we'll implement basic role checking
    // In a full implementation, you'd check against actual permissions
    const hasPermission = permissions.length === 0 || checkUserPermissions(user, permissions, requireAll);

    if (hasRole && hasPermission) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};

/**
 * Hook for checking user roles
 */
export const useRole = () => {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    return {
        user,
        hasRole: (role: string) => user?.role === role,
        hasAnyRole: (roles: string[]) => user ? roles.includes(user.role) : false,
        isAdmin: () => user ? ['super_admin', 'hospital_admin'].includes(user.role) : false,
        isMedicalStaff: () => user ? ['doctor', 'nurse'].includes(user.role) : false,
        isAmbulanceStaff: () => user ? ['ambulance_driver', 'ambulance_paramedic'].includes(user.role) : false,
        isPatient: () => user?.role === 'patient',
        isDispatcher: () => user?.role === 'dispatcher',
        canAccessPatients: () => user ? ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'patient'].includes(user.role) : false,
        canCreateReferrals: () => user ? ['super_admin', 'hospital_admin', 'doctor'].includes(user.role) : false,
        canManageAmbulances: () => user ? ['super_admin', 'hospital_admin', 'dispatcher'].includes(user.role) : false,
        canViewReports: () => user ? ['super_admin', 'hospital_admin', 'doctor'].includes(user.role) : false,
    };
};

/**
 * Helper function to check user permissions
 * This is a simplified implementation - in a real app you'd have a more sophisticated permission system
 */
function checkUserPermissions(user: User, permissions: string[], requireAll: boolean): boolean {
    const userPermissions = getUserPermissions(user);
    
    if (requireAll) {
        return permissions.every(permission => userPermissions.includes(permission));
    } else {
        return permissions.some(permission => userPermissions.includes(permission));
    }
}

/**
 * Get user permissions based on role
 * This maps roles to permissions - in a real app this would come from the backend
 */
function getUserPermissions(user: User): string[] {
    const rolePermissions: Record<string, string[]> = {
        super_admin: [
            'manage-users',
            'manage-facilities',
            'view-system-reports',
            'manage-system-settings',
            'view-all-patients',
            'create-patients',
            'view-patient-medical-records',
            'update-patient-medical-records',
            'create-referrals',
            'accept-referrals',
            'reject-referrals',
            'dispatch-ambulances',
            'manage-ambulance-fleet',
            'track-ambulances',
            'update-ambulance-status',
            'send-emergency-broadcasts',
            'access-communication-system',
            'manage-equipment',
            'view-equipment',
            'manage-beds',
            'reserve-beds',
            'view-analytics',
            'export-reports',
            'view-audit-logs',
            'declare-emergency',
            'manage-emergency-response'
        ],
        hospital_admin: [
            'manage-users',
            'manage-facilities',
            'view-system-reports',
            'view-all-patients',
            'create-patients',
            'view-patient-medical-records',
            'update-patient-medical-records',
            'create-referrals',
            'accept-referrals',
            'reject-referrals',
            'dispatch-ambulances',
            'manage-ambulance-fleet',
            'track-ambulances',
            'update-ambulance-status',
            'send-emergency-broadcasts',
            'access-communication-system',
            'manage-equipment',
            'view-equipment',
            'manage-beds',
            'reserve-beds',
            'view-analytics',
            'export-reports',
            'view-audit-logs',
            'declare-emergency',
            'manage-emergency-response'
        ],
        doctor: [
            'view-all-patients',
            'create-patients',
            'view-patient-medical-records',
            'update-patient-medical-records',
            'create-referrals',
            'accept-referrals',
            'reject-referrals',
            'track-ambulances',
            'access-communication-system',
            'view-equipment',
            'reserve-beds',
            'view-analytics',
            'declare-emergency'
        ],
        nurse: [
            'view-all-patients',
            'create-patients',
            'access-communication-system',
            'view-equipment',
            'manage-beds',
            'reserve-beds',
            'track-ambulances'
        ],
        dispatcher: [
            'dispatch-ambulances',
            'track-ambulances',
            'update-ambulance-status',
            'send-emergency-broadcasts',
            'access-communication-system',
            'manage-emergency-response'
        ],
        ambulance_driver: [
            'track-ambulances',
            'update-ambulance-status',
            'access-communication-system',
            'manage-emergency-response'
        ],
        ambulance_paramedic: [
            'track-ambulances',
            'update-ambulance-status',
            'access-communication-system',
            'manage-emergency-response'
        ],
        patient: [
            // Patients have very limited permissions - mostly viewing their own data
        ]
    };

    return rolePermissions[user.role] || [];
}

export default RoleGuard;
