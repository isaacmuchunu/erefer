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
        Schema::create('ambulance_dispatches', function (Blueprint $table) {
            $table->id();
            $table->string('dispatch_number')->unique();
            $table->foreignId('referral_id')->nullable()->constrained();
            $table->foreignId('ambulance_id')->constrained();
            $table->foreignId('dispatcher_id')->constrained('users');
            $table->json('crew_members'); // Array of ambulance_crew IDs
            $table->json('pickup_location');
            $table->json('destination_location');
            $table->timestamp('dispatched_at');
            $table->timestamp('eta_pickup')->nullable();
            $table->timestamp('eta_destination')->nullable();
            $table->timestamp('arrived_pickup_at')->nullable();
            $table->timestamp('left_pickup_at')->nullable();
            $table->timestamp('arrived_destination_at')->nullable();
            $table->enum('status', [
                'dispatched', 'en_route_pickup', 'at_pickup', 'en_route_destination',
                'arrived', 'completed', 'cancelled'
            ])->default('dispatched');
            $table->text('special_instructions')->nullable();
            $table->json('patient_condition_on_pickup')->nullable();
            $table->json('patient_condition_on_arrival')->nullable();
            $table->decimal('distance_km', 8, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ambulance_dispatches');
    }
};