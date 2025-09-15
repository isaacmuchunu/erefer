<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Department;
use App\Models\Facility;
use App\Models\User;

class DepartmentFactory extends Factory
{
    protected $model = Department::class;

    public function definition(): array
    {
        return [
            'facility_id' => Facility::factory(),
            'name' => fake()->word() . ' Department',
            'code' => Str::upper(Str::random(3)),
            'description' => fake()->paragraph(),
            'services_offered' => [fake()->word(), fake()->word()],
            'equipment_available' => [fake()->word(), fake()->word()],
            'head_of_department' => User::factory(),
            'status' => 'active',
        ];
    }
}