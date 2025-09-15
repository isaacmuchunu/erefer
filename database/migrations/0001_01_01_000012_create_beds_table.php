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
        Schema::create('beds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facility_id')->constrained()->onDelete('cascade');
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->foreignId('bed_type_id')->constrained();
            $table->string('bed_number');
            $table->string('room_number')->nullable();
            $table->enum('status', ['available', 'occupied', 'maintenance', 'reserved', 'cleaning'])->default('available');
            $table->json('equipment')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('last_occupied_at')->nullable();
            $table->timestamp('available_from')->nullable();
            $table->timestamps();
            
            $table->unique(['facility_id', 'bed_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beds');
    }
};