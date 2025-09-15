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
        Schema::create('patient_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->string('notifiable_type');
            $table->unsignedBigInteger('notifiable_id');
            $table->string('type');
            $table->enum('channel', ['email', 'sms', 'whatsapp', 'push', 'voice']);
            $table->string('title');
            $table->text('message');
            $table->unsignedBigInteger('template_id')->nullable();
            $table->json('template_data')->nullable();
            $table->datetime('scheduled_at')->nullable();
            $table->datetime('sent_at')->nullable();
            $table->datetime('delivered_at')->nullable();
            $table->datetime('read_at')->nullable();
            $table->datetime('failed_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->enum('status', ['pending', 'sent', 'delivered', 'read', 'failed'])->default('pending');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->integer('retry_count')->default(0);
            $table->integer('max_retries')->default(3);
            $table->json('metadata')->nullable();
            $table->string('external_id')->nullable();
            $table->string('external_status')->nullable();
            $table->decimal('cost', 8, 4)->default(0);
            $table->boolean('ai_optimized')->default(false);
            $table->decimal('ai_score', 3, 2)->nullable();
            $table->json('personalization_data')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['patient_id', 'status']);
            $table->index(['notifiable_type', 'notifiable_id']);
            $table->index(['type', 'channel']);
            $table->index(['status', 'scheduled_at']);
            $table->index(['priority', 'created_at']);
            $table->index('external_id');
            $table->index(['ai_optimized', 'ai_score']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_notifications');
    }
};
