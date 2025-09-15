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
        if (!Schema::hasTable('equipment_data_quality_rules')) {
            Schema::create('equipment_data_quality_rules', function (Blueprint $table) {
                $table->id();
                $table->string('rule_name');
                $table->text('description')->nullable();
                $table->string('table_name');
                $table->string('column_name')->nullable();
                $table->enum('rule_type', [
                    'required', 'unique', 'format', 'range', 'relationship', 
                    'consistency', 'business_logic', 'custom'
                ]);
                $table->json('rule_parameters')->nullable()->comment('Parameters specific to the rule type');
                $table->text('validation_query')->nullable()->comment('SQL query to validate this rule');
                $table->text('error_message')->nullable();
                $table->enum('severity', ['info', 'warning', 'error', 'critical'])->default('error');
                $table->json('remediation_steps')->nullable()->comment('Steps to fix violations');
                $table->boolean('auto_fix')->default(false)->comment('Whether violations can be auto-fixed');
                $table->text('auto_fix_query')->nullable()->comment('SQL query to fix violations');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Indexes
                $table->index(['table_name', 'column_name'], 'eq_data_qual_rule_table_col_idx');
                $table->index(['rule_type', 'severity'], 'eq_data_qual_rule_type_sev_idx');
                $table->index('is_active');
            });
        }

        if (!Schema::hasTable('equipment_data_quality_checks')) {
            Schema::create('equipment_data_quality_checks', function (Blueprint $table) {
                $table->id();
                $table->string('check_name');
                $table->text('description')->nullable();
                $table->json('rules')->comment('IDs of rules to check');
                $table->enum('frequency', ['manual', 'hourly', 'daily', 'weekly', 'monthly']);
                $table->time('scheduled_time')->nullable()->comment('Time of day to run check');
                $table->integer('day_of_week')->nullable()->comment('1-7 for weekly checks');
                $table->integer('day_of_month')->nullable()->comment('1-31 for monthly checks');
                $table->foreignId('created_by')->nullable()->constrained('users');
                $table->foreignId('facility_id')->nullable()->constrained('facilities');
                $table->foreignId('department_id')->nullable()->constrained('departments');
                $table->json('notification_channels')->nullable()->comment('Where to send notifications');
                $table->json('notification_recipients')->nullable()->comment('Who to notify');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Indexes
                $table->index(['frequency', 'is_active'], 'eq_data_export_freq_active_idx');
                $table->index(['facility_id', 'department_id'], 'eq_data_export_fac_dept_idx');
            });
        }

        if (!Schema::hasTable('equipment_data_quality_check_runs')) {
            Schema::create('equipment_data_quality_check_runs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('check_id')->constrained('equipment_data_quality_checks');
                $table->foreignId('triggered_by')->nullable()->constrained('users');
                $table->enum('trigger_type', ['manual', 'scheduled', 'event']);
                $table->dateTime('started_at');
                $table->dateTime('completed_at')->nullable();
                $table->integer('duration_seconds')->nullable();
                $table->integer('total_records_checked')->nullable();
                $table->integer('total_violations_found')->nullable();
                $table->json('violation_summary')->nullable()->comment('Summary of violations by rule');
                $table->enum('status', ['running', 'completed', 'failed', 'cancelled']);
                $table->text('error_message')->nullable();
                $table->timestamps();
                
                // Indexes
                $table->index(['check_id', 'started_at'], 'eq_data_qual_run_check_start_idx');
                $table->index(['status', 'started_at'], 'eq_data_qual_run_status_start_idx');
            });
        }

        if (!Schema::hasTable('equipment_data_quality_violations')) {
            Schema::create('equipment_data_quality_violations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('check_run_id')->constrained('equipment_data_quality_check_runs');
                $table->foreignId('rule_id')->constrained('equipment_data_quality_rules');
                $table->string('table_name');
                $table->string('column_name')->nullable();
                $table->string('record_id')->comment('Primary key of the violating record');
                $table->text('violation_details')->nullable();
                $table->enum('severity', ['info', 'warning', 'error', 'critical']);
                $table->boolean('is_fixed')->default(false);
                $table->foreignId('fixed_by')->nullable()->constrained('users');
                $table->dateTime('fixed_at')->nullable();
                $table->text('fix_details')->nullable();
                $table->timestamps();
                
                // Indexes
                $table->index(['check_run_id', 'rule_id'], 'eq_data_qual_viol_run_rule_idx');
                $table->index(['table_name', 'record_id'], 'eq_data_qual_viol_table_rec_idx');
                $table->index(['severity', 'is_fixed'], 'eq_data_qual_viol_sev_fixed_idx');
            });
        }

        if (!Schema::hasTable('equipment_data_quality_metrics')) {
            Schema::create('equipment_data_quality_metrics', function (Blueprint $table) {
                $table->id();
                $table->string('metric_name');
                $table->text('description')->nullable();
                $table->string('table_name')->nullable();
                $table->enum('metric_type', [
                    'completeness', 'accuracy', 'consistency', 'timeliness', 
                    'uniqueness', 'validity', 'integrity', 'custom'
                ]);
                $table->text('calculation_query')->comment('SQL query to calculate this metric');
                $table->json('thresholds')->nullable()->comment('Thresholds for different severity levels');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Indexes
                $table->index(['table_name', 'metric_type'], 'eq_data_qual_metr_table_type_idx');
                $table->index('is_active');
            });
        }

        if (!Schema::hasTable('equipment_data_quality_metric_values')) {
            Schema::create('equipment_data_quality_metric_values', function (Blueprint $table) {
                $table->id();
                $table->foreignId('metric_id')->constrained('equipment_data_quality_metrics');
                $table->foreignId('facility_id')->nullable()->constrained('facilities');
                $table->foreignId('department_id')->nullable()->constrained('departments');
                $table->decimal('value', 10, 4);
                $table->enum('status', ['good', 'warning', 'critical'])->nullable();
                $table->dateTime('measured_at');
                $table->json('dimension_values')->nullable()->comment('Values for any dimensions');
                $table->timestamps();
                
                // Indexes
                $table->index(['metric_id', 'measured_at'], 'eq_data_qual_val_metr_time_idx');
                $table->index(['facility_id', 'department_id'], 'eq_data_qual_val_fac_dept_idx');
                $table->index('status');
            });
        }

        if (!Schema::hasTable('equipment_data_dictionaries')) {
            Schema::create('equipment_data_dictionaries', function (Blueprint $table) {
                $table->id();
                $table->string('table_name')->unique();
                $table->text('description')->nullable();
                $table->string('primary_key')->nullable();
                $table->json('columns')->comment('Column definitions and metadata');
                $table->json('relationships')->nullable()->comment('Relationships to other tables');
                $table->json('constraints')->nullable()->comment('Table constraints');
                $table->json('indexes')->nullable()->comment('Table indexes');
                $table->string('data_owner')->nullable()->comment('Person/role responsible for this data');
                $table->string('data_steward')->nullable()->comment('Person/role managing this data');
                $table->json('business_rules')->nullable()->comment('Business rules for this table');
                $table->json('data_lineage')->nullable()->comment('Where this data comes from');
                $table->json('usage_examples')->nullable()->comment('Examples of how to use this data');
                $table->dateTime('last_updated_at');
                $table->foreignId('last_updated_by')->nullable()->constrained('users');
                $table->timestamps();
                
                // Indexes
                $table->index('last_updated_at');
            });
        }

        if (!Schema::hasTable('equipment_data_dictionary_columns')) {
            Schema::create('equipment_data_dictionary_columns', function (Blueprint $table) {
                $table->id();
                $table->foreignId('dictionary_id')->constrained('equipment_data_dictionaries');
                $table->string('column_name');
                $table->text('description')->nullable();
                $table->string('data_type');
                $table->boolean('is_nullable')->default(true);
                $table->string('default_value')->nullable();
                $table->json('constraints')->nullable()->comment('Column constraints');
                $table->json('valid_values')->nullable()->comment('Valid values or range');
                $table->text('business_definition')->nullable()->comment('Business meaning of this column');
                $table->string('source')->nullable()->comment('Source of this data');
                $table->json('transformation_rules')->nullable()->comment('How this data is transformed');
                $table->json('usage_examples')->nullable()->comment('Examples of how to use this column');
                $table->boolean('is_pii')->default(false)->comment('Contains personally identifiable information');
                $table->boolean('is_phi')->default(false)->comment('Contains protected health information');
                $table->enum('sensitivity', ['public', 'internal', 'confidential', 'restricted'])->default('internal');
                $table->timestamps();
                
                // Ensure unique columns per dictionary
                $table->unique(['dictionary_id', 'column_name'], 'eq_dict_col_dict_name_uniq');
                
                // Indexes
                $table->index(['is_pii', 'is_phi'], 'eq_data_dict_col_pii_phi_idx');
                $table->index('sensitivity');
            });
        }

        if (!Schema::hasTable('equipment_audit_configurations')) {
            Schema::create('equipment_audit_configurations', function (Blueprint $table) {
                $table->id();
                $table->string('audit_name');
                $table->text('description')->nullable();
                $table->string('table_name');
                $table->json('columns_to_audit')->nullable()->comment('Specific columns to audit, null for all');
                $table->boolean('audit_inserts')->default(true);
                $table->boolean('audit_updates')->default(true);
                $table->boolean('audit_deletes')->default(true);
                $table->boolean('audit_selects')->default(false);
                $table->boolean('store_old_values')->default(true);
                $table->boolean('store_new_values')->default(true);
                $table->boolean('store_changed_values_only')->default(true);
                $table->json('excluded_columns')->nullable()->comment('Columns to exclude from auditing');
                $table->json('conditional_audit')->nullable()->comment('Conditions under which to audit');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Indexes
                $table->index(['table_name', 'is_active'], 'eq_audit_conf_table_active_idx');
            });
        }

        if (!Schema::hasTable('equipment_audit_logs')) {
            Schema::create('equipment_audit_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('configuration_id')->nullable()->constrained('equipment_audit_configurations');
                $table->string('table_name');
                $table->string('record_id')->comment('Primary key of the audited record');
                $table->enum('action', ['insert', 'update', 'delete', 'select']);
                $table->foreignId('user_id')->nullable()->constrained();
                $table->string('user_type')->nullable()->comment('Role or type of user');
                $table->string('ip_address')->nullable();
                $table->string('user_agent')->nullable();
                $table->json('old_values')->nullable();
                $table->json('new_values')->nullable();
                $table->json('changed_columns')->nullable()->comment('List of columns that changed');
                $table->text('reason')->nullable()->comment('Reason for the change');
                $table->string('application_context')->nullable()->comment('Context in which change was made');
                $table->string('request_id')->nullable()->comment('ID of the request that made this change');
                $table->dateTime('audit_timestamp');
                $table->timestamps();
                
                // Indexes
                $table->index(['table_name', 'record_id'], 'eq_audit_log_table_record_idx');
                $table->index(['user_id', 'action'], 'eq_audit_log_user_action_idx');
                $table->index('audit_timestamp');
            });
        }

        if (!Schema::hasTable('equipment_audit_log_reviews')) {
            Schema::create('equipment_audit_log_reviews', function (Blueprint $table) {
                $table->id();
                $table->foreignId('audit_log_id')->constrained('equipment_audit_logs');
                $table->foreignId('reviewed_by')->constrained('users');
                $table->dateTime('reviewed_at');
                $table->enum('review_result', ['approved', 'flagged', 'rejected']);
                $table->text('review_comments')->nullable();
                $table->json('follow_up_actions')->nullable();
                $table->boolean('requires_further_review')->default(false);
                $table->foreignId('escalated_to')->nullable()->constrained('users');
                $table->timestamps();
                
                // Indexes
                $table->index(['audit_log_id', 'review_result'], 'eq_audit_log_rev_log_result_idx');
                $table->index('reviewed_at');
            });
        }

        if (!Schema::hasTable('equipment_audit_trails')) {
            Schema::create('equipment_audit_trails', function (Blueprint $table) {
                $table->id();
                $table->string('equipment_id');
                $table->string('action_type');
                $table->text('action_details')->nullable();
                $table->foreignId('performed_by')->nullable()->constrained('users');
                $table->foreignId('facility_id')->nullable()->constrained('facilities');
                $table->foreignId('department_id')->nullable()->constrained('departments');
                $table->json('metadata')->nullable()->comment('Additional context about the action');
                $table->dateTime('action_timestamp');
                $table->timestamps();
                
                // Indexes
                $table->index(['equipment_id', 'action_type'], 'eq_audit_trail_equip_action_idx');
                $table->index(['facility_id', 'department_id'], 'eq_audit_trail_fac_dept_idx');
                $table->index('action_timestamp');
            });
        }

        if (!Schema::hasTable('equipment_data_change_requests')) {
            Schema::create('equipment_data_change_requests', function (Blueprint $table) {
                $table->id();
                $table->string('request_title');
                $table->text('request_description');
                $table->string('table_name');
                $table->string('record_id')->comment('Primary key of the record to change');
                $table->json('current_values')->nullable();
                $table->json('requested_values');
                $table->json('changed_columns')->comment('List of columns to change');
                $table->text('change_reason')->nullable();
                $table->foreignId('requested_by')->constrained('users');
                $table->foreignId('assigned_to')->nullable()->constrained('users');
                $table->foreignId('facility_id')->nullable()->constrained('facilities');
                $table->foreignId('department_id')->nullable()->constrained('departments');
                $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
                $table->enum('status', [
                    'draft', 'submitted', 'under_review', 'approved', 
                    'rejected', 'implemented', 'cancelled'
                ])->default('draft');
                $table->foreignId('approved_by')->nullable()->constrained('users');
                $table->dateTime('approved_at')->nullable();
                $table->text('rejection_reason')->nullable();
                $table->dateTime('implemented_at')->nullable();
                $table->foreignId('implemented_by')->nullable()->constrained('users');
                $table->json('implementation_details')->nullable();
                $table->timestamps();
                
                // Indexes
                $table->index(['table_name', 'record_id'], 'eq_data_chg_req_table_record_idx');
                $table->index(['status', 'priority'], 'eq_data_chg_req_status_prio_idx');
                $table->index(['facility_id', 'department_id'], 'eq_data_chg_req_fac_dept_idx');
            });
        }

        if (!Schema::hasTable('equipment_data_change_request_comments')) {
            Schema::create('equipment_data_change_request_comments', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('change_request_id');
                $table->unsignedBigInteger('user_id');
                $table->text('comment');
                $table->json('attachments')->nullable();
                $table->boolean('is_internal')->default(false)->comment('Only visible to reviewers');
                $table->timestamps();
                
                // Foreign keys with custom names
                $table->foreign('change_request_id')
                      ->references('id')
                      ->on('equipment_data_change_requests')
                      ->name('eq_dcrc_cr_id_fk');
                $table->foreign('user_id')
                      ->references('id')
                      ->on('users')
                      ->name('eq_dcrc_user_id_fk');
                
                // Indexes
                $table->index(['change_request_id', 'created_at'], 'eq_data_chg_req_comm_req_time_idx');
            });
        }

        if (!Schema::hasTable('equipment_data_change_request_approvals')) {
            Schema::create('equipment_data_change_request_approvals', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('change_request_id');
                $table->unsignedBigInteger('approver_id');
                $table->enum('decision', ['pending', 'approved', 'rejected']);
                $table->text('comments')->nullable();
                $table->dateTime('decision_at')->nullable();
                $table->timestamps();
                
                // Foreign keys with custom names
                $table->foreign('change_request_id')
                      ->references('id')
                      ->on('equipment_data_change_requests')
                      ->name('eq_dcra_cr_id_fk');
                $table->foreign('approver_id')
                      ->references('id')
                      ->on('users')
                      ->name('eq_dcra_appr_id_fk');
                
                // Ensure unique approvers per request
                $table->unique(['change_request_id', 'approver_id'], 'eq_chg_req_appr_req_appr_uniq');
                
                // Indexes
                $table->index(['change_request_id', 'decision'], 'eq_data_chg_req_appr_req_dec_idx');
            });
        }

        if (!Schema::hasTable('equipment_data_exports')) {
            Schema::create('equipment_data_exports', function (Blueprint $table) {
                $table->id();
                $table->string('export_name');
                $table->text('description')->nullable();
                $table->text('query')->nullable()->comment('SQL query for the export');
                $table->json('tables')->nullable()->comment('Tables included in the export');
                $table->json('filters')->nullable()->comment('Filters applied to the export');
                $table->json('columns')->nullable()->comment('Columns included in the export');
                $table->enum('format', ['csv', 'json', 'xml', 'excel', 'pdf'])->default('csv');
                $table->json('format_options')->nullable()->comment('Options specific to the format');
                $table->foreignId('created_by')->constrained('users');
                $table->foreignId('facility_id')->nullable()->constrained('facilities');
                $table->foreignId('department_id')->nullable()->constrained('departments');
                $table->enum('frequency', ['one_time', 'daily', 'weekly', 'monthly'])->default('one_time');
                $table->time('scheduled_time')->nullable()->comment('Time of day to run export');
                $table->integer('day_of_week')->nullable()->comment('1-7 for weekly exports');
                $table->integer('day_of_month')->nullable()->comment('1-31 for monthly exports');
                $table->json('notification_recipients')->nullable()->comment('Who to notify when export is ready');
                $table->string('storage_location')->nullable()->comment('Where to store the export');
                $table->integer('retention_days')->nullable()->comment('How long to keep the export');
                $table->boolean('include_pii')->default(false)->comment('Whether to include PII');
                $table->boolean('include_phi')->default(false)->comment('Whether to include PHI');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Indexes
                $table->index(['frequency', 'is_active']);
                $table->index(['facility_id', 'department_id']);
            });
        }

        if (!Schema::hasTable('equipment_data_export_runs')) {
            Schema::create('equipment_data_export_runs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('export_id')->constrained('equipment_data_exports');
                $table->foreignId('triggered_by')->nullable()->constrained('users');
                $table->enum('trigger_type', ['manual', 'scheduled', 'api']);
                $table->dateTime('started_at');
                $table->dateTime('completed_at')->nullable();
                $table->integer('duration_seconds')->nullable();
                $table->integer('record_count')->nullable();
                $table->bigInteger('file_size_bytes')->nullable();
                $table->string('file_path')->nullable();
                $table->string('download_url')->nullable();
                $table->enum('status', ['running', 'completed', 'failed', 'cancelled']);
                $table->text('error_message')->nullable();
                $table->dateTime('expires_at')->nullable();
                $table->timestamps();
                
                // Indexes
                $table->index(['export_id', 'started_at'], 'eq_data_exp_run_exp_start_idx');
                $table->index(['status', 'started_at'], 'eq_data_exp_run_status_start_idx');
            });
        }

        if (!Schema::hasTable('equipment_data_import_templates')) {
            Schema::create('equipment_data_import_templates', function (Blueprint $table) {
                $table->id();
                $table->string('template_name');
                $table->text('description')->nullable();
                $table->string('target_table');
                $table->json('column_mappings')->comment('Mapping between file columns and DB columns');
                $table->json('validation_rules')->nullable()->comment('Validation rules for each column');
                $table->json('transformation_rules')->nullable()->comment('How to transform data before import');
                $table->boolean('has_header_row')->default(true);
                $table->enum('default_format', ['csv', 'json', 'xml', 'excel'])->default('csv');
                $table->json('format_options')->nullable()->comment('Options specific to the format');
                $table->boolean('allow_updates')->default(false)->comment('Whether to update existing records');
                $table->string('update_key')->nullable()->comment('Column to use for matching existing records');
                $table->boolean('skip_validation_errors')->default(false);
                $table->boolean('is_active')->default(true);
                $table->foreignId('created_by')->constrained('users');
                $table->timestamps();
                
                // Indexes
                $table->index(['target_table', 'is_active'], 'eq_data_imp_templ_table_active_idx');
            });
        }

        if (!Schema::hasTable('equipment_data_imports')) {
            Schema::create('equipment_data_imports', function (Blueprint $table) {
                $table->id();
                $table->string('import_name');
                $table->foreignId('template_id')->nullable()->constrained('equipment_data_import_templates');
                $table->string('file_name');
                $table->string('file_path');
                $table->bigInteger('file_size_bytes');
                $table->enum('file_format', ['csv', 'json', 'xml', 'excel', 'other']);
                $table->foreignId('uploaded_by')->constrained('users');
                $table->foreignId('facility_id')->nullable()->constrained('facilities');
                $table->foreignId('department_id')->nullable()->constrained('departments');
                $table->json('column_mappings')->nullable()->comment('Custom column mappings for this import');
                $table->json('import_options')->nullable()->comment('Options for this import');
                $table->enum('status', [
                    'uploaded', 'validating', 'validation_failed', 'validation_passed', 
                    'processing', 'completed', 'failed', 'cancelled'
                ])->default('uploaded');
                $table->integer('total_rows')->nullable();
                $table->integer('processed_rows')->nullable();
                $table->integer('successful_rows')->nullable();
                $table->integer('error_rows')->nullable();
                $table->integer('warning_rows')->nullable();
                $table->dateTime('started_at')->nullable();
                $table->dateTime('completed_at')->nullable();
                $table->text('error_message')->nullable();
                $table->string('error_log_path')->nullable();
                $table->boolean('is_test_run')->default(false)->comment('Whether this is a test run');
                $table->timestamps();
                
                // Indexes
                $table->index(['status', 'created_at'], 'eq_data_imp_status_time_idx');
                $table->index(['facility_id', 'department_id'], 'eq_data_imp_fac_dept_idx');
            });
        }

        if (!Schema::hasTable('equipment_data_import_errors')) {
            Schema::create('equipment_data_import_errors', function (Blueprint $table) {
                $table->id();
                $table->foreignId('import_id')->constrained('equipment_data_imports');
                $table->integer('row_number');
                $table->json('row_data')->nullable();
                $table->enum('error_type', ['validation', 'transformation', 'database', 'system']);
                $table->string('column_name')->nullable();
                $table->text('error_message');
                $table->json('validation_errors')->nullable();
                $table->enum('severity', ['warning', 'error', 'critical'])->default('error');
                $table->boolean('is_resolved')->default(false);
                $table->text('resolution_notes')->nullable();
                $table->foreignId('resolved_by')->nullable()->constrained('users');
                $table->dateTime('resolved_at')->nullable();
                $table->timestamps();
                
                // Indexes
                $table->index(['import_id', 'row_number'], 'eq_data_imp_err_imp_row_idx');
                $table->index(['error_type', 'severity'], 'eq_data_imp_err_type_sev_idx');
                $table->index('is_resolved');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_data_import_errors');
        Schema::dropIfExists('equipment_data_imports');
        Schema::dropIfExists('equipment_data_import_templates');
        Schema::dropIfExists('equipment_data_export_runs');
        Schema::dropIfExists('equipment_data_exports');
        Schema::dropIfExists('equipment_data_change_request_approvals');
        Schema::dropIfExists('equipment_data_change_request_comments');
        Schema::dropIfExists('equipment_data_change_requests');
        Schema::dropIfExists('equipment_audit_trails');
        Schema::dropIfExists('equipment_audit_log_reviews');
        Schema::dropIfExists('equipment_audit_logs');
        Schema::dropIfExists('equipment_audit_configurations');
        Schema::dropIfExists('equipment_data_dictionary_columns');
        Schema::dropIfExists('equipment_data_dictionaries');
        Schema::dropIfExists('equipment_data_quality_metric_values');
        Schema::dropIfExists('equipment_data_quality_metrics');
        Schema::dropIfExists('equipment_data_quality_violations');
        Schema::dropIfExists('equipment_data_quality_check_runs');
        Schema::dropIfExists('equipment_data_quality_checks');
        Schema::dropIfExists('equipment_data_quality_rules');
    }
};