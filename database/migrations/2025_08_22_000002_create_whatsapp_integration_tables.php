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
        // WhatsApp Business Accounts
        Schema::create('whatsapp_business_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('business_account_id')->unique();
            $table->string('name');
            $table->string('phone_number');
            $table->string('phone_number_id');
            $table->string('access_token');
            $table->string('webhook_verify_token');
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->json('settings')->nullable();
            $table->json('rate_limits')->nullable();
            $table->timestamp('last_sync_at')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'phone_number']);
        });

        // WhatsApp Message Templates
        Schema::create('whatsapp_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_account_id')->constrained('whatsapp_business_accounts');
            $table->string('template_id')->unique();
            $table->string('name');
            $table->string('language');
            $table->enum('category', ['authentication', 'marketing', 'utility'])->default('utility');
            $table->enum('status', ['approved', 'pending', 'rejected', 'disabled'])->default('pending');
            $table->json('components'); // Header, body, footer, buttons
            $table->json('variables')->nullable(); // Available variables
            $table->text('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            
            $table->index(['business_account_id', 'status']);
            $table->index(['category', 'language']);
        });

        // WhatsApp Conversations
        Schema::create('whatsapp_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_account_id')->constrained('whatsapp_business_accounts');
            $table->string('conversation_id')->unique();
            $table->string('contact_phone');
            $table->string('contact_name')->nullable();
            $table->json('contact_profile')->nullable();
            $table->enum('status', ['active', 'archived', 'blocked'])->default('active');
            $table->enum('type', ['user_initiated', 'business_initiated'])->default('user_initiated');
            $table->timestamp('last_message_at')->nullable();
            $table->integer('unread_count')->default(0);
            $table->json('labels')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->foreignId('referral_id')->nullable()->constrained('referrals');
            $table->timestamps();
            
            $table->index(['business_account_id', 'status']);
            $table->index(['contact_phone', 'status']);
            $table->index(['assigned_to']);
        });

        // WhatsApp Messages
        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('whatsapp_conversations');
            $table->string('message_id')->unique();
            $table->string('wamid')->nullable(); // WhatsApp message ID
            $table->enum('direction', ['inbound', 'outbound'])->default('outbound');
            $table->enum('type', ['text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'template', 'interactive'])->default('text');
            $table->json('content'); // Message content based on type
            $table->enum('status', ['sent', 'delivered', 'read', 'failed'])->default('sent');
            $table->text('error_message')->nullable();
            $table->foreignId('template_id')->nullable()->constrained('whatsapp_templates');
            $table->foreignId('sender_id')->nullable()->constrained('users');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['conversation_id', 'direction']);
            $table->index(['status', 'sent_at']);
            $table->index(['sender_id']);
        });

        // WhatsApp Media Files
        Schema::create('whatsapp_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('whatsapp_messages');
            $table->string('media_id')->unique();
            $table->string('filename')->nullable();
            $table->string('mime_type');
            $table->integer('file_size')->nullable();
            $table->string('storage_path')->nullable();
            $table->string('download_url')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_downloaded')->default(false);
            $table->timestamps();
            
            $table->index(['message_id']);
            $table->index(['media_id']);
        });

        // WhatsApp Webhooks Log
        Schema::create('whatsapp_webhooks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_account_id')->nullable()->constrained('whatsapp_business_accounts');
            $table->string('webhook_id')->nullable();
            $table->enum('event_type', ['message', 'status', 'account_update', 'template_update']);
            $table->json('payload');
            $table->enum('status', ['pending', 'processed', 'failed'])->default('pending');
            $table->text('error_message')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            
            $table->index(['business_account_id', 'event_type']);
            $table->index(['status', 'created_at']);
        });

        // WhatsApp Automation Rules
        Schema::create('whatsapp_automation_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_account_id')->constrained('whatsapp_business_accounts');
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('triggers'); // Conditions that trigger the rule
            $table->json('actions'); // Actions to perform
            $table->boolean('is_active')->default(true);
            $table->integer('execution_count')->default(0);
            $table->timestamp('last_executed_at')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            
            $table->index(['business_account_id', 'is_active']);
        });

        // WhatsApp Quick Replies
        Schema::create('whatsapp_quick_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->string('title');
            $table->text('message');
            $table->string('category')->default('general');
            $table->json('variables')->nullable();
            $table->integer('usage_count')->default(0);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'category']);
        });

        // WhatsApp Contact Labels
        Schema::create('whatsapp_contact_labels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_account_id')->constrained('whatsapp_business_accounts');
            $table->string('name');
            $table->string('color')->default('#007bff');
            $table->text('description')->nullable();
            $table->timestamps();
            
            $table->unique(['business_account_id', 'name']);
        });

        // WhatsApp Conversation Labels (Many-to-Many)
        Schema::create('whatsapp_conversation_labels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('whatsapp_conversations');
            $table->foreignId('label_id')->constrained('whatsapp_contact_labels');
            $table->foreignId('applied_by')->constrained('users');
            $table->timestamps();
            
            $table->unique(['conversation_id', 'label_id']);
        });

        // WhatsApp Analytics
        Schema::create('whatsapp_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_account_id')->constrained('whatsapp_business_accounts');
            $table->date('date');
            $table->integer('messages_sent')->default(0);
            $table->integer('messages_received')->default(0);
            $table->integer('messages_delivered')->default(0);
            $table->integer('messages_read')->default(0);
            $table->integer('messages_failed')->default(0);
            $table->integer('conversations_started')->default(0);
            $table->integer('conversations_ended')->default(0);
            $table->decimal('response_time_avg', 8, 2)->nullable(); // Average response time in minutes
            $table->json('template_usage')->nullable(); // Template usage statistics
            $table->timestamps();
            
            $table->unique(['business_account_id', 'date']);
            $table->index(['date']);
        });

        // WhatsApp API Rate Limits
        Schema::create('whatsapp_rate_limits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_account_id')->constrained('whatsapp_business_accounts');
            $table->string('endpoint');
            $table->integer('requests_made')->default(0);
            $table->integer('requests_limit');
            $table->timestamp('window_start');
            $table->timestamp('window_end');
            $table->timestamps();
            
            $table->unique(['business_account_id', 'endpoint', 'window_start'], 'whatsapp_rate_limits_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whatsapp_rate_limits');
        Schema::dropIfExists('whatsapp_analytics');
        Schema::dropIfExists('whatsapp_conversation_labels');
        Schema::dropIfExists('whatsapp_contact_labels');
        Schema::dropIfExists('whatsapp_quick_replies');
        Schema::dropIfExists('whatsapp_automation_rules');
        Schema::dropIfExists('whatsapp_webhooks');
        Schema::dropIfExists('whatsapp_media');
        Schema::dropIfExists('whatsapp_messages');
        Schema::dropIfExists('whatsapp_conversations');
        Schema::dropIfExists('whatsapp_templates');
        Schema::dropIfExists('whatsapp_business_accounts');
    }
};
