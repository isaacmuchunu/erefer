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
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->integer('level')->default(0); // Hierarchy level (higher = more permissions)
            $table->boolean('is_active')->default(true);
            $table->string('color', 7)->default('#6B7280'); // Hex color for UI
            $table->string('icon')->nullable(); // Icon name for UI
            $table->json('metadata')->nullable(); // Additional role configuration
            $table->timestamps();

            $table->index(['slug', 'is_active']);
            $table->index('level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};