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
        Schema::create('equipment_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('parent_category_id')->nullable()->constrained('equipment_categories')->onDelete('set null');
            $table->boolean('requires_maintenance')->default(true);
            $table->integer('maintenance_frequency_days')->nullable();
            $table->boolean('requires_calibration')->default(false);
            $table->integer('calibration_frequency_days')->nullable();
            $table->boolean('requires_reservation')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Add a unique constraint on name
            $table->unique('name');
        });
        
        // Add category_id to equipment table
        Schema::table('equipment', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('department_id')->constrained('equipment_categories')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove category_id from equipment table
        Schema::table('equipment', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });
        
        Schema::dropIfExists('equipment_categories');
    }
};