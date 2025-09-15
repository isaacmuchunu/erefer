<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            PatientSeeder::class,
            ReferralSeeder::class,
            DoctorSeeder::class,
            FacilitySeeder::class,
            BedTypeSeeder::class,
            BedSeeder::class,
            EquipmentSeeder::class,
        ]);
    }
}
