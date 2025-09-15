# Enhanced Role-Based Access Control (RBAC) Implementation

## Overview

This document outlines the comprehensive RBAC system implementation for the eRefer Healthcare Platform. The enhanced system provides granular permissions, advanced security features, and comprehensive audit logging.

## System Architecture

### Core Components

1. **Enhanced User Model** - Extended with advanced RBAC methods and security features
2. **Role & Permission Models** - Flexible role hierarchy with granular permissions
3. **Enhanced Middleware** - Advanced security middleware with audit logging
4. **Authentication Listeners** - Comprehensive event tracking and security monitoring
5. **Security Controller** - Advanced security features (2FA, session management)
6. **Dashboard System** - Role-specific dashboards with analytics

## Role Hierarchy

### Role Levels (Higher number = More privileges)

| Role | Level | Description | Users | Permissions |
|------|-------|-------------|-------|-------------|
| Super Administrator | 100 | Complete system access | System admins | All permissions |
| Hospital Administrator | 80 | Hospital-level management | Facility admins | Hospital operations |
| Dispatcher | 55 | Emergency coordination | Dispatch staff | Emergency operations |
| Doctor | 60 | Medical professional | Physicians | Patient care, referrals |
| Nurse | 50 | Nursing staff | Nurses | Patient support, bed management |
| Ambulance Paramedic | 35 | Emergency medical tech | Paramedics | Emergency response |
| Ambulance Driver | 30 | Vehicle operation | Drivers | Transport operations |
| Patient | 10 | Healthcare recipient | Patients | Personal data only |

## Permission Categories

### 1. User Management
- `users.view` - View user listings and profiles
- `users.create` - Create new user accounts
- `users.edit` - Modify user information
- `users.delete` - Remove user accounts
- `users.roles` - Assign and modify user roles
- `users.password_reset` - Reset user passwords
- `users.bulk` - Perform bulk operations on users

### 2. Patient Management
- `patients.view` - View patient records
- `patients.create` - Register new patients
- `patients.edit` - Modify patient information
- `patients.delete` - Remove patient records
- `patients.medical_records` - Access medical history
- `patients.documents` - Manage patient documents

### 3. Referral Management
- `referrals.view` - View referral requests
- `referrals.create` - Create new referrals
- `referrals.edit` - Modify referral information
- `referrals.delete` - Cancel or remove referrals
- `referrals.approve` - Approve or reject referrals
- `referrals.track` - Monitor referral progress

### 4. Facility Management
- `facilities.view` - View facility information
- `facilities.create` - Register new facilities
- `facilities.edit` - Modify facility information
- `facilities.delete` - Remove facility records
- `facilities.beds` - Manage bed allocation
- `facilities.equipment` - Track medical equipment

### 5. Ambulance Management
- `ambulances.view` - View ambulance fleet
- `ambulances.create` - Add new ambulances
- `ambulances.edit` - Modify ambulance information
- `ambulances.delete` - Remove ambulances
- `ambulances.dispatch` - Dispatch for emergencies
- `ambulances.track` - Monitor location and status
- `ambulances.crew` - Manage ambulance crew

### 6. Emergency Management
- `emergency.handle` - Respond to emergencies
- `emergency.alerts` - Create emergency alerts
- `emergency.coordinate` - Coordinate response efforts

### 7. Communication
- `communication.send` - Send messages to users
- `communication.view` - View and read messages
- `communication.broadcast` - Send broadcast messages
- `communication.chat` - Manage chat rooms

### 8. Reporting & Analytics
- `reports.view` - Access system reports
- `reports.create` - Generate custom reports
- `reports.export` - Export data and reports
- `analytics.view` - Access advanced analytics

### 9. System Administration
- `system.settings` - Modify system configuration
- `system.logs` - Access system logs
- `system.backups` - Manage system backups
- `system.maintenance` - Perform maintenance tasks
- `system.security` - Manage security settings

### 10. Personal
- `profile.view` - View own profile
- `profile.edit` - Modify own profile
- `profile.password` - Change own password

