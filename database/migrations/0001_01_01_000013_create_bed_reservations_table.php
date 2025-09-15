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
        Schema::create('bed_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bed_id')->constrained()->onDelete('cascade');
            $table->foreignId('patient_id')->constrained();
            $table->foreignId('reserved_by')->constrained('users');
            $table->timestamp('reserved_at');
            $table->timestamp('reserved_until');
            $table->enum('status', ['active', 'expired', 'cancelled', 'occupied'])->default('active');
            $table->text('reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bed_reservations');
    }
};