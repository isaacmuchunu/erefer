<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Bed;

class BedSeeder extends Seeder
{
    public function run(): void
    {
        Bed::factory(15)->create();
    }
}