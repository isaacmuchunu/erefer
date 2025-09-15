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
        Schema::create('equipment_compliance_requirements', function (Blueprint $table) {
            $table->id();
            $table->string('requirement_name');
            $table->text('description')->nullable();
            $table->enum('requirement_type', [
                'regulatory', 'safety', 'quality', 'environmental', 
                'infection_control', 'radiation_safety', 'electrical_safety', 'other'
            ]);
            $table->string('regulation_code')->nullable()->comment('Reference to specific regulation');
            $table->string('issuing_authority')->nullable()->comment('FDA, ISO, etc');
            $table->text('compliance_criteria')->nullable();
            $table->string('documentation_required')->nullable();
            $table->integer('recertification_frequency_days')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('equipment_compliance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->foreignId('compliance_requirement_id')->constrained('equipment_compliance_requirements');
            $table->date('certification_date');
            $table->date('expiration_date')->nullable();
            $table->string('certification_number')->nullable();
            $table->string('certificate_file_path')->nullable();
            $table->foreignId('certified_by')->nullable()->constrained('users');
            $table->string('certifying_authority')->nullable()->comment('External certifying body');
            $table->string('certifying_technician')->nullable();
            $table->enum('compliance_status', ['compliant', 'non_compliant', 'pending', 'exempt', 'expired']);
            $table->text('non_compliance_details')->nullable();
            $table->text('corrective_actions')->nullable();
            $table->date('correction_deadline')->nullable();
            $table->boolean('is_critical')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for compliance monitoring with custom short names
            $table->index('certification_date', 'ecr_cert_date_idx');
            $table->index('expiration_date', 'ecr_exp_date_idx');
            $table->index(['equipment_id', 'compliance_status'], 'ecr_equip_status_idx');
        });

        Schema::create('equipment_compliance_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->date('inspection_date');
            $table->enum('inspection_type', [
                'routine', 'follow_up', 'incident_related', 'regulatory', 'internal_audit', 'external_audit'
            ]);
            $table->string('inspector_name');
            $table->string('inspector_organization')->nullable();
            $table->string('inspection_reference_number')->nullable();
            $table->enum('inspection_result', ['pass', 'pass_with_recommendations', 'conditional_pass', 'fail']);
            $table->json('inspection_checklist')->nullable()->comment('Completed inspection checklist items');
            $table->text('findings')->nullable();
            $table->text('recommendations')->nullable();
            $table->text('required_actions')->nullable();
            $table->date('action_deadline')->nullable();
            $table->boolean('actions_completed')->default(false);
            $table->date('actions_completed_date')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->string('report_file_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for inspection tracking with custom short names
            $table->index('inspection_date', 'eci_insp_date_idx');
            $table->index(['equipment_id', 'inspection_result'], 'eci_equip_result_idx');
            $table->index('action_deadline', 'eci_action_deadline_idx');
        });

        Schema::create('equipment_incidents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->dateTime('incident_datetime');
            $table->enum('incident_type', [
                'malfunction', 'damage', 'injury', 'near_miss', 'unexpected_result', 
                'software_error', 'user_error', 'other'
            ]);
            $table->enum('severity', ['minor', 'moderate', 'major', 'critical', 'catastrophic']);
            $table->text('incident_description');
            $table->foreignId('reported_by')->constrained('users');
            $table->dateTime('reported_at');
            $table->foreignId('patient_id')->nullable()->constrained();
            $table->text('patient_impact')->nullable();
            $table->boolean('injury_occurred')->default(false);
            $table->text('injury_details')->nullable();
            $table->boolean('reportable_to_authorities')->default(false);
            $table->string('authority_report_number')->nullable();
            $table->date('authority_report_date')->nullable();
            $table->text('immediate_actions_taken')->nullable();
            $table->text('root_cause_analysis')->nullable();
            $table->text('corrective_actions')->nullable();
            $table->text('preventive_actions')->nullable();
            $table->foreignId('investigation_lead')->nullable()->constrained('users');
            $table->enum('investigation_status', ['pending', 'in_progress', 'completed', 'closed']);
            $table->date('investigation_completed_date')->nullable();
            $table->json('related_documents')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for incident management with custom short names
            $table->index('incident_datetime', 'ei_incident_dt_idx');
            $table->index(['equipment_id', 'severity'], 'ei_equip_severity_idx');
            $table->index('investigation_status', 'ei_invest_status_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_incidents');
        Schema::dropIfExists('equipment_compliance_inspections');
        Schema::dropIfExists('equipment_compliance_records');
        Schema::dropIfExists('equipment_compliance_requirements');
    }
};