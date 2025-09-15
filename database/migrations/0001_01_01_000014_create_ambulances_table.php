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
        Schema::create('ambulances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facility_id')->constrained();
            $table->string('vehicle_number')->unique();
            $table->string('license_plate')->unique();
            $table->enum('type', ['basic_life_support', 'advanced_life_support', 'critical_care', 'air_ambulance']);
            $table->string('make_model');
            $table->year('year_of_manufacture');
            $table->json('equipment_inventory');
            $table->integer('capacity'); // Number of patients
            $table->json('gps_device_info')->nullable();
            $table->date('insurance_expiry');
            $table->date('license_expiry');
            $table->date('last_maintenance');
            $table->date('next_maintenance_due');
            $table->enum('status', ['available', 'dispatched', 'maintenance', 'out_of_service'])->default('available');
            $table->decimal('fuel_level', 5, 2)->nullable(); // Percentage
            $table->json('current_location')->nullable(); // GPS coordinates
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ambulances');
    }
};