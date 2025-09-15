<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class NavigationAndRBACTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that messages page is accessible to authenticated users
     */
    public function test_messages_page_accessible_to_authenticated_users(): void
    {
        $user = User::factory()->create([
            'role' => 'doctor',
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)->get('/messages');
        $response->assertStatus(200);
    }

    /**
     * Test that notifications page is accessible to authenticated users
     */
    public function test_notifications_page_accessible_to_authenticated_users(): void
    {
        $user = User::factory()->create([
            'role' => 'nurse',
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)->get('/notifications');
        $response->assertStatus(200);
    }

    /**
     * Test that dispatcher dashboard is only accessible to dispatchers
     */
    public function test_dispatcher_dashboard_only_accessible_to_dispatchers(): void
    {
        // Test with dispatcher role
        $dispatcher = User::factory()->create([
            'role' => 'dispatcher',
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($dispatcher)->get('/dispatcher-dashboard');
        $response->assertStatus(200);

        // Test with non-dispatcher role
        $doctor = User::factory()->create([
            'role' => 'doctor',
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($doctor)->get('/dispatcher-dashboard');
        $response->assertStatus(403);
    }

    /**
     * Test that unauthenticated users cannot access protected pages
     */
    public function test_unauthenticated_users_cannot_access_protected_pages(): void
    {
        $response = $this->get('/messages');
        $response->assertRedirect('/login');

        $response = $this->get('/notifications');
        $response->assertRedirect('/login');

        $response = $this->get('/dispatcher-dashboard');
        $response->assertRedirect('/login');
    }

    /**
     * Test API endpoints have proper RBAC
     */
    public function test_api_endpoints_have_proper_rbac(): void
    {
        // Test dispatcher API with dispatcher user
        $dispatcher = User::factory()->create([
            'role' => 'dispatcher',
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($dispatcher)->getJson('/api/dispatcher/dashboard/updates');
        $response->assertStatus(200);

        // Test dispatcher API with non-dispatcher user
        $doctor = User::factory()->create([
            'role' => 'doctor',
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($doctor)->getJson('/api/dispatcher/dashboard/updates');
        $response->assertStatus(403);
    }

    /**
     * Test notification API endpoints
     */
    public function test_notification_api_endpoints(): void
    {
        $user = User::factory()->create([
            'role' => 'doctor',
            'email_verified_at' => now(),
        ]);

        // Test notifications index
        $response = $this->actingAs($user)->getJson('/api/notifications');
        $response->assertStatus(200);

        // Test mark all as read
        $response = $this->actingAs($user)->postJson('/api/notifications/mark-all-read');
        $response->assertStatus(200);
    }

    /**
     * Test role-based gates
     */
    public function test_role_based_gates(): void
    {
        $dispatcher = User::factory()->create(['role' => 'dispatcher']);
        $doctor = User::factory()->create(['role' => 'doctor']);
        $patient = User::factory()->create(['role' => 'patient']);

        // Test dispatcher permissions
        $this->assertTrue($dispatcher->can('dispatch-ambulances'));
        $this->assertTrue($dispatcher->can('access-communication-system'));
        $this->assertTrue($dispatcher->can('send-emergency-broadcasts'));

        // Test doctor permissions
        $this->assertTrue($doctor->can('access-communication-system'));
        $this->assertTrue($doctor->can('create-chat-rooms'));
        $this->assertFalse($doctor->can('dispatch-ambulances'));

        // Test patient permissions
        $this->assertFalse($patient->can('access-communication-system'));
        $this->assertFalse($patient->can('dispatch-ambulances'));
    }
}
