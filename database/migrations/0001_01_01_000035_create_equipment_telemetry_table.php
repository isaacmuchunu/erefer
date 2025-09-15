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
        Schema::create('equipment_telemetry_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->string('telemetry_endpoint_url')->nullable();
            $table->string('api_key')->nullable();
            $table->json('monitored_parameters')->nullable()->comment('List of parameters being monitored');
            $table->json('alert_thresholds')->nullable()->comment('Thresholds for generating alerts');
            $table->integer('polling_frequency_seconds')->default(60);
            $table->boolean('is_active')->default(true);
            $table->enum('connection_type', ['direct', 'gateway', 'cloud', 'manual'])->default('direct');
            $table->string('gateway_device_id')->nullable();
            $table->json('authentication_details')->nullable();
            $table->string('protocol')->nullable()->comment('MQTT, HTTP, etc');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('equipment_telemetry_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->dateTime('reading_timestamp');
            $table->json('parameters')->comment('All telemetry parameters and their values');
            $table->boolean('is_within_threshold')->default(true);
            $table->json('threshold_violations')->nullable()->comment('Parameters that violated thresholds');
            $table->string('reading_source')->nullable()->comment('Source of the reading: device, gateway, manual');
            $table->string('connection_quality')->nullable();
            $table->boolean('requires_attention')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for time-series queries
            $table->index('reading_timestamp');
            $table->index(['equipment_id', 'reading_timestamp'], 'eq_telemetry_eq_timestamp_idx');
            $table->index('requires_attention');
        });

        Schema::create('equipment_telemetry_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->foreignId('telemetry_reading_id')->nullable()->constrained('equipment_telemetry_readings');
            $table->dateTime('alert_timestamp');
            $table->enum('severity', ['info', 'warning', 'critical', 'emergency'])->default('warning');
            $table->string('alert_type');
            $table->string('parameter_name')->nullable();
            $table->string('threshold_value')->nullable();
            $table->string('actual_value')->nullable();
            $table->text('message');
            $table->boolean('is_active')->default(true);
            $table->dateTime('resolved_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users');
            $table->text('resolution_notes')->nullable();
            $table->boolean('auto_resolved')->default(false);
            $table->boolean('notification_sent')->default(false);
            $table->json('notification_recipients')->nullable();
            $table->timestamps();
            
            // Indexes for alert management
            $table->index('alert_timestamp');
            $table->index(['equipment_id', 'is_active']);
            $table->index('severity');
        });
        
        // Create predictive maintenance model table
        Schema::create('equipment_predictive_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->string('model_name');
            $table->string('model_version');
            $table->enum('model_type', ['failure_prediction', 'maintenance_optimization', 'anomaly_detection', 'other'])->default('failure_prediction');
            $table->json('model_parameters')->nullable();
            $table->json('training_dataset_info')->nullable();
            $table->date('last_trained_date');
            $table->decimal('accuracy_score', 5, 2)->nullable();
            $table->decimal('precision_score', 5, 2)->nullable();
            $table->decimal('recall_score', 5, 2)->nullable();
            $table->text('model_description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('created_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_predictive_models');
        Schema::dropIfExists('equipment_telemetry_alerts');
        Schema::dropIfExists('equipment_telemetry_readings');
        Schema::dropIfExists('equipment_telemetry_configs');
    }
};