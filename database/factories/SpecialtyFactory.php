<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Specialty;

class SpecialtyFactory extends Factory
{
    protected $model = Specialty::class;

    public function definition(): array
    {
        return [
            'name' => fake()->word() . ' Specialty',
            'code' => Str::upper(Str::random(3)),
            'description' => fake()->paragraph(),
            'category' => fake()->randomElement(['medical', 'surgical', 'diagnostic', 'therapeutic', 'other']),
            'requires_referral' => fake()->boolean(),
        ];
    }
}