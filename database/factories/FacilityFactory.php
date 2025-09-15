<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Facility;

class FacilityFactory extends Factory
{
    protected $model = Facility::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company() . ' Hospital',
            'code' => Str::random(6),
            'type' => fake()->randomElement(['hospital', 'clinic', 'health_center', 'specialist_center', 'emergency_center']),
            'ownership' => fake()->randomElement(['public', 'private']),
            'description' => fake()->paragraph(),
            'license_number' => Str::random(10),
            'license_expiry' => fake()->dateTimeBetween('now', '+5 years')->format('Y-m-d'),
            'verification_status' => 'verified',
            'contact_info' => ['phone' => fake()->phoneNumber(), 'email' => fake()->email()],
            'address' => ['street' => fake()->streetAddress(), 'city' => fake()->city(), 'state' => fake()->state(), 'zip' => fake()->postcode(), 'coordinates' => ['lat' => fake()->latitude(), 'lng' => fake()->longitude()]],
            'total_beds' => fake()->numberBetween(50, 500),
            'available_beds' => fake()->numberBetween(10, 100),
            'operating_hours' => ['monday_friday' => '08:00-20:00', 'saturday' => '09:00-17:00'],
            'emergency_services' => fake()->boolean(),
            'ambulance_services' => fake()->boolean(),
            'accreditations' => [fake()->word()],
            'rating' => fake()->randomFloat(1, 3, 5),
            'rating_count' => fake()->numberBetween(0, 1000),
            'status' => 'active',
        ];
    }
}