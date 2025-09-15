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
        Schema::create('equipment_calibrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->date('calibration_date');
            $table->date('next_calibration_due');
            $table->foreignId('performed_by')->nullable()->constrained('users');
            $table->string('technician_name')->nullable();
            $table->string('technician_company')->nullable();
            $table->string('calibration_certificate_number')->nullable();
            $table->string('calibration_certificate_file')->nullable();
            $table->enum('calibration_type', ['initial', 'routine', 'post_repair', 'verification', 'special'])->default('routine');
            $table->enum('calibration_standard', ['manufacturer', 'iso', 'astm', 'custom', 'other'])->default('manufacturer');
            $table->string('standard_reference')->nullable()->comment('Specific standard reference number');
            $table->json('measurement_points')->nullable()->comment('Points tested during calibration');
            $table->json('test_results')->nullable();
            $table->boolean('passed')->default(true);
            $table->text('adjustments_made')->nullable();
            $table->text('recommendations')->nullable();
            $table->decimal('cost', 10, 2)->nullable();
            $table->string('invoice_number')->nullable();
            $table->text('notes')->nullable();
            $table->string('environmental_conditions')->nullable()->comment('Temperature, humidity during calibration');
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->timestamps();
        });
        
        // Add calibration-specific fields to equipment table
        Schema::table('equipment', function (Blueprint $table) {
            $table->boolean('requires_calibration')->default(false);
            $table->integer('calibration_frequency_days')->nullable();
            $table->date('last_calibration')->nullable();
            $table->date('next_calibration_due')->nullable();
            $table->string('calibration_procedure_reference')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('equipment', function (Blueprint $table) {
            $table->dropColumn('requires_calibration');
            $table->dropColumn('calibration_frequency_days');
            $table->dropColumn('last_calibration');
            $table->dropColumn('next_calibration_due');
            $table->dropColumn('calibration_procedure_reference');
        });
        
        Schema::dropIfExists('equipment_calibrations');
    }
};