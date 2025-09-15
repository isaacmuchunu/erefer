<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\BedType;

class BedTypeFactory extends Factory
{
    protected $model = BedType::class;

    public function definition(): array
    {
        return [
            'name' => fake()->word() . ' Bed',
            'code' => Str::upper(Str::random(3)),
            'description' => fake()->sentence(),
            'equipment_included' => [fake()->word(), fake()->word()],
            'daily_rate' => fake()->randomFloat(2, 100, 1000),
        ];
    }
}