## Security Features

### Advanced Authentication
- **Failed Login Tracking** - Monitors and logs failed attempts
- **Account Lockout** - Automatic lockout after 5 failed attempts
- **Session Management** - Track and manage active sessions
- **Two-Factor Authentication** - TOTP-based 2FA with backup codes
- **Password Policies** - Strong password requirements with expiration

### Security Monitoring
- **Suspicious Activity Detection** - New location and unusual time login alerts
- **Brute Force Protection** - IP-based attack detection
- **Comprehensive Audit Logging** - All security events tracked
- **Real-time Security Metrics** - Dashboard with security indicators

### Session Security
- **Session Tracking** - Device, browser, and location tracking
- **Concurrent Session Limits** - Control multiple sessions
- **Session Termination** - Remote session termination capability
- **Activity Monitoring** - Track user activity and idle time

## Middleware Implementation

### 1. EnhancedRoleMiddleware
```php
// Usage in routes
Route::middleware(['enhanced.role:super_admin,hospital_admin'])->group(function () {
    // Protected routes
});
```

**Features:**
- Hierarchical role checking
- Enhanced audit logging
- Performance monitoring
- Security headers injection

### 2. PermissionMiddleware
```php
// Usage in routes
Route::middleware(['permission:users.create,users.edit'])->group(function () {
    // Permission-protected routes
});
```

**Features:**
- Granular permission checking
- User-specific permission overrides
- Comprehensive access logging
- Unauthorized access tracking

## Dashboard System

### Role-Specific Dashboards

Each role has a tailored dashboard with relevant information:

1. **Super Admin Dashboard**
   - System health monitoring
   - Security metrics
   - User analytics
   - Performance data
   - Recent activities

2. **Hospital Admin Dashboard**
   - Facility overview
   - Staff analytics
   - Resource utilization
   - Quality metrics
   - Patient flow

3. **Doctor Dashboard**
   - Patient queue
   - Appointments
   - Pending referrals
   - Clinical metrics
   - Recent patients

4. **Nurse Dashboard**
   - Patient assignments
   - Medication rounds
   - Vital signs tracking
   - Bed management
   - Shift summary

5. **Dispatcher Dashboard**
   - Active emergency calls
   - Ambulance status
   - Response times
   - Emergency queue
   - Resource availability

6. **Ambulance Crew Dashboard**
   - Current assignments
   - Vehicle status
   - Trip history
   - Performance metrics
   - Navigation tools

7. **Patient Dashboard**
   - Appointments
   - Referral status
   - Medical records
   - Health metrics
   - Messages

## API Usage

### User Permissions
```php
// Check if user has specific permission
if ($user->hasPermission('patients.create')) {
    // Allow patient creation
}

// Check if user has any of multiple permissions
if ($user->hasAnyPermission(['patients.view', 'patients.edit'])) {
    // Allow patient access
}

// Check if user has all required permissions
if ($user->hasAllPermissions(['patients.view', 'patients.edit', 'patients.delete'])) {
    // Allow full patient management
}
```

### Role Management
```php
// Get user's role information
$roleName = $user->roleModel->name;
$roleColor = $user->getRoleColor();
$roleIcon = $user->getRoleIcon();

// Check role hierarchy
if ($user->roleModel->isHigherThan($otherUser->roleModel)) {
    // User has higher privileges
}
```

### Security Features
```php
// Check account security status
if ($user->isLocked()) {
    // Account is locked
}

if ($user->isPasswordExpired()) {
    // Password needs to be changed
}

// Manage sessions
$activeSessions = $user->getActiveSessions();
$user->terminateOtherSessions();
```

## Database Schema

### New Tables

1. **roles** - Role definitions with hierarchy
2. **permissions** - Permission definitions by category
3. **role_permissions** - Role-permission associations
4. **user_sessions** - Active session tracking

### Enhanced Tables

