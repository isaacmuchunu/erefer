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
        // Email Templates
        if (!Schema::hasTable('email_templates')) {
            Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('subject');
            $table->text('body_html');
            $table->text('body_text')->nullable();
            $table->string('category')->default('general');
            $table->json('variables')->nullable(); // Available template variables
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['category', 'is_active']);
        });

        // Email Campaigns
        Schema::create('email_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('template_id')->constrained('email_templates');
            $table->json('recipients'); // Array of user IDs or email addresses
            $table->json('variables')->nullable(); // Template variables
            $table->enum('status', ['draft', 'scheduled', 'sending', 'sent', 'failed'])->default('draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->integer('total_recipients')->default(0);
            $table->integer('sent_count')->default(0);
            $table->integer('failed_count')->default(0);
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            
            $table->index(['status', 'scheduled_at']);
        });

        // Email Messages
        Schema::create('email_messages', function (Blueprint $table) {
            $table->id();
            $table->string('message_id')->unique(); // Email provider message ID
            $table->foreignId('sender_id')->nullable()->constrained('users');
            $table->string('sender_email');
            $table->string('sender_name')->nullable();
            $table->json('recipients'); // to, cc, bcc
            $table->string('subject');
            $table->text('body_html')->nullable();
            $table->text('body_text')->nullable();
            $table->json('attachments')->nullable();
            $table->json('headers')->nullable();
            $table->enum('type', ['outbound', 'inbound'])->default('outbound');
            $table->enum('status', ['draft', 'queued', 'sending', 'sent', 'delivered', 'failed', 'bounced'])->default('draft');
            $table->text('failure_reason')->nullable();
            $table->foreignId('campaign_id')->nullable()->constrained('email_campaigns');
            $table->foreignId('template_id')->nullable()->constrained('email_templates');
            $table->foreignId('referral_id')->nullable()->constrained('referrals');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('clicked_at')->nullable();
            $table->integer('open_count')->default(0);
            $table->integer('click_count')->default(0);
            $table->timestamps();
            
            $table->index(['sender_id', 'type']);
            $table->index(['status', 'sent_at']);
            $table->index(['referral_id']);
        });

        // Email Tracking Events
        Schema::create('email_tracking_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('email_message_id')->constrained('email_messages');
            $table->string('event_type'); // opened, clicked, bounced, delivered, etc.
            $table->string('recipient_email');
            $table->json('event_data')->nullable();
            $table->string('user_agent')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();
            
            $table->index(['email_message_id', 'event_type']);
            $table->index(['recipient_email', 'event_type']);
        });

        // Email Attachments
        Schema::create('email_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('email_message_id')->constrained('email_messages');
            $table->string('filename');
            $table->string('original_filename');
            $table->string('mime_type');
            $table->integer('size_bytes');
            $table->string('storage_path');
            $table->string('content_id')->nullable(); // For inline attachments
            $table->boolean('is_inline')->default(false);
            $table->timestamps();
            
            $table->index(['email_message_id']);
        });

        // Email Signatures
        Schema::create('email_signatures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->string('name');
            $table->text('signature_html');
            $table->text('signature_text')->nullable();
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['user_id', 'is_default']);
        });

        // Email Folders/Labels
        Schema::create('email_folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->string('name');
            $table->string('type')->default('custom'); // inbox, sent, drafts, trash, custom
            $table->string('color')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_system')->default(false);
            $table->timestamps();
            
            $table->unique(['user_id', 'name']);
            $table->index(['user_id', 'type']);
        });

        // Email Message Folders (Many-to-Many)
        Schema::create('email_message_folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('email_message_id')->constrained('email_messages');
            $table->foreignId('email_folder_id')->constrained('email_folders');
            $table->foreignId('user_id')->constrained('users');
            $table->timestamps();
            
            $table->unique(['email_message_id', 'email_folder_id', 'user_id'], 'email_msg_folder_unique');
            $table->index(['user_id', 'email_folder_id']);
        });

        // Email Rules/Filters
        Schema::create('email_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->string('name');
            $table->json('conditions'); // Array of conditions
            $table->json('actions'); // Array of actions to perform
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->index(['user_id', 'is_active']);
        });

        // Email Contacts/Address Book
        Schema::create('email_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->string('email');
            $table->string('name')->nullable();
            $table->string('organization')->nullable();
            $table->string('phone')->nullable();
            $table->text('notes')->nullable();
            $table->json('custom_fields')->nullable();
            $table->boolean('is_favorite')->default(false);
            $table->integer('email_count')->default(0); // Number of emails exchanged
            $table->timestamp('last_email_at')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'email']);
            $table->index(['user_id', 'is_favorite']);
        });

        // Email Contact Groups
        Schema::create('email_contact_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('color')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'name']);
        });

        // Email Contact Group Members
        Schema::create('email_contact_group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('email_contact_group_id')->constrained('email_contact_groups');
            $table->foreignId('email_contact_id')->constrained('email_contacts');
            $table->timestamps();
            
            $table->unique(['email_contact_group_id', 'email_contact_id'], 'email_contact_group_member_unique');
        });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_contact_group_members');
        Schema::dropIfExists('email_contact_groups');
        Schema::dropIfExists('email_contacts');
        Schema::dropIfExists('email_rules');
        Schema::dropIfExists('email_message_folders');
        Schema::dropIfExists('email_folders');
        Schema::dropIfExists('email_signatures');
        Schema::dropIfExists('email_attachments');
        Schema::dropIfExists('email_tracking_events');
        Schema::dropIfExists('email_messages');
        Schema::dropIfExists('email_campaigns');
        Schema::dropIfExists('email_templates');
    }
};
