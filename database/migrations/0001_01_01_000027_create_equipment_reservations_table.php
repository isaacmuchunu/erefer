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
        Schema::create('equipment_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained()->onDelete('cascade');
            $table->foreignId('reserved_by')->constrained('users');
            $table->foreignId('patient_id')->nullable()->constrained();
            $table->foreignId('doctor_id')->nullable()->constrained('doctors');
            $table->dateTime('reserved_from');
            $table->dateTime('reserved_until');
            $table->enum('status', ['pending', 'approved', 'in_use', 'completed', 'cancelled'])->default('pending');
            $table->text('purpose')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->dateTime('approved_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Add a unique constraint to prevent double booking
            $table->unique(['equipment_id', 'reserved_from', 'reserved_until', 'status'], 'equipment_reservation_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_reservations');
    }
};