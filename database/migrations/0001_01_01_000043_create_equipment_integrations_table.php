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
        Schema::create('integration_systems', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('system_code')->unique();
            $table->text('description')->nullable();
            $table->enum('system_type', [
                'ehr', 'pacs', 'lis', 'his', 'billing', 'inventory', 
                'maintenance', 'asset_management', 'other'
            ]);
            $table->string('vendor')->nullable();
            $table->string('version')->nullable();
            $table->string('api_base_url')->nullable();
            $table->string('api_version')->nullable();
            $table->json('authentication_details')->nullable()->comment('Encrypted authentication details');
            $table->string('contact_person')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('equipment_integration_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->foreignId('integration_system_id')->constrained('integration_systems');
            $table->string('external_system_id')->comment('ID of the equipment in the external system');
            $table->string('mapping_type')->nullable()->comment('Type of mapping relationship');
            $table->json('field_mappings')->nullable()->comment('JSON mapping of fields between systems');
            $table->dateTime('last_sync_at')->nullable();
            $table->enum('sync_status', ['active', 'pending', 'error', 'disabled']);
            $table->text('sync_error_message')->nullable();
            $table->boolean('is_primary_system')->default(false)->comment('Whether this is the primary system of record');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Ensure unique equipment-system-external ID combinations
            $table->unique(['equipment_id', 'integration_system_id', 'external_system_id'], 'unique_equipment_system_mapping');
            
            // Indexes for integration mapping
            $table->index(['equipment_id', 'sync_status'], 'eq_integration_eq_sync_idx');
            $table->index(['integration_system_id', 'external_system_id'], 'eq_integration_sys_ext_idx');
        });

        Schema::create('integration_data_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('data_type_code')->unique();
            $table->text('description')->nullable();
            $table->json('schema_definition')->nullable()->comment('JSON schema defining the data structure');
            $table->string('direction')->comment('inbound, outbound, bidirectional');
            $table->boolean('requires_transformation')->default(false);
            $table->text('transformation_logic')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('equipment_integration_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->foreignId('integration_system_id')->constrained('integration_systems');
            $table->foreignId('data_type_id')->constrained('integration_data_types');
            $table->string('config_name');
            $table->text('config_description')->nullable();
            $table->json('configuration_parameters')->nullable();
            $table->string('endpoint_url')->nullable();
            $table->string('sync_frequency')->nullable()->comment('realtime, hourly, daily, etc');
            $table->string('cron_expression')->nullable();
            $table->integer('retry_attempts')->nullable()->default(3);
            $table->integer('timeout_seconds')->nullable()->default(30);
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for integration configuration
            $table->index(['equipment_id', 'integration_system_id'], 'eq_int_config_eq_sys_idx');
            $table->index(['data_type_id', 'is_active'], 'eq_int_config_type_active_idx');
        });

        Schema::create('equipment_integration_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->foreignId('integration_system_id')->constrained('integration_systems');
            $table->foreignId('integration_config_id')->nullable()->constrained('equipment_integration_configs');
            $table->string('transaction_id')->nullable();
            $table->enum('direction', ['inbound', 'outbound']);
            $table->enum('status', ['initiated', 'in_progress', 'completed', 'failed', 'retrying']);
            $table->dateTime('initiated_at');
            $table->dateTime('completed_at')->nullable();
            $table->string('data_type')->nullable();
            $table->text('request_summary')->nullable();
            $table->text('response_summary')->nullable();
            $table->text('error_message')->nullable();
            $table->integer('retry_count')->default(0);
            $table->json('request_payload')->nullable()->comment('May contain sensitive data, consider encryption');
            $table->json('response_payload')->nullable()->comment('May contain sensitive data, consider encryption');
            $table->string('ip_address')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for integration logging
            $table->index('transaction_id');
            $table->index('initiated_at');
            $table->index(['equipment_id', 'status'], 'eq_int_log_eq_status_idx');
            $table->index(['integration_system_id', 'status'], 'eq_int_log_sys_status_idx');
        });

        Schema::create('equipment_data_transformations', function (Blueprint $table) {
            $table->id();
            $table->string('transformation_name');
            $table->text('description')->nullable();
            $table->foreignId('source_system_id')->constrained('integration_systems');
            $table->foreignId('target_system_id')->constrained('integration_systems');
            $table->foreignId('data_type_id')->constrained('integration_data_types');
            $table->enum('transformation_type', ['mapping', 'conversion', 'enrichment', 'filtering', 'aggregation', 'custom']);
            $table->json('transformation_rules')->nullable()->comment('JSON rules for transformation');
            $table->text('custom_transformation_logic')->nullable()->comment('For complex transformations');
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for data transformation
            $table->index(['source_system_id', 'target_system_id'], 'eq_data_trans_src_tgt_idx');
            $table->index(['data_type_id', 'is_active'], 'eq_data_trans_type_active_idx');
        });

        Schema::create('equipment_api_endpoints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->string('endpoint_name');
            $table->text('description')->nullable();
            $table->string('endpoint_url');
            $table->enum('http_method', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
            $table->json('request_headers')->nullable();
            $table->json('request_parameters')->nullable();
            $table->json('request_body_template')->nullable();
            $table->json('response_schema')->nullable();
            $table->text('authentication_method')->nullable()->comment('Basic, OAuth, API Key, etc');
            $table->json('authentication_details')->nullable()->comment('Encrypted authentication details');
            $table->integer('timeout_seconds')->nullable()->default(30);
            $table->boolean('requires_ssl')->default(true);
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for API endpoints
            $table->index(['equipment_id', 'is_active'], 'eq_api_endp_eq_active_idx');
        });

        Schema::create('equipment_webhooks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->string('webhook_name');
            $table->text('description')->nullable();
            $table->string('event_type')->comment('Type of event that triggers the webhook');
            $table->string('target_url');
            $table->enum('http_method', ['GET', 'POST', 'PUT']);
            $table->json('request_headers')->nullable();
            $table->json('payload_template')->nullable();
            $table->string('secret_key')->nullable()->comment('For webhook signature validation');
            $table->integer('timeout_seconds')->nullable()->default(5);
            $table->integer('retry_attempts')->nullable()->default(3);
            $table->integer('retry_delay_seconds')->nullable()->default(60);
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for webhooks
            $table->index(['equipment_id', 'event_type'], 'eq_webhook_eq_event_idx');
            $table->index('is_active');
        });

        Schema::create('equipment_webhook_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('webhook_id')->constrained('equipment_webhooks');
            $table->string('delivery_id')->unique();
            $table->dateTime('triggered_at');
            $table->string('event_type');
            $table->json('payload')->nullable();
            $table->integer('status_code')->nullable();
            $table->text('response_body')->nullable();
            $table->enum('status', ['pending', 'delivered', 'failed', 'retrying']);
            $table->integer('retry_count')->default(0);
            $table->dateTime('next_retry_at')->nullable();
            $table->text('error_message')->nullable();
            $table->integer('delivery_time_ms')->nullable()->comment('Time taken for delivery in milliseconds');
            $table->timestamps();
            
            // Indexes for webhook deliveries
            $table->index('delivery_id');
            $table->index('triggered_at');
            $table->index(['webhook_id', 'status'], 'eq_webhook_del_id_status_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_webhook_deliveries');
        Schema::dropIfExists('equipment_webhooks');
        Schema::dropIfExists('equipment_api_endpoints');
        Schema::dropIfExists('equipment_data_transformations');
        Schema::dropIfExists('equipment_integration_logs');
        Schema::dropIfExists('equipment_integration_configs');
        Schema::dropIfExists('integration_data_types');
        Schema::dropIfExists('equipment_integration_mappings');
        Schema::dropIfExists('integration_systems');
    }
};