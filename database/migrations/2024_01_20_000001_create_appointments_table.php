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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('appointment_number')->unique();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('facility_id')->constrained()->onDelete('cascade');
            $table->foreignId('specialty_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('referral_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('appointment_type', ['consultation', 'follow_up', 'procedure', 'emergency', 'telemedicine']);
            $table->datetime('scheduled_at');
            $table->integer('duration_minutes')->default(30);
            $table->enum('status', ['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'])->default('scheduled');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->text('reason');
            $table->text('notes')->nullable();
            $table->text('preparation_instructions')->nullable();
            $table->string('location_details')->nullable();
            $table->boolean('is_telemedicine')->default(false);
            $table->string('meeting_link')->nullable();
            $table->string('meeting_id')->nullable();
            $table->string('meeting_password')->nullable();
            $table->datetime('confirmed_at')->nullable();
            $table->datetime('checked_in_at')->nullable();
            $table->datetime('started_at')->nullable();
            $table->datetime('completed_at')->nullable();
            $table->datetime('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('rescheduled_from')->nullable()->constrained('appointments')->onDelete('set null');
            $table->foreignId('rescheduled_to')->nullable()->constrained('appointments')->onDelete('set null');
            $table->boolean('follow_up_required')->default(false);
            $table->datetime('follow_up_date')->nullable();
            $table->datetime('reminder_sent_at')->nullable();
            $table->datetime('confirmation_sent_at')->nullable();
            $table->boolean('patient_arrived')->default(false);
            $table->text('doctor_notes')->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('treatment_plan')->nullable();
            $table->json('prescriptions')->nullable();
            $table->boolean('next_appointment_recommended')->default(false);
            $table->integer('patient_satisfaction_score')->nullable();
            $table->text('feedback')->nullable();
            $table->decimal('billing_amount', 10, 2)->nullable();
            $table->string('insurance_claim_id')->nullable();
            $table->enum('payment_status', ['pending', 'paid', 'partially_paid', 'refunded'])->default('pending');
            $table->decimal('ai_risk_score', 3, 2)->nullable();
            $table->json('ai_recommendations')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['patient_id', 'scheduled_at']);
            $table->index(['doctor_id', 'scheduled_at']);
            $table->index(['facility_id', 'scheduled_at']);
            $table->index(['status', 'scheduled_at']);
            $table->index(['appointment_type', 'scheduled_at']);
            $table->index(['is_telemedicine', 'scheduled_at']);
            $table->index('ai_risk_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
