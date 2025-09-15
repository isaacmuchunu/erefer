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
        if (!Schema::hasTable('equipment_maintenance_types')) {
            Schema::create('equipment_maintenance_types', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->enum('category', ['preventive', 'corrective', 'predictive', 'condition-based', 'emergency', 'regulatory', 'other']);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Indexes
                $table->index(['category', 'is_active'], 'eq_maint_type_cat_active_idx');
            });
        }

        if (!Schema::hasTable('equipment_maintenance_procedures')) {
            Schema::create('equipment_maintenance_procedures', function (Blueprint $table) {
                $table->id();
                $table->string('procedure_code')->unique();
                $table->string('name');
                $table->text('description')->nullable();
                $table->foreignId('maintenance_type_id')->constrained('equipment_maintenance_types');
                $table->text('instructions')->nullable();
                $table->text('safety_precautions')->nullable();
                $table->text('required_tools')->nullable();
                $table->text('required_parts')->nullable();
                $table->text('required_skills')->nullable();
                $table->integer('estimated_duration_minutes')->nullable();
                $table->integer('number_of_technicians_required')->default(1);
                $table->boolean('requires_shutdown')->default(false);
                $table->boolean('requires_calibration')->default(false);
                $table->boolean('requires_testing')->default(false);
                $table->boolean('is_active')->default(true);
                $table->foreignId('created_by')->constrained('users');
                $table->timestamps();
                
                // Indexes
                $table->index(['maintenance_type_id', 'is_active'], 'eq_maint_proc_type_active_idx');
                $table->index('requires_shutdown');
            });
        }

        if (!Schema::hasTable('equipment_maintenance_checklists')) {
            Schema::create('equipment_maintenance_checklists', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->foreignId('procedure_id')->constrained('equipment_maintenance_procedures');
                $table->json('checklist_items');
                $table->boolean('is_active')->default(true);
                $table->foreignId('created_by')->constrained('users');
                $table->timestamps();
                
                // Indexes
                $table->index(['procedure_id', 'is_active'], 'eq_maint_check_proc_active_idx');
            });
        }

        if (!Schema::hasTable('equipment_maintenance_schedules')) {
            Schema::create('equipment_maintenance_schedules', function (Blueprint $table) {
                $table->id();
                $table->foreignId('equipment_id')->constrained('equipment');
                $table->foreignId('procedure_id')->constrained('equipment_maintenance_procedures');
                $table->string('schedule_name')->nullable();
                $table->enum('frequency_type', [
                    'one-time', 'daily', 'weekly', 'bi-weekly', 'monthly', 
                    'quarterly', 'semi-annually', 'annually', 'custom', 
                    'meter-based', 'runtime-based', 'condition-based'
                ]);
                $table->integer('frequency_value')->nullable()->comment('Number of days/weeks/months or meter units');
                $table->json('custom_schedule')->nullable()->comment('For custom recurring schedules');
                $table->date('start_date');
                $table->date('end_date')->nullable();
                $table->time('preferred_time')->nullable();
                $table->integer('estimated_duration_minutes')->nullable();
                $table->decimal('meter_threshold', 10, 2)->nullable()->comment('For meter-based maintenance');
                $table->string('meter_unit')->nullable()->comment('Hours, miles, cycles, etc.');
                $table->integer('runtime_threshold_hours')->nullable()->comment('For runtime-based maintenance');
                $table->boolean('requires_shutdown')->default(false);
                $table->integer('advance_notice_days')->default(7)->comment('Days before to notify');
                $table->boolean('is_active')->default(true);
                $table->text('notes')->nullable();
                $table->foreignId('created_by')->constrained('users');
                $table->timestamps();
                
                // Indexes
                $table->index(['equipment_id', 'is_active'], 'eq_maint_sched_eq_active_idx');
                $table->index(['procedure_id', 'frequency_type'], 'eq_maint_sched_proc_freq_idx');
                $table->index(['start_date', 'end_date'], 'eq_maint_sched_dates_idx');
            });
        }

        if (!Schema::hasTable('equipment_maintenance_tasks')) {
            Schema::create('equipment_maintenance_tasks', function (Blueprint $table) {
                $table->id();
                $table->uuid('task_reference')->unique();
                $table->foreignId('equipment_id')->constrained('equipment');
                $table->foreignId('procedure_id')->constrained('equipment_maintenance_procedures');
                $table->foreignId('schedule_id')->nullable()->constrained('equipment_maintenance_schedules');
                $table->foreignId('checklist_id')->nullable()->constrained('equipment_maintenance_checklists');
                $table->string('task_name');
                $table->text('task_description')->nullable();
                $table->enum('task_type', ['scheduled', 'unscheduled', 'emergency', 'inspection', 'calibration', 'testing', 'other']);
                $table->enum('priority', ['low', 'medium', 'high', 'critical', 'emergency']);
                $table->date('due_date');
                $table->time('due_time')->nullable();
                $table->date('completion_date')->nullable();
                $table->time('completion_time')->nullable();
                $table->integer('estimated_duration_minutes')->nullable();
                $table->integer('actual_duration_minutes')->nullable();
                $table->enum('status', [
                    'pending', 'scheduled', 'in_progress', 'on_hold', 
                    'completed', 'cancelled', 'rescheduled', 'overdue'
                ]);
                $table->boolean('requires_shutdown')->default(false);
                $table->boolean('requires_parts')->default(false);
                $table->decimal('meter_reading_at_creation', 10, 2)->nullable();
                $table->decimal('meter_reading_at_completion', 10, 2)->nullable();
                $table->text('completion_notes')->nullable();
                $table->json('checklist_results')->nullable();
                $table->foreignId('assigned_department_id')->nullable()->constrained('departments');
                $table->foreignId('created_by')->constrained('users');
                $table->foreignId('assigned_to')->nullable()->constrained('users');
                $table->foreignId('completed_by')->nullable()->constrained('users');
                $table->timestamps();
                
                // Indexes
                $table->index(['equipment_id', 'due_date'], 'eq_maint_task_eq_date_idx');
                $table->index(['schedule_id', 'status'], 'eq_maint_task_sched_status_idx');
                $table->index(['assigned_to', 'status'], 'eq_maint_task_assgn_status_idx');
                $table->index(['task_type', 'priority'], 'eq_maint_task_type_prio_idx');
            });
        }

        if (!Schema::hasTable('equipment_maintenance_task_parts')) {
            Schema::create('equipment_maintenance_task_parts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('task_id')->constrained('equipment_maintenance_tasks');
                $table->foreignId('part_id')->constrained('equipment_parts');
                $table->decimal('quantity_required', 10, 2);
                $table->decimal('quantity_used', 10, 2)->default(0);
                $table->decimal('unit_cost', 15, 2)->nullable();
                $table->string('unit_of_measure')->default('each');
                $table->boolean('is_critical')->default(false);
                $table->enum('status', ['planned', 'requested', 'allocated', 'used', 'returned']);
                $table->text('notes')->nullable();
                $table->timestamps();
                
                // Indexes
                $table->index(['task_id', 'part_id'], 'eq_maint_task_part_ids_idx');
                $table->index('status');
            });
        }

        if (!Schema::hasTable('equipment_maintenance_labor')) {
            Schema::create('equipment_maintenance_labor', function (Blueprint $table) {
                $table->id();
                $table->foreignId('task_id')->constrained('equipment_maintenance_tasks');
                $table->foreignId('user_id')->constrained('users');
                $table->dateTime('start_time');
                $table->dateTime('end_time')->nullable();
                $table->integer('duration_minutes')->nullable();
                $table->enum('labor_type', ['inspection', 'diagnosis', 'repair', 'testing', 'other']);
                $table->text('work_performed')->nullable();
                $table->decimal('labor_cost', 15, 2)->nullable();
                $table->timestamps();
                
                // Indexes
                $table->index(['task_id', 'user_id'], 'eq_maint_labor_task_user_idx');
                $table->index('labor_type');
            });
        }

        if (!Schema::hasTable('equipment_maintenance_logs')) {
    Schema::create('equipment_maintenance_logs', function (Blueprint $table) {
        $table->id();
        $table->foreignId('equipment_id')->constrained('equipment');
        $table->foreignId('task_id')->nullable()->constrained('equipment_maintenance_tasks');
        $table->date('log_date');
        $table->time('log_time')->nullable();
        $table->string('log_type');
        $table->text('description');
        $table->text('actions_taken')->nullable();
        $table->text('results')->nullable();
        $table->decimal('meter_reading', 10, 2)->nullable();
        $table->string('meter_unit')->nullable();
        $table->foreignId('performed_by')->constrained('users');
        $table->timestamps();
        
        // Indexes
        $table->index(['equipment_id', 'log_date'], 'eq_maint_log_eq_date_idx');
        $table->index('task_id');
        $table->index('log_type');
    });
}

        if (!Schema::hasTable('equipment_service_providers')) {
            Schema::create('equipment_service_providers', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('provider_type');
                $table->string('contact_person')->nullable();
                $table->string('contact_email')->nullable();
                $table->string('contact_phone')->nullable();
                $table->text('address')->nullable();
                $table->string('website')->nullable();
                $table->text('service_areas')->nullable();
                $table->text('specializations')->nullable();
                $table->boolean('is_under_contract')->default(false);
                $table->text('contract_details')->nullable();
                $table->date('contract_start_date')->nullable();
                $table->date('contract_end_date')->nullable();
                $table->decimal('hourly_rate', 10, 2)->nullable();
                $table->text('notes')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Indexes
                $table->index(['provider_type', 'is_active'], 'eq_serv_prov_type_active_idx');
                $table->index(['is_under_contract', 'contract_end_date'], 'eq_serv_prov_contract_date_idx');
            });
        }

        if (!Schema::hasTable('equipment_service_contracts')) {
            Schema::create('equipment_service_contracts', function (Blueprint $table) {
                $table->id();
                $table->string('contract_number')->unique();
                $table->foreignId('service_provider_id')->constrained('equipment_service_providers');
                $table->string('contract_type');
                $table->text('description')->nullable();
                $table->date('start_date');
                $table->date('end_date');
                $table->decimal('contract_value', 15, 2);
                $table->string('currency', 3)->default('USD');
                $table->enum('billing_frequency', ['monthly', 'quarterly', 'semi_annually', 'annually', 'one_time']);
                $table->decimal('billing_amount', 15, 2);
                $table->text('coverage_details')->nullable();
                $table->text('exclusions')->nullable();
                $table->text('response_time_sla')->nullable();
                $table->text('resolution_time_sla')->nullable();
                $table->boolean('includes_parts')->default(false);
                $table->boolean('includes_labor')->default(true);
                $table->text('renewal_terms')->nullable();
                $table->text('termination_terms')->nullable();
                $table->enum('status', ['draft', 'active', 'expired', 'terminated', 'renewed']);
                $table->foreignId('department_id')->nullable()->constrained('departments');
                $table->foreignId('cost_center_id')->nullable()->constrained('equipment_cost_centers');
                $table->foreignId('created_by')->constrained('users');
                $table->timestamps();
                
                // Indexes
                $table->index(['service_provider_id', 'status'], 'eq_serv_cont_prov_status_idx');
                $table->index(['start_date', 'end_date'], 'eq_service_contract_dates_idx');
            });
        }

        if (!Schema::hasTable('equipment_service_contract_items')) {
            Schema::create('equipment_service_contract_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('contract_id')->constrained('equipment_service_contracts');
                $table->foreignId('equipment_id')->constrained('equipment');
                $table->text('coverage_details')->nullable();
                $table->decimal('item_value', 15, 2)->nullable();
                $table->date('coverage_start_date')->nullable();
                $table->date('coverage_end_date')->nullable();
                $table->text('special_terms')->nullable();
                $table->enum('status', ['active', 'pending', 'expired', 'removed']);
                $table->timestamps();
                
                // Indexes
                $table->index(['contract_id', 'equipment_id'], 'eq_contract_item_ids_idx');
                $table->index(['coverage_start_date', 'coverage_end_date'], 'eq_coverage_dates_idx');
                $table->index('status');
            });
        }

        if (!Schema::hasTable('equipment_service_requests')) {
            Schema::create('equipment_service_requests', function (Blueprint $table) {
                $table->id();
                $table->uuid('request_reference')->unique();
                $table->foreignId('equipment_id')->constrained('equipment');
                $table->string('request_title');
                $table->text('request_description');
                $table->enum('request_type', [
                    'repair', 'maintenance', 'inspection', 'installation', 
                    'calibration', 'upgrade', 'consultation', 'other'
                ]);
                $table->enum('priority', ['low', 'medium', 'high', 'critical', 'emergency']);
                $table->enum('status', [
                    'submitted', 'under_review', 'approved', 'scheduled', 
                    'in_progress', 'on_hold', 'completed', 'cancelled', 'rejected'
                ]);
                $table->date('requested_date');
                $table->date('preferred_service_date')->nullable();
                $table->time('preferred_service_time')->nullable();
                $table->date('scheduled_date')->nullable();
                $table->time('scheduled_time')->nullable();
                $table->date('completion_date')->nullable();
                $table->time('completion_time')->nullable();
                $table->foreignId('service_provider_id')->nullable()->constrained('equipment_service_providers');
                $table->foreignId('contract_id')->nullable()->constrained('equipment_service_contracts');
                $table->foreignId('task_id')->nullable()->constrained('equipment_maintenance_tasks');
                $table->boolean('is_under_warranty')->default(false);
                $table->boolean('is_under_contract')->default(false);
                $table->boolean('requires_quote')->default(false);
                $table->decimal('estimated_cost', 15, 2)->nullable();
                $table->decimal('actual_cost', 15, 2)->nullable();
                $table->string('currency', 3)->default('USD');
                $table->text('service_notes')->nullable();
                $table->text('completion_notes')->nullable();
                $table->foreignId('requested_by')->constrained('users');
                $table->foreignId('approved_by')->nullable()->constrained('users');
                $table->foreignId('assigned_to')->nullable()->constrained('users');
                $table->foreignId('completed_by')->nullable()->constrained('users');
                $table->timestamps();
                
                // Indexes
                $table->index(['equipment_id', 'status'], 'eq_serv_req_eq_status_idx');
                $table->index(['service_provider_id', 'scheduled_date'], 'eq_serv_req_prov_date_idx');
                $table->index(['request_type', 'priority'], 'eq_serv_req_type_priority_idx');
                $table->index(['is_under_warranty', 'is_under_contract'], 'eq_serv_req_warranty_contract_idx');
            });
        }

        if (!Schema::hasTable('equipment_service_visits')) {
            Schema::create('equipment_service_visits', function (Blueprint $table) {
                $table->id();
                $table->foreignId('service_request_id')->nullable()->constrained('equipment_service_requests');
                $table->foreignId('equipment_id')->constrained('equipment');
                $table->foreignId('service_provider_id')->nullable()->constrained('equipment_service_providers');
                $table->foreignId('contract_id')->nullable()->constrained('equipment_service_contracts');
                $table->foreignId('task_id')->nullable()->constrained('equipment_maintenance_tasks');
                $table->date('visit_date');
                $table->time('start_time')->nullable();
                $table->time('end_time')->nullable();
                $table->integer('duration_minutes')->nullable();
                $table->enum('visit_type', [
                    'inspection', 'maintenance', 'repair', 'installation', 
                    'calibration', 'testing', 'training', 'consultation', 'other'
                ]);
                $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_show']);
                $table->text('work_performed')->nullable();
                $table->text('findings')->nullable();
                $table->text('recommendations')->nullable();
                $table->decimal('service_cost', 15, 2)->nullable();
                $table->decimal('parts_cost', 15, 2)->nullable();
                $table->decimal('total_cost', 15, 2)->nullable();
                $table->string('currency', 3)->default('USD');
                $table->string('invoice_number')->nullable();
                $table->boolean('is_billable')->default(true);
                $table->boolean('is_warranty_service')->default(false);
                $table->boolean('is_contract_service')->default(false);
                $table->foreignId('technician_id')->nullable()->constrained('users');
                $table->string('technician_name')->nullable()->comment('For external technicians');
                $table->string('technician_contact')->nullable();
                $table->foreignId('created_by')->constrained('users');
                $table->timestamps();
                
                // Indexes
                $table->index(['equipment_id', 'visit_date'], 'eq_serv_visit_eq_date_idx');
                $table->index(['service_request_id', 'status'], 'eq_serv_visit_req_status_idx');
                $table->index(['service_provider_id', 'visit_type'], 'eq_serv_visit_prov_type_idx');
                $table->index(['is_warranty_service', 'is_contract_service'], 'eq_serv_visit_warranty_contract_idx');
            });
        }

        if (!Schema::hasTable('equipment_service_visit_parts')) {
            Schema::create('equipment_service_visit_parts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('visit_id')->constrained('equipment_service_visits');
                $table->foreignId('part_id')->nullable()->constrained('equipment_parts');
                $table->string('part_name');
                $table->string('part_number')->nullable();
                $table->decimal('quantity', 10, 2);
                $table->string('unit_of_measure')->default('each');
                $table->decimal('unit_cost', 15, 2)->nullable();
                $table->decimal('total_cost', 15, 2)->nullable();
                $table->boolean('is_billable')->default(true);
                $table->boolean('is_covered_by_warranty')->default(false);
                $table->boolean('is_covered_by_contract')->default(false);
                $table->timestamps();
                
                // Indexes
                $table->index(['visit_id', 'part_id'], 'eq_serv_visit_part_ids_idx');
                $table->index(['is_covered_by_warranty', 'is_covered_by_contract'], 'eq_serv_part_coverage_idx');
            });
        }

        if (!Schema::hasTable('equipment_service_visit_labor')) {
            Schema::create('equipment_service_visit_labor', function (Blueprint $table) {
                $table->id();
                $table->foreignId('visit_id')->constrained('equipment_service_visits');
                $table->string('labor_description');
                $table->decimal('hours', 5, 2);
                $table->decimal('hourly_rate', 10, 2)->nullable();
                $table->decimal('total_cost', 15, 2)->nullable();
                $table->boolean('is_billable')->default(true);
                $table->boolean('is_covered_by_warranty')->default(false);
                $table->boolean('is_covered_by_contract')->default(false);
                $table->timestamps();
                
                // Indexes
                $table->index('visit_id');
                $table->index(['is_covered_by_warranty', 'is_covered_by_contract'], 'eq_serv_labor_warr_cont_idx');
            });
        }

        if (!Schema::hasTable('equipment_downtime_records')) {
            Schema::create('equipment_downtime_records', function (Blueprint $table) {
                $table->id();
                $table->foreignId('equipment_id')->constrained('equipment');
                $table->foreignId('task_id')->nullable()->constrained('equipment_maintenance_tasks');
                $table->foreignId('service_request_id')->nullable()->constrained('equipment_service_requests');
                $table->dateTime('start_time');
                $table->dateTime('end_time')->nullable();
                $table->integer('duration_minutes')->nullable();
                $table->enum('downtime_type', [
                    'scheduled_maintenance', 'unscheduled_maintenance', 'breakdown', 
                    'repair', 'calibration', 'inspection', 'idle', 'power_outage', 
                    'operator_unavailable', 'material_shortage', 'setup_changeover', 'other'
                ]);
                $table->enum('impact_level', ['none', 'low', 'medium', 'high', 'critical']);
                $table->boolean('is_planned')->default(false);
                $table->text('reason')->nullable();
                $table->text('resolution')->nullable();
                $table->decimal('production_loss', 15, 2)->nullable();
                $table->decimal('estimated_cost', 15, 2)->nullable();
                $table->string('currency', 3)->default('USD');
                $table->foreignId('reported_by')->constrained('users');
                $table->foreignId('resolved_by')->nullable()->constrained('users');
                $table->timestamps();
                
                // Indexes
                $table->index(['equipment_id', 'start_time', 'end_time'], 'eq_downtime_eq_timespan_idx');
                $table->index(['downtime_type', 'is_planned'], 'eq_downtime_type_planned_idx');
                $table->index('impact_level');
            });
        }

        if (!Schema::hasTable('equipment_meter_readings')) {
            Schema::create('equipment_meter_readings', function (Blueprint $table) {
                $table->id();
                $table->foreignId('equipment_id')->constrained('equipment');
                $table->string('meter_name');
                $table->string('meter_type');
                $table->decimal('reading_value', 15, 2);
                $table->string('unit_of_measure');
                $table->dateTime('reading_date');
                $table->decimal('previous_reading', 15, 2)->nullable();
                $table->dateTime('previous_reading_date')->nullable();
                $table->decimal('daily_average', 10, 2)->nullable();
                $table->decimal('monthly_average', 10, 2)->nullable();
                $table->boolean('is_reset')->default(false);
                $table->text('notes')->nullable();
                $table->foreignId('recorded_by')->constrained('users');
                $table->timestamps();
                
                // Indexes
                $table->index(['equipment_id', 'meter_name', 'reading_date'], 'eq_meter_eq_name_date_idx');
                $table->index(['meter_type', 'is_reset'], 'eq_meter_type_reset_idx');
            });
        }

        if (!Schema::hasTable('equipment_condition_monitoring')) {
            Schema::create('equipment_condition_monitoring', function (Blueprint $table) {
                $table->id();
                $table->foreignId('equipment_id')->constrained('equipment');
                $table->string('monitoring_point');
                $table->string('measurement_type');
                $table->decimal('measurement_value', 15, 5);
                $table->string('unit_of_measure');
                $table->dateTime('measurement_date');
                $table->decimal('min_acceptable', 15, 5)->nullable();
                $table->decimal('max_acceptable', 15, 5)->nullable();
                $table->decimal('target_value', 15, 5)->nullable();
                $table->enum('condition_status', ['normal', 'warning', 'alert', 'critical', 'unknown']);
                $table->text('notes')->nullable();
                $table->foreignId('recorded_by')->constrained('users');
                $table->timestamps();
                
                // Indexes
                $table->index(['equipment_id', 'monitoring_point', 'measurement_date'], 'eq_cond_mon_eq_point_date_idx');
                $table->index(['measurement_type', 'condition_status'], 'eq_cond_mon_type_status_idx');
            });
        }

        if (!Schema::hasTable('equipment_maintenance_forecasts')) {
            Schema::create('equipment_maintenance_forecasts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('equipment_id')->constrained('equipment');
                $table->foreignId('procedure_id')->nullable()->constrained('equipment_maintenance_procedures');
                $table->date('forecast_date');
                $table->enum('forecast_type', ['scheduled', 'predicted', 'recommended']);
                $table->text('forecast_reason')->nullable();
                $table->decimal('confidence_level', 5, 2)->nullable()->comment('For predictive maintenance');
                $table->text('data_sources')->nullable();
                $table->decimal('estimated_cost', 15, 2)->nullable();
                $table->string('currency', 3)->default('USD');
                $table->integer('estimated_downtime_minutes')->nullable();
                $table->text('notes')->nullable();
                $table->foreignId('created_by')->constrained('users');
                $table->timestamps();
                
                // Indexes
                $table->index(['equipment_id', 'forecast_date'], 'eq_maint_fcst_eq_date_idx');
                $table->index(['procedure_id', 'forecast_type'], 'eq_maint_fcst_proc_type_idx');
            });
        }

        if (!Schema::hasTable('equipment_maintenance_kpis')) {
            Schema::create('equipment_maintenance_kpis', function (Blueprint $table) {
                $table->id();
                $table->foreignId('equipment_id')->nullable()->constrained('equipment');
                $table->foreignId('department_id')->nullable()->constrained('departments');
                $table->string('kpi_name');
                $table->string('kpi_type');
                $table->date('period_start');
                $table->date('period_end');
                $table->decimal('kpi_value', 15, 5);
                $table->string('unit_of_measure')->nullable();
                $table->decimal('target_value', 15, 5)->nullable();
                $table->decimal('previous_value', 15, 5)->nullable();
                $table->decimal('variance_percentage', 8, 2)->nullable();
                $table->enum('performance_indicator', ['excellent', 'good', 'average', 'poor', 'critical']);
                $table->text('notes')->nullable();
                $table->foreignId('calculated_by')->constrained('users');
                $table->timestamps();
                
                // Indexes
                $table->index(['equipment_id', 'kpi_type', 'period_start', 'period_end'], 'eq_maint_kpi_eq_type_period_idx');
                $table->index(['department_id', 'kpi_name'], 'eq_maint_kpi_dept_name_idx');
                $table->index('performance_indicator');
            });
        }

        // Add maintenance fields to equipment table
        Schema::table('equipment', function (Blueprint $table) {
            if (!Schema::hasColumn('equipment', 'maintenance_status')) {
                $table->enum('maintenance_status', [
                    'operational', 'scheduled_maintenance', 'under_maintenance', 
                    'awaiting_parts', 'under_repair', 'out_of_service', 'standby'
                ])->default('operational');
            }
            if (!Schema::hasColumn('equipment', 'last_maintenance_date')) {
                $table->date('last_maintenance_date')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'next_maintenance_date')) {
                $table->date('next_maintenance_date')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'maintenance_frequency_days')) {
                $table->integer('maintenance_frequency_days')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'total_runtime_hours')) {
                $table->integer('total_runtime_hours')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'runtime_last_reset')) {
                $table->date('runtime_last_reset')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'mtbf_hours')) {
                $table->decimal('mtbf_hours', 10, 2)->nullable()->comment('Mean Time Between Failures');
            }
            if (!Schema::hasColumn('equipment', 'mttr_hours')) {
                $table->decimal('mttr_hours', 10, 2)->nullable()->comment('Mean Time To Repair');
            }
            if (!Schema::hasColumn('equipment', 'availability_percentage')) {
                $table->decimal('availability_percentage', 5, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'maintenance_cost_ytd')) {
                $table->decimal('maintenance_cost_ytd', 15, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'repair_cost_ytd')) {
                $table->decimal('repair_cost_ytd', 15, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'primary_service_provider_id')) {
                $table->foreignId('primary_service_provider_id')->nullable()->constrained('equipment_service_providers');
            }
            if (!Schema::hasColumn('equipment', 'service_contract_id')) {
                $table->foreignId('service_contract_id')->nullable()->constrained('equipment_service_contracts');
            }
            // Indexes
            $table->index('maintenance_status');
            $table->index(['last_maintenance_date', 'next_maintenance_date'], 'eq_last_next_maint_date_idx');
            $table->index(['primary_service_provider_id', 'service_contract_id'], 'eq_prim_prov_contract_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove maintenance fields from equipment table
        Schema::table('equipment', function (Blueprint $table) {
            $table->dropColumn([
                'maintenance_status',
                'last_maintenance_date',
                'next_maintenance_date',
                'maintenance_frequency_days',
                'total_runtime_hours',
                'runtime_last_reset',
                'mtbf_hours',
                'mttr_hours',
                'availability_percentage',
                'maintenance_cost_ytd',
                'repair_cost_ytd',
                'primary_service_provider_id',
                'service_contract_id'
            ]);
        });

        Schema::dropIfExists('equipment_maintenance_kpis');
        Schema::dropIfExists('equipment_maintenance_forecasts');
        Schema::dropIfExists('equipment_condition_monitoring');
        Schema::dropIfExists('equipment_meter_readings');
        Schema::dropIfExists('equipment_downtime_records');
        Schema::dropIfExists('equipment_service_visit_labor');
        Schema::dropIfExists('equipment_service_visit_parts');
        Schema::dropIfExists('equipment_service_visits');
        Schema::dropIfExists('equipment_service_requests');
        Schema::dropIfExists('equipment_service_contract_items');
        Schema::dropIfExists('equipment_service_contracts');
        Schema::dropIfExists('equipment_service_providers');
        Schema::dropIfExists('equipment_maintenance_logs');
        Schema::dropIfExists('equipment_maintenance_labor');
        Schema::dropIfExists('equipment_maintenance_task_parts');
        Schema::dropIfExists('equipment_maintenance_tasks');
        Schema::dropIfExists('equipment_maintenance_schedules');
        Schema::dropIfExists('equipment_maintenance_checklists');
        Schema::dropIfExists('equipment_maintenance_procedures');
        Schema::dropIfExists('equipment_maintenance_types');
    }
};