<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Update the role column to have a default value
            $table->enum('role', [
                'super_admin',
                'hospital_admin',
                'doctor',
                'nurse',
                'dispatcher',
                'ambulance_driver',
                'ambulance_paramedic',
                'patient'
            ])->default('patient')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Remove the default value from role column
            $table->enum('role', [
                'super_admin',
                'hospital_admin',
                'doctor',
                'nurse',
                'dispatcher',
                'ambulance_driver',
                'ambulance_paramedic',
                'patient'
            ])->change();
        });
    }
};
