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
        Schema::create('patient_follow_ups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('appointment_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('referral_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('follow_up_type', ['medication_check', 'symptom_monitoring', 'recovery_check', 'test_results', 'general_wellness', 'post_procedure']);
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->enum('status', ['pending', 'completed', 'cancelled', 'overdue'])->default('pending');
            $table->datetime('scheduled_date');
            $table->datetime('completed_date')->nullable();
            $table->string('title');
            $table->text('description');
            $table->text('instructions')->nullable();
            $table->json('questions')->nullable();
            $table->json('patient_responses')->nullable();
            $table->text('doctor_notes')->nullable();
            $table->text('outcome')->nullable();
            $table->datetime('next_follow_up_date')->nullable();
            $table->enum('follow_up_method', ['phone', 'email', 'sms', 'whatsapp', 'app', 'in_person'])->default('app');
            $table->boolean('automated')->default(false);
            $table->boolean('ai_generated')->default(false);
            $table->decimal('ai_score', 3, 2)->nullable();
            $table->json('ai_recommendations')->nullable();
            $table->enum('reminder_frequency', ['hourly', 'daily', 'weekly'])->default('daily');
            $table->integer('reminder_count')->default(0);
            $table->datetime('last_reminder_sent')->nullable();
            $table->integer('patient_satisfaction')->nullable();
            $table->decimal('compliance_score', 5, 2)->nullable();
            $table->json('health_metrics')->nullable();
            $table->decimal('medication_adherence', 5, 2)->nullable();
            $table->json('symptoms_reported')->nullable();
            $table->json('red_flags')->nullable();
            $table->boolean('escalation_required')->default(false);
            $table->datetime('escalated_at')->nullable();
            $table->foreignId('escalated_to')->nullable()->constrained('users')->onDelete('set null');
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['patient_id', 'status']);
            $table->index(['doctor_id', 'scheduled_date']);
            $table->index(['follow_up_type', 'priority']);
            $table->index(['status', 'scheduled_date']);
            $table->index(['automated', 'ai_generated']);
            $table->index(['escalation_required', 'escalated_at']);
            $table->index('ai_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_follow_ups');
    }
};
