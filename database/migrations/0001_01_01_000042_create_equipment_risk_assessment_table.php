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
        Schema::create('equipment_risk_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('severity_level')->comment('1-5, with 5 being most severe');
            $table->string('color_code')->nullable()->comment('For visual representation');
            $table->text('mitigation_guidelines')->nullable();
            $table->boolean('requires_immediate_action')->default(false);
            $table->boolean('requires_regular_assessment')->default(true);
            $table->integer('reassessment_frequency_days')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Ensure unique risk category names
            $table->unique('name');
        });

        Schema::create('equipment_hazard_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('hazard_class', [
                'mechanical', 'electrical', 'thermal', 'chemical', 'radiation', 
                'biological', 'ergonomic', 'psychological', 'other'
            ]);
            $table->text('potential_consequences')->nullable();
            $table->text('detection_methods')->nullable();
            $table->text('prevention_measures')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Ensure unique hazard type names
            $table->unique('name');
        });

        Schema::create('equipment_risk_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->foreignId('conducted_by')->constrained('users');
            $table->date('assessment_date');
            $table->date('next_assessment_due')->nullable();
            $table->enum('assessment_type', ['initial', 'periodic', 'post_incident', 'post_modification', 'pre_purchase']);
            $table->text('assessment_methodology')->nullable();
            $table->text('scope')->nullable();
            $table->text('operational_context')->nullable();
            $table->text('user_groups_affected')->nullable();
            $table->text('patient_impact_potential')->nullable();
            $table->integer('overall_risk_score')->nullable()->comment('Calculated risk score');
            $table->foreignId('risk_category_id')->nullable()->constrained('equipment_risk_categories');
            $table->text('assessment_summary')->nullable();
            $table->text('recommendations')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->dateTime('reviewed_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->dateTime('approved_at')->nullable();
            $table->enum('status', ['draft', 'in_review', 'approved', 'requires_action', 'closed']);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for risk assessment tracking
            $table->index('assessment_date');
            $table->index('next_assessment_due');
            $table->index(['equipment_id', 'status']);
        });

        Schema::create('equipment_identified_hazards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('risk_assessment_id')->constrained('equipment_risk_assessments');
            $table->foreignId('hazard_type_id')->constrained('equipment_hazard_types');
            $table->text('hazard_description');
            $table->text('potential_harm')->nullable();
            $table->integer('likelihood')->comment('1-5, with 5 being most likely');
            $table->integer('severity')->comment('1-5, with 5 being most severe');
            $table->integer('risk_score')->nullable()->comment('Calculated from likelihood and severity');
            $table->foreignId('risk_category_id')->nullable()->constrained('equipment_risk_categories');
            $table->text('existing_controls')->nullable();
            $table->text('additional_controls_required')->nullable();
            $table->text('residual_risk_assessment')->nullable();
            $table->integer('residual_likelihood')->nullable()->comment('1-5, after controls');
            $table->integer('residual_severity')->nullable()->comment('1-5, after controls');
            $table->integer('residual_risk_score')->nullable()->comment('Calculated from residual likelihood and severity');
            $table->boolean('is_acceptable_risk')->nullable();
            $table->text('justification')->nullable()->comment('If risk is deemed acceptable despite score');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for hazard tracking
            $table->index(['risk_assessment_id', 'risk_score']);
            $table->index('hazard_type_id');
        });

        Schema::create('equipment_risk_mitigations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('identified_hazard_id')->constrained('equipment_identified_hazards');
            $table->string('mitigation_title');
            $table->text('mitigation_description');
            $table->enum('mitigation_type', [
                'elimination', 'substitution', 'engineering_control', 
                'administrative_control', 'ppe', 'other'
            ]);
            $table->enum('priority', ['low', 'medium', 'high', 'critical']);
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->date('target_completion_date')->nullable();
            $table->date('actual_completion_date')->nullable();
            $table->decimal('estimated_cost', 10, 2)->nullable();
            $table->decimal('actual_cost', 10, 2)->nullable();
            $table->text('implementation_steps')->nullable();
            $table->text('verification_method')->nullable();
            $table->text('effectiveness_criteria')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->dateTime('verified_at')->nullable();
            $table->text('verification_results')->nullable();
            $table->boolean('is_effective')->nullable();
            $table->enum('status', ['planned', 'in_progress', 'completed', 'verified', 'ineffective']);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for mitigation tracking
            $table->index('target_completion_date');
            $table->index(['identified_hazard_id', 'status']);
        });

        Schema::create('equipment_safety_incidents', function (Blueprint $table) {
            $table->id();
            $table->string('incident_number');
            $table->foreignId('equipment_id')->constrained();
            $table->foreignId('reported_by')->constrained('users');
            $table->dateTime('incident_date');
            $table->dateTime('reported_at');
            $table->enum('incident_type', [
                'malfunction', 'user_error', 'near_miss', 'patient_injury', 
                'staff_injury', 'property_damage', 'other'
            ]);
            $table->enum('severity', ['negligible', 'minor', 'moderate', 'major', 'catastrophic']);
            $table->text('incident_description');
            $table->text('immediate_actions_taken')->nullable();
            $table->text('equipment_status_after_incident')->nullable();
            $table->boolean('patient_impact')->default(false);
            $table->text('patient_impact_details')->nullable();
            $table->boolean('reportable_to_authorities')->default(false);
            $table->dateTime('authority_report_date')->nullable();
            $table->string('authority_report_number')->nullable();
            $table->boolean('manufacturer_notified')->default(false);
            $table->dateTime('manufacturer_notified_date')->nullable();
            $table->string('manufacturer_reference_number')->nullable();
            $table->foreignId('investigated_by')->nullable()->constrained('users');
            $table->text('investigation_findings')->nullable();
            $table->text('root_causes')->nullable();
            $table->text('corrective_actions')->nullable();
            $table->text('preventive_actions')->nullable();
            $table->foreignId('related_risk_assessment_id')->nullable()->constrained('equipment_risk_assessments');
            $table->enum('status', ['reported', 'under_investigation', 'action_required', 'resolved', 'closed']);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for incident tracking
            $table->index('incident_number');
            $table->index('incident_date');
            $table->index(['equipment_id', 'status']);
        });

        Schema::create('equipment_safety_alerts', function (Blueprint $table) {
            $table->id();
            $table->string('alert_number');
            $table->enum('alert_source', ['internal', 'manufacturer', 'regulatory_authority', 'other']);
            $table->string('external_reference_number')->nullable();
            $table->string('title');
            $table->text('description');
            $table->enum('alert_type', [
                'recall', 'field_safety_notice', 'safety_alert', 
                'software_update', 'user_advisory', 'other'
            ]);
            $table->enum('priority', ['low', 'medium', 'high', 'critical', 'emergency']);
            $table->date('issue_date');
            $table->date('response_due_date')->nullable();
            $table->text('affected_models')->nullable();
            $table->text('affected_serial_numbers')->nullable();
            $table->text('potential_risks')->nullable();
            $table->text('recommended_actions')->nullable();
            $table->foreignId('received_by')->nullable()->constrained('users');
            $table->dateTime('received_at')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->text('internal_assessment')->nullable();
            $table->text('action_plan')->nullable();
            $table->date('action_completion_target')->nullable();
            $table->date('action_completion_actual')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->dateTime('verified_at')->nullable();
            $table->enum('status', ['received', 'under_review', 'action_planned', 'in_progress', 'completed', 'closed', 'not_applicable']);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for alert tracking
            $table->index('alert_number');
            $table->index('issue_date');
            $table->index(['priority', 'status']);
        });

        Schema::create('equipment_alert_equipment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('safety_alert_id')->constrained('equipment_safety_alerts');
            $table->foreignId('equipment_id')->constrained();
            $table->boolean('is_affected')->default(true);
            $table->text('verification_method')->nullable()->comment('How it was determined this equipment is affected');
            $table->text('specific_actions_required')->nullable();
            $table->foreignId('action_assigned_to')->nullable()->constrained('users');
            $table->date('action_due_date')->nullable();
            $table->date('action_completed_date')->nullable();
            $table->text('action_taken')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->dateTime('verified_at')->nullable();
            $table->enum('status', ['identified', 'action_required', 'in_progress', 'completed', 'verified']);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Ensure unique alert-equipment combinations
            $table->unique(['safety_alert_id', 'equipment_id']);
            
            // Indexes for alert-equipment tracking
            $table->index('action_due_date');
            $table->index(['equipment_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_alert_equipment');
        Schema::dropIfExists('equipment_safety_alerts');
        Schema::dropIfExists('equipment_safety_incidents');
        Schema::dropIfExists('equipment_risk_mitigations');
        Schema::dropIfExists('equipment_identified_hazards');
        Schema::dropIfExists('equipment_risk_assessments');
        Schema::dropIfExists('equipment_hazard_types');
        Schema::dropIfExists('equipment_risk_categories');
    }
};