1. **users** - Added RBAC and security fields:
   - `role_id` - Foreign key to roles table
   - `permissions` - JSON array of user-specific permissions
   - `last_password_change` - Password change tracking
   - `password_expires_at` - Password expiration
   - `failed_login_attempts` - Failed login counter
   - `locked_until` - Account lockout timestamp
   - `must_change_password` - Force password change flag
   - `security_questions` - Security questions for recovery
   - `preferences` - User preferences and settings

## Migration Guide

### 1. Run Migrations
```bash
php artisan migrate
```

### 2. Seed Roles and Permissions
```bash
php artisan db:seed --class=RolePermissionSeeder
```

### 3. Update Existing Users
```php
// Assign roles to existing users based on their current role field
User::where('role', 'super_admin')->update(['role_id' => 1]);
User::where('role', 'hospital_admin')->update(['role_id' => 2]);
// ... etc for all roles
```

### 4. Update Routes
```php
// Replace old middleware
Route::middleware(['role:super_admin'])->group(function () {
    // Routes
});

// With enhanced middleware
Route::middleware(['enhanced.role:super_admin'])->group(function () {
    // Routes
});

// Or use permission-based middleware
Route::middleware(['permission:users.create'])->group(function () {
    // Routes
});
```

## Security Best Practices

### 1. Principle of Least Privilege
- Users receive only minimum necessary permissions
- Regular permission audits and reviews
- Role-based access strictly enforced

### 2. Defense in Depth
- Multiple layers of security controls
- Middleware, policies, and data scoping
- Frontend and backend validation

### 3. Audit Trail Maintenance
- Comprehensive logging of all operations
- Regular audit log review and analysis
- Compliance reporting capabilities

### 4. Regular Security Reviews
- Periodic access control audits
- Role permission validation
- Security vulnerability assessments

## Monitoring and Alerting

### Security Metrics Dashboard
- Failed login attempts
- Locked accounts
- Security alerts
- Suspicious activities
- Active sessions

### Automated Alerts
- Multiple failed login attempts
- New device/location logins
- Account lockouts
- Permission escalation attempts
- Unusual access patterns

## Compliance Features

### HIPAA Compliance
- Patient data access logging
- Minimum necessary access principle
- Audit trail requirements
- Access control documentation

### Data Protection
- Personal data access restrictions
- Cross-border data transfer controls
- Data retention policies
- Privacy by design implementation

## Testing

### Security Test Coverage
- Role-based access control validation
- Permission enforcement testing
- Data isolation verification
- Audit logging functionality
- Authentication flow testing

### Performance Testing
- Middleware performance impact
- Database query optimization
- Caching strategy validation
- Load testing with RBAC

## Troubleshooting

### Common Issues

1. **403 Forbidden Errors**
   - Check user role and permissions
   - Verify middleware configuration
   - Review policy implementations

2. **Missing Audit Logs**
   - Verify middleware is applied
   - Check database connectivity
   - Review log configuration

3. **Performance Issues**
   - Enable query caching
   - Optimize permission checks
   - Review middleware order

4. **Session Problems**
   - Check session configuration
   - Verify database sessions
   - Review cleanup processes

### Debug Commands
```bash
# Check user permissions
php artisan tinker
>>> $user = User::find(1);
>>> $user->hasPermission('users.create');
>>> $user->roleModel->permissions->pluck('slug');

# Review audit logs
>>> AuditLog::recent()->get();

# Test middleware
>>> Gate::allows('manage-users', $user);
```

## Future Enhancements

### Planned Features
- Dynamic permission assignment UI
- Role templates and inheritance
- Advanced security analytics
- Integration with external identity providers
- Mobile device management
- Biometric authentication support

### Scalability Improvements
- Permission caching strategies
- Distributed session management
- Advanced audit log storage
- Real-time security monitoring
- Automated threat response

## Conclusion

The enhanced RBAC system provides a comprehensive, secure, and scalable foundation for the eRefer Healthcare Platform. With granular permissions, advanced security features, and comprehensive monitoring, it ensures that sensitive healthcare data is protected while enabling efficient workflows for all user types.

The system is designed to be flexible and extensible, allowing for future enhancements and integration with additional security technologies as requirements evolve.