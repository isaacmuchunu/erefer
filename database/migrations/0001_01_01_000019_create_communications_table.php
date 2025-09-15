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
        Schema::create('communications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referral_id')->nullable()->constrained();
            $table->foreignId('sender_id')->constrained('users');
            $table->foreignId('receiver_id')->nullable()->constrained('users');
            $table->foreignId('sender_facility_id')->constrained('facilities');
            $table->foreignId('receiver_facility_id')->nullable()->constrained('facilities');
            $table->enum('type', ['message', 'status_update', 'emergency_alert', 'system_notification']);
            $table->string('subject')->nullable();
            $table->text('message');
            $table->json('attachments')->nullable();
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->boolean('requires_response')->default(false);
            $table->timestamp('response_deadline')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('communications');
    }
};