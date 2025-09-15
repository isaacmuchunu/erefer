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
        Schema::create('facilities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->enum('type', ['hospital', 'clinic', 'health_center', 'specialist_center', 'emergency_center']);
            $table->enum('ownership', ['public', 'private', 'ngo', 'faith_based']);
            $table->text('description')->nullable();
            $table->string('license_number')->unique();
            $table->date('license_expiry');
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->json('contact_info'); // phone, email, website, fax
            $table->json('address'); // street, city, state, postal_code, country, coordinates
            $table->integer('total_beds')->default(0);
            $table->integer('available_beds')->default(0);
            $table->json('operating_hours'); // Different hours for different days
            $table->boolean('emergency_services')->default(false);
            $table->boolean('ambulance_services')->default(false);
            $table->json('accreditations')->nullable(); // ISO, JCI, etc.
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('rating_count')->default(0);
            $table->enum('status', ['active', 'inactive', 'maintenance'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facilities');
    }
};