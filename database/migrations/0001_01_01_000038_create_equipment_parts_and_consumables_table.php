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
        Schema::create('equipment_parts', function (Blueprint $table) {
            $table->id();
            $table->string('part_number');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('supplier')->nullable();
            $table->decimal('cost', 10, 2)->nullable();
            $table->integer('typical_lifetime_hours')->nullable();
            $table->boolean('is_critical')->default(false);
            $table->integer('lead_time_days')->nullable()->comment('Typical time to receive after ordering');
            $table->integer('min_stock_level')->nullable();
            $table->integer('current_stock')->default(0);
            $table->string('storage_location')->nullable();
            $table->string('image_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Ensure unique part numbers
            $table->unique('part_number');
        });

        Schema::create('equipment_consumables', function (Blueprint $table) {
            $table->id();
            $table->string('item_number');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('supplier')->nullable();
            $table->decimal('cost_per_unit', 10, 2)->nullable();
            $table->string('unit_type')->nullable()->comment('box, each, pack, etc');
            $table->integer('units_per_package')->nullable();
            $table->integer('min_stock_level')->nullable();
            $table->integer('current_stock')->default(0);
            $table->string('storage_location')->nullable();
            $table->date('expiration_date')->nullable();
            $table->string('lot_number')->nullable();
            $table->string('image_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Ensure unique item numbers
            $table->unique('item_number');
        });

        Schema::create('equipment_part_compatibility', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->foreignId('part_id')->constrained('equipment_parts');
            $table->boolean('is_original_part')->default(false);
            $table->text('compatibility_notes')->nullable();
            $table->string('location_in_equipment')->nullable();
            $table->integer('quantity_required')->default(1);
            $table->timestamps();
            
            // Ensure unique equipment-part combinations
            $table->unique(['equipment_id', 'part_id'], 'epc_equip_part_unique');
        });

        Schema::create('equipment_consumable_compatibility', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->foreignId('consumable_id')->constrained('equipment_consumables');
            $table->text('compatibility_notes')->nullable();
            $table->decimal('usage_rate', 10, 2)->nullable()->comment('Units used per hour of operation');
            $table->timestamps();
            
            // Ensure unique equipment-consumable combinations
            $table->unique(['equipment_id', 'consumable_id'], 'ecc_equip_cons_unique');
        });

        Schema::create('equipment_part_replacements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->foreignId('part_id')->constrained('equipment_parts');
            $table->foreignId('maintenance_log_id')->nullable()->constrained('equipment_maintenance_logs');
            $table->date('replacement_date');
            $table->foreignId('replaced_by')->constrained('users');
            $table->integer('equipment_hours_at_replacement')->nullable();
            $table->string('old_part_serial')->nullable();
            $table->string('new_part_serial')->nullable();
            $table->string('old_part_condition')->nullable();
            $table->boolean('old_part_returned')->default(false);
            $table->string('return_authorization_number')->nullable();
            $table->decimal('replacement_cost', 10, 2)->nullable();
            $table->string('invoice_number')->nullable();
            $table->text('reason_for_replacement')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for part replacement history with custom names
            $table->index('replacement_date', 'epr_repl_date_idx');
            $table->index(['equipment_id', 'part_id'], 'epr_equip_part_idx');
        });

        Schema::create('equipment_consumable_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->foreignId('consumable_id')->constrained('equipment_consumables');
            $table->foreignId('usage_log_id')->nullable()->constrained('equipment_usage_logs');
            $table->date('usage_date');
            $table->foreignId('used_by')->constrained('users');
            $table->decimal('quantity_used', 10, 2);
            $table->string('lot_number')->nullable();
            $table->foreignId('patient_id')->nullable()->constrained();
            $table->string('procedure_reference')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for consumable usage tracking with custom names
            $table->index('usage_date', 'ecu_usage_date_idx');
            $table->index(['equipment_id', 'consumable_id'], 'ecu_equip_cons_idx');
        });

        Schema::create('equipment_inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->enum('item_type', ['part', 'consumable']);
            $table->unsignedBigInteger('item_id')->comment('FK to either equipment_parts or equipment_consumables');
            $table->enum('transaction_type', ['purchase', 'use', 'adjustment', 'return', 'transfer', 'disposal']);
            $table->date('transaction_date');
            $table->decimal('quantity', 10, 2);
            $table->integer('previous_stock_level');
            $table->integer('new_stock_level');
            $table->string('reference_number')->nullable()->comment('PO, invoice, etc');
            $table->string('supplier')->nullable();
            $table->decimal('unit_cost', 10, 2)->nullable();
            $table->decimal('total_cost', 10, 2)->nullable();
            $table->foreignId('performed_by')->constrained('users');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for inventory management with custom names
            $table->index('transaction_date', 'eit_trans_date_idx');
            $table->index(['item_type', 'item_id'], 'eit_item_type_id_idx');
            $table->index('transaction_type', 'eit_trans_type_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_inventory_transactions');
        Schema::dropIfExists('equipment_consumable_usage');
        Schema::dropIfExists('equipment_part_replacements');
        Schema::dropIfExists('equipment_consumable_compatibility');
        Schema::dropIfExists('equipment_part_compatibility');
        Schema::dropIfExists('equipment_consumables');
        Schema::dropIfExists('equipment_parts');
    }
};