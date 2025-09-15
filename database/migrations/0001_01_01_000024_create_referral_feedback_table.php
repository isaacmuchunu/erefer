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
        Schema::create('referral_feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referral_id')->constrained()->onDelete('cascade');
            $table->foreignId('feedback_by')->constrained('users');
            $table->enum('type', ['quality', 'outcome', 'service', 'communication']);
            $table->integer('rating')->comment('Rating from 1 to 5');
            $table->text('comments')->nullable();
            $table->json('specific_ratings')->nullable(); // Breakdown of different aspects
            $table->boolean('would_refer_again')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referral_feedback');
    }
};