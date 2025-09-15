<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Delete existing super admin if exists
        User::where('email', 'isaacmuchunu@gmail.com')->delete();
        
        // Create the super admin user
        $superAdmin = User::create([
            'first_name' => 'Isaac',
            'last_name' => 'Muchunu',
            'email' => 'isaacmuchunu@gmail.com',
            'email_verified_at' => now(),
            'password' => Hash::make('Kukus@1993'),
            'role' => 'super_admin',
            'phone' => '0743610160',
            'status' => 'active',
        ]);

        $this->command->info('Super Admin created successfully:');
        $this->command->info('Email: ' . $superAdmin->email);
        $this->command->info('Role: ' . $superAdmin->role);
        $this->command->info('Name: ' . $superAdmin->first_name . ' ' . $superAdmin->last_name);
    }
}