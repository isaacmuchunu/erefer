<?php
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to determine if an authenticated user can listen to the channel.
|
*/

// User-specific notifications
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Facility-specific channels
Broadcast::channel('facility.{facilityId}', function ($user, $facilityId) {
    return $user->facility_id === (int) $facilityId || $user->role === 'super_admin';
});

// Referral-specific channels
Broadcast::channel('referral.{referralId}', function ($user, $referralId) {
    $referral = \App\Models\Referral::find($referralId);
    if (!$referral) return false;
    
    return $user->facility_id === $referral->referring_facility_id ||
           $user->facility_id === $referral->receiving_facility_id ||
           $user->role === 'super_admin';
});

// Emergency alerts channel
Broadcast::channel('emergency-alerts', function ($user) {
    return in_array($user->role, ['hospital_admin', 'doctor', 'nurse', 'dispatcher', 'super_admin']);
});

// Ambulance tracking channels
Broadcast::channel('ambulance.{ambulanceId}', function ($user, $ambulanceId) {
    $ambulance = \App\Models\Ambulance::find($ambulanceId);
    if (!$ambulance) return false;
    
    return $user->facility_id === $ambulance->facility_id ||
           $user->role === 'super_admin' ||
           $user->role === 'dispatcher';
});

// System-wide announcements
Broadcast::channel('system-announcements', function ($user) {
    return true; // All authenticated users can receive system announcements
});

// Doctor availability updates
Broadcast::channel('doctor-availability.{doctorId}', function ($user, $doctorId) {
    $doctor = \App\Models\Doctor::find($doctorId);
    if (!$doctor) return false;
    
    return $user->facility_id === $doctor->facility_id ||
           $user->role === 'super_admin';
});

// Bed availability updates
Broadcast::channel('bed-availability.{facilityId}', function ($user, $facilityId) {
    return $user->facility_id === (int) $facilityId ||
           $user->role === 'super_admin' ||
           $user->role === 'dispatcher';
});
