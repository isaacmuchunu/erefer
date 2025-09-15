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
        Schema::create('ambulance_crews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('role', ['driver', 'paramedic', 'emt', 'nurse']);
            $table->string('license_number');
            $table->date('license_expiry');
            $table->json('certifications');
            $table->json('skills')->nullable();
            $table->boolean('available')->default(true);
            $table->enum('shift_type', ['day', 'night', 'rotating'])->default('day');
            $table->json('availability_schedule');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ambulance_crews');
    }
};