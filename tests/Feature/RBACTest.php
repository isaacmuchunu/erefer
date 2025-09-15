<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Patient;
use App\Models\Referral;
use App\Models\Ambulance;
use App\Models\Facility;
use App\Models\Doctor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class RBACTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test facilities
        $this->facility = Facility::factory()->create();
    }

    /** @test */
    public function super_admin_can_access_all_resources()
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        Sanctum::actingAs($superAdmin);

        // Test patient access
        $response = $this->getJson('/api/v1/patients');
        $response->assertStatus(200);

        // Test referral access
        $response = $this->getJson('/api/v1/referrals');
        $response->assertStatus(200);

        // Test ambulance access
        $response = $this->getJson('/api/v1/ambulances');
        $response->assertStatus(200);

        // Test admin routes
        $response = $this->get('/admin/dashboard');
        $response->assertStatus(200);
    }

    /** @test */
    public function patient_can_only_access_own_data()
    {
        $patient = Patient::factory()->create();
        $user = User::factory()->create([
            'role' => 'patient',
            'email' => $patient->email
        ]);
        
        Sanctum::actingAs($user);

        // Patient should be able to access patient routes
        $response = $this->getJson('/api/v1/patients');
        $response->assertStatus(200);

        // But not admin routes
        $response = $this->get('/admin/dashboard');
        $response->assertStatus(403);

        // And not ambulance management
        $response = $this->getJson('/api/v1/ambulances');
        $response->assertStatus(403);
    }

    /** @test */
    public function doctor_can_access_medical_resources()
    {
        $doctor = Doctor::factory()->create(['facility_id' => $this->facility->id]);
        $user = User::factory()->create([
            'role' => 'doctor',
            'facility_id' => $this->facility->id
        ]);
        $user->doctor()->associate($doctor);
        $user->save();

        Sanctum::actingAs($user);

        // Doctor should access patients
        $response = $this->getJson('/api/v1/patients');
        $response->assertStatus(200);

        // And referrals
        $response = $this->getJson('/api/v1/referrals');
        $response->assertStatus(200);

        // But not admin routes
        $response = $this->get('/admin/dashboard');
        $response->assertStatus(403);

        // And not ambulance management
        $response = $this->getJson('/api/v1/ambulances');
        $response->assertStatus(403);
    }

    /** @test */
    public function nurse_has_limited_access()
    {
        $user = User::factory()->create([
            'role' => 'nurse',
            'facility_id' => $this->facility->id
        ]);

        Sanctum::actingAs($user);

        // Nurse should access patients
        $response = $this->getJson('/api/v1/patients');
        $response->assertStatus(200);

        // And referrals
        $response = $this->getJson('/api/v1/referrals');
        $response->assertStatus(200);

        // But not admin routes
        $response = $this->get('/admin/dashboard');
        $response->assertStatus(403);

        // And not ambulance management
        $response = $this->getJson('/api/v1/ambulances');
        $response->assertStatus(403);
    }

    /** @test */
    public function dispatcher_can_manage_ambulances()
    {
        $user = User::factory()->create(['role' => 'dispatcher']);
        Sanctum::actingAs($user);

        // Dispatcher should access ambulances
        $response = $this->getJson('/api/v1/ambulances');
        $response->assertStatus(200);

        // And referrals (for dispatch purposes)
        $response = $this->getJson('/api/v1/referrals');
        $response->assertStatus(200);

        // But not admin routes
        $response = $this->get('/admin/dashboard');
        $response->assertStatus(403);

        // And limited patient access
        $response = $this->getJson('/api/v1/patients');
        $response->assertStatus(403);
    }

    /** @test */
    public function ambulance_staff_has_restricted_access()
    {
        $user = User::factory()->create(['role' => 'ambulance_driver']);
        Sanctum::actingAs($user);

        // Ambulance staff should access ambulances
        $response = $this->getJson('/api/v1/ambulances');
        $response->assertStatus(200);

        // And assigned referrals
        $response = $this->getJson('/api/v1/referrals');
        $response->assertStatus(200);

        // But not admin routes
        $response = $this->get('/admin/dashboard');
        $response->assertStatus(403);

        // And not patient management
        $response = $this->getJson('/api/v1/patients');
        $response->assertStatus(403);
    }

    /** @test */
    public function unauthorized_access_is_logged()
    {
        $user = User::factory()->create(['role' => 'patient']);
        Sanctum::actingAs($user);

        // Attempt unauthorized access
        $response = $this->get('/admin/dashboard');
        $response->assertStatus(403);

        // Check if it was logged
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'action' => 'security.access_denied',
            'severity' => 'warning'
        ]);
    }

    /** @test */
    public function patient_data_isolation_works()
    {
        // Create two patients
        $patient1 = Patient::factory()->create();
        $patient2 = Patient::factory()->create();

        $user1 = User::factory()->create([
            'role' => 'patient',
            'email' => $patient1->email
        ]);

        Sanctum::actingAs($user1);

        // User should only see their own patient data
        $response = $this->getJson('/api/v1/patients');
        $response->assertStatus(200);
        
        $data = $response->json();
        $this->assertCount(1, $data['data']);
        $this->assertEquals($patient1->id, $data['data'][0]['id']);
    }

    /** @test */
    public function doctor_can_only_see_assigned_patients()
    {
        $doctor = Doctor::factory()->create(['facility_id' => $this->facility->id]);
        $user = User::factory()->create([
            'role' => 'doctor',
            'facility_id' => $this->facility->id
        ]);
        $user->doctor()->associate($doctor);
        $user->save();

        // Create patients with and without referrals to this doctor
        $patient1 = Patient::factory()->create();
        $patient2 = Patient::factory()->create();

        $referral = Referral::factory()->create([
            'patient_id' => $patient1->id,
            'referring_doctor_id' => $doctor->id,
            'referring_facility_id' => $this->facility->id
        ]);

        Sanctum::actingAs($user);

        // Doctor should only see patients they're treating
        $response = $this->getJson('/api/v1/patients');
        $response->assertStatus(200);
        
        $data = $response->json();
        $this->assertCount(1, $data['data']);
        $this->assertEquals($patient1->id, $data['data'][0]['id']);
    }

    /** @test */
    public function role_changes_are_audited()
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        $user = User::factory()->create(['role' => 'nurse']);

        Sanctum::actingAs($admin);

        // Change user role
        $response = $this->putJson("/api/v1/admin/users/{$user->id}/role", [
            'role' => 'doctor'
        ]);

        $response->assertStatus(200);

        // Check if role change was logged
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action' => 'user.role_changed',
            'model_type' => User::class,
            'model_id' => $user->id
        ]);
    }

    /** @test */
    public function users_cannot_remove_their_own_super_admin_role()
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        Sanctum::actingAs($admin);

        // Attempt to remove own super admin role
        $response = $this->putJson("/api/v1/admin/users/{$admin->id}/role", [
            'role' => 'doctor'
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'You cannot remove your own super admin privileges.'
        ]);
    }

    /** @test */
    public function middleware_blocks_unauthorized_role_access()
    {
        $user = User::factory()->create(['role' => 'nurse']);
        Sanctum::actingAs($user);

        // Test ambulance middleware
        $response = $this->getJson('/api/v1/ambulances');
        $response->assertStatus(403);

        // Test admin middleware
        $response = $this->get('/admin/dashboard');
        $response->assertStatus(403);
    }

    /** @test */
    public function audit_logging_captures_sensitive_operations()
    {
        $doctor = Doctor::factory()->create(['facility_id' => $this->facility->id]);
        $user = User::factory()->create([
            'role' => 'doctor',
            'facility_id' => $this->facility->id
        ]);
        $user->doctor()->associate($doctor);
        $user->save();

        $patient = Patient::factory()->create();

        Sanctum::actingAs($user);

        // Access patient data
        $response = $this->getJson("/api/v1/patients/{$patient->id}");

        // Check if access was logged
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'action' => 'patients.viewed'
        ]);
    }

    /** @test */
    public function cross_facility_access_is_restricted()
    {
        $facility1 = Facility::factory()->create();
        $facility2 = Facility::factory()->create();

        $user = User::factory()->create([
            'role' => 'nurse',
            'facility_id' => $facility1->id
        ]);

        $patient = Patient::factory()->create();
        $referral = Referral::factory()->create([
            'patient_id' => $patient->id,
            'referring_facility_id' => $facility2->id, // Different facility
            'receiving_facility_id' => $facility2->id
        ]);

        Sanctum::actingAs($user);

        // User should not see referrals from other facilities
        $response = $this->getJson('/api/v1/referrals');
        $response->assertStatus(200);

        $data = $response->json();
        $this->assertCount(0, $data['data']);
    }
}
