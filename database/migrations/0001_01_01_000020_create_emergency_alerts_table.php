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
        Schema::create('emergency_alerts', function (Blueprint $table) {
            $table->id();
            $table->string('alert_code')->unique();
            $table->enum('type', ['mass_casualty', 'disaster', 'epidemic', 'facility_emergency', 'system_wide']);
            $table->enum('severity', ['low', 'medium', 'high', 'critical']);
            $table->string('title');
            $table->text('description');
            $table->json('affected_areas')->nullable(); // Geographic areas
            $table->json('affected_facilities')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamp('alert_start');
            $table->timestamp('alert_end')->nullable();
            $table->enum('status', ['active', 'resolved', 'cancelled'])->default('active');
            $table->json('response_actions')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emergency_alerts');
    }
};