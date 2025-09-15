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
        if (!Schema::hasTable('equipment_lifecycle_stages')) {
            Schema::create('equipment_lifecycle_stages', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description');
                $table->integer('default_order')->comment('Ordering of stages in typical lifecycle');
                $table->json('required_data_fields')->nullable()->comment('Fields that must be completed in this stage');
                $table->json('optional_data_fields')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Indexes
                $table->index(['default_order', 'is_active'], 'eq_lc_stage_idx');
            });
        }

        if (!Schema::hasTable('equipment_lifecycle_transitions')) {
    Schema::create('equipment_lifecycle_transitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('from_stage_id')->constrained('equipment_lifecycle_stages')->name('eq_lc_trans_from_fk');
            $table->foreignId('to_stage_id')->constrained('equipment_lifecycle_stages')->name('eq_lc_trans_to_fk');
            $table->string('transition_name');
            $table->text('description')->nullable();
            $table->boolean('requires_approval')->default(false);
            $table->json('required_approvers')->nullable()->comment('User roles required for approval');
            $table->json('required_documents')->nullable()->comment('Document types required for transition');
            $table->json('required_checklists')->nullable()->comment('Checklists to complete before transition');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes
            $table->unique(['from_stage_id', 'to_stage_id'], 'eq_lc_trans_unique');
            $table->index('requires_approval', 'eq_lc_trans_appr_idx');
        });
}

        if (!Schema::hasTable('equipment_lifecycle_status')) {
    Schema::create('equipment_lifecycle_status', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained('equipment')->name('eq_lc_status_eq_fk');
            $table->foreignId('lifecycle_stage_id')->constrained('equipment_lifecycle_stages')->name('eq_lc_status_stage_fk');
            $table->date('entered_stage_date');
            $table->foreignId('updated_by')->constrained('users')->name('eq_lc_status_user_fk');
            $table->text('status_notes')->nullable();
            $table->date('expected_next_stage_date')->nullable();
            $table->foreignId('next_expected_stage_id')->nullable()->constrained('equipment_lifecycle_stages')->name('eq_lc_status_next_fk');
            $table->json('completed_requirements')->nullable()->comment('Requirements completed for this stage');
            $table->json('pending_requirements')->nullable()->comment('Requirements still pending for this stage');
            $table->timestamps();
            
            // Indexes
            $table->index(['equipment_id', 'entered_stage_date'], 'eq_lc_status_date_idx');
            $table->index('lifecycle_stage_id', 'eq_lc_status_stage_idx');
        });
}

        if (!Schema::hasTable('equipment_lifecycle_history')) {
    Schema::create('equipment_lifecycle_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained('equipment')->name('eq_lc_hist_eq_fk');
            $table->foreignId('from_stage_id')->nullable()->constrained('equipment_lifecycle_stages')->name('eq_lc_hist_from_fk');
            $table->foreignId('to_stage_id')->constrained('equipment_lifecycle_stages')->name('eq_lc_hist_to_fk');
            $table->foreignId('transition_id')->nullable()->constrained('equipment_lifecycle_transitions')->name('eq_lc_hist_trans_fk');
            $table->dateTime('transition_timestamp');
            $table->foreignId('performed_by')->constrained('users')->name('eq_lc_hist_user_fk');
            $table->text('transition_notes')->nullable();
            $table->json('related_documents')->nullable()->comment('Documents associated with this transition');
            $table->json('completed_checklists')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['equipment_id', 'transition_timestamp'], 'eq_lc_hist_date_idx');
            $table->index(['from_stage_id', 'to_stage_id'], 'eq_lc_hist_trans_idx');
        });
}

        if (!Schema::hasTable('equipment_lifecycle_approvals')) {
    Schema::create('equipment_lifecycle_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained('equipment')->name('eq_lc_appr_eq_fk');
            $table->foreignId('transition_id')->constrained('equipment_lifecycle_transitions')->name('eq_lc_appr_trans_fk');
            $table->foreignId('requested_by')->constrained('users')->name('eq_lc_appr_req_fk');
            $table->dateTime('requested_at');
            $table->text('request_notes')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled']);
            $table->json('approvers')->comment('List of required approvers and their status');
            $table->dateTime('completed_at')->nullable();
            $table->text('decision_notes')->nullable();
            $table->json('supporting_documents')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['equipment_id', 'status'], 'eq_lc_appr_status_idx');
            $table->index(['transition_id', 'requested_at'], 'eq_lc_appr_date_idx');
        });
}

        if (!Schema::hasTable('equipment_lifecycle_approval_actions')) {
    Schema::create('equipment_lifecycle_approval_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lifecycle_approval_id')->constrained('equipment_lifecycle_approvals')->name('eq_lc_appr_act_fk');
            $table->foreignId('user_id')->constrained('users')->name('eq_lc_appr_act_user_fk');
            $table->enum('action', ['approved', 'rejected', 'delegated', 'commented']);
            $table->dateTime('action_timestamp');
            $table->text('action_notes')->nullable();
            $table->foreignId('delegated_to')->nullable()->constrained('users')->name('eq_lc_appr_act_del_fk');
            $table->json('supporting_documents')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['lifecycle_approval_id', 'action'], 'eq_lc_appr_act_idx');
            $table->index(['user_id', 'action_timestamp'], 'eq_lc_appr_act_time_idx');
        });
}

        if (!Schema::hasTable('equipment_acquisition_methods')) {
    Schema::create('equipment_acquisition_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('required_fields')->nullable()->comment('Fields required for this acquisition method');
            $table->json('document_templates')->nullable()-> investigative('Templates for acquisition documents');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes
            $table->index('is_active', 'eq_acq_method_active_idx');
        });
}

        if (!Schema::hasTable('equipment_acquisitions')) {
    Schema::create('equipment_acquisitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained('equipment')->name('eq_acq_eq_fk');
            $table->foreignId('acquisition_method_id')->constrained('equipment_acquisition_methods')->name('eq_acq_method_fk');
            $table->date('acquisition_date');
            $table->decimal('acquisition_cost', 15, 2)->nullable();
            $table->string('purchase_order_number')->nullable();
            $table->string('invoice_number')->nullable();
            $table->foreignId('vendor_id')->nullable()->constrained('equipment_vendors')->name('eq_acq_vendor_fk');
            $table->foreignId('requested_by')->nullable()->constrained('users')->name('eq_acq_req_fk');
            $table->foreignId('approved_by')->nullable()->constrained('users')->name('eq_acq_appr_fk');
            $table->foreignId('received_by')->nullable()->constrained('users')->name('eq_acq_rec_fk');
            $table->date('warranty_start_date')->nullable();
            $table->date('warranty_end_date')->nullable();
            $table->text('acquisition_notes')->nullable();
            $table->json('funding_sources')->nullable()->comment('Sources of funding for acquisition');
            $table->json('acquisition_documents')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['equipment_id', 'acquisition_date'], 'eq_acq_date_idx');
            $table->index('acquisition_method_id', 'eq_acq_method_idx');
        });
}

        if (!Schema::hasTable('equipment_commissioning')) {
    Schema::create('equipment_commissioning', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained('equipment')->name('eq_comm_eq_fk');
            $table->date('commissioning_date');
            $table->foreignId('performed_by')->constrained('users')->name('eq_comm_perf_fk');
            $table->string('commissioning_reference')->nullable();
            $table->enum('status', ['planned', 'in_progress', 'completed', 'failed', 'rescheduled']);
            $table->text('commissioning_notes')->nullable();
            $table->json('commissioning_checklist')->nullable()->comment('Checklist items and completion status');
            $table->json('test_results')->nullable();
            $table->json('issues_identified')->nullable();
            $table->json('resolutions')->nullable();
            $table->date('acceptance_date')->nullable();
            $table->foreignId('accepted_by')->nullable()->constrained('users')->name('eq_comm_acc_fk');
            $table->json('commissioning_documents')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['equipment_id', 'commissioning_date'], 'eq_comm_date_idx');
            $table->index('status', 'eq_comm_status_idx');
        });
}

        if (!Schema::hasTable('equipment_decommissioning')) {
    Schema::create('equipment_decommissioning', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained('equipment')->name('eq_decomm_eq_fk');
            $table->date('decommissioning_date');
            $table->foreignId('requested_by')->constrained('users')->name('eq_decomm_req_fk');
            $table->foreignId('approved_by')->nullable()->constrained('users')->name('eq_decomm_appr_fk');
            $table->foreignId('performed_by')->nullable()->constrained('users')->name('eq_decomm_perf_fk');
            $table->enum('status', ['planned', 'approved', 'in_progress', 'completed', 'cancelled']);
            $table->text('reason_for_decommissioning');
            $table->text('decommissioning_notes')->nullable();
            $table->json('decommissioning_checklist')->nullable()->comment('Checklist items and completion status');
            $table->boolean('data_wiped')->default(false);
            $table->text('data_wiping_method')->nullable();
            $table->date('data_wiping_date')->nullable();
            $table->foreignId('data_wiped_by')->nullable()->constrained('users')->name('eq_decomm_wipe_fk');
            $table->string('data_wiping_certificate')->nullable();
            $table->json('decommissioning_documents')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['equipment_id', 'decommissioning_date'], 'eq_decomm_date_idx');
            $table->index('status', 'eq_decomm_status_idx');
        });
}

        if (!Schema::hasTable('equipment_disposal_methods')) {
    Schema::create('equipment_disposal_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->boolean('is_environmentally_friendly')->default(false);
            $table->boolean('requires_special_handling')->default(false);
            $table->text('handling_instructions')->nullable();
            $table->json('required_documentation')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes
            $table->index(['is_environmentally_friendly', 'requires_special_handling'], 'eq_disp_method_idx');
            $table->index('is_active', 'eq_disp_method_active_idx');
        });
}

        if (!Schema::hasTable('equipment_disposals')) {
    Schema::create('equipment_disposals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained('equipment')->name('eq_disp_eq_fk');
            $table->foreignId('disposal_method_id')->constrained('equipment_disposal_methods')->name('eq_disp_method_fk');
            $table->date('disposal_date');
            $table->foreignId('requested_by')->constrained('users')->name('eq_disp_req_fk');
            $table->foreignId('approved_by')->nullable()->constrained('users')->name('eq_disp_appr_fk');
            $table->foreignId('performed_by')->nullable()->constrained('users')->name('eq_disp_perf_fk');
            $table->enum('status', ['planned', 'approved', 'in_progress', 'completed', 'cancelled']);
            $table->text('disposal_notes')->nullable();
            $table->decimal('disposal_cost', 15, 2)->nullable();
            $table->decimal('recovery_value', 15, 2)->nullable()->comment('Value recovered from disposal');
            $table->string('disposal_certificate')->nullable();
            $table->string('recipient_name')->nullable()->comment('Person or organization receiving the equipment');
            $table->string('recipient_contact')->nullable();
            $table->text('environmental_compliance_notes')->nullable();
            $table->json('disposal_documents')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['equipment_id', 'disposal_date'], 'eq_disp_date_idx');
            $table->index(['disposal_method_id', 'status'], 'eq_disp_status_idx');
        });
}

        if (!Schema::hasTable('equipment_transfers')) {
    Schema::create('equipment_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained('equipment')->name('eq_trans_eq_fk');
            $table->foreignId('from_department_id')->constrained('departments')->name('eq_trans_from_dept_fk');
            $table->foreignId('to_department_id')->constrained('departments')->name('eq_trans_to_dept_fk');
            $table->foreignId('from_location_id')->nullable()->constrained('equipment_locations')->name('eq_trans_from_loc_fk');
            $table->foreignId('to_location_id')->nullable()->constrained('equipment_locations')->name('eq_trans_to_loc_fk');
            $table->date('transfer_date');
            $table->foreignId('requested_by')->constrained('users')->name('eq_trans_req_fk');
            $table->foreignId('approved_by')->nullable()->constrained('users')->name('eq_trans_appr_fk');
            $table->enum('status', ['requested', 'approved', 'in_transit', 'completed', 'cancelled']);
            $table->text('reason_for_transfer');
            $table->text('transfer_notes')->nullable();
            $table->foreignId('transferred_by')->nullable()->constrained('users')->name('eq_trans_perf_fk');
            $table->foreignId('received_by')->nullable()->constrained('users')->name('eq_trans_rec_fk');
            $table->date('received_date')->nullable();
            $table->text('condition_before_transfer')->nullable();
            $table->text('condition_after_transfer')->nullable();
            $table->json('transfer_documents')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['equipment_id', 'transfer_date'], 'eq_trans_date_idx');
            $table->index(['from_department_id', 'to_department_id'], 'eq_trans_dept_idx');
            $table->index('status', 'eq_trans_status_idx');
        });
}

        if (!Schema::hasTable('equipment_upgrades')) {
    Schema::create('equipment_upgrades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained('equipment')->name('eq_upgr_eq_fk');
            $table->string('upgrade_name');
            $table->text('upgrade_description');
            $table->enum('upgrade_type', ['hardware', 'software', 'firmware', 'component', 'accessory', 'other']);
            $table->date('upgrade_date');
            $table->foreignId('requested_by')->constrained('users')->name('eq_upgr_req_fk');
            $table->foreignId('approved_by')->nullable()->constrained('users')->name('eq_upgr_appr_fk');
            $table->enum('status', ['planned', 'approved', 'in_progress', 'completed', 'failed', 'cancelled']);
            $table->text('reason_for_upgrade');
            $table->decimal('upgrade_cost', 15, 2)->nullable();
            $table->string('purchase_order_number')->nullable();
            $table->foreignId('vendor_id')->nullable()->constrained('equipment_vendors')->name('eq_upgr_vendor_fk');
            $table->foreignId('performed_by')->nullable()->constrained('users')->name('eq_upgr_perf_fk');
            $table->text('upgrade_notes')->nullable();
            $table->string('previous_version')->nullable();
            $table->string('new_version')->nullable();
            $table->boolean('requires_validation')->default(false);
            $table->date('validation_date')->nullable();
            $table->foreignId('validated_by')->nullable()->constrained('users')->name('eq_upgr_val_fk');
            $table->json('validation_results')->nullable();
            $table->json('upgrade_documents')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['equipment_id', 'upgrade_date'], 'eq_upgr_date_idx');
            $table->index(['upgrade_type', 'status'], 'eq_upgr_status_idx');
        });
}

        if (!Schema::hasTable('equipment_retirement_plans')) {
    Schema::create('equipment_retirement_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained('equipment')->name('eq_ret_plan_eq_fk');
            $table->date('planned_retirement_date');
            $table->foreignId('planned_by')->constrained('users')->name('eq_ret_plan_plan_fk');
            $table->foreignId('approved_by')->nullable()->constrained('users')->name('eq_ret_plan_appr_fk');
            $table->enum('status', ['draft', 'approved', 'in_progress', 'completed', 'cancelled', 'postponed']);
            $table->text('retirement_reason');
            $table->text('retirement_notes')->nullable();
            $table->foreignId('replacement_equipment_id')->nullable()->constrained('equipment')->name('eq_ret_plan_rep_fk');
            $table->decimal('estimated_residual_value', 15, 2)->nullable();
            $table->json('data_migration_plan')->nullable();
            $table->json('user_transition_plan')->nullable();
            $table->json('retirement_checklist')->nullable();
            $table->json('retirement_documents')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['equipment_id', 'planned_retirement_date'], 'eq_ret_plan_date_idx');
            $table->index('status', 'eq_ret_plan_status_idx');
        });
}

        if (!Schema::hasTable('equipment_replacements')) {
    Schema::create('equipment_replacements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('old_equipment_id')->constrained('equipment')->name('eq_repl_old_eq_fk');
            $table->foreignId('new_equipment_id')->constrained('equipment')->name('eq_repl_new_eq_fk');
            $table->date('replacement_date');
            $table->foreignId('requested_by')->constrained('users')->name('eq_repl_req_fk');
            $table->foreignId('approved_by')->nullable()->constrained('users')->name('eq_repl_appr_fk');
            $table->enum('status', ['planned', 'approved', 'in_progress', 'completed', 'cancelled']);
            $table->text('replacement_reason');
            $table->text('replacement_notes')->nullable();
            $table->boolean('data_migrated')->default(false);
            $table->date('data_migration_date')->nullable();
            $table->foreignId('data_migrated_by')->nullable()->constrained('users')->name('eq_repl_mig_fk');
            $table->text('data_migration_notes')->nullable();
            $table->boolean('users_trained')->default(false);
            $table->date('training_date')->nullable();
            $table->json('replacement_documents')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['old_equipment_id', 'new_equipment_id'], 'eq_repl_eq_idx');
            $table->index(['replacement_date', 'status'], 'eq_repl_status_idx');
        });
}

        if (!Schema::hasTable('equipment_lifecycle_costs')) {
    Schema::create('equipment_lifecycle_costs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained('equipment')->name('eq_lc_cost_eq_fk');
            $table->enum('cost_type', [
                'acquisition', 'installation', 'training', 'maintenance', 'repair', 
                'upgrade', 'consumables', 'utilities', 'disposal', 'other'
            ]);
            $table->date('cost_date');
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('USD');
            $table->text('description')->nullable();
            $table->string('invoice_number')->nullable();
            $table->string('purchase_order_number')->nullable();
            $table->foreignId('vendor_id')->nullable()->constrained('equipment_vendors')->name('eq_lc_cost_vendor_fk');
            $table->foreignId('recorded_by')->constrained('users')->name('eq_lc_cost_rec_fk');
            $table->foreignId('approved_by')->nullable()->constrained('users')->name('eq_lc_cost_appr_fk');
            $table->foreignId('lifecycle_stage_id')->nullable()->constrained('equipment_lifecycle_stages')->name('eq_lc_cost_stage_fk');
            $table->json('cost_documents')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['equipment_id', 'cost_date'], 'eq_lc_cost_date_idx');
            $table->index(['cost_type', 'amount'], 'eq_lc_cost_type_idx');
        });
}

        if (!Schema::hasTable('equipment_lifecycle_events')) {
    Schema::create('equipment_lifecycle_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained('equipment')->name('eq_lc_event_eq_fk');
            $table->string('event_name');
            $table->text('event_description');
            $table->enum('event_type', [
                'milestone', 'incident', 'modification', 'relocation', 
                'compliance', 'review', 'other'
            ]);
            $table->dateTime('event_timestamp');
            $table->foreignId('recorded_by')->constrained('users')->name('eq_lc_event_rec_fk');
            $table->foreignId('lifecycle_stage_id')->nullable()->constrained('equipment_lifecycle_stages')->name('eq_lc_event_stage_fk');
            $table->text('event_notes')->nullable();
            $table->json('event_documents')->nullable();
            $table->json('related_events')->nullable()->comment('IDs of related lifecycle events');
            $table->timestamps();
            
            // Indexes
            $table->index(['equipment_id', 'event_timestamp'], 'eq_lc_event_date_idx');
            $table->index(['event_type', 'lifecycle_stage_id'], 'eq_lc_event_type_idx');
        });
}

        Schema::table('equipment', function (Blueprint $table) {
            // Lifecycle status
            $table->foreignId('current_lifecycle_stage_id')->nullable()->constrained('equipment_lifecycle_stages')->name('eq_curr_stage_fk');
            $table->date('lifecycle_stage_updated_at')->nullable();
            
            // Acquisition details
            $table->foreignId('acquisition_method_id')->nullable()->constrained('equipment_acquisition_methods')->name('eq_acq_method_fk');
            $table->date('acquisition_date')->nullable();
            $table->decimal('initial_cost', 15, 2)->nullable();
            
            // Lifecycle planning
            $table->integer('expected_lifetime_years')->nullable();
            $table->date('planned_retirement_date')->nullable();
            $table->date('actual_retirement_date')->nullable();
            
            // Replacement planning
            $table->boolean('replacement_planned')->default(false);
            $table->date('planned_replacement_date')->nullable();
            $table->string('replacement_budget_reference')->nullable();
            
            // Total cost of ownership
            $table->decimal('total_lifecycle_cost', 15, 2)->nullable()->comment('Calculated total cost of ownership');
            $table->date('lifecycle_cost_updated_at')->nullable();
            
            // Indexes
            $table->index('current_lifecycle_stage_id', 'eq_curr_stage_idx');
            $table->index(['acquisition_date', 'planned_retirement_date'], 'eq_acq_ret_date_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('equipment', function (Blueprint $table) {
            $table->dropColumn([
                'current_lifecycle_stage_id',
                'lifecycle_stage_updated_at',
                'acquisition_method_id',
                'acquisition_date',
                'initial_cost',
                'expected_lifetime_years',
                'planned_retirement_date',
                'actual_retirement_date',
                'replacement_planned',
                'planned_replacement_date',
                'replacement_budget_reference',
                'total_lifecycle_cost',
                'lifecycle_cost_updated_at'
            ]);
        });

        Schema::dropIfExists('equipment_lifecycle_events');
        Schema::dropIfExists('equipment_lifecycle_costs');
        Schema::dropIfExists('equipment_replacements');
        Schema::dropIfExists('equipment_retirement_plans');
        Schema::dropIfExists('equipment_upgrades');
        Schema::dropIfExists('equipment_transfers');
        Schema::dropIfExists('equipment_disposals');
        Schema::dropIfExists('equipment_disposal_methods');
        Schema::dropIfExists('equipment_decommissioning');
        Schema::dropIfExists('equipment_commissioning');
        Schema::dropIfExists('equipment_acquisitions');
        Schema::dropIfExists('equipment_acquisition_methods');
        Schema::dropIfExists('equipment_lifecycle_approval_actions');
        Schema::dropIfExists('equipment_lifecycle_approvals');
        Schema::dropIfExists('equipment_lifecycle_history');
        Schema::dropIfExists('equipment_lifecycle_status');
        Schema::dropIfExists('equipment_lifecycle_transitions');
        Schema::dropIfExists('equipment_lifecycle_stages');
    }
};