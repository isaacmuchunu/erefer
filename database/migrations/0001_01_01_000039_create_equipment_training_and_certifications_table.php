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
        Schema::create('equipment_training_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_category_id')->nullable()->constrained('equipment_categories');
            $table->string('training_name');
            $table->text('description')->nullable();
            $table->enum('training_level', ['basic', 'intermediate', 'advanced', 'expert'])->default('basic');
            $table->integer('duration_hours')->nullable();
            $table->text('learning_objectives')->nullable();
            $table->text('prerequisites')->nullable();
            $table->boolean('certification_required')->default(false);
            $table->integer('recertification_months')->nullable()->comment('How often recertification is needed');
            $table->text('training_materials')->nullable()->comment('URLs or file paths to training materials');
            $table->string('assessment_method')->nullable()->comment('How competency is assessed');
            $table->decimal('passing_score', 5, 2)->nullable();
            $table->boolean('is_mandatory')->default(true);
            $table->text('regulatory_references')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('equipment_specific_training', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->foreignId('training_requirement_id')->constrained('equipment_training_requirements');
            $table->text('equipment_specific_details')->nullable();
            $table->string('training_provider')->nullable();
            $table->string('trainer_contact')->nullable();
            $table->decimal('training_cost', 10, 2)->nullable();
            $table->string('training_location')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Ensure unique equipment-training combinations with custom name
            $table->unique(['equipment_id', 'training_requirement_id'], 'est_equip_train_unique');
        });

        Schema::create('equipment_user_certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('equipment_id')->nullable()->constrained();
            $table->foreignId('equipment_category_id')->nullable()->constrained('equipment_categories');
            $table->foreignId('training_requirement_id')->constrained('equipment_training_requirements');
            $table->date('certification_date');
            $table->date('expiration_date')->nullable();
            $table->string('certification_level')->nullable();
            $table->decimal('score', 5, 2)->nullable();
            $table->enum('status', ['active', 'expired', 'revoked', 'suspended'])->default('active');
            $table->string('certificate_number')->nullable();
            $table->string('certificate_file_path')->nullable();
            $table->foreignId('certified_by')->nullable()->constrained('users');
            $table->string('training_provider')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for certification management with custom names
            $table->index('certification_date', 'euc_cert_date_idx');
            $table->index('expiration_date', 'euc_exp_date_idx');
            $table->index(['user_id', 'status'], 'euc_user_status_idx');
        });

        Schema::create('equipment_training_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->nullable()->constrained();
            $table->foreignId('equipment_category_id')->nullable()->constrained('equipment_categories');
            $table->foreignId('training_requirement_id')->constrained('equipment_training_requirements');
            $table->string('session_name');
            $table->dateTime('session_start');
            $table->dateTime('session_end');
            $table->string('location');
            $table->foreignId('trainer_id')->nullable()->constrained('users');
            $table->string('external_trainer_name')->nullable();
            $table->string('external_trainer_organization')->nullable();
            $table->integer('max_participants')->nullable();
            $table->enum('session_type', ['classroom', 'hands_on', 'online', 'hybrid', 'self_paced'])->default('classroom');
            $table->text('session_description')->nullable();
            $table->text('materials_needed')->nullable();
            $table->decimal('session_cost', 10, 2)->nullable();
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled'])->default('scheduled');
            $table->text('cancellation_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for session management with custom names
            $table->index('session_start', 'ets_session_start_idx');
            $table->index(['equipment_id', 'status'], 'ets_equip_status_idx');
        });

        Schema::create('equipment_training_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_session_id')->constrained('equipment_training_sessions');
            $table->foreignId('user_id')->constrained();
            $table->boolean('registered')->default(true);
            $table->boolean('attended')->default(false);
            $table->dateTime('check_in_time')->nullable();
            $table->dateTime('check_out_time')->nullable();
            $table->decimal('completion_percentage', 5, 2)->default(0);
            $table->boolean('passed')->nullable();
            $table->decimal('score', 5, 2)->nullable();
            $table->text('feedback')->nullable();
            $table->text('trainer_notes')->nullable();
            $table->boolean('certificate_issued')->default(false);
            $table->foreignId('certification_id')->nullable()->constrained('equipment_user_certifications');
            $table->timestamps();
            
            // Ensure unique session-user combinations with custom name
            $table->unique(['training_session_id', 'user_id'], 'eta_session_user_unique');
        });

        Schema::create('equipment_competency_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('equipment_id')->nullable()->constrained();
            $table->foreignId('equipment_category_id')->nullable()->constrained('equipment_categories');
            $table->date('assessment_date');
            $table->foreignId('assessor_id')->constrained('users');
            $table->enum('assessment_type', ['initial', 'periodic', 'post_incident', 'recertification']);
            $table->json('competency_criteria')->nullable();
            $table->json('assessment_results')->nullable();
            $table->decimal('overall_score', 5, 2)->nullable();
            $table->enum('competency_level', ['novice', 'competent', 'proficient', 'expert'])->nullable();
            $table->boolean('passed')->nullable();
            $table->text('strengths')->nullable();
            $table->text('areas_for_improvement')->nullable();
            $table->text('action_plan')->nullable();
            $table->date('reassessment_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for assessment tracking with custom names
            $table->index('assessment_date', 'eca_assess_date_idx');
            $table->index(['user_id', 'equipment_id'], 'eca_user_equip_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_competency_assessments');
        Schema::dropIfExists('equipment_training_attendances');
        Schema::dropIfExists('equipment_training_sessions');
        Schema::dropIfExists('equipment_user_certifications');
        Schema::dropIfExists('equipment_specific_training');
        Schema::dropIfExists('equipment_training_requirements');
    }
};