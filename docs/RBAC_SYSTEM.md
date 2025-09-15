# CareLink RBAC (Role-Based Access Control) System

## Overview

The CareLink healthcare referral system implements a comprehensive Role-Based Access Control (RBAC) system to ensure secure access to sensitive medical data and system functionality. This document outlines the implementation, roles, permissions, and security measures.

## User Roles

### 1. Super Administrator (`super_admin`)
- **Description**: Highest level of system access
- **Permissions**: Full system control, user management, system configuration
- **Access Level**: All modules and data
- **Restrictions**: Cannot remove own super admin privileges

### 2. Hospital Administrator (`hospital_admin`)
- **Description**: Hospital-level administrative access
- **Permissions**: User management, facility management, reporting
- **Access Level**: All data within their facility scope
- **Restrictions**: Cannot access system-wide configuration

### 3. Doctor/Physician (`doctor`)
- **Description**: Medical professionals with patient care responsibilities
- **Permissions**: Patient management, referral creation, medical records access
- **Access Level**: Patients under their care, referrals they're involved in
- **Restrictions**: Limited to assigned patients and referrals

### 4. Nurse (`nurse`)
- **Description**: Nursing staff with patient care support
- **Permissions**: Patient viewing, bed management, basic referral access
- **Access Level**: Patients in their facility, limited medical record access
- **Restrictions**: Cannot create referrals or access sensitive medical data

### 5. Ambulance Dispatcher (`dispatcher`)
- **Description**: Emergency dispatch and ambulance coordination
- **Permissions**: Ambulance management, emergency response coordination
- **Access Level**: Ambulance fleet, emergency referrals
- **Restrictions**: Limited patient data access

### 6. Ambulance Driver (`ambulance_driver`)
- **Description**: Ambulance vehicle operation
- **Permissions**: Ambulance status updates, assigned call access
- **Access Level**: Assigned ambulance and calls only
- **Restrictions**: No patient management or administrative access

### 7. Ambulance Paramedic (`ambulance_paramedic`)
- **Description**: Emergency medical technician
- **Permissions**: Similar to ambulance driver with medical response capabilities
- **Access Level**: Assigned ambulance and emergency calls
- **Restrictions**: Limited to emergency response functions

### 8. Patient (`patient`)
- **Description**: Healthcare service recipients
- **Permissions**: View own data, update personal information
- **Access Level**: Own medical records and referrals only
- **Restrictions**: Cannot access other patients' data or administrative functions

## Security Implementation

### Middleware Protection

#### 1. RoleMiddleware
- Validates user roles for route access
- Supports multiple role requirements
- Returns appropriate error responses

#### 2. PatientMiddleware
- Ensures patient data isolation
- Validates patient-specific access
- Prevents cross-patient data access

#### 3. DoctorMiddleware
- Restricts access to medical staff
- Validates doctor-patient relationships
- Enforces medical data access rules

#### 4. AmbulanceMiddleware
- Controls ambulance system access
- Validates emergency response permissions
- Restricts to authorized personnel

#### 5. AuditMiddleware
- Logs all sensitive operations
- Tracks access attempts and failures
- Creates audit trails for compliance

### Authorization Policies

#### PatientPolicy
- Controls patient data access
- Enforces doctor-patient relationships
- Implements medical record protection

#### ReferralPolicy
- Manages referral access and modifications
- Validates facility relationships
- Controls referral workflow permissions

#### AmbulancePolicy
- Governs ambulance fleet access
- Manages dispatch permissions
- Controls tracking and status updates

### Data Scoping

#### Patient Data Isolation
```php
// Patients can only access their own data
if ($user->role === 'patient') {
    return Patient::where('id', $user->patient?->id);
}
```

#### Doctor-Patient Relationships
```php
// Doctors can only access patients they're treating
if ($user->role === 'doctor' && $user->doctor) {
    return Patient::whereHas('referrals', function ($query) {
        $query->where('referring_doctor_id', $this->doctor->id)
              ->orWhere('receiving_doctor_id', $this->doctor->id);
    });
}
```

#### Facility-Based Access
```php
// Nurses can access patients in their facility
if ($user->role === 'nurse' && $user->facility_id) {
    return Patient::whereHas('referrals', function ($query) {
        $query->where('referring_facility_id', $this->facility_id)
              ->orWhere('receiving_facility_id', $this->facility_id);
    });
}
```

## Audit Logging

### Logged Activities
- Patient data access
- Medical record modifications
- Referral creation and updates
- Ambulance dispatches
- Role changes
- Security violations
- Failed authorization attempts

### Audit Log Structure
```php
[
    'user_id' => 'ID of user performing action',
    'action' => 'Specific action performed',
    'model_type' => 'Type of model affected',
    'model_id' => 'ID of affected model',
    'old_values' => 'Previous values (for updates)',
    'new_values' => 'New values (for updates)',
    'ip_address' => 'User IP address',
    'user_agent' => 'User browser/client',
    'url' => 'Request URL',
    'method' => 'HTTP method',
    'description' => 'Human-readable description',
    'severity' => 'Security severity level',
    'tags' => 'Categorization tags'
]
```

### Severity Levels
- **info**: Normal operations
- **low**: Minor security events
- **medium**: Moderate security concerns
- **high**: Significant security events
- **critical**: Critical security violations
- **warning**: Potential security issues

## Frontend Integration

### RoleGuard Component
```tsx
<RoleGuard roles={['doctor', 'nurse']} fallback={<AccessDenied />}>
    <PatientManagement />
</RoleGuard>
```

### useRole Hook
```tsx
const { hasRole, canAccessPatients, isAdmin } = useRole();

if (canAccessPatients()) {
    // Show patient management UI
}
```

## API Route Protection

### Role-Based Route Groups
```php
// Patient routes - restricted to medical staff and patients
Route::prefix('patients')
    ->middleware(['role:super_admin,hospital_admin,doctor,nurse,patient'])
    ->group(function () {
        // Patient management routes
    });

// Ambulance routes - restricted to emergency staff
Route::prefix('ambulances')
    ->middleware(['ambulance'])
    ->group(function () {
        // Ambulance management routes
    });
```

## Testing

### Security Test Coverage
- Role-based access control validation
- Data isolation verification
- Cross-facility access prevention
- Audit logging functionality
- Middleware protection testing
- Policy enforcement validation

### Test Examples
```php
/** @test */
public function patient_can_only_access_own_data()
{
    // Test implementation
}

/** @test */
public function unauthorized_access_is_logged()
{
    // Test implementation
}
```

## Best Practices

### 1. Principle of Least Privilege
- Users receive minimum necessary permissions
- Role-based access strictly enforced
- Regular permission audits

### 2. Defense in Depth
- Multiple layers of security controls
- Middleware, policies, and data scoping
- Frontend and backend validation

### 3. Audit Trail Maintenance
- Comprehensive logging of sensitive operations
- Regular audit log review
- Compliance reporting capabilities

### 4. Regular Security Reviews
- Periodic access control audits
- Role permission validation
- Security vulnerability assessments

## Compliance Considerations

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

## Troubleshooting

### Common Issues
1. **403 Forbidden Errors**: Check user role and route middleware
2. **Missing Audit Logs**: Verify AuditMiddleware is applied
3. **Data Access Issues**: Review policy implementations
4. **Role Assignment Problems**: Check user role validation

### Debug Commands
```bash
# Check user roles
php artisan tinker
>>> User::find(1)->role

# Review audit logs
>>> AuditLog::recent()->get()

# Test policies
>>> Gate::allows('view', $patient)
```
