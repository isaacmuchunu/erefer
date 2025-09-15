<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BedType;

class BedTypeSeeder extends Seeder
{
    public function run(): void
    {
        BedType::factory(15)->create();
    }
}