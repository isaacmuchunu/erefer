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
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->string('referral_number')->unique();
            $table->foreignId('patient_id')->constrained();
            $table->foreignId('referring_facility_id')->constrained('facilities');
            $table->foreignId('referring_doctor_id')->constrained('doctors');
            $table->foreignId('receiving_facility_id')->nullable()->constrained('facilities');
            $table->foreignId('receiving_doctor_id')->nullable()->constrained('doctors');
            $table->foreignId('specialty_id')->constrained();
            $table->enum('urgency', ['emergency', 'urgent', 'semi_urgent', 'routine'])->default('routine');
            $table->enum('type', ['consultation', 'treatment', 'admission', 'surgery', 'diagnostic']);
            $table->text('clinical_summary');
            $table->text('reason_for_referral');
            $table->json('vital_signs')->nullable();
            $table->json('investigations_done')->nullable();
            $table->json('current_medications')->nullable();
            $table->text('treatment_given')->nullable();
            $table->enum('transport_required', ['none', 'ambulance', 'air_ambulance', 'patient_transport'])->default('none');
            $table->boolean('bed_required')->default(false);
            $table->foreignId('bed_type_id')->nullable()->constrained();
            $table->enum('status', [
                'pending', 'accepted', 'rejected', 'in_transit', 'arrived',
                'completed', 'cancelled', 'expired'
            ])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('referred_at');
            $table->timestamp('response_deadline');
            $table->timestamp('responded_at')->nullable();
            $table->timestamp('patient_arrived_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->json('outcome')->nullable();
            $table->decimal('estimated_cost', 12, 2)->nullable();
            $table->text('special_requirements')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};