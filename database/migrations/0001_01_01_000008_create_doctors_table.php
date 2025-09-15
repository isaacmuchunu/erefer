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
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('facility_id')->constrained();
            $table->string('medical_license_number')->unique();
            $table->date('license_expiry');
            $table->json('qualifications'); // degrees, certifications
            $table->integer('years_of_experience');
            $table->json('languages_spoken');
            $table->text('bio')->nullable();
            $table->decimal('consultation_fee', 10, 2)->nullable();
            $table->json('availability_schedule'); // Working hours, days off
            $table->boolean('accepts_referrals')->default(true);
            $table->integer('max_daily_referrals')->default(20);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('rating_count')->default(0);
            $table->enum('status', ['active', 'on_leave', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};