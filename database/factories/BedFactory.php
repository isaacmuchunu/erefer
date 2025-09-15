<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Bed;
use App\Models\Facility;
use App\Models\Department;
use App\Models\BedType;

class BedFactory extends Factory
{
    protected $model = Bed::class;

    public function definition(): array
    {
        return [
            'facility_id' => Facility::factory(),
            'department_id' => Department::factory(),
            'bed_type_id' => BedType::factory(),
            'bed_number' => Str::random(5),
            'room_number' => fake()->numberBetween(100, 999),
            'status' => fake()->randomElement(['available', 'occupied', 'maintenance']),
            'equipment' => [fake()->word(), fake()->word()],
            'notes' => fake()->sentence(),
            'last_occupied_at' => fake()->optional()->dateTimeThisYear(),
            'available_from' => fake()->optional()->dateTimeBetween('now', '+1 month'),
        ];
    }
}