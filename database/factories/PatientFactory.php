<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Patient;

class PatientFactory extends Factory
{
    protected $model = Patient::class;

    public function definition(): array
    {
        return [
            'medical_record_number' => Str::random(10),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'date_of_birth' => fake()->dateTimeBetween('-90 years', '-1 year')->format('Y-m-d'),
            'gender' => fake()->randomElement(['male', 'female', 'other']),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->unique()->safeEmail(),
            'address' => ['street' => fake()->streetAddress(), 'city' => fake()->city(), 'state' => fake()->state(), 'zip' => fake()->postcode()],
            'national_id' => Str::random(12),
            'insurance_info' => ['provider' => fake()->company(), 'policy_number' => Str::random(10)],
            'emergency_contacts' => [['name' => fake()->name(), 'relationship' => 'spouse', 'phone' => fake()->phoneNumber()]],
            'medical_history' => [['condition' => 'hypertension', 'diagnosed_at' => fake()->date()]],
            'allergies' => [fake()->word()],
            'current_medications' => [['name' => fake()->word(), 'dosage' => '10mg']],
            'blood_group' => fake()->randomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
            'special_notes' => fake()->sentence(),
            'consent_for_data_sharing' => fake()->boolean(),
        ];
    }
}