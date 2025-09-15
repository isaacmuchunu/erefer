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
        Schema::create('equipment_ui_components', function (Blueprint $table) {
            $table->id();
            $table->string('component_name');
            $table->text('description')->nullable();
            $table->enum('component_type', [
                'dashboard', 'form', 'list', 'detail', 'chart', 'map', 
                'scanner', 'wizard', 'report', 'search', 'other'
            ]);
            $table->string('route_name')->nullable();
            $table->string('icon')->nullable();
            $table->json('permissions_required')->nullable()->comment('Permissions needed to access this component');
            $table->json('layout_configuration')->nullable()->comment('Layout and styling configuration');
            $table->json('data_sources')->nullable()->comment('Data sources for this component');
            $table->json('action_handlers')->nullable()->comment('Actions this component can perform');
            $table->boolean('is_system')->default(false)->comment('Whether this is a system component');
            $table->boolean('is_mobile_compatible')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Ensure unique component names
            $table->unique('component_name');
            
            // Indexes for UI components
            $table->index(['component_type', 'is_active'], 'eq_ui_comp_type_active_idx');
            $table->index('is_mobile_compatible');
        });

        Schema::create('equipment_ui_screens', function (Blueprint $table) {
            $table->id();
            $table->string('screen_name');
            $table->text('description')->nullable();
            $table->enum('screen_type', [
                'dashboard', 'list', 'detail', 'form', 'report', 
                'analytics', 'settings', 'help', 'other'
            ]);
            $table->string('route')->nullable();
            $table->string('icon')->nullable();
            $table->json('components')->nullable()->comment('Components used in this screen');
            $table->json('layout_configuration')->nullable()->comment('Screen layout configuration');
            $table->json('permissions_required')->nullable()->comment('Permissions needed to access this screen');
            $table->json('navigation_configuration')->nullable()->comment('Navigation behavior');
            $table->boolean('is_system')->default(false);
            $table->boolean('is_mobile_compatible')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Ensure unique screen names
            $table->unique('screen_name');
            
            // Indexes for UI screens
            $table->index(['screen_type', 'is_active'], 'eq_ui_screen_type_active_idx');
            $table->index('is_mobile_compatible');
        });

        Schema::create('equipment_ui_workflows', function (Blueprint $table) {
            $table->id();
            $table->string('workflow_name');
            $table->text('description')->nullable();
            $table->enum('workflow_type', [
                'maintenance', 'inventory', 'inspection', 'transfer', 
                'reservation', 'disposal', 'onboarding', 'other'
            ]);
            $table->json('screens')->nullable()->comment('Screens in this workflow');
            $table->json('flow_configuration')->nullable()->comment('Flow between screens');
            $table->json('validation_rules')->nullable()->comment('Validation rules for this workflow');
            $table->json('permissions_required')->nullable()->comment('Permissions needed for this workflow');
            $table->boolean('is_system')->default(false);
            $table->boolean('is_mobile_compatible')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Ensure unique workflow names
            $table->unique('workflow_name');
            
            // Indexes for UI workflows
            $table->index(['workflow_type', 'is_active'], 'eq_ui_wf_type_active_idx');
            $table->index('is_mobile_compatible');
        });

        Schema::create('equipment_ui_themes', function (Blueprint $table) {
            $table->id();
            $table->string('theme_name');
            $table->text('description')->nullable();
            $table->json('color_scheme')->nullable()->comment('Color definitions');
            $table->json('typography')->nullable()->comment('Font settings');
            $table->json('spacing')->nullable()->comment('Spacing settings');
            $table->json('component_styles')->nullable()->comment('Component-specific styles');
            $table->json('icon_set')->nullable()->comment('Icon set configuration');
            $table->boolean('is_dark_mode')->default(false);
            $table->boolean('is_high_contrast')->default(false);
            $table->boolean('is_system_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Ensure unique theme names
            $table->unique('theme_name');
            
            // Indexes for UI themes
            $table->index(['is_dark_mode', 'is_active'], 'eq_ui_theme_dark_active_idx');
            $table->index('is_system_default');
        });

        Schema::create('equipment_ui_user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('theme_id')->nullable()->constrained('equipment_ui_themes');
            $table->json('dashboard_configuration')->nullable()->comment('User dashboard preferences');
            $table->json('list_view_configuration')->nullable()->comment('List view preferences');
            $table->json('notification_preferences')->nullable()->comment('Notification settings');
            $table->json('accessibility_settings')->nullable()->comment('Accessibility preferences');
            $table->json('favorite_screens')->nullable()->comment('Favorite/pinned screens');
            $table->json('recent_items')->nullable()->comment('Recently viewed items');
            $table->json('saved_filters')->nullable()->comment('Saved search filters');
            $table->json('custom_shortcuts')->nullable()->comment('Custom keyboard shortcuts');
            $table->timestamps();
            
            // Ensure one preference record per user
            $table->unique('user_id');
        });

        Schema::create('equipment_mobile_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained();
            $table->string('device_identifier')->comment('Unique device identifier');
            $table->string('device_name')->nullable();
            $table->string('device_type')->nullable()->comment('Phone, tablet, etc.');
            $table->string('os_type')->nullable()->comment('iOS, Android, etc.');
            $table->string('os_version')->nullable();
            $table->string('app_version')->nullable();
            $table->dateTime('last_sync_at')->nullable();
            $table->dateTime('last_login_at')->nullable();
            $table->json('capabilities')->nullable()->comment('Camera, NFC, etc.');
            $table->json('push_token')->nullable()->comment('For push notifications');
            $table->boolean('is_authorized')->default(true);
            $table->dateTime('authorized_until')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Ensure unique device identifiers
            $table->unique('device_identifier');
            
            // Indexes for mobile devices
            $table->index(['user_id', 'is_authorized'], 'eq_mob_dev_user_auth_idx');
            $table->index('last_sync_at');
        });

        Schema::create('equipment_mobile_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained('equipment_mobile_devices');
            $table->foreignId('user_id')->nullable()->constrained();
            $table->dateTime('sync_started_at');
            $table->dateTime('sync_completed_at')->nullable();
            $table->enum('sync_type', ['full', 'incremental', 'specific']);
            $table->json('synced_data_types')->nullable()->comment('Types of data synced');
            $table->integer('records_sent')->nullable()->comment('Records sent to device');
            $table->integer('records_received')->nullable()->comment('Records received from device');
            $table->integer('conflicts_detected')->nullable();
            $table->integer('conflicts_resolved')->nullable();
            $table->string('connection_type')->nullable()->comment('WiFi, cellular, etc.');
            $table->integer('bandwidth_used_kb')->nullable();
            $table->enum('status', ['in_progress', 'completed', 'failed', 'partial']);
            $table->text('error_message')->nullable();
            $table->timestamps();
            
            // Indexes for sync logs
            $table->index(['device_id', 'sync_started_at'], 'eq_mob_sync_dev_start_idx');
            $table->index(['user_id', 'status'], 'eq_mob_sync_user_status_idx');
        });

        Schema::create('equipment_offline_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained('equipment_mobile_devices');
            $table->foreignId('user_id')->nullable()->constrained();
            $table->uuid('action_uuid')->comment('Unique identifier for this action');
            $table->dateTime('created_at_device')->comment('When this action was created on the device');
            $table->dateTime('synced_at')->nullable()->comment('When this action was synced to the server');
            $table->string('action_type')->comment('Type of action performed');
            $table->json('action_data')->comment('Data for this action');
            $table->morphs('actionable'); // Can reference equipment, maintenance, etc.
            $table->json('device_context')->nullable()->comment('Device context when action was performed');
            $table->boolean('requires_review')->default(false);
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->dateTime('reviewed_at')->nullable();
            $table->enum('status', ['pending', 'processed', 'rejected', 'conflict', 'error']);
            $table->text('status_notes')->nullable();
            $table->timestamps();
            
            // Ensure unique action UUIDs
            $table->unique('action_uuid');
            
            // Indexes for offline actions
            $table->index(['device_id', 'status'], 'eq_off_act_dev_status_idx');
            $table->index(['actionable_type', 'actionable_id'], 'eq_off_act_actionable_idx');
            $table->index('requires_review');
        });

        Schema::create('equipment_barcode_formats', function (Blueprint $table) {
            $table->id();
            $table->string('format_name');
            $table->text('description')->nullable();
            $table->string('prefix')->nullable();
            $table->string('suffix')->nullable();
            $table->integer('length')->nullable();
            $table->string('pattern')->nullable()->comment('Regex pattern for validation');
            $table->enum('barcode_type', [
                '1d', '2d', 'qr', 'datamatrix', 'pdf417', 'aztec', 'other'
            ]);
            $table->json('format_configuration')->nullable()->comment('Format-specific configuration');
            $table->string('sample_value')->nullable();
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Ensure unique format names
            $table->unique('format_name');
            
            // Indexes for barcode formats
            $table->index(['barcode_type', 'is_active'], 'eq_bar_fmt_type_active_idx');
        });

        Schema::create('equipment_scan_actions', function (Blueprint $table) {
            $table->id();
            $table->string('action_name');
            $table->text('description')->nullable();
            $table->enum('scan_type', [
                'equipment', 'location', 'user', 'patient', 'document', 'other'
            ]);
            $table->json('action_configuration')->nullable()->comment('What happens when this scan occurs');
            $table->json('required_fields')->nullable()->comment('Fields that must be collected with this scan');
            $table->json('validation_rules')->nullable()->comment('Validation rules for scan data');
            $table->json('permissions_required')->nullable()->comment('Permissions needed for this action');
            $table->boolean('requires_confirmation')->default(false);
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Ensure unique action names
            $table->unique('action_name');
            
            // Indexes for scan actions
            $table->index(['scan_type', 'is_active'], 'eq_scan_act_type_active_idx');
        });

        Schema::create('equipment_ui_help_content', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->string('content_type')->default('text')->comment('text, html, markdown, video');
            $table->string('context')->comment('Where this help content applies');
            $table->string('trigger')->nullable()->comment('What triggers this help content');
            $table->integer('display_order')->default(0);
            $table->json('related_topics')->nullable();
            $table->string('video_url')->nullable();
            $table->string('image_url')->nullable();
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes for help content
            $table->index(['context', 'is_active'], 'eq_ui_help_ctx_active_idx');
            $table->index('display_order');
        });

        Schema::create('equipment_ui_user_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->string('activity_type')->comment('page_view, action, search, etc.');
            $table->string('screen')->nullable()->comment('Screen or page viewed');
            $table->string('action')->nullable()->comment('Action performed');
            $table->json('context_data')->nullable()->comment('Additional context for this activity');
            $table->morphs('subject'); // Can reference equipment, maintenance, etc.
            $table->string('device_type')->nullable()->comment('web, mobile, etc.');
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->dateTime('activity_time');
            $table->integer('duration_seconds')->nullable();
            $table->timestamps();
            
            // Indexes for user activities
            $table->index(['user_id', 'activity_time'], 'eq_ui_act_user_time_idx');
            $table->index(['subject_type', 'subject_id'], 'eq_ui_act_subject_idx');
            $table->index(['activity_type', 'screen'], 'eq_ui_act_type_screen_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_ui_user_activities');
        Schema::dropIfExists('equipment_ui_help_content');
        Schema::dropIfExists('equipment_scan_actions');
        Schema::dropIfExists('equipment_barcode_formats');
        Schema::dropIfExists('equipment_offline_actions');
        Schema::dropIfExists('equipment_mobile_sync_logs');
        Schema::dropIfExists('equipment_mobile_devices');
        Schema::dropIfExists('equipment_ui_user_preferences');
        Schema::dropIfExists('equipment_ui_themes');
        Schema::dropIfExists('equipment_ui_workflows');
        Schema::dropIfExists('equipment_ui_screens');
        Schema::dropIfExists('equipment_ui_components');
    }
};