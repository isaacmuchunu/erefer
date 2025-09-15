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
        if (!Schema::hasTable('equipment_api_keys')) {
            Schema::create('equipment_api_keys', function (Blueprint $table) {
                $table->id();
                $table->string('key_name');
                $table->string('api_key', 64)->unique();
                $table->text('description')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users');
                $table->foreignId('facility_id')->nullable()->constrained('facilities');
                $table->foreignId('department_id')->nullable()->constrained('departments');
                $table->json('allowed_endpoints')->nullable()->comment('Endpoints this key can access');
                $table->json('allowed_methods')->nullable()->comment('HTTP methods this key can use');
                $table->json('rate_limits')->nullable()->comment('Rate limiting configuration');
                $table->json('ip_restrictions')->nullable()->comment('IP addresses allowed to use this key');
                $table->dateTime('valid_from')->nullable();
                $table->dateTime('valid_until')->nullable();
                $table->dateTime('last_used_at')->nullable();
                $table->string('last_used_ip')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                $table->softDeletes();
                
                // Indexes
                $table->index(['is_active', 'valid_until'], 'eq_api_key_active_valid_idx');
                $table->index(['facility_id', 'department_id'], 'eq_api_key_fac_dept_idx');
                $table->index('last_used_at');
            });
        }

        if (!Schema::hasTable('equipment_api_endpoints')) {
            Schema::create('equipment_api_endpoints', function (Blueprint $table) {
                $table->id();
                $table->string('endpoint_path')->unique();
                $table->string('endpoint_name');
                $table->text('description')->nullable();
                $table->json('allowed_methods')->comment('HTTP methods this endpoint supports');
                $table->json('required_parameters')->nullable()->comment('Required parameters for this endpoint');
                $table->json('optional_parameters')->nullable()->comment('Optional parameters for this endpoint');
                $table->json('response_format')->nullable()->comment('Format of the response');
                $table->json('rate_limits')->nullable()->comment('Rate limiting configuration');
                $table->json('permissions_required')->nullable()->comment('Permissions needed to access this endpoint');
                $table->boolean('requires_authentication')->default(true);
                $table->boolean('is_public')->default(false);
                $table->boolean('is_deprecated')->default(false);
                $table->string('deprecated_message')->nullable();
                $table->string('version')->default('1.0');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Indexes
                $table->index(['is_active', 'is_deprecated'], 'eq_api_end_active_depr_idx');
                $table->index('version');
            });
        }

        if (!Schema::hasTable('equipment_api_logs')) {
            Schema::create('equipment_api_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('api_key_id')->nullable()->constrained('equipment_api_keys');
                $table->foreignId('user_id')->nullable()->constrained();
                $table->string('endpoint');
                $table->string('method');
                $table->json('request_headers')->nullable();
                $table->json('request_params')->nullable();
                $table->json('request_body')->nullable();
                $table->integer('response_code');
                $table->json('response_headers')->nullable();
                $table->json('response_body')->nullable();
                $table->integer('response_time_ms')->nullable()->comment('Response time in milliseconds');
                $table->string('ip_address')->nullable();
                $table->string('user_agent')->nullable();
                $table->text('error_message')->nullable();
                $table->dateTime('request_time');
                $table->timestamps();
                
                // Indexes
                $table->index(['api_key_id', 'request_time'], 'eq_api_log_key_time_idx');
                $table->index(['endpoint', 'method'], 'eq_api_log_end_method_idx');
                $table->index('response_code');
            });
        }

        if (!Schema::hasTable('equipment_api_webhooks')) {
            Schema::create('equipment_api_webhooks', function (Blueprint $table) {
                $table->id();
                $table->string('webhook_name');
                $table->text('description')->nullable();
                $table->string('target_url');
                $table->string('secret_token', 64)->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users');
                $table->json('event_types')->comment('Event types this webhook subscribes to');
                $table->json('filters')->nullable()->comment('Filters to apply to events');
                $table->json('custom_headers')->nullable()->comment('Custom headers to send with webhook');
                $table->integer('max_retries')->default(3);
                $table->integer('retry_delay_seconds')->default(60);
                $table->dateTime('last_triggered_at')->nullable();
                $table->dateTime('last_successful_at')->nullable();
                $table->dateTime('last_failed_at')->nullable();
                $table->text('last_failure_reason')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Indexes
                $table->index(['is_active', 'last_triggered_at'], 'eq_webhook_active_trig_idx');
            });
        }

        if (!Schema::hasTable('equipment_api_webhook_deliveries')) {
            Schema::create('equipment_api_webhook_deliveries', function (Blueprint $table) {
                $table->id();
                $table->foreignId('webhook_id')->constrained('equipment_api_webhooks');
                $table->uuid('delivery_id')->unique();
                $table->string('event_type');
                $table->json('payload')->nullable();
                $table->json('request_headers')->nullable();
                $table->integer('response_code')->nullable();
                $table->json('response_headers')->nullable();
                $table->json('response_body')->nullable();
                $table->integer('delivery_time_ms')->nullable()->comment('Delivery time in milliseconds');
                $table->integer('attempt_number')->default(1);
                $table->dateTime('next_retry_at')->nullable();
                $table->text('failure_reason')->nullable();
                $table->enum('status', ['pending', 'delivered', 'failed', 'retrying']);
                $table->timestamps();
                
                // Indexes
                $table->index(['webhook_id', 'status'], 'eq_web_del_web_status_idx');
                $table->index(['status', 'next_retry_at'], 'eq_web_del_status_retry_idx');
                $table->index('event_type');
            });
        }

        if (!Schema::hasTable('equipment_api_oauth_clients')) {
            Schema::create('equipment_api_oauth_clients', function (Blueprint $table) {
                $table->id();
                $table->string('client_name');
                $table->string('client_id', 40)->unique();
                $table->string('client_secret', 100)->nullable();
                $table->text('description')->nullable();
                $table->text('redirect_uri')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users');
                $table->foreignId('facility_id')->nullable()->constrained('facilities');
                $table->foreignId('department_id')->nullable()->constrained('departments');
                $table->json('allowed_scopes')->nullable()->comment('OAuth scopes this client can request');
                $table->json('allowed_grant_types')->nullable()->comment('OAuth grant types this client can use');
                $table->json('rate_limits')->nullable()->comment('Rate limiting configuration');
                $table->json('ip_restrictions')->nullable()->comment('IP addresses allowed to use this client');
                $table->dateTime('valid_from')->nullable();
                $table->dateTime('valid_until')->nullable();
                $table->dateTime('last_used_at')->nullable();
                $table->boolean('is_first_party')->default(false)->comment('Whether this is a first-party client');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                $table->softDeletes();
                
                // Indexes
                $table->index(['is_active', 'valid_until'], 'eq_oauth_cli_active_val_idx');
                $table->index(['facility_id', 'department_id'], 'eq_oauth_cli_fac_dept_idx');
                $table->index('last_used_at');
            });
        }

        if (!Schema::hasTable('equipment_api_oauth_tokens')) {
            Schema::create('equipment_api_oauth_tokens', function (Blueprint $table) {
                $table->id();
                $table->foreignId('client_id')->constrained('equipment_api_oauth_clients');
                $table->foreignId('user_id')->nullable()->constrained();
                $table->string('access_token', 100)->unique();
                $table->string('refresh_token', 100)->nullable()->unique();
                $table->json('scopes')->nullable()->comment('Scopes granted to this token');
                $table->dateTime('expires_at');
                $table->dateTime('refresh_expires_at')->nullable();
                $table->string('ip_address')->nullable();
                $table->string('user_agent')->nullable();
                $table->dateTime('last_used_at')->nullable();
                $table->string('last_used_ip')->nullable();
                $table->boolean('is_revoked')->default(false);
                $table->timestamps();
                
                // Indexes
                $table->index(['client_id', 'user_id'], 'eq_oauth_tok_cli_user_idx');
                $table->index(['expires_at', 'is_revoked'], 'eq_oauth_tok_exp_rev_idx');
                $table->index('last_used_at');
            });
        }

        if (!Schema::hasTable('equipment_api_documentation')) {
            Schema::create('equipment_api_documentation', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('content');
                $table->string('content_type')->default('markdown')->comment('markdown, html, etc.');
                $table->string('section')->comment('Section of the documentation');
                $table->integer('display_order')->default(0);
                $table->json('related_endpoints')->nullable()->comment('Related API endpoints');
                $table->json('code_examples')->nullable()->comment('Code examples for this documentation');
                $table->string('version')->default('1.0');
                $table->boolean('is_public')->default(true);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Indexes
                $table->index(['section', 'display_order'], 'eq_api_doc_sec_order_idx');
                $table->index(['is_public', 'is_active'], 'eq_api_doc_pub_active_idx');
                $table->index('version');
            });
        }

        if (!Schema::hasTable('equipment_api_versions')) {
            Schema::create('equipment_api_versions', function (Blueprint $table) {
                $table->id();
                $table->string('version')->unique();
                $table->text('description')->nullable();
                $table->dateTime('released_at')->nullable();
                $table->dateTime('deprecated_at')->nullable();
                $table->dateTime('sunset_at')->nullable()->comment('When this version will be removed');
                $table->json('changes')->nullable()->comment('Changes in this version');
                $table->json('breaking_changes')->nullable()->comment('Breaking changes in this version');
                $table->json('migration_guide')->nullable()->comment('Guide for migrating to this version');
                $table->boolean('is_current')->default(false);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Indexes
                $table->index(['is_current', 'is_active'], 'eq_api_ver_curr_active_idx');
                $table->index('released_at');
            });
        }

        if (!Schema::hasTable('equipment_api_rate_limits')) {
            Schema::create('equipment_api_rate_limits', function (Blueprint $table) {
                $table->id();
                $table->string('limit_name');
                $table->text('description')->nullable();
                $table->string('resource_type')->comment('endpoint, client, key, user, ip');
                $table->string('resource_identifier')->nullable()->comment('Specific resource this limit applies to');
                $table->integer('requests_limit');
                $table->integer('time_window_seconds');
                $table->json('additional_constraints')->nullable()->comment('Additional constraints for this limit');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Ensure unique limit configurations
                $table->unique(['resource_type', 'resource_identifier', 'requests_limit', 'time_window_seconds'], 'unique_rate_limit_config');
                
                // Indexes
                $table->index(['resource_type', 'is_active'], 'eq_rate_lim_type_active_idx');
            });
        }

        if (!Schema::hasTable('equipment_api_rate_limit_logs')) {
            Schema::create('equipment_api_rate_limit_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('rate_limit_id')->nullable()->constrained('equipment_api_rate_limits');
                $table->string('resource_type');
                $table->string('resource_identifier');
                $table->foreignId('api_key_id')->nullable()->constrained('equipment_api_keys');
                $table->foreignId('oauth_client_id')->nullable()->constrained('equipment_api_oauth_clients');
                $table->foreignId('user_id')->nullable()->constrained();
                $table->string('ip_address')->nullable();
                $table->string('endpoint')->nullable();
                $table->integer('current_count');
                $table->dateTime('window_starts_at');
                $table->dateTime('window_ends_at');
                $table->boolean('limit_exceeded')->default(false);
                $table->dateTime('logged_at');
                $table->timestamps();
                
                // Indexes
                $table->index(['resource_type', 'resource_identifier'], 'eq_rate_log_res_id_idx');
                $table->index(['window_starts_at', 'window_ends_at'], 'eq_rate_log_window_idx');
                $table->index('limit_exceeded');
            });
        }

        if (!Schema::hasTable('equipment_api_sdks')) {
            Schema::create('equipment_api_sdks', function (Blueprint $table) {
                $table->id();
                $table->string('sdk_name');
                $table->string('language')->comment('Programming language of the SDK');
                $table->string('version');
                $table->text('description')->nullable();
                $table->string('repository_url')->nullable();
                $table->string('documentation_url')->nullable();
                $table->string('package_manager_url')->nullable()->comment('NPM, PyPI, etc. URL');
                $table->json('supported_api_versions')->comment('API versions this SDK supports');
                $table->json('features')->nullable()->comment('Features supported by this SDK');
                $table->json('installation_instructions')->nullable();
                $table->json('usage_examples')->nullable();
                $table->dateTime('released_at');
                $table->dateTime('deprecated_at')->nullable();
                $table->boolean('is_official')->default(true);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Ensure unique SDK versions per language
                $table->unique(['language', 'version'], 'unique_sdk_lang_version');
                
                // Indexes
                $table->index(['language', 'is_active'], 'eq_sdk_lang_active_idx');
                $table->index(['is_official', 'is_active'], 'eq_sdk_official_active_idx');
            });
        }

        if (!Schema::hasTable('equipment_api_external_services')) {
            Schema::create('equipment_api_external_services', function (Blueprint $table) {
                $table->id();
                $table->string('service_name');
                $table->text('description')->nullable();
                $table->string('base_url')->nullable();
                $table->enum('auth_type', ['none', 'api_key', 'oauth', 'basic', 'jwt', 'custom']);
                $table->json('auth_credentials')->nullable()->comment('Encrypted credentials for this service');
                $table->json('default_headers')->nullable()->comment('Default headers to send with requests');
                $table->json('rate_limits')->nullable()->comment('Rate limiting configuration');
                $table->json('endpoints')->nullable()->comment('Available endpoints for this service');
                $table->json('webhook_config')->nullable()->comment('Webhook configuration for this service');
                $table->dateTime('last_connected_at')->nullable();
                $table->text('last_connection_error')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                // Indexes
                $table->index(['auth_type', 'is_active'], 'eq_ext_srv_auth_active_idx');
                $table->index('last_connected_at');
            });
        }

        if (!Schema::hasTable('equipment_api_external_service_logs')) {
            Schema::create('equipment_api_external_service_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('service_id')->constrained('equipment_api_external_services');
                $table->string('endpoint');
                $table->string('method');
                $table->json('request_headers')->nullable();
                $table->json('request_params')->nullable();
                $table->json('request_body')->nullable();
                $table->integer('response_code')->nullable();
                $table->json('response_headers')->nullable();
                $table->json('response_body')->nullable();
                $table->integer('response_time_ms')->nullable()->comment('Response time in milliseconds');
                $table->text('error_message')->nullable();
                $table->enum('status', ['success', 'error', 'timeout']);
                $table->dateTime('request_time');
                $table->timestamps();
                
                // Indexes
                $table->index(['service_id', 'status'], 'eq_ext_srv_log_id_status_idx');
                $table->index(['endpoint', 'method'], 'eq_ext_srv_log_end_meth_idx');
                $table->index('request_time');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_api_external_service_logs');
        Schema::dropIfExists('equipment_api_external_services');
        Schema::dropIfExists('equipment_api_sdks');
        Schema::dropIfExists('equipment_api_rate_limit_logs');
        Schema::dropIfExists('equipment_api_rate_limits');
        Schema::dropIfExists('equipment_api_versions');
        Schema::dropIfExists('equipment_api_documentation');
        Schema::dropIfExists('equipment_api_oauth_tokens');
        Schema::dropIfExists('equipment_api_oauth_clients');
        Schema::dropIfExists('equipment_api_webhook_deliveries');
        Schema::dropIfExists('equipment_api_webhooks');
        Schema::dropIfExists('equipment_api_logs');
        Schema::dropIfExists('equipment_api_endpoints');
        Schema::dropIfExists('equipment_api_keys');
    }
};