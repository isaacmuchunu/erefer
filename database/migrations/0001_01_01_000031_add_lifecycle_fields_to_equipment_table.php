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
        Schema::table('equipment', function (Blueprint $table) {
            // Lifecycle management fields
            $table->date('end_of_life_date')->nullable()->after('warranty_expiry');
            $table->decimal('depreciation_rate', 5, 2)->nullable()->after('cost')->comment('Annual depreciation rate as percentage');
            $table->decimal('residual_value', 10, 2)->nullable()->after('depreciation_rate')->comment('Expected value at end of life');
            $table->date('last_depreciation_date')->nullable()->after('residual_value');
            
            // Compliance fields
            $table->json('certifications')->nullable()->after('specifications');
            $table->date('certification_expiry')->nullable()->after('certifications');
            $table->date('last_inspection_date')->nullable()->after('certification_expiry');
            $table->date('next_inspection_due')->nullable()->after('last_inspection_date');
            
            // IoT & Telemetry fields
            $table->string('device_id')->nullable()->after('serial_number');
            $table->string('connectivity_type')->nullable()->after('device_id')->comment('wifi, bluetooth, ethernet, etc');
            $table->json('telemetry_data')->nullable()->after('specifications');
            
            // Location tracking
            $table->string('location_detail')->nullable()->after('department_id')->comment('Room number, floor, specific location');
            $table->string('qr_code')->nullable()->after('code');
            
            // Cost management
            $table->decimal('annual_maintenance_cost', 10, 2)->nullable()->after('cost');
            $table->string('warranty_reference')->nullable()->after('warranty_expiry');
            $table->string('service_contract_reference')->nullable()->after('warranty_reference');
            $table->date('service_contract_expiry')->nullable()->after('service_contract_reference');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('equipment', function (Blueprint $table) {
            // Lifecycle management fields
            $table->dropColumn('end_of_life_date');
            $table->dropColumn('depreciation_rate');
            $table->dropColumn('residual_value');
            $table->dropColumn('last_depreciation_date');
            
            // Compliance fields
            $table->dropColumn('certifications');
            $table->dropColumn('certification_expiry');
            $table->dropColumn('last_inspection_date');
            $table->dropColumn('next_inspection_due');
            
            // IoT & Telemetry fields
            $table->dropColumn('device_id');
            $table->dropColumn('connectivity_type');
            $table->dropColumn('telemetry_data');
            
            // Location tracking
            $table->dropColumn('location_detail');
            $table->dropColumn('qr_code');
            
            // Cost management
            $table->dropColumn('annual_maintenance_cost');
            $table->dropColumn('warranty_reference');
            $table->dropColumn('service_contract_reference');
            $table->dropColumn('service_contract_expiry');
        });
    }
};