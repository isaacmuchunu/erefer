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
        Schema::create('equipment_inventory_checks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facility_id')->constrained()->onDelete('cascade');
            $table->foreignId('department_id')->nullable()->constrained();
            $table->foreignId('conducted_by')->constrained('users');
            $table->date('check_date');
            $table->enum('check_type', ['routine', 'annual', 'special', 'audit'])->default('routine');
            $table->text('findings')->nullable();
            $table->integer('items_checked')->default(0);
            $table->integer('items_missing')->default(0);
            $table->integer('items_damaged')->default(0);
            $table->integer('items_requiring_maintenance')->default(0);
            $table->boolean('is_complete')->default(false);
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->dateTime('verified_at')->nullable();
            $table->text('action_taken')->nullable();
            $table->date('next_check_date')->nullable();
            $table->timestamps();
        });
        
        // Create equipment inventory check items table
        Schema::create('equipment_inventory_check_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_check_id')->constrained('equipment_inventory_checks')->onDelete('cascade');
            $table->foreignId('equipment_id')->constrained();
            $table->enum('status', ['present', 'missing', 'damaged', 'requires_maintenance', 'obsolete'])->default('present');
            $table->text('notes')->nullable();
            $table->string('condition_rating')->nullable()->comment('Rating from 1-5');
            $table->boolean('requires_action')->default(false);
            $table->text('action_required')->nullable();
            $table->boolean('action_completed')->default(false);
            $table->dateTime('action_completed_at')->nullable();
            $table->foreignId('action_completed_by')->nullable()->constrained('users');
            $table->timestamps();
            
            // Ensure each equipment is only checked once per inventory check
            $table->unique(['inventory_check_id', 'equipment_id'], 'eq_inv_check_items_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_inventory_check_items');
        Schema::dropIfExists('equipment_inventory_checks');
    }
};