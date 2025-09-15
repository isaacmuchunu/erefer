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
        if (!Schema::hasTable('equipment_metrics')) {
            Schema::create('equipment_metrics', function (Blueprint $table) {
                $table->id();
                $table->string('metric_name');
                $table->string('display_name');
                $table->text('description')->nullable();
                $table->enum('metric_type', ['utilization', 'performance', 'maintenance', 'financial', 'compliance', 'safety', 'custom']);
                $table->string('unit_of_measure')->nullable();
                $table->string('calculation_method')->nullable()->comment('Formula or method used to calculate this metric');
                $table->json('calculation_parameters')->nullable();
                $table->string('data_source')->nullable()->comment('Where the raw data comes from');
                $table->string('frequency')->nullable()->comment('How often this metric is calculated');
                $table->json('benchmark_values')->nullable()->comment('Industry or internal benchmark values');
                $table->json('threshold_values')->nullable()->comment('Warning and critical thresholds');
                $table->boolean('is_kpi')->default(false)->comment('Whether this is a key performance indicator');
                $table->boolean('is_active')->default(true);
                $table->text('notes')->nullable();
                $table->timestamps();
                
                // Ensure unique metric names
                $table->unique('metric_name');
            });
        }

        if (!Schema::hasTable('equipment_metric_values')) {
            Schema::create('equipment_metric_values', function (Blueprint $table) {
                $table->id();
                $table->foreignId('equipment_id')->constrained();
                $table->foreignId('metric_id')->constrained('equipment_metrics');
                $table->dateTime('measurement_time');
                $table->decimal('metric_value', 15, 5);
                $table->string('value_type')->nullable()->comment('actual, target, forecast, etc.');
                $table->json('raw_data')->nullable()->comment('Raw data used for calculation');
                $table->string('calculation_version')->nullable()->comment('Version of calculation method used');
                $table->foreignId('calculated_by')->nullable()->constrained('users');
                $table->text('notes')->nullable();
                $table->timestamps();
                
                // Indexes for metric values
                $table->index(['equipment_id', 'metric_id', 'measurement_time'], 'eq_metric_eq_time_idx');
                $table->index('measurement_time');
            });
        }

        if (!Schema::hasTable('equipment_dashboards')) {
            Schema::create('equipment_dashboards', function (Blueprint $table) {
                $table->id();
                $table->string('dashboard_name');
                $table->text('description')->nullable();
                $table->enum('dashboard_type', ['operational', 'tactical', 'strategic', 'compliance', 'custom']);
                $table->json('layout_configuration')->nullable()->comment('Dashboard layout and widget placement');
                $table->json('filter_configuration')->nullable()->comment('Default filters for this dashboard');
                $table->boolean('is_system_default')->default(false);
                $table->boolean('is_public')->default(false);
                $table->foreignId('created_by')->constrained('users');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Indexes for dashboards
                $table->index(['created_by', 'is_active']);
                $table->index(['dashboard_type', 'is_public']);
            });
        }

        if (!Schema::hasTable('equipment_dashboard_widgets')) {
            Schema::create('equipment_dashboard_widgets', function (Blueprint $table) {
                $table->id();
                $table->foreignId('dashboard_id')->constrained('equipment_dashboards');
                $table->string('widget_name');
                $table->text('description')->nullable();
                $table->enum('widget_type', [
                    'chart', 'gauge', 'table', 'metric', 'heatmap', 
                    'timeline', 'map', 'alert', 'custom'
                ]);
                $table->enum('chart_type', [
                    'line', 'bar', 'pie', 'scatter', 'area', 
                    'radar', 'bubble', 'mixed', 'other', 'not_applicable'
                ])->default('not_applicable');
                $table->json('data_configuration')->nullable()->comment('Data sources and metrics for this widget');
                $table->json('visual_configuration')->nullable()->comment('Visual settings for this widget');
                $table->json('filter_configuration')->nullable()->comment('Widget-specific filters');
                $table->json('drill_down_configuration')->nullable()->comment('Drill-down behavior configuration');
                $table->integer('refresh_interval_seconds')->nullable()->comment('How often to refresh data');
                $table->integer('position_x')->nullable();
                $table->integer('position_y')->nullable();
                $table->integer('width')->nullable();
                $table->integer('height')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Indexes for dashboard widgets
                $table->index(['dashboard_id', 'is_active']);
            });
        }

        if (!Schema::hasTable('equipment_reports')) {
            Schema::create('equipment_reports', function (Blueprint $table) {
                $table->id();
                $table->string('report_name');
                $table->text('description')->nullable();
                $table->enum('report_type', [
                    'operational', 'maintenance', 'financial', 'compliance', 
                    'utilization', 'performance', 'safety', 'custom'
                ]);
                $table->json('data_configuration')->nullable()->comment('Data sources and metrics for this report');
                $table->json('filter_configuration')->nullable()->comment('Default filters for this report');
                $table->json('column_configuration')->nullable()->comment('Column definitions and formatting');
                $table->json('sorting_configuration')->nullable()->comment('Default sorting for this report');
                $table->json('grouping_configuration')->nullable()->comment('Grouping settings for this report');
                $table->json('calculation_configuration')->nullable()->comment('Calculations and aggregations');
                $table->string('export_formats')->nullable()->comment('Supported export formats (CSV, PDF, etc.)');
                $table->boolean('is_system_default')->default(false);
                $table->boolean('is_public')->default(false);
                $table->foreignId('created_by')->constrained('users');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Indexes for reports
                $table->index(['created_by', 'is_active']);
                $table->index(['report_type', 'is_public']);
            });
        }

        if (!Schema::hasTable('equipment_report_schedules')) {
            Schema::create('equipment_report_schedules', function (Blueprint $table) {
                $table->id();
                $table->foreignId('report_id')->constrained('equipment_reports');
                $table->string('schedule_name');
                $table->text('description')->nullable();
                $table->string('frequency')->comment('daily, weekly, monthly, quarterly, custom');
                $table->string('cron_expression')->nullable()->comment('For custom schedules');
                $table->json('recipient_users')->nullable()->comment('User IDs to receive this report');
                $table->json('recipient_emails')->nullable()->comment('External emails to receive this report');
                $table->json('recipient_roles')->nullable()->comment('Role IDs to receive this report');
                $table->json('filter_overrides')->nullable()->comment('Schedule-specific filter overrides');
                $table->string('export_format')->nullable()->comment('Format for this schedule (PDF, CSV, etc.)');
                $table->text('email_subject_template')->nullable();
                $table->text('email_body_template')->nullable();
                $table->dateTime('last_run_at')->nullable();
                $table->dateTime('next_run_at')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Indexes for report schedules
                $table->index(['report_id', 'is_active']);
                $table->index('next_run_at');
            });
        }

        if (!Schema::hasTable('equipment_report_executions')) {
            Schema::create('equipment_report_executions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('report_id')->constrained('equipment_reports');
                $table->foreignId('schedule_id')->nullable()->constrained('equipment_report_schedules');
                $table->foreignId('executed_by')->nullable()->constrained('users')->comment('Null if system-generated');
                $table->dateTime('execution_started_at');
                $table->dateTime('execution_completed_at')->nullable();
                $table->json('parameters_used')->nullable()->comment('Filters and parameters used for this execution');
                $table->integer('record_count')->nullable()->comment('Number of records in the result');
                $table->string('output_format')->nullable()->comment('Format of the output (PDF, CSV, etc.)');
                $table->string('file_path')->nullable()->comment('Path to the generated file, if any');
                $table->string('file_size_kb')->nullable();
                $table->enum('status', ['queued', 'running', 'completed', 'failed', 'cancelled']);
                $table->text('error_message')->nullable();
                $table->json('delivery_status')->nullable()->comment('Status of delivery to recipients');
                $table->timestamps();
                
                // Indexes for report executions
                $table->index(['report_id', 'execution_started_at']);
                $table->index(['schedule_id', 'status']);
            });
        }

        if (!Schema::hasTable('equipment_analytics_queries')) {
            Schema::create('equipment_analytics_queries', function (Blueprint $table) {
                $table->id();
                $table->string('query_name');
                $table->text('description')->nullable();
                $table->text('query_definition')->comment('SQL or query language definition');
                $table->json('parameter_definitions')->nullable()->comment('Parameters that can be passed to this query');
                $table->json('output_schema')->nullable()->comment('Expected schema of the query output');
                $table->integer('timeout_seconds')->nullable()->default(60);
                $table->boolean('is_materialized')->default(false)->comment('Whether this query is materialized for performance');
                $table->string('refresh_frequency')->nullable()->comment('How often materialized results are refreshed');
                $table->dateTime('last_materialized_at')->nullable();
                $table->boolean('is_system')->default(false);
                $table->foreignId('created_by')->constrained('users');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Indexes for analytics queries
                $table->index(['created_by', 'is_active']);
            });
        }

        if (!Schema::hasTable('equipment_predictive_models')) {
            Schema::create('equipment_predictive_models', function (Blueprint $table) {
                $table->id();
                $table->string('model_name');
                $table->text('description')->nullable();
                $table->enum('model_type', [
                    'failure_prediction', 'maintenance_optimization', 'utilization_forecast', 
                    'cost_prediction', 'lifespan_estimation', 'custom'
                ]);
                $table->json('model_parameters')->nullable()->comment('Parameters and configuration for this model');
                $table->json('feature_definitions')->nullable()->comment('Features used by this model');
                $table->string('algorithm')->nullable()->comment('Algorithm or approach used');
                $table->decimal('accuracy_metric', 8, 4)->nullable()->comment('Accuracy or performance metric');
                $table->dateTime('last_trained_at')->nullable();
                $table->dateTime('next_training_due')->nullable();
                $table->string('training_frequency')->nullable();
                $table->string('model_version')->nullable();
                $table->string('model_file_path')->nullable()->comment('Path to the model file, if applicable');
                $table->foreignId('created_by')->constrained('users');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Indexes for predictive models
                $table->index(['model_type', 'is_active']);
                $table->index('last_trained_at');
            });
        }

        if (!Schema::hasTable('equipment_model_predictions')) {
            Schema::create('equipment_model_predictions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('model_id')->constrained('equipment_predictive_models');
                $table->foreignId('equipment_id')->constrained();
                $table->dateTime('prediction_time');
                $table->string('prediction_type')->comment('What is being predicted');
                $table->json('input_features')->nullable()->comment('Features used for this prediction');
                $table->json('prediction_results')->comment('Results of the prediction');
                $table->decimal('confidence_score', 8, 4)->nullable()->comment('Confidence in this prediction');
                $table->dateTime('prediction_target_date')->nullable()->comment('Date this prediction is for, if applicable');
                $table->json('explanation')->nullable()->comment('Explanation of this prediction');
                $table->boolean('was_accurate')->nullable()->comment('Whether this prediction was accurate, if known');
                $table->dateTime('accuracy_determined_at')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
                
                // Indexes for model predictions
                $table->index(['equipment_id', 'prediction_type', 'prediction_time'], 'eq_prediction_eq_type_time_idx');
                $table->index(['model_id', 'prediction_time']);
            });
        }

        if (!Schema::hasTable('equipment_anomaly_detections')) {
            Schema::create('equipment_anomaly_detections', function (Blueprint $table) {
                $table->id();
                $table->foreignId('equipment_id')->constrained();
                $table->dateTime('detection_time');
                $table->string('anomaly_type');
                $table->text('description')->nullable();
                $table->decimal('severity_score', 8, 4)->nullable()->comment('How severe this anomaly is');
                $table->json('affected_metrics')->nullable()->comment('Metrics showing anomalous behavior');
                $table->json('detection_details')->nullable()->comment('Details of how this was detected');
                $table->string('detection_method')->nullable()->comment('Method or algorithm used');
                $table->boolean('requires_attention')->default(true);
                $table->foreignId('assigned_to')->nullable()->constrained('users');
                $table->text('resolution_notes')->nullable();
                $table->dateTime('resolved_at')->nullable();
                $table->enum('status', ['detected', 'under_investigation', 'false_positive', 'resolved', 'monitoring']);
                $table->timestamps();
                
                // Indexes for anomaly detections
                $table->index(['equipment_id', 'detection_time']);
                $table->index(['status', 'requires_attention']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_anomaly_detections');
        Schema::dropIfExists('equipment_model_predictions');
        Schema::dropIfExists('equipment_predictive_models');
        Schema::dropIfExists('equipment_analytics_queries');
        Schema::dropIfExists('equipment_report_executions');
        Schema::dropIfExists('equipment_report_schedules');
        Schema::dropIfExists('equipment_reports');
        Schema::dropIfExists('equipment_dashboard_widgets');
        Schema::dropIfExists('equipment_dashboards');
        Schema::dropIfExists('equipment_metric_values');
        Schema::dropIfExists('equipment_metrics');
    }
};