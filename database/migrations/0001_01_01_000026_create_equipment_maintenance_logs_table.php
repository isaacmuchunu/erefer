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
        Schema::create('equipment_maintenance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained()->onDelete('cascade');
            $table->foreignId('performed_by')->nullable()->constrained('users');
            $table->date('maintenance_date');
            $table->enum('maintenance_type', ['routine', 'repair', 'inspection', 'calibration', 'other'])->default('routine');
            $table->text('description')->nullable();
            $table->text('actions_taken')->nullable();
            $table->text('parts_replaced')->nullable();
            $table->decimal('cost', 12, 2)->nullable();
            $table->string('technician_name')->nullable();
            $table->string('technician_company')->nullable();
            $table->string('invoice_number')->nullable();
            $table->date('next_maintenance_due')->nullable();
            $table->enum('status', ['completed', 'pending', 'scheduled', 'cancelled'])->default('completed');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_maintenance_logs');
    }
};