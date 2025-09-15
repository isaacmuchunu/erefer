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
        if (!Schema::hasTable('equipment_workflow_templates')) {
            Schema::create('equipment_workflow_templates', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->enum('workflow_type', [
                    'maintenance', 'calibration', 'inspection', 'procurement',
                    'disposal', 'transfer', 'reservation', 'onboarding', 'other'
                ]);
                $table->json('applicable_equipment_types')->nullable();
                $table->foreignId('created_by')->constrained('users');
                $table->boolean('is_active')->default(true);
                $table->boolean('is_default')->default(false);
                $table->integer('version')->default(1);
                $table->timestamps();
                
                // Indexes
                $table->index(['workflow_type', 'is_active'], 'eq_wf_templ_type_active_idx');
                $table->index('is_default');
            });
        }
        
        if (!Schema::hasTable('equipment_workflow_stages')) {
            Schema::create('equipment_workflow_stages', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workflow_template_id');
                $table->string('name');
                $table->text('description')->nullable();
                $table->integer('sequence')->comment('Order of stages in workflow');
                $table->integer('estimated_duration_hours')->nullable();
                $table->boolean('requires_approval')->default(false);
                $table->json('approval_roles')->nullable()->comment('User roles that can approve this stage');
                $table->boolean('is_mandatory')->default(true);
                $table->json('form_definition')->nullable()->comment('Form fields for this stage');
                $table->json('required_documents')->nullable()->comment('Documents required for this stage');
                $table->json('required_checklists')->nullable()->comment('Checklists required for this stage');
                $table->json('automation_rules')->nullable()->comment('Rules for automatic actions');
                $table->json('notification_settings')->nullable()->comment('Who to notify and when');
                $table->timestamps();
                
                // Foreign key with custom name
                $table->foreign('workflow_template_id', 'eq_wf_stage_template_fk')
                    ->references('id')->on('equipment_workflow_templates');
                
                // Indexes
                $table->index(['workflow_template_id', 'sequence'], 'eq_wf_stage_templ_seq_idx');
                $table->index('requires_approval');
            });
        }
        
        if (!Schema::hasTable('equipment_workflow_transitions')) {
            Schema::create('equipment_workflow_transitions', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workflow_template_id');
                $table->unsignedBigInteger('from_stage_id');
                $table->unsignedBigInteger('to_stage_id');
                $table->string('name')->nullable();
                $table->text('description')->nullable();
                $table->json('transition_conditions')->nullable()->comment('Conditions required for transition');
                $table->json('required_approvals')->nullable()->comment('Approvals needed for transition');
                $table->json('actions')->nullable()->comment('Actions to perform during transition');
                $table->boolean('is_automatic')->default(false)->comment('Whether transition happens automatically');
                $table->timestamps();
                
                // Foreign keys with custom names
                $table->foreign('workflow_template_id', 'eq_wf_trans_templ_fk')
                    ->references('id')->on('equipment_workflow_templates');
                $table->foreign('from_stage_id', 'eq_wf_trans_from_fk')
                    ->references('id')->on('equipment_workflow_stages');
                $table->foreign('to_stage_id', 'eq_wf_trans_to_fk')
                    ->references('id')->on('equipment_workflow_stages');
                
                // Ensure unique transitions
                $table->unique(['workflow_template_id', 'from_stage_id', 'to_stage_id'], 'eq_wf_trans_unique');
                
                // Indexes
                $table->index(['from_stage_id', 'to_stage_id'], 'eq_wf_trans_from_to_idx');
                $table->index('is_automatic');
            });
        }
        
        if (!Schema::hasTable('equipment_workflow_instances')) {
            Schema::create('equipment_workflow_instances', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workflow_template_id');
                $table->unsignedBigInteger('equipment_id');
                $table->unsignedBigInteger('current_stage_id')->nullable();
                $table->unsignedBigInteger('initiated_by');
                $table->unsignedBigInteger('facility_id')->nullable();
                $table->unsignedBigInteger('department_id')->nullable();
                $table->string('reference_number')->unique();
                $table->enum('status', [
                    'draft', 'in_progress', 'on_hold', 'completed', 'cancelled', 'failed'
                ])->default('draft');
                $table->text('status_reason')->nullable();
                $table->dateTime('started_at')->nullable();
                $table->dateTime('completed_at')->nullable();
                $table->dateTime('due_date')->nullable();
                $table->integer('priority')->default(3)->comment('1-5, with 1 being highest');
                $table->json('metadata')->nullable()->comment('Additional workflow data');
                $table->timestamps();
                
                // Foreign keys with custom names
                $table->foreign('workflow_template_id', 'eq_wf_inst_template_fk')
                    ->references('id')->on('equipment_workflow_templates');
                $table->foreign('equipment_id', 'eq_wf_inst_equipment_fk')
                    ->references('id')->on('equipment');
                $table->foreign('current_stage_id', 'eq_wf_inst_stage_fk')
                    ->references('id')->on('equipment_workflow_stages');
                $table->foreign('initiated_by', 'eq_wf_inst_user_fk')
                    ->references('id')->on('users');
                $table->foreign('facility_id', 'eq_wf_inst_facility_fk')
                    ->references('id')->on('facilities');
                $table->foreign('department_id', 'eq_wf_inst_dept_fk')
                    ->references('id')->on('departments');
                
                // Indexes
                $table->index(['equipment_id', 'status'], 'eq_wf_inst_equip_status_idx');
                $table->index(['facility_id', 'department_id'], 'eq_wf_inst_fac_dept_idx');
                $table->index(['status', 'priority'], 'eq_wf_inst_status_prio_idx');
                $table->index('reference_number');
            });
        }
        
        if (!Schema::hasTable('equipment_workflow_stage_instances')) {
            Schema::create('equipment_workflow_stage_instances', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workflow_instance_id');
                $table->unsignedBigInteger('workflow_stage_id');
                $table->enum('status', [
                    'pending', 'in_progress', 'waiting_approval', 'approved', 
                    'rejected', 'skipped', 'completed', 'failed'
                ])->default('pending');
                $table->unsignedBigInteger('assigned_to')->nullable();
                $table->unsignedBigInteger('completed_by')->nullable();
                $table->dateTime('started_at')->nullable();
                $table->dateTime('completed_at')->nullable();
                $table->dateTime('due_date')->nullable();
                $table->json('form_data')->nullable()->comment('Data collected in this stage');
                $table->text('notes')->nullable();
                $table->json('documents')->nullable()->comment('Documents uploaded in this stage');
                $table->json('checklist_results')->nullable()->comment('Results of checklists');
                $table->timestamps();
                
                // Foreign keys with custom names
                $table->foreign('workflow_instance_id', 'eq_wf_stage_inst_wf_fk')
                    ->references('id')->on('equipment_workflow_instances');
                $table->foreign('workflow_stage_id', 'eq_wf_stage_inst_stage_fk')
                    ->references('id')->on('equipment_workflow_stages');
                $table->foreign('assigned_to', 'eq_wf_stage_inst_assigned_fk')
                    ->references('id')->on('users');
                $table->foreign('completed_by', 'eq_wf_stage_inst_completed_fk')
                    ->references('id')->on('users');
                
                // Indexes
                $table->index(['workflow_instance_id', 'workflow_stage_id'], 'eq_wf_stage_inst_idx');
                $table->index(['status', 'due_date'], 'eq_wf_stage_inst_status_due_idx');
                $table->index('assigned_to');
            });
        }
        
        if (!Schema::hasTable('equipment_workflow_approvals')) {
            Schema::create('equipment_workflow_approvals', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workflow_stage_instance_id');
                $table->unsignedBigInteger('approver_id');
                $table->enum('decision', ['pending', 'approved', 'rejected', 'delegated']);
                $table->text('comments')->nullable();
                $table->dateTime('decision_at')->nullable();
                $table->unsignedBigInteger('delegated_to')->nullable();
                $table->json('supporting_documents')->nullable();
                $table->timestamps();
                
                // Foreign keys with custom names
                $table->foreign('workflow_stage_instance_id', 'eq_wf_appr_stage_inst_fk')
                    ->references('id')->on('equipment_workflow_stage_instances');
                $table->foreign('approver_id', 'eq_wf_appr_user_fk')
                    ->references('id')->on('users');
                $table->foreign('delegated_to', 'eq_wf_appr_delegated_fk')
                    ->references('id')->on('users');
                
                // Indexes
                $table->index(['workflow_stage_instance_id', 'decision'], 'eq_wf_appr_stage_decision_idx');
                $table->index('approver_id');
            });
        }
        
        if (!Schema::hasTable('equipment_workflow_comments')) {
            Schema::create('equipment_workflow_comments', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workflow_instance_id');
                $table->unsignedBigInteger('workflow_stage_instance_id')->nullable();
                $table->unsignedBigInteger('user_id');
                $table->text('comment');
                $table->json('attachments')->nullable();
                $table->boolean('is_internal')->default(false)->comment('Only visible to staff');
                $table->timestamps();
                
                // Foreign keys with custom names
                $table->foreign('workflow_instance_id', 'eq_wf_comm_inst_fk')
                    ->references('id')->on('equipment_workflow_instances');
                $table->foreign('workflow_stage_instance_id', 'eq_wf_comm_stage_inst_fk')
                    ->references('id')->on('equipment_workflow_stage_instances');
                $table->foreign('user_id', 'eq_wf_comm_user_fk')
                    ->references('id')->on('users');
                
                // Indexes
                $table->index(['workflow_instance_id', 'created_at'], 'eq_wf_comm_inst_time_idx');
                $table->index('workflow_stage_instance_id');
            });
        }
        
        if (!Schema::hasTable('equipment_workflow_history')) {
            Schema::create('equipment_workflow_history', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workflow_instance_id');
                $table->unsignedBigInteger('workflow_stage_instance_id')->nullable();
                $table->enum('event_type', [
                    'created', 'stage_started', 'stage_completed', 'approval_requested',
                    'approved', 'rejected', 'on_hold', 'resumed', 'cancelled', 'completed',
                    'reassigned', 'comment_added', 'document_added', 'reminder_sent', 'other'
                ]);
                $table->text('description');
                $table->unsignedBigInteger('user_id')->nullable();
                $table->json('event_data')->nullable()->comment('Additional event details');
                $table->dateTime('event_timestamp');
                $table->timestamps();
                
                // Foreign keys with custom names
                $table->foreign('workflow_instance_id', 'eq_wf_hist_inst_fk')
                    ->references('id')->on('equipment_workflow_instances');
                $table->foreign('workflow_stage_instance_id', 'eq_wf_hist_stage_inst_fk')
                    ->references('id')->on('equipment_workflow_stage_instances');
                $table->foreign('user_id', 'eq_wf_hist_user_fk')
                    ->references('id')->on('users');
                
                // Indexes
                $table->index(['workflow_instance_id', 'event_timestamp'], 'eq_wf_hist_inst_time_idx');
                $table->index(['workflow_stage_instance_id', 'event_type'], 'eq_wf_hist_stage_event_idx');
            });
        }
        
        if (!Schema::hasTable('equipment_workflow_reminders')) {
            Schema::create('equipment_workflow_reminders', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('workflow_instance_id');
                $table->unsignedBigInteger('workflow_stage_instance_id')->nullable();
                $table->string('reminder_type');
                $table->text('message');
                $table->unsignedBigInteger('user_id')->nullable();
                $table->json('user_roles')->nullable()->comment('Roles to remind');
                $table->dateTime('scheduled_at');
                $table->dateTime('sent_at')->nullable();
                $table->boolean('is_sent')->default(false);
                $table->boolean('is_read')->default(false);
                $table->dateTime('read_at')->nullable();
                $table->enum('delivery_channel', ['email', 'sms', 'push', 'in_app', 'multiple']);
                $table->json('delivery_status')->nullable();
                $table->timestamps();
                
                // Foreign keys with custom names
                $table->foreign('workflow_instance_id', 'eq_wf_remind_inst_fk')
                    ->references('id')->on('equipment_workflow_instances');
                $table->foreign('workflow_stage_instance_id', 'eq_wf_remind_stage_inst_fk')
                    ->references('id')->on('equipment_workflow_stage_instances');
                $table->foreign('user_id', 'eq_wf_remind_user_fk')
                    ->references('id')->on('users');
                
                // Indexes
                $table->index(['scheduled_at', 'is_sent'], 'eq_wf_remind_sched_sent_idx');
                $table->index(['user_id', 'is_read'], 'eq_wf_remind_user_read_idx');
                $table->index('workflow_instance_id', 'eq_wf_remind_inst_id_idx');
            });
        }
        
        if (!Schema::hasTable('equipment_workflow_checklists')) {
            Schema::create('equipment_workflow_checklists', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->enum('checklist_type', [
                    'maintenance', 'safety', 'quality', 'compliance', 
                    'operational', 'inspection', 'other'
                ]);
                $table->json('applicable_equipment_types')->nullable();
                $table->unsignedBigInteger('created_by');
                $table->boolean('is_active')->default(true);
                $table->integer('version')->default(1);
                $table->timestamps();
                
                $table->foreign('created_by', 'eq_wf_chk_created_by_fk')
                    ->references('id')->on('users');
                
                // Indexes
                $table->index(['checklist_type', 'is_active'], 'eq_wf_chk_type_active_idx');
            });
        }
        
        if (!Schema::hasTable('equipment_workflow_checklist_items')) {
            Schema::create('equipment_workflow_checklist_items', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('checklist_id');
                $table->string('item_text');
                $table->text('instructions')->nullable();
                $table->integer('sequence');
                $table->enum('item_type', [
                    'yes_no', 'multiple_choice', 'text', 'number', 
                    'measurement', 'signature', 'photo', 'other'
                ])->default('yes_no');
                $table->json('options')->nullable()->comment('Options for multiple choice');
                $table->json('validation_rules')->nullable();
                $table->boolean('is_critical')->default(false)->comment('Failure requires immediate attention');
                $table->boolean('is_mandatory')->default(true);
                $table->json('conditional_display')->nullable()->comment('When to show this item');
                $table->timestamps();
                
                $table->foreign('checklist_id', 'eq_wf_chk_item_list_fk')
                    ->references('id')->on('equipment_workflow_checklists');
                
                // Indexes
                $table->index(['checklist_id', 'sequence'], 'eq_wf_chk_item_chk_seq_idx');
                $table->index(['is_critical', 'is_mandatory'], 'eq_wf_chk_item_crit_mand_idx');
            });
        }
        
        if (!Schema::hasTable('equipment_workflow_checklist_executions')) {
            Schema::create('equipment_workflow_checklist_executions', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('checklist_id');
                $table->unsignedBigInteger('workflow_stage_instance_id')->nullable();
                $table->unsignedBigInteger('equipment_id');
                $table->unsignedBigInteger('performed_by');
                $table->dateTime('started_at');
                $table->dateTime('completed_at')->nullable();
                $table->enum('status', ['in_progress', 'completed', 'failed', 'cancelled']);
                $table->text('notes')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();
                
                // Foreign keys with custom names
                $table->foreign('checklist_id', 'eq_wf_chk_exec_list_fk')
                    ->references('id')->on('equipment_workflow_checklists');
                $table->foreign('workflow_stage_instance_id', 'eq_wf_chk_exec_stage_fk')
                    ->references('id')->on('equipment_workflow_stage_instances');
                $table->foreign('equipment_id', 'eq_wf_chk_exec_equip_fk')
                    ->references('id')->on('equipment');
                $table->foreign('performed_by', 'eq_wf_chk_exec_user_fk')
                    ->references('id')->on('users');
                
                // Indexes
                $table->index(['equipment_id', 'status'], 'eq_wf_chk_exec_equip_status_idx');
                $table->index('workflow_stage_instance_id', 'eq_wf_chk_exec_stage_idx');
                $table->index(['started_at', 'completed_at'], 'eq_wf_chk_exec_start_comp_idx');
            });
        }
        
        if (!Schema::hasTable('equipment_workflow_checklist_item_results')) {
            Schema::create('equipment_workflow_checklist_item_results', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('checklist_execution_id');
                $table->unsignedBigInteger('checklist_item_id');
                $table->json('response')->comment('The answer/result for this item');
                $table->boolean('is_pass')->nullable()->comment('Whether this item passed');
                $table->text('notes')->nullable();
                $table->json('attachments')->nullable()->comment('Photos, signatures, etc.');
                $table->timestamps();
                
                // Foreign keys with custom names
                $table->foreign('checklist_execution_id', 'eq_wf_chk_res_exec_fk')
                    ->references('id')->on('equipment_workflow_checklist_executions');
                $table->foreign('checklist_item_id', 'eq_wf_chk_res_item_fk')
                    ->references('id')->on('equipment_workflow_checklist_items');
                
                // Ensure unique items per execution
                $table->unique(['checklist_execution_id', 'checklist_item_id'], 'eq_wf_chk_res_unique');
                
                // Indexes
                $table->index('is_pass');
            });
        }
        
        if (!Schema::hasTable('equipment_workflow_forms')) {
            Schema::create('equipment_workflow_forms', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->enum('form_type', [
                    'maintenance', 'inspection', 'calibration', 'incident', 
                    'request', 'approval', 'survey', 'other'
                ]);
                $table->json('form_schema')->comment('JSON schema defining the form fields');
                $table->json('validation_rules')->nullable();
                $table->json('ui_schema')->nullable()->comment('UI rendering instructions');
                $table->unsignedBigInteger('created_by');
                $table->boolean('is_active')->default(true);
                $table->integer('version')->default(1);
                $table->timestamps();
                
                $table->foreign('created_by', 'eq_wf_form_created_by_fk')
                    ->references('id')->on('users');
                
                // Indexes
                $table->index(['form_type', 'is_active'], 'eq_wf_form_type_active_idx');
                $table->index('version');
            });
        }
        
        if (!Schema::hasTable('equipment_workflow_form_submissions')) {
            Schema::create('equipment_workflow_form_submissions', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('form_id');
                $table->unsignedBigInteger('workflow_stage_instance_id')->nullable();
                $table->unsignedBigInteger('equipment_id')->nullable();
                $table->unsignedBigInteger('submitted_by');
                $table->json('form_data')->comment('The submitted form data');
                $table->json('validation_results')->nullable();
                $table->boolean('is_valid')->default(true);
                $table->dateTime('submitted_at');
                $table->json('attachments')->nullable();
                $table->timestamps();
                
                // Foreign keys with custom names
                $table->foreign('form_id', 'eq_wf_form_sub_form_fk')
                    ->references('id')->on('equipment_workflow_forms');
                $table->foreign('workflow_stage_instance_id', 'eq_wf_form_sub_stage_fk')
                    ->references('id')->on('equipment_workflow_stage_instances');
                $table->foreign('equipment_id', 'eq_wf_form_sub_equip_fk')
                    ->references('id')->on('equipment');
                $table->foreign('submitted_by', 'eq_wf_form_sub_user_fk')
                    ->references('id')->on('users');
                
                // Indexes
                $table->index(['form_id', 'submitted_at'], 'eq_wf_form_sub_form_time_idx');
                $table->index('workflow_stage_instance_id', 'eq_wf_form_sub_stage_idx');
                $table->index(['equipment_id', 'is_valid'], 'eq_wf_form_sub_equip_valid_idx');
            });
        }
        
        if (!Schema::hasTable('equipment_workflow_slas')) {
            Schema::create('equipment_workflow_slas', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->enum('workflow_type', [
                    'maintenance', 'calibration', 'inspection', 'procurement',
                    'disposal', 'transfer', 'reservation', 'onboarding', 'other'
                ]);
                $table->json('equipment_types')->nullable()->comment('Equipment types this SLA applies to');
                $table->json('priority_levels')->comment('Response times for different priorities');
                $table->json('stage_deadlines')->nullable()->comment('Deadlines for specific stages');
                $table->json('escalation_rules')->nullable()->comment('When and to whom to escalate');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Indexes
                $table->index(['workflow_type', 'is_active'], 'eq_wf_sla_type_active_idx');
            });
        }
        
        if (!Schema::hasTable('equipment_workflow_sla_violations')) {
            Schema::create('equipment_workflow_sla_violations', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('sla_id');
                $table->unsignedBigInteger('workflow_instance_id');
                $table->unsignedBigInteger('workflow_stage_instance_id')->nullable();
                $table->enum('violation_type', ['response_time', 'resolution_time', 'stage_deadline', 'other']);
                $table->text('description');
                $table->dateTime('detected_at');
                $table->integer('minutes_exceeded');
                $table->boolean('is_resolved')->default(false);
                $table->dateTime('resolved_at')->nullable();
                $table->text('resolution_notes')->nullable();
                $table->unsignedBigInteger('assigned_to')->nullable();
                $table->timestamps();
                
                // Foreign keys with custom names
                $table->foreign('sla_id', 'eq_wf_sla_viol_sla_fk')
                    ->references('id')->on('equipment_workflow_slas');
                $table->foreign('workflow_instance_id', 'eq_wf_sla_viol_inst_fk')
                    ->references('id')->on('equipment_workflow_instances');
                $table->foreign('workflow_stage_instance_id', 'eq_wf_sla_viol_stage_fk')
                    ->references('id')->on('equipment_workflow_stage_instances');
                $table->foreign('assigned_to', 'eq_wf_sla_viol_user_fk')
                    ->references('id')->on('users');
                
                // Indexes
                $table->index(['workflow_instance_id', 'violation_type'], 'eq_wf_sla_viol_inst_type_idx');
                $table->index(['is_resolved', 'detected_at'], 'eq_wf_sla_viol_resolved_time_idx');
                $table->index('workflow_stage_instance_id', 'eq_wf_sla_viol_stage_inst_idx');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_workflow_sla_violations');
        Schema::dropIfExists('equipment_workflow_slas');
        Schema::dropIfExists('equipment_workflow_form_submissions');
        Schema::dropIfExists('equipment_workflow_forms');
        Schema::dropIfExists('equipment_workflow_checklist_item_results');
        Schema::dropIfExists('equipment_workflow_checklist_executions');
        Schema::dropIfExists('equipment_workflow_checklist_items');
        Schema::dropIfExists('equipment_workflow_checklists');
        Schema::dropIfExists('equipment_workflow_reminders');
        Schema::dropIfExists('equipment_workflow_history');
        Schema::dropIfExists('equipment_workflow_comments');
        Schema::dropIfExists('equipment_workflow_approvals');
        Schema::dropIfExists('equipment_workflow_stage_instances');
        Schema::dropIfExists('equipment_workflow_instances');
        Schema::dropIfExists('equipment_workflow_transitions');
        Schema::dropIfExists('equipment_workflow_stages');
        Schema::dropIfExists('equipment_workflow_templates');
    }
};