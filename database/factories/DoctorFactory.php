<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Doctor;
use App\Models\User;
use App\Models\Facility;

class DoctorFactory extends Factory
{
    protected $model = Doctor::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'facility_id' => Facility::factory(),
            'medical_license_number' => Str::random(10),
            'license_expiry' => fake()->dateTimeBetween('now', '+5 years')->format('Y-m-d'),
            'qualifications' => [fake()->word()],
            'years_of_experience' => fake()->numberBetween(1, 30),
            'languages_spoken' => [fake()->languageCode(), fake()->languageCode()],
            'bio' => fake()->paragraph(),
            'consultation_fee' => fake()->randomFloat(2, 50, 500),
            'availability_schedule' => ['monday' => ['start' => '09:00', 'end' => '17:00']],
            'accepts_referrals' => fake()->boolean(),
            'max_daily_referrals' => fake()->numberBetween(5, 20),
            'rating' => fake()->randomFloat(1, 3, 5),
            'rating_count' => fake()->numberBetween(0, 100),
            'status' => 'active',
        ];
    }
}