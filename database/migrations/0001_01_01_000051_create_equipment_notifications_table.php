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
        Schema::create('equipment_notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('subject');
            $table->text('body_template');
            $table->enum('notification_type', [
                'maintenance_due', 'maintenance_completed', 'calibration_due', 'calibration_completed',
                'reservation_confirmation', 'reservation_reminder', 'reservation_cancellation',
                'transfer_request', 'transfer_approval', 'transfer_rejection', 'transfer_completion',
                'inventory_check_scheduled', 'inventory_check_completed', 'inventory_discrepancy',
                'equipment_disposal', 'equipment_acquisition', 'warranty_expiration', 'certification_expiration',
                'inspection_due', 'inspection_failed', 'incident_report', 'compliance_violation',
                'telemetry_alert', 'workflow_stage_change', 'workflow_approval_required', 'other'
            ]);
            $table->json('available_variables')->comment('Variables that can be used in the template');
            $table->json('default_recipients')->nullable()->comment('Default roles or users to notify');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes
            $table->index(['notification_type', 'is_active'], 'eq_notif_templ_type_active_idx');
        });

        Schema::create('equipment_notification_channels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('channel_type', ['email', 'sms', 'push', 'in_app', 'webhook', 'other']);
            $table->json('configuration')->comment('Channel-specific configuration');
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['channel_type', 'is_active'], 'eq_notif_chan_type_active_idx');
        });

        Schema::create('equipment_notification_template_channels', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('notification_template_id');
            $table->unsignedBigInteger('notification_channel_id');
            $table->json('channel_specific_template')->nullable()->comment('Channel-specific formatting');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->foreign('notification_template_id')->references('id')->on('equipment_notification_templates')->name('eq_notif_tchan_templ_id_fk');
            $table->foreign('notification_channel_id')->references('id')->on('equipment_notification_channels')->name('eq_notif_tchan_chan_id_fk');
            
            // Ensure unique template-channel combinations
            $table->unique(['notification_template_id', 'notification_channel_id'], 'eq_notif_tchan_templ_chan_uniq');
            
            // Indexes
            $table->index('is_active', 'eq_notif_tchan_active_idx');
        });

        Schema::create('equipment_notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->enum('notification_type', [
                'maintenance_due', 'maintenance_completed', 'calibration_due', 'calibration_completed',
                'reservation_confirmation', 'reservation_reminder', 'reservation_cancellation',
                'transfer_request', 'transfer_approval', 'transfer_rejection', 'transfer_completion',
                'inventory_check_scheduled', 'inventory_check_completed', 'inventory_discrepancy',
                'equipment_disposal', 'equipment_acquisition', 'warranty_expiration', 'certification_expiration',
                'inspection_due', 'inspection_failed', 'incident_report', 'compliance_violation',
                'telemetry_alert', 'workflow_stage_change', 'workflow_approval_required', 'other'
            ])->nullable()->comment('Null means all types');
            $table->json('preferred_channels')->comment('Ordered list of preferred channels');
            $table->boolean('is_subscribed')->default(true);
            $table->json('quiet_hours')->nullable()->comment('Times when notifications should not be sent');
            $table->json('equipment_filters')->nullable()->comment('Only notify for specific equipment');
            $table->json('department_filters')->nullable()->comment('Only notify for specific departments');
            $table->json('facility_filters')->nullable()->comment('Only notify for specific facilities');
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->name('eq_notif_pref_user_id_fk');
            
            // Indexes
            $table->index(['user_id', 'notification_type', 'is_subscribed'], 'eq_notif_pref_user_type_sub_idx');
        });

        Schema::create('equipment_notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('notification_template_id');
            $table->enum('notification_type', [
                'maintenance_due', 'maintenance_completed', 'calibration_due', 'calibration_completed',
                'reservation_confirmation', 'reservation_reminder', 'reservation_cancellation',
                'transfer_request', 'transfer_approval', 'transfer_rejection', 'transfer_completion',
                'inventory_check_scheduled', 'inventory_check_completed', 'inventory_discrepancy',
                'equipment_disposal', 'equipment_acquisition', 'warranty_expiration', 'certification_expiration',
                'inspection_due', 'inspection_failed', 'incident_report', 'compliance_violation',
                'telemetry_alert', 'workflow_stage_change', 'workflow_approval_required', 'other'
            ]);
            $table->string('subject');
            $table->text('body');
            $table->json('data')->comment('Data used to generate the notification');
            $table->unsignedBigInteger('equipment_id')->nullable();
            $table->unsignedBigInteger('facility_id')->nullable();
            $table->unsignedBigInteger('department_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->dateTime('created_at');
            $table->dateTime('expires_at')->nullable();
            $table->json('related_records')->nullable()->comment('IDs of related records');
            $table->string('external_reference')->nullable()->comment('Reference to external system');
            
            $table->foreign('notification_template_id')->references('id')->on('equipment_notification_templates')->name('eq_notif_templ_id_fk');
            $table->foreign('equipment_id')->references('id')->on('equipment')->name('eq_notif_equip_id_fk');
            $table->foreign('facility_id')->references('id')->on('facilities')->name('eq_notif_fac_id_fk');
            $table->foreign('department_id')->references('id')->on('departments')->name('eq_notif_dept_id_fk');
            $table->foreign('created_by')->references('id')->on('users')->name('eq_notif_created_by_fk');
            
            // Indexes
            $table->index(['notification_type', 'created_at'], 'eq_notif_type_created_idx');
            $table->index(['equipment_id', 'priority'], 'eq_notif_eq_priority_idx');
            $table->index(['facility_id', 'department_id'], 'eq_notif_fac_dept_idx');
            $table->index('expires_at');
        });

        Schema::create('equipment_notification_recipients', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('notification_id');
            $table->unsignedBigInteger('user_id');
            $table->enum('recipient_type', ['primary', 'cc', 'bcc', 'escalation'])->default('primary');
            $table->boolean('is_read')->default(false);
            $table->dateTime('read_at')->nullable();
            $table->boolean('is_actioned')->default(false);
            $table->dateTime('actioned_at')->nullable();
            $table->text('action_taken')->nullable();
            $table->timestamps();
            
            $table->foreign('notification_id')->references('id')->on('equipment_notifications')->name('eq_notif_recip_notif_id_fk');
            $table->foreign('user_id')->references('id')->on('users')->name('eq_notif_recip_user_id_fk');
            
            // Ensure unique notification-user combinations
            $table->unique(['notification_id', 'user_id', 'recipient_type'], 'eq_notif_recip_notif_user_type_unique');
            
            // Indexes
            $table->index(['user_id', 'is_read'], 'eq_notif_recip_user_read_idx');
            $table->index(['user_id', 'is_actioned'], 'eq_notif_recip_user_actioned_idx');
        });

        Schema::create('equipment_notification_deliveries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('notification_id');
            $table->unsignedBigInteger('notification_recipient_id');
            $table->unsignedBigInteger('notification_channel_id');
            $table->enum('status', ['pending', 'sent', 'delivered', 'failed', 'bounced']);
            $table->dateTime('sent_at')->nullable();
            $table->dateTime('delivered_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->integer('retry_count')->default(0);
            $table->dateTime('next_retry_at')->nullable();
            $table->json('delivery_metadata')->nullable()->comment('Channel-specific delivery data');
            $table->timestamps();
            
            $table->foreign('notification_id')->references('id')->on('equipment_notifications')->name('eq_notif_deliv_notif_id_fk');
            $table->foreign('notification_recipient_id')->references('id')->on('equipment_notification_recipients')->name('eq_notif_deliv_recip_id_fk');
            $table->foreign('notification_channel_id')->references('id')->on('equipment_notification_channels')->name('eq_notif_deliv_chan_id_fk');
            
            // Indexes
            $table->index(['notification_id', 'status'], 'eq_notif_deliv_notif_status_idx');
            $table->index(['status', 'next_retry_at'], 'eq_notif_deliv_status_retry_idx');
            $table->index('notification_recipient_id', 'eq_notif_deliv_recip_id_idx');
        });

        Schema::create('equipment_notification_events', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('notification_id');
            $table->unsignedBigInteger('notification_recipient_id')->nullable();
            $table->enum('event_type', [
                'created', 'sent', 'delivered', 'read', 'clicked', 'actioned',
                'failed', 'bounced', 'expired', 'cancelled', 'other'
            ]);
            $table->dateTime('event_timestamp');
            $table->json('event_data')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
            
            $table->foreign('notification_id')->references('id')->on('equipment_notifications')->name('eq_notif_event_notif_id_fk');
            $table->foreign('notification_recipient_id')->references('id')->on('equipment_notification_recipient')->name('eq_notif_event_recip_id_fk');
            
            // Indexes
            $table->index(['notification_id', 'event_type', 'event_timestamp'], 'eq_notif_event_notif_type_time_idx');
            $table->index('notification_recipient_id', 'eq_notif_event_recip_id_idx');
        });

        Schema::create('equipment_notification_digests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->enum('digest_frequency', ['daily', 'weekly', 'monthly', 'custom']);
            $table->json('notification_types')->comment('Types of notifications to include');
            $table->json('delivery_schedule')->comment('When to deliver the digest');
            $table->unsignedBigInteger('notification_channel_id');
            $table->boolean('is_active')->default(true);
            $table->dateTime('last_sent_at')->nullable();
            $table->dateTime('next_scheduled_at')->nullable();
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->name('eq_notif_digest_user_id_fk');
            $table->foreign('notification_channel_id')->references('id')->on('equipment_notification_channels')->name('eq_notif_digest_chan_id_fk');
            
            // Indexes
            $table->index(['user_id', 'digest_frequency', 'is_active'], 'eq_notif_digest_user_freq_active_idx');
            $table->index('next_scheduled_at', 'eq_notif_digest_next_sched_idx');
        });

        Schema::create('equipment_notification_digest_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('digest_id');
            $table->unsignedBigInteger('notification_id');
            $table->boolean('is_included')->default(true);
            $table->integer('display_order')->nullable();
            $table->timestamps();
            
            $table->foreign('digest_id')->references('id')->on('equipment_notification_digests')->name('eq_notif_ditem_digest_id_fk');
            $table->foreign('notification_id')->references('id')->on('equipment_notifications')->name('eq_notif_ditem_notif_id_fk');
            
            // Ensure unique digest-notification combinations
            $table->unique(['digest_id', 'notification_id'], 'eq_notif_digest_item_digest_notif_unique');
            
            // Indexes
            $table->index(['digest_id', 'display_order'], 'eq_notif_digest_item_digest_order_idx');
        });

        Schema::create('equipment_notification_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('trigger_event', [
                'maintenance_scheduled', 'maintenance_completed', 'calibration_scheduled', 'calibration_completed',
                'reservation_created', 'reservation_updated', 'reservation_cancelled',
                'transfer_requested', 'transfer_approved', 'transfer_rejected', 'transfer_completed',
                'inventory_check_scheduled', 'inventory_check_completed', 'inventory_discrepancy_found',
                'equipment_disposed', 'equipment_acquired', 'warranty_expiring', 'certification_expiring',
                'inspection_scheduled', 'inspection_failed', 'incident_reported', 'compliance_violated',
                'telemetry_threshold_exceeded', 'workflow_stage_changed', 'workflow_approval_needed',
                'equipment_status_changed', 'equipment_location_changed', 'other'
            ]);
            $table->json('conditions')->comment('Conditions that must be met to trigger');
            $table->unsignedBigInteger('notification_template_id');
            $table->json('recipient_rules')->comment('Rules for determining recipients');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->foreign('notification_template_id')->references('id')->on('equipment_notification_templates')->name('eq_notif_rule_templ_id_fk');
            
            // Indexes
            $table->index(['trigger_event', 'is_active'], 'eq_notif_rule_trigger_active_idx');
            $table->index('priority', 'eq_notif_rule_priority_idx');
        });

        Schema::create('equipment_notification_rule_executions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('notification_rule_id');
            $table->unsignedBigInteger('notification_id')->nullable();
            $table->enum('execution_status', ['triggered', 'condition_failed', 'executed', 'failed']);
            $table->dateTime('execution_timestamp');
            $table->json('trigger_data')->comment('Data that triggered the rule');
            $table->json('evaluation_result')->nullable()->comment('Result of condition evaluation');
            $table->text('failure_reason')->nullable();
            $table->timestamps();
            
            $table->foreign('notification_rule_id')->references('id')->on('equipment_notification_rules')->name('eq_notif_rexec_rule_id_fk');
            $table->foreign('notification_id')->references('id')->on('equipment_notifications')->name('eq_notif_rexec_notif_id_fk');
            
            // Indexes
            $table->index(['notification_rule_id', 'execution_status'], 'eq_notif_rule_exec_rule_status_idx');
            $table->index('notification_id', 'eq_notif_rexec_notif_id_idx');
            $table->index('execution_timestamp', 'eq_notif_rexec_time_idx');
        });

        Schema::create('equipment_notification_escalations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('notification_id');
            $table->integer('escalation_level');
            $table->text('escalation_reason');
            $table->json('escalation_recipient')->comment('Users or roles to escalate to');
            $table->dateTime('escalated_at');
            $table->unsignedBigInteger('escalated_by')->nullable();
            $table->boolean('is_auto_escalated')->default(false);
            $table->boolean('is_resolved')->default(false);
            $table->dateTime('resolved_at')->nullable();
            $table->unsignedBigInteger('resolved_by')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->timestamps();
            
            $table->foreign('notification_id')->references('id')->on('equipment_notifications')->name('eq_notif_escal_notif_id_fk');
            $table->foreign('escalated_by')->references('id')->on('users')->name('eq_notif_escal_by_fk');
            $table->foreign('resolved_by')->references('id')->on('users')->name('eq_notif_escal_res_by_fk');
            
            // Indexes
            $table->index(['notification_id', 'escalation_level'], 'eq_notif_escal_notif_level_idx');
            $table->index(['is_resolved', 'escalated_at'], 'eq_notif_escal_resolved_at_idx');
        });

        Schema::create('equipment_notification_suppressions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->enum('suppression_type', ['user', 'equipment', 'notification_type', 'global']);
            $table->unsignedBigInteger('equipment_id')->nullable();
            $table->enum('notification_type', [
                'maintenance_due', 'maintenance_completed', 'calibration_due', 'calibration_completed',
                'reservation_confirmation', 'reservation_reminder', 'reservation_cancellation',
                'transfer_request', 'transfer_approval', 'transfer_rejection', 'transfer_completion',
                'inventory_check_scheduled', 'inventory_check_completed', 'inventory_discrepancy',
                'equipment_disposal', 'equipment_acquisition', 'warranty_expiration', 'certification_expiration',
                'inspection_due', 'inspection_failed', 'incident_report', 'compliance_violation',
                'telemetry_alert', 'workflow_stage_change', 'workflow_approval_required', 'other'
            ])->nullable();
            $table->dateTime('start_time');
            $table->dateTime('end_time')->nullable();
            $table->text('reason')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->name('eq_notif_supp_user_id_fk');
            $table->foreign('equipment_id')->references('id')->on('equipment')->name('eq_notif_supp_equip_id_fk');
            $table->foreign('created_by')->references('id')->on('users')->name('eq_notif_supp_created_by_fk');
            
            // Indexes
            $table->index(['suppression_type', 'is_active'], 'eq_notif_supp_type_active_idx');
            $table->index(['start_time', 'end_time'], 'eq_notif_supp_start_end_idx');
            $table->index(['user_id', 'equipment_id', 'notification_type'], 'eq_notif_supp_user_eq_type_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_notification_suppressions');
        Schema::dropIfExists('equipment_notification_escalations');
        Schema::dropIfExists('equipment_notification_rule_executions');
        Schema::dropIfExists('equipment_notification_rules');
        Schema::dropIfExists('equipment_notification_digest_items');
        Schema::dropIfExists('equipment_notification_digests');
        Schema::dropIfExists('equipment_notification_events');
        Schema::dropIfExists('equipment_notification_deliveries');
        Schema::dropIfExists('equipment_notification_recipients');
        Schema::dropIfExists('equipment_notifications');
        Schema::dropIfExists('equipment_notification_preferences');
        Schema::dropIfExists('equipment_notification_template_channels');
        Schema::dropIfExists('equipment_notification_channels');
        Schema::dropIfExists('equipment_notification_templates');
    }
};