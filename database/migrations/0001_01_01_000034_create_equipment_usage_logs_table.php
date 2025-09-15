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
        Schema::create('equipment_usage_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('patient_id')->nullable()->constrained();
            $table->foreignId('doctor_id')->nullable()->constrained('users');
            $table->dateTime('usage_start');
            $table->dateTime('usage_end')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->string('procedure_type')->nullable();
            $table->string('procedure_code')->nullable();
            $table->text('procedure_notes')->nullable();
            $table->enum('usage_type', ['clinical', 'research', 'training', 'maintenance', 'testing', 'other'])->default('clinical');
            $table->json('settings_used')->nullable()->comment('Equipment settings during procedure');
            $table->json('consumables_used')->nullable()->comment('Any consumables used with the equipment');
            $table->text('outcome')->nullable();
            $table->boolean('complications')->default(false);
            $table->text('complication_details')->nullable();
            $table->json('telemetry_data')->nullable()->comment('Data collected during usage');
            $table->decimal('billable_amount', 10, 2)->nullable();
            $table->string('billing_code')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for common queries
            $table->index('usage_start');
            $table->index('usage_type');
            $table->index(['equipment_id', 'usage_start']);
        });
        
        // Create equipment procedures table for linking equipment to standard procedures
        Schema::create('equipment_procedures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->string('procedure_name');
            $table->string('procedure_code')->nullable();
            $table->text('description')->nullable();
            $table->integer('typical_duration_minutes')->nullable();
            $table->json('required_settings')->nullable();
            $table->json('required_consumables')->nullable();
            $table->json('setup_instructions')->nullable();
            $table->string('protocol_reference')->nullable();
            $table->decimal('standard_billing_amount', 10, 2)->nullable();
            $table->string('billing_code')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Ensure unique procedure codes per equipment
            $table->unique(['equipment_id', 'procedure_code']);
        });
        
        // Add utilization fields to equipment table
        Schema::table('equipment', function (Blueprint $table) {
            $table->integer('total_usage_hours')->default(0)->after('status');
            $table->integer('usage_limit_hours')->nullable()->after('total_usage_hours')->comment('Recommended usage limit before maintenance');
            $table->integer('remaining_usage_hours')->nullable()->after('usage_limit_hours');
            $table->dateTime('last_used_at')->nullable()->after('remaining_usage_hours');
            $table->integer('idle_threshold_hours')->nullable()->after('last_used_at')->comment('Hours of non-use before flagging');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('equipment', function (Blueprint $table) {
            $table->dropColumn('total_usage_hours');
            $table->dropColumn('usage_limit_hours');
            $table->dropColumn('remaining_usage_hours');
            $table->dropColumn('last_used_at');
            $table->dropColumn('idle_threshold_hours');
        });
        
        Schema::dropIfExists('equipment_procedures');
        Schema::dropIfExists('equipment_usage_logs');
    }
};