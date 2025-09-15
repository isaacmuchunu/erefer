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
        if (!Schema::hasTable('equipment_configuration_types')) {
            Schema::create('equipment_configuration_types', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('data_type')->comment('Supported types: string, number, boolean, json, etc.');
                $table->json('validation_rules')->nullable()->comment('Rules for validating configuration values');
                $table->json('allowed_values')->nullable()->comment('For enum-like configuration types');
                $table->string('default_value')->nullable();
                $table->boolean('is_required')->default(false);
                $table->boolean('is_system')->default(false)->comment('System configurations cannot be modified by regular users');
                $table->boolean('is_sensitive')->default(false)->comment('Sensitive configurations are encrypted');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Indexes
                $table->index(['is_system', 'is_active'], 'eq_conf_type_sys_act');
                $table->index('is_sensitive');
            });
        }

        if (!Schema::hasTable('equipment_configuration_categories')) {
            Schema::create('equipment_configuration_categories', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('icon')->nullable();
                $table->integer('display_order')->default(0);
                $table->unsignedBigInteger('parent_category_id')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Foreign keys with custom short names
                $table->foreign('parent_category_id', 'eq_conf_cat_parent')->references('id')->on('equipment_configuration_categories');
                
                // Indexes
                $table->index(['parent_category_id', 'display_order'], 'eq_conf_cat_par_ord');
                $table->index('is_active');
            });
        }

        if (!Schema::hasTable('equipment_configuration_type_categories')) {
            Schema::create('equipment_configuration_type_categories', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('configuration_type_id');
                $table->unsignedBigInteger('category_id');
                $table->integer('display_order')->default(0);
                $table->timestamps();
                
                // Foreign keys with custom short names
                $table->foreign('configuration_type_id', 'eq_conf_type_cat_type')->references('id')->on('equipment_configuration_types');
                $table->foreign('category_id', 'eq_conf_type_cat_cat')->references('id')->on('equipment_configuration_categories');
                
                // Indexes
                $table->unique(['configuration_type_id', 'category_id'], 'eq_conf_type_cat_uq');
                $table->index('display_order');
            });
        }

        if (!Schema::hasTable('equipment_models')) {
            Schema::create('equipment_models', function (Blueprint $table) {
                $table->id();
                $table->string('manufacturer');
                $table->string('model');
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('equipment_model_configurations')) {
            Schema::create('equipment_model_configurations', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('equipment_model_id');
                $table->unsignedBigInteger('configuration_type_id');
                $table->text('value');
                $table->text('description')->nullable();
                $table->boolean('is_default')->default(true)->comment('Whether this is the default value for this model');
                $table->boolean('is_overridable')->default(true)->comment('Whether individual equipment can override this value');
                $table->unsignedBigInteger('created_by');
                $table->unsignedBigInteger('updated_by');
                $table->timestamps();
                
                // Foreign keys with custom short names
                $table->foreign('equipment_model_id', 'eq_mod_conf_model')->references('id')->on('equipment_models')->onDelete('cascade');
                $table->foreign('configuration_type_id', 'eq_mod_conf_type')->references('id')->on('equipment_configuration_types');
                $table->foreign('created_by', 'eq_mod_conf_cr_by')->references('id')->on('users');
                $table->foreign('updated_by', 'eq_mod_conf_up_by')->references('id')->on('users');
                
                // Indexes
                $table->unique(['equipment_model_id', 'configuration_type_id'], 'eq_mod_conf_type_uq');
                $table->index('is_default');
            });
        }

        if (!Schema::hasTable('equipment_configurations')) {
            Schema::create('equipment_configurations', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('equipment_id');
                $table->unsignedBigInteger('configuration_type_id');
                $table->text('value');
                $table->text('description')->nullable();
                $table->unsignedBigInteger('created_by');
                $table->unsignedBigInteger('updated_by');
                $table->timestamps();
                
                // Foreign keys with custom short names
                $table->foreign('equipment_id', 'eq_conf_eq')->references('id')->on('equipment');
                $table->foreign('configuration_type_id', 'eq_conf_type')->references('id')->on('equipment_configuration_types');
                $table->foreign('created_by', 'eq_conf_cr_by')->references('id')->on('users');
                $table->foreign('updated_by', 'eq_conf_up_by')->references('id')->on('users');
                
                // Indexes
                $table->unique(['equipment_id', 'configuration_type_id'], 'eq_conf_type_uq');
            });
        }

        if (!Schema::hasTable('equipment_configuration_history')) {
            Schema::create('equipment_configuration_history', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('equipment_id');
                $table->unsignedBigInteger('configuration_type_id');
                $table->text('old_value')->nullable();
                $table->text('new_value');
                $table->text('change_reason')->nullable();
                $table->unsignedBigInteger('changed_by');
                $table->dateTime('changed_at');
                $table->string('change_source')->nullable()->comment('Source of change: UI, API, System, etc.');
                $table->timestamps();
                
                // Foreign keys with custom short names
                $table->foreign('equipment_id', 'eq_conf_hist_eq')->references('id')->on('equipment');
                $table->foreign('configuration_type_id', 'eq_conf_hist_type')->references('id')->on('equipment_configuration_types');
                $table->foreign('changed_by', 'eq_conf_hist_chg_by')->references('id')->on('users');
                
                // Indexes
                $table->index(['equipment_id', 'changed_at'], 'eq_conf_hist_eq_chg');
                $table->index('configuration_type_id');
            });
        }

        if (!Schema::hasTable('equipment_configuration_templates')) {
            Schema::create('equipment_configuration_templates', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->unsignedBigInteger('created_by');
                $table->boolean('is_system')->default(false);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Foreign keys with custom short names
                $table->foreign('created_by', 'eq_conf_tmpl_cr_by')->references('id')->on('users');
                
                // Indexes
                $table->index(['is_system', 'is_active'], 'eq_conf_tmpl_sys_act');
            });
        }

        if (!Schema::hasTable('equipment_configuration_template_items')) {
            Schema::create('equipment_configuration_template_items', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('template_id');
                $table->unsignedBigInteger('configuration_type_id');
                $table->text('default_value')->nullable();
                $table->boolean('is_required')->default(false);
                $table->integer('display_order')->default(0);
                $table->timestamps();
                
                // Foreign keys with custom short names
                $table->foreign('template_id', 'eq_conf_tmpl_item_tmpl')->references('id')->on('equipment_configuration_templates');
                $table->foreign('configuration_type_id', 'eq_conf_tmpl_item_type')->references('id')->on('equipment_configuration_types');
                
                // Indexes
                $table->unique(['template_id', 'configuration_type_id'], 'eq_conf_tmpl_item_uq');
                $table->index('display_order');
            });
        }

        if (!Schema::hasTable('equipment_configuration_profiles')) {
            Schema::create('equipment_configuration_profiles', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->unsignedBigInteger('template_id')->nullable();
                $table->unsignedBigInteger('created_by');
                $table->boolean('is_system')->default(false);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Foreign keys with custom short names
                $table->foreign('template_id', 'eq_conf_prof_tmpl')->references('id')->on('equipment_configuration_templates');
                $table->foreign('created_by', 'eq_conf_prof_cr_by')->references('id')->on('users');
                
                // Indexes
                $table->index(['template_id', 'is_active'], 'eq_conf_prof_tmpl_act');
                $table->index('is_system');
            });
        }

        if (!Schema::hasTable('equipment_configuration_profile_values')) {
            Schema::create('equipment_configuration_profile_values', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('profile_id');
                $table->unsignedBigInteger('configuration_type_id');
                $table->text('value');
                $table->timestamps();
                
                // Foreign keys with custom short names
                $table->foreign('profile_id', 'eq_conf_prof_val_prof')->references('id')->on('equipment_configuration_profiles');
                $table->foreign('configuration_type_id', 'eq_conf_prof_val_type')->references('id')->on('equipment_configuration_types');
                
                // Indexes
                $table->unique(['profile_id', 'configuration_type_id'], 'eq_conf_prof_val_uq');
            });
        }

        if (!Schema::hasTable('equipment_configuration_profile_assignments')) {
            Schema::create('equipment_configuration_profile_assignments', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('equipment_id');
                $table->unsignedBigInteger('profile_id');
                $table->unsignedBigInteger('assigned_by');
                $table->dateTime('assigned_at');
                $table->text('assignment_notes')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Foreign keys with custom short names
                $table->foreign('equipment_id', 'eq_conf_prof_asgn_eq')->references('id')->on('equipment');
                $table->foreign('profile_id', 'eq_conf_prof_asgn_prof')->references('id')->on('equipment_configuration_profiles');
                $table->foreign('assigned_by', 'eq_conf_prof_asgn_by')->references('id')->on('users');
                
                // Indexes
                $table->unique(['equipment_id', 'profile_id'], 'eq_conf_prof_asgn_uq');
                $table->index('is_active');
            });
        }

        if (!Schema::hasTable('equipment_configuration_dependencies')) {
            Schema::create('equipment_configuration_dependencies', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('configuration_type_id');
                $table->unsignedBigInteger('dependent_configuration_type_id');
                $table->enum('dependency_type', ['requires', 'conflicts_with', 'suggests', 'influences'])->comment('Types: requires, conflicts_with, suggests, influences');
                $table->json('condition')->nullable()->comment('Condition under which the dependency applies');
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Foreign keys with custom short names
                $table->foreign('configuration_type_id', 'eq_conf_dep_type')->references('id')->on('equipment_configuration_types');
                $table->foreign('dependent_configuration_type_id', 'eq_conf_dep_dep_type')->references('id')->on('equipment_configuration_types');
                
                // Indexes
                $table->unique(['configuration_type_id', 'dependent_configuration_type_id', 'dependency_type'], 'eq_conf_dep_type_uq');
                $table->index('is_active');
            });
        }

        if (!Schema::hasTable('equipment_configuration_validations')) {
            Schema::create('equipment_configuration_validations', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('equipment_id');
                $table->dateTime('validation_timestamp');
                $table->unsignedBigInteger('validated_by')->nullable();
                $table->enum('validation_type', ['manual', 'automatic', 'scheduled'])->comment('Types: manual, automatic, scheduled');
                $table->enum('status', ['passed', 'failed', 'warning', 'incomplete'])->comment('Statuses: passed, failed, warning, incomplete');
                $table->text('validation_notes')->nullable();
                $table->json('validation_results')->nullable()->comment('Detailed results of validation checks');
                $table->timestamps();
                
                // Foreign keys with custom short names
                $table->foreign('equipment_id', 'eq_conf_val_eq')->references('id')->on('equipment');
                $table->foreign('validated_by', 'eq_conf_val_val_by')->references('id')->on('users');
                
                // Indexes
                $table->index(['equipment_id', 'validation_timestamp'], 'eq_conf_val_eq_time');
                $table->index(['validation_type', 'status']);
            });
        }

        if (!Schema::hasTable('equipment_configuration_validation_issues')) {
            Schema::create('equipment_configuration_validation_issues', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('validation_id');
                $table->unsignedBigInteger('configuration_type_id')->nullable();
                $table->enum('issue_type', ['missing', 'invalid', 'conflict', 'deprecated', 'security', 'performance', 'other'])->comment('Types: missing, invalid, conflict, deprecated, security, performance, other');
                $table->enum('severity', ['critical', 'high', 'medium', 'low', 'info'])->comment('Severities: critical, high, medium, low, info');
                $table->text('issue_description');
                $table->text('recommended_action')->nullable();
                $table->boolean('is_resolved')->default(false);
                $table->dateTime('resolved_at')->nullable();
                $table->unsignedBigInteger('resolved_by')->nullable();
                $table->text('resolution_notes')->nullable();
                $table->timestamps();
                
                // Foreign keys with custom short names
                $table->foreign('validation_id', 'eq_conf_val_iss_val')->references('id')->on('equipment_configuration_validations');
                $table->foreign('configuration_type_id', 'eq_conf_val_iss_type')->references('id')->on('equipment_configuration_types');
                $table->foreign('resolved_by', 'eq_conf_val_iss_res_by')->references('id')->on('users');
                
                // Indexes
                $table->index(['validation_id', 'severity'], 'eq_conf_val_iss_sev');
                $table->index(['issue_type', 'is_resolved'], 'eq_conf_val_iss_type_res');
            });
        }

        if (!Schema::hasTable('equipment_configuration_backups')) {
            Schema::create('equipment_configuration_backups', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('equipment_id');
                $table->string('backup_name');
                $table->text('description')->nullable();
                $table->dateTime('backup_timestamp');
                $table->unsignedBigInteger('created_by');
                $table->enum('backup_type', ['manual', 'automatic', 'pre_update', 'scheduled'])->comment('Types: manual, automatic, pre_update, scheduled');
                $table->string('storage_location');
                $table->string('file_path');
                $table->string('file_size')->nullable();
                $table->string('file_hash')->nullable()->comment('For integrity verification');
                $table->json('included_configurations')->nullable()->comment('List of configuration types included');
                $table->boolean('is_encrypted')->default(false);
                $table->string('encryption_method')->nullable();
                $table->boolean('is_compressed')->default(false);
                $table->string('compression_method')->nullable();
                $table->timestamps();
                
                // Foreign keys with custom short names
                $table->foreign('equipment_id', 'eq_conf_bkp_eq')->references('id')->on('equipment');
                $table->foreign('created_by', 'eq_conf_bkp_cr_by')->references('id')->on('users');
                
                // Indexes
                $table->index(['equipment_id', 'backup_timestamp'], 'eq_conf_bkp_eq_time');
                $table->index('backup_type');
            });
        }

        if (!Schema::hasTable('equipment_configuration_restores')) {
            Schema::create('equipment_configuration_restores', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('equipment_id');
                $table->unsignedBigInteger('backup_id')->nullable();
                $table->dateTime('restore_timestamp');
                $table->unsignedBigInteger('performed_by');
                $table->enum('status', ['pending', 'in_progress', 'completed', 'failed', 'cancelled'])->comment('Statuses: pending, in_progress, completed, failed, cancelled');
                $table->text('restore_notes')->nullable();
                $table->json('restore_details')->nullable()->comment('Details about what was restored');
                $table->json('issues_encountered')->nullable();
                $table->boolean('pre_restore_backup_created')->default(false);
                $table->unsignedBigInteger('pre_restore_backup_id')->nullable();
                $table->timestamps();
                
                // Foreign keys with custom short names
                $table->foreign('equipment_id', 'eq_conf_rest_eq')->references('id')->on('equipment');
                $table->foreign('backup_id', 'eq_conf_rest_bkp')->references('id')->on('equipment_configuration_backups');
                $table->foreign('performed_by', 'eq_conf_rest_perf_by')->references('id')->on('users');
                $table->foreign('pre_restore_backup_id', 'eq_conf_rest_pre_bkp')->references('id')->on('equipment_configuration_backups');
                
                // Indexes
                $table->index(['equipment_id', 'restore_timestamp'], 'eq_conf_rest_eq_time');
                $table->index(['backup_id', 'status'], 'eq_conf_rest_bkp_stat');
            });
        }

        if (!Schema::hasTable('equipment_configuration_comparisons')) {
            Schema::create('equipment_configuration_comparisons', function (Blueprint $table) {
                $table->id();
                $table->string('comparison_name');
                $table->text('description')->nullable();
                $table->dateTime('comparison_timestamp');
                $table->unsignedBigInteger('performed_by');
                $table->enum('comparison_type', [
                    'equipment_to_equipment', 
                    'equipment_to_backup', 
                    'equipment_to_profile', 
                    'backup_to_backup', 
                    'profile_to_profile'
                ])->comment('Types: equipment_to_equipment, equipment_to_backup, equipment_to_profile, backup_to_backup, profile_to_profile');
                $table->unsignedBigInteger('source_equipment_id')->nullable();
                $table->unsignedBigInteger('target_equipment_id')->nullable();
                $table->unsignedBigInteger('source_backup_id')->nullable();
                $table->unsignedBigInteger('target_backup_id')->nullable();
                $table->unsignedBigInteger('source_profile_id')->nullable();
                $table->unsignedBigInteger('target_profile_id')->nullable();
                $table->json('comparison_results')->comment('Detailed results of the comparison');
                $table->integer('total_configurations_compared')->nullable();
                $table->integer('matching_configurations')->nullable();
                $table->integer('differing_configurations')->nullable();
                $table->integer('missing_configurations')->nullable();
                $table->timestamps();
                
                // Foreign keys with custom short names
                $table->foreign('performed_by', 'eq_conf_comp_perf_by')->references('id')->on('users');
                $table->foreign('source_equipment_id', 'eq_conf_comp_src_eq')->references('id')->on('equipment');
                $table->foreign('target_equipment_id', 'eq_conf_comp_tgt_eq')->references('id')->on('equipment');
                $table->foreign('source_backup_id', 'eq_conf_comp_src_bkp')->references('id')->on('equipment_configuration_backups');
                $table->foreign('target_backup_id', 'eq_conf_comp_tgt_bkp')->references('id')->on('equipment_configuration_backups');
                $table->foreign('source_profile_id', 'eq_conf_comp_src_prof')->references('id')->on('equipment_configuration_profiles');
                $table->foreign('target_profile_id', 'eq_conf_comp_tgt_prof')->references('id')->on('equipment_configuration_profiles');
                
                // Indexes
                $table->index('comparison_timestamp');
                $table->index('comparison_type');
            });
        }

        if (!Schema::hasTable('equipment_configuration_deployments')) {
            Schema::create('equipment_configuration_deployments', function (Blueprint $table) {
                $table->id();
                $table->string('deployment_name');
                $table->text('description')->nullable();
                $table->unsignedBigInteger('created_by');
                $table->enum('status', ['draft', 'scheduled', 'in_progress', 'completed', 'failed', 'cancelled'])->comment('Statuses: draft, scheduled, in_progress, completed, failed, cancelled');
                $table->dateTime('scheduled_at')->nullable();
                $table->dateTime('started_at')->nullable();
                $table->dateTime('completed_at')->nullable();
                $table->unsignedBigInteger('source_profile_id')->nullable();
                $table->unsignedBigInteger('source_equipment_id')->nullable();
                $table->unsignedBigInteger('source_backup_id')->nullable();
                $table->json('configuration_values')->nullable()->comment('Custom configuration values for this deployment');
                $table->boolean('create_backup_before_deploy')->default(true);
                $table->boolean('rollback_on_failure')->default(true);
                $table->text('deployment_notes')->nullable();
                $table->timestamps();
                
                // Foreign keys with custom short names
                $table->foreign('created_by', 'eq_conf_deploy_cr_by')->references('id')->on('users');
                $table->foreign('source_profile_id', 'eq_conf_deploy_src_prof')->references('id')->on('equipment_configuration_profiles');
                $table->foreign('source_equipment_id', 'eq_conf_deploy_src_eq')->references('id')->on('equipment');
                $table->foreign('source_backup_id', 'eq_conf_deploy_src_bkp')->references('id')->on('equipment_configuration_backups');
                
                // Indexes
                $table->index(['status', 'scheduled_at'], 'eq_conf_deploy_stat_sch');
            });
        }

        if (!Schema::hasTable('eq_config_deploy_targets')) {
            Schema::create('eq_config_deploy_targets', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('deployment_id');
                $table->unsignedBigInteger('equipment_id');
                $table->enum('status', ['pending', 'in_progress', 'succeeded', 'failed', 'skipped', 'rolled_back'])->comment('Statuses: pending, in_progress, succeeded, failed, skipped, rolled_back');
                $table->dateTime('started_at')->nullable();
                $table->dateTime('completed_at')->nullable();
                $table->unsignedBigInteger('pre_deployment_backup_id')->nullable();
                $table->text('deployment_notes')->nullable();
                $table->json('deployment_results')->nullable();
                $table->json('errors')->nullable();
                $table->boolean('was_rolled_back')->default(false);
                $table->dateTime('rolled_back_at')->nullable();
                $table->timestamps();
                
                // Foreign keys with custom short names
                $table->foreign('deployment_id', 'eq_conf_dep_tgt_dep')->references('id')->on('equipment_configuration_deployments');
                $table->foreign('equipment_id', 'eq_conf_dep_tgt_eq')->references('id')->on('equipment');
                $table->foreign('pre_deployment_backup_id', 'eq_conf_dep_tgt_pre_bkp')->references('id')->on('equipment_configuration_backups');
                
                // Indexes
                $table->unique(['deployment_id', 'equipment_id'], 'eq_conf_dep_tgt_dep_eq');
                $table->index('status');
            });
        }

        if (!Schema::hasTable('equipment_configuration_baselines')) {
            Schema::create('equipment_configuration_baselines', function (Blueprint $table) {
                $table->id();
                $table->string('baseline_name');
                $table->text('description')->nullable();
                $table->unsignedBigInteger('created_by');
                $table->dateTime('baseline_timestamp');
                $table->enum('baseline_type', ['golden', 'approved', 'reference', 'custom'])->comment('Types: golden, approved, reference, custom');
                $table->unsignedBigInteger('equipment_model_id')->nullable();
                $table->unsignedBigInteger('equipment_id')->nullable();
                $table->unsignedBigInteger('profile_id')->nullable();
                $table->json('configuration_values')->comment('The actual baseline configuration values');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Foreign keys with custom short names
                $table->foreign('created_by', 'eq_conf_base_cr_by')->references('id')->on('users');
                $table->foreign('equipment_model_id', 'eq_conf_base_model')->references('id')->on('equipment_models');
                $table->foreign('equipment_id', 'eq_conf_base_eq')->references('id')->on('equipment');
                $table->foreign('profile_id', 'eq_conf_base_prof')->references('id')->on('equipment_configuration_profiles');
                
                // Indexes
                $table->index(['baseline_type', 'is_active'], 'eq_conf_base_type_act');
                $table->index('equipment_model_id');
            });
        }

        if (!Schema::hasTable('equipment_configuration_compliance_checks')) {
            Schema::create('equipment_configuration_compliance_checks', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('equipment_id');
                $table->unsignedBigInteger('baseline_id')->nullable();
                $table->unsignedBigInteger('profile_id')->nullable();
                $table->dateTime('check_timestamp');
                $table->unsignedBigInteger('performed_by')->nullable();
                $table->enum('check_type', ['manual', 'automatic', 'scheduled'])->comment('Types: manual, automatic, scheduled');
                $table->enum('status', ['compliant', 'non_compliant', 'partially_compliant', 'error'])->comment('Statuses: compliant, non_compliant, partially_compliant, error');
                $table->float('compliance_percentage')->nullable();
                $table->integer('total_checks')->nullable();
                $table->integer('passed_checks')->nullable();
                $table->integer('failed_checks')->nullable();
                $table->json('check_results')->nullable()->comment('Detailed results of compliance checks');
                $table->timestamps();
                
                // Foreign keys with custom short names
                $table->foreign('equipment_id', 'eq_conf_comp_eq')->references('id')->on('equipment');
                $table->foreign('baseline_id', 'eq_conf_comp_base')->references('id')->on('equipment_configuration_baselines');
                $table->foreign('profile_id', 'eq_conf_comp_prof')->references('id')->on('equipment_configuration_profiles');
                $table->foreign('performed_by', 'eq_conf_comp_perf')->references('id')->on('users');
                
                // Indexes
                $table->index(['equipment_id', 'check_timestamp'], 'eq_conf_comp_eq_check');
                $table->index(['baseline_id', 'status'], 'eq_conf_comp_base_stat');
            });
        }

        if (!Schema::hasTable('equipment_configuration_drift_detections')) {
            Schema::create('equipment_configuration_drift_detections', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('equipment_id');
                $table->dateTime('detection_timestamp');
                $table->enum('detection_type', ['scheduled', 'manual', 'event_triggered'])->comment('Types: scheduled, manual, event_triggered');
                $table->unsignedBigInteger('baseline_id')->nullable();
                $table->unsignedBigInteger('profile_id')->nullable();
                $table->unsignedBigInteger('previous_backup_id')->nullable();
                $table->boolean('drift_detected')->default(false);
                $table->integer('total_configurations_checked')->nullable();
                $table->integer('drifted_configurations')->nullable();
                $table->json('drift_details')->nullable()->comment('Details of detected configuration drifts');
                $table->timestamps();
                
                // Foreign keys with custom short names
                $table->foreign('equipment_id', 'eq_conf_drift_eq')->references('id')->on('equipment');
                $table->foreign('baseline_id', 'eq_conf_drift_base')->references('id')->on('equipment_configuration_baselines');
                $table->foreign('profile_id', 'eq_conf_drift_prof')->references('id')->on('equipment_configuration_profiles');
                $table->foreign('previous_backup_id', 'eq_conf_drift_prev_bkp')->references('id')->on('equipment_configuration_backups');
                
                // Indexes
                $table->index(['equipment_id', 'detection_timestamp'], 'eq_conf_drift_eq_time');
                $table->index('drift_detected');
            });
        }

        // Add configuration fields to equipment table
        Schema::table('equipment', function (Blueprint $table) {
            // Configuration status
            $table->boolean('has_custom_configuration')->default(false);
            $table->dateTime('configuration_last_updated')->nullable();
            $table->unsignedBigInteger('configuration_last_updated_by')->nullable();
            
            // Configuration validation
            $table->boolean('configuration_validated')->default(false);
            $table->dateTime('last_configuration_validation')->nullable();
            $table->enum('configuration_validation_status', ['passed', 'failed', 'warning', 'not_validated'])->default('not_validated')->comment('Statuses: passed, failed, warning, not_validated');
            
            // Configuration compliance
            $table->boolean('is_configuration_compliant')->default(false);
            $table->dateTime('last_compliance_check')->nullable();
            $table->float('compliance_percentage')->nullable();
            
            // Configuration backup
            $table->dateTime('last_configuration_backup')->nullable();
            $table->unsignedBigInteger('last_backup_id')->nullable();
            
            // Foreign keys with custom short names
            $table->foreign('configuration_last_updated_by', 'eq_conf_last_up_by')->references('id')->on('users');
            $table->foreign('last_backup_id', 'eq_conf_last_bkp')->references('id')->on('equipment_configuration_backups');
            
            // Indexes
            $table->index('has_custom_configuration');
            $table->index(['configuration_validated', 'configuration_validation_status'], 'eq_conf_val_status');
            $table->index('is_configuration_compliant');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove configuration fields from equipment table
        Schema::table('equipment', function (Blueprint $table) {
            $table->dropForeign(['configuration_last_updated_by']);
            $table->dropForeign(['last_backup_id']);
            $table->dropColumn([
                'has_custom_configuration',
                'configuration_last_updated',
                'configuration_last_updated_by',
                'configuration_validated',
                'last_configuration_validation',
                'configuration_validation_status',
                'is_configuration_compliant',
                'last_compliance_check',
                'compliance_percentage',
                'last_configuration_backup',
                'last_backup_id'
            ]);
        });

        Schema::dropIfExists('equipment_configuration_drift_detections');
        Schema::dropIfExists('equipment_configuration_compliance_checks');
        Schema::dropIfExists('equipment_configuration_baselines');
        Schema::dropIfExists('eq_config_deploy_targets');
        Schema::dropIfExists('equipment_configuration_deployments');
        Schema::dropIfExists('equipment_configuration_comparisons');
        Schema::dropIfExists('equipment_configuration_restores');
        Schema::dropIfExists('equipment_configuration_backups');
        Schema::dropIfExists('equipment_configuration_validation_issues');
        Schema::dropIfExists('equipment_configuration_validations');
        Schema::dropIfExists('equipment_configuration_dependencies');
        Schema::dropIfExists('equipment_configuration_profile_assignments');
        Schema::dropIfExists('equipment_configuration_profile_values');
        Schema::dropIfExists('equipment_configuration_profiles');
        Schema::dropIfExists('equipment_configuration_template_items');
        Schema::dropIfExists('equipment_configuration_templates');
        Schema::dropIfExists('equipment_configuration_history');
        Schema::dropIfExists('equipment_configurations');
        Schema::dropIfExists('equipment_model_configurations');
        Schema::dropIfExists('equipment_configuration_type_categories');
        Schema::dropIfExists('equipment_configuration_categories');
        Schema::dropIfExists('equipment_configuration_types');
    }
};