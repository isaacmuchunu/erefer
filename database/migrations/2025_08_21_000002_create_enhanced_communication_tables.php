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
        Schema::create('chat_rooms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['referral_case', 'emergency', 'general', 'private', 'group']);
            $table->foreignId('referral_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('incident_id')->nullable()->comment('For emergency incidents');
            $table->foreignId('created_by')->constrained('users');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_private')->default(false);
            $table->json('settings')->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->string('invite_code', 8)->nullable()->unique();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['type', 'is_active']);
            $table->index('referral_id');
            $table->index('incident_id');
            $table->index('last_activity_at');
        });

        Schema::create('chat_room_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_room_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('role', ['admin', 'moderator', 'participant'])->default('participant');
            $table->timestamp('joined_at');
            $table->timestamp('last_read_at')->nullable();
            $table->json('notification_settings')->nullable();
            $table->timestamps();
            
            // Unique constraint
            $table->unique(['chat_room_id', 'user_id']);
            
            // Indexes
            $table->index(['chat_room_id', 'role']);
            $table->index('user_id');
        });

        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_room_id')->constrained()->onDelete('cascade');
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->text('message')->nullable();
            $table->enum('message_type', ['text', 'file', 'image', 'voice', 'video', 'system', 'location'])->default('text');
            $table->json('attachments')->nullable();
            $table->json('metadata')->nullable();
            $table->foreignId('reply_to_id')->nullable()->constrained('chat_messages')->onDelete('set null');
            $table->boolean('is_system_message')->default(false);
            $table->boolean('is_edited')->default(false);
            $table->timestamp('edited_at')->nullable();
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['chat_room_id', 'created_at']);
            $table->index(['sender_id', 'created_at']);
            $table->index('message_type');
            $table->index('priority');
            $table->index('expires_at');
        });

        Schema::create('message_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_message_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('emoji', 10);
            $table->timestamps();
            
            // Unique constraint - one reaction per user per message
            $table->unique(['chat_message_id', 'user_id']);
            
            // Indexes
            $table->index(['chat_message_id', 'emoji']);
        });

        Schema::create('message_read_receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_message_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('read_at');
            $table->timestamps();
            
            // Unique constraint
            $table->unique(['chat_message_id', 'user_id']);
            
            // Indexes
            $table->index(['chat_message_id', 'read_at']);
            $table->index('user_id');
        });

        Schema::create('video_calls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_room_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('initiator_id')->constrained('users');
            $table->string('call_id')->unique();
            $table->enum('type', ['voice', 'video'])->default('video');
            $table->enum('status', ['initiated', 'ringing', 'active', 'ended', 'cancelled', 'failed']);
            $table->json('participants'); // Array of user IDs
            $table->json('settings')->nullable();
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->json('recording_info')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['status', 'started_at']);
            $table->index('initiator_id');
            $table->index('chat_room_id');
        });

        Schema::create('call_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('video_call_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['invited', 'joined', 'left', 'declined']);
            $table->timestamp('invited_at');
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('left_at')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->json('connection_info')->nullable();
            $table->timestamps();
            
            // Unique constraint
            $table->unique(['video_call_id', 'user_id']);
            
            // Indexes
            $table->index(['video_call_id', 'status']);
            $table->index('user_id');
        });

        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('type'); // email, sms, push, in_app
            $table->string('event_trigger');
            $table->string('subject')->nullable();
            $table->text('template');
            $table->json('variables')->nullable(); // Available template variables
            $table->json('conditions')->nullable(); // When to send this notification
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(1);
            $table->timestamps();
            
            // Indexes
            $table->index(['event_trigger', 'is_active']);
            $table->index('type');
        });

        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('notification_type');
            $table->enum('delivery_method', ['email', 'sms', 'push', 'in_app']);
            $table->boolean('enabled')->default(true);
            $table->json('schedule')->nullable(); // When to receive notifications
            $table->json('filters')->nullable(); // Conditions for receiving notifications
            $table->timestamps();
            
            // Unique constraint
            $table->unique(['user_id', 'notification_type', 'delivery_method'], 'notification_prefs_unique');
            
            // Indexes
            $table->index(['user_id', 'enabled']);
            $table->index('notification_type');
        });

        Schema::create('communication_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('chat_room_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('metric_type'); // messages_sent, calls_made, response_time, etc.
            $table->decimal('value', 10, 2);
            $table->string('unit')->nullable(); // seconds, count, percentage, etc.
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['date', 'metric_type']);
            $table->index(['chat_room_id', 'date']);
            $table->index(['user_id', 'date']);
        });

        Schema::create('emergency_broadcasts', function (Blueprint $table) {
            $table->id();
            $table->string('incident_id');
            $table->foreignId('initiated_by')->constrained('users');
            $table->string('title');
            $table->text('message');
            $table->enum('severity', ['low', 'medium', 'high', 'critical']);
            $table->enum('type', ['general', 'evacuation', 'lockdown', 'medical', 'fire', 'weather']);
            $table->json('target_facilities')->nullable(); // Specific facilities to notify
            $table->json('target_roles')->nullable(); // Specific roles to notify
            $table->json('target_locations')->nullable(); // Geographic areas
            $table->boolean('requires_acknowledgment')->default(false);
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('recipients_count')->default(0);
            $table->integer('acknowledged_count')->default(0);
            $table->timestamps();
            
            // Indexes
            $table->index(['incident_id', 'is_active']);
            $table->index(['severity', 'created_at']);
            $table->index('expires_at');
        });

        Schema::create('emergency_broadcast_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('emergency_broadcast_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('delivery_method', ['email', 'sms', 'push', 'in_app']);
            $table->enum('status', ['pending', 'sent', 'delivered', 'failed']);
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('acknowledged_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamps();
            
            // Unique constraint
            $table->unique(['emergency_broadcast_id', 'user_id', 'delivery_method'], 'eb_recipient_unique');
            
            // Indexes
            $table->index(['emergency_broadcast_id', 'status'], 'eb_recip_status_idx');
            $table->index(['user_id', 'acknowledged_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emergency_broadcast_recipients');
        Schema::dropIfExists('emergency_broadcasts');
        Schema::dropIfExists('communication_analytics');
        Schema::dropIfExists('notification_preferences');
        Schema::dropIfExists('notification_templates');
        Schema::dropIfExists('call_participants');
        Schema::dropIfExists('video_calls');
        Schema::dropIfExists('message_read_receipts');
        Schema::dropIfExists('message_reactions');
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chat_room_participants');
        Schema::dropIfExists('chat_rooms');
    }
};
