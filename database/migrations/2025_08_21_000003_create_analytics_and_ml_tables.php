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
        Schema::create('analytics_metrics', function (Blueprint $table) {
            $table->id();
            $table->date('metric_date');
            $table->string('metric_type'); // referral_volume, response_time, utilization, etc.
            $table->string('metric_category'); // performance, quality, efficiency, cost
            $table->decimal('value', 15, 4);
            $table->string('unit')->nullable(); // minutes, percentage, count, currency
            $table->foreignId('facility_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('ambulance_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->json('dimensions')->nullable(); // Additional grouping dimensions
            $table->json('metadata')->nullable(); // Additional context data
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['metric_date', 'metric_type']);
            $table->index(['metric_category', 'metric_date']);
            $table->index(['facility_id', 'metric_date']);
            $table->index(['ambulance_id', 'metric_date']);
        });

        Schema::create('predictive_models', function (Blueprint $table) {
            $table->id();
            $table->string('model_name');
            $table->string('model_type'); // demand_forecast, risk_assessment, maintenance_prediction
            $table->string('version');
            $table->json('parameters'); // Model configuration and hyperparameters
            $table->json('training_data_info'); // Information about training dataset
            $table->decimal('accuracy_score', 5, 4)->nullable();
            $table->decimal('precision_score', 5, 4)->nullable();
            $table->decimal('recall_score', 5, 4)->nullable();
            $table->decimal('f1_score', 5, 4)->nullable();
            $table->json('feature_importance')->nullable();
            $table->json('validation_results')->nullable();
            $table->timestamp('trained_at');
            $table->timestamp('last_used_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['model_type', 'is_active']);
            $table->index('trained_at');
        });

        Schema::create('ml_predictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('model_id')->constrained('predictive_models')->onDelete('cascade');
            $table->string('prediction_type'); // demand, risk, maintenance, etc.
            $table->json('input_features'); // Features used for prediction
            $table->json('prediction_output'); // Model output/predictions
            $table->decimal('confidence_score', 5, 4)->nullable();
            $table->date('prediction_date'); // Date the prediction is for
            $table->timestamp('created_at');
            $table->json('actual_outcome')->nullable(); // For model validation
            $table->timestamp('outcome_recorded_at')->nullable();
            $table->decimal('prediction_error', 10, 4)->nullable();
            $table->foreignId('facility_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('ambulance_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('patient_id')->nullable()->constrained()->onDelete('cascade');
            
            // Indexes
            $table->index(['prediction_type', 'prediction_date']);
            $table->index(['model_id', 'created_at']);
            $table->index(['facility_id', 'prediction_date']);
        });

        Schema::create('anomaly_detections', function (Blueprint $table) {
            $table->id();
            $table->string('anomaly_type'); // volume, response_time, utilization, etc.
            $table->enum('severity', ['low', 'medium', 'high', 'critical']);
            $table->string('metric_name');
            $table->decimal('expected_value', 15, 4);
            $table->decimal('actual_value', 15, 4);
            $table->decimal('deviation_score', 8, 4); // Standard deviations from normal
            $table->decimal('anomaly_score', 5, 4); // 0-1 score indicating anomaly strength
            $table->json('context_data'); // Additional context about the anomaly
            $table->text('description');
            $table->json('recommendations')->nullable();
            $table->timestamp('detected_at');
            $table->boolean('acknowledged')->default(false);
            $table->foreignId('acknowledged_by')->nullable()->constrained('users');
            $table->timestamp('acknowledged_at')->nullable();
            $table->boolean('resolved')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->foreignId('facility_id')->nullable()->constrained()->onDelete('cascade');
            $table->timestamps();
            
            // Indexes
            $table->index(['severity', 'detected_at']);
            $table->index(['anomaly_type', 'detected_at']);
            $table->index(['acknowledged', 'resolved']);
        });

        Schema::create('performance_benchmarks', function (Blueprint $table) {
            $table->id();
            $table->string('benchmark_name');
            $table->string('metric_type');
            $table->string('benchmark_category'); // internal, industry, regulatory
            $table->decimal('target_value', 15, 4);
            $table->decimal('minimum_acceptable', 15, 4)->nullable();
            $table->decimal('maximum_acceptable', 15, 4)->nullable();
            $table->string('unit');
            $table->text('description');
            $table->json('calculation_method')->nullable();
            $table->boolean('is_active')->default(true);
            $table->date('effective_from');
            $table->date('effective_until')->nullable();
            $table->foreignId('facility_id')->nullable()->constrained()->onDelete('cascade');
            $table->timestamps();
            
            // Indexes
            $table->index(['metric_type', 'is_active']);
            $table->index(['facility_id', 'effective_from']);
        });

        Schema::create('analytics_dashboards', function (Blueprint $table) {
            $table->id();
            $table->string('dashboard_name');
            $table->string('dashboard_type'); // executive, operational, clinical, financial
            $table->text('description')->nullable();
            $table->json('widget_configuration'); // Dashboard layout and widgets
            $table->json('filter_configuration')->nullable(); // Default filters
            $table->json('access_permissions'); // Who can view/edit
            $table->foreignId('created_by')->constrained('users');
            $table->boolean('is_public')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('view_count')->default(0);
            $table->timestamp('last_viewed_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['dashboard_type', 'is_active']);
            $table->index('created_by');
        });

        Schema::create('analytics_reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_name');
            $table->string('report_type'); // scheduled, ad_hoc, regulatory
            $table->text('description')->nullable();
            $table->json('report_configuration'); // Metrics, filters, formatting
            $table->json('schedule_configuration')->nullable(); // For scheduled reports
            $table->enum('output_format', ['pdf', 'excel', 'csv', 'json']);
            $table->foreignId('created_by')->constrained('users');
            $table->json('recipients')->nullable(); // Email recipients for scheduled reports
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_generated_at')->nullable();
            $table->timestamp('next_generation_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['report_type', 'is_active']);
            $table->index('next_generation_at');
        });

        Schema::create('analytics_report_executions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('analytics_reports')->onDelete('cascade');
            $table->enum('status', ['pending', 'running', 'completed', 'failed']);
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->integer('execution_time_seconds')->nullable();
            $table->string('output_file_path')->nullable();
            $table->integer('output_file_size')->nullable();
            $table->json('parameters_used')->nullable();
            $table->text('error_message')->nullable();
            $table->json('execution_metadata')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['report_id', 'started_at']);
            $table->index('status');
        });

        Schema::create('data_quality_metrics', function (Blueprint $table) {
            $table->id();
            $table->date('metric_date');
            $table->string('data_source'); // referrals, ambulances, patients, etc.
            $table->string('quality_dimension'); // completeness, accuracy, consistency, timeliness
            $table->decimal('score', 5, 2); // 0-100 quality score
            $table->integer('total_records');
            $table->integer('valid_records');
            $table->integer('invalid_records');
            $table->json('quality_issues')->nullable(); // Specific issues found
            $table->json('improvement_suggestions')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['metric_date', 'data_source']);
            $table->index(['data_source', 'quality_dimension']);
        });

        Schema::create('capacity_planning_scenarios', function (Blueprint $table) {
            $table->id();
            $table->string('scenario_name');
            $table->text('description');
            $table->json('assumptions'); // Growth rates, external factors, etc.
            $table->json('resource_requirements'); // Predicted resource needs
            $table->json('cost_projections'); // Financial projections
            $table->json('risk_factors'); // Identified risks and mitigation strategies
            $table->date('scenario_start_date');
            $table->date('scenario_end_date');
            $table->foreignId('created_by')->constrained('users');
            $table->boolean('is_baseline')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes
            $table->index(['scenario_start_date', 'scenario_end_date'], 'capacity_scenarios_dates_idx');
            $table->index('is_baseline');
        });

        Schema::create('optimization_recommendations', function (Blueprint $table) {
            $table->id();
            $table->string('recommendation_type'); // staffing, equipment, process, cost
            $table->string('category'); // efficiency, quality, cost_reduction, capacity
            $table->string('title');
            $table->text('description');
            $table->json('current_state'); // Current metrics/situation
            $table->json('recommended_changes'); // Specific recommendations
            $table->json('expected_benefits'); // Projected improvements
            $table->decimal('estimated_cost', 12, 2)->nullable();
            $table->decimal('estimated_savings', 12, 2)->nullable();
            $table->integer('implementation_effort_days')->nullable();
            $table->enum('priority', ['low', 'medium', 'high', 'critical']);
            $table->enum('status', ['pending', 'approved', 'in_progress', 'completed', 'rejected']);
            $table->foreignId('facility_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->timestamp('target_completion_date')->nullable();
            $table->timestamp('actual_completion_date')->nullable();
            $table->json('implementation_notes')->nullable();
            $table->json('actual_results')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['recommendation_type', 'status']);
            $table->index(['priority', 'status']);
            $table->index(['facility_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('optimization_recommendations');
        Schema::dropIfExists('capacity_planning_scenarios');
        Schema::dropIfExists('data_quality_metrics');
        Schema::dropIfExists('analytics_report_executions');
        Schema::dropIfExists('analytics_reports');
        Schema::dropIfExists('analytics_dashboards');
        Schema::dropIfExists('performance_benchmarks');
        Schema::dropIfExists('anomaly_detections');
        Schema::dropIfExists('ml_predictions');
        Schema::dropIfExists('predictive_models');
        Schema::dropIfExists('analytics_metrics');
    }
};
