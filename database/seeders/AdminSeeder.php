<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Create default administrator account
        $admin = User::updateOrCreate(
            ['email' => 'admin@erefer.com'],
            [
                'first_name' => 'System',
                'last_name' => 'Administrator',
                'email' => 'admin@erefer.com',
                'password' => Hash::make('Password@123'),
                'role' => 'super_admin',
                'status' => 'active',
                'email_verified_at' => now(),
                'phone' => '+254700000000',
                'two_factor_enabled' => false,
            ]
        );

        $this->command->info('Default administrator account created successfully!');
        $this->command->info('Email: admin@erefer.com');
        $this->command->info('Password: Password@123');
        $this->command->info('Role: super_admin');

        // Also create the original admin user for development
        $devAdmin = User::updateOrCreate(
            ['email' => 'isaacmuchunu@gmail.com'],
            [
                'first_name' => 'Isaac',
                'last_name' => 'Muchunu',
                'email' => 'isaacmuchunu@gmail.com',
                'password' => Hash::make('Kukus@1993'),
                'role' => 'super_admin',
                'status' => 'active',
                'email_verified_at' => now(),
                'phone' => '+254700000001',
                'two_factor_enabled' => false,
            ]
        );

        $this->command->info('Development admin user created successfully!');
        $this->command->info('Email: isaacmuchunu@gmail.com');
        $this->command->info('Password: Kukus@1993');
        $this->command->info('Role: super_admin');

        // Create a few test users for development
        $testUsers = [
            [
                'first_name' => 'Dr. Sarah',
                'last_name' => 'Johnson',
                'email' => 'sarah.johnson@hospital.com',
                'password' => Hash::make('password123'),
                'role' => 'doctor',
                'status' => 'active',
                'email_verified_at' => now(),
                'phone' => '+254700000001',
            ],
            [
                'first_name' => 'Nurse',
                'last_name' => 'Mary',
                'email' => 'mary.nurse@hospital.com',
                'password' => Hash::make('password123'),
                'role' => 'nurse',
                'status' => 'active',
                'email_verified_at' => now(),
                'phone' => '+254700000002',
            ],
            [
                'first_name' => 'Hospital',
                'last_name' => 'Admin',
                'email' => 'admin@hospital.com',
                'password' => Hash::make('password123'),
                'role' => 'hospital_admin',
                'status' => 'active',
                'email_verified_at' => now(),
                'phone' => '+254700000003',
            ],
            [
                'first_name' => 'John',
                'last_name' => 'Dispatcher',
                'email' => 'dispatcher@hospital.com',
                'password' => Hash::make('password123'),
                'role' => 'dispatcher',
                'status' => 'active',
                'email_verified_at' => now(),
                'phone' => '+254700000004',
            ],
            [
                'first_name' => 'Test',
                'last_name' => 'Patient',
                'email' => 'patient@test.com',
                'password' => Hash::make('password123'),
                'role' => 'patient',
                'status' => 'active',
                'email_verified_at' => now(),
                'phone' => '+254700000005',
            ]
        ];

        foreach ($testUsers as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }

        $this->command->info('Test users created successfully!');
        $this->command->info('All test users have password: password123');
    }
}
