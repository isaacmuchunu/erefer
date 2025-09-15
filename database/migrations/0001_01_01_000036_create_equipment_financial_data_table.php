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
        Schema::create('equipment_financial_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->decimal('purchase_price', 12, 2);
            $table->string('purchase_order_number')->nullable();
            $table->string('invoice_number')->nullable();
            $table->string('invoice_file_path')->nullable();
            $table->string('cost_center')->nullable();
            $table->string('budget_code')->nullable();
            $table->string('funding_source')->nullable()->comment('Grant, capital budget, donation, etc');
            $table->string('grant_reference')->nullable();
            $table->decimal('installation_cost', 10, 2)->nullable();
            $table->decimal('shipping_cost', 10, 2)->nullable();
            $table->decimal('training_cost', 10, 2)->nullable();
            $table->decimal('annual_maintenance_cost', 10, 2)->nullable();
            $table->decimal('annual_calibration_cost', 10, 2)->nullable();
            $table->decimal('annual_consumables_cost', 10, 2)->nullable();
            $table->decimal('annual_licensing_cost', 10, 2)->nullable();
            $table->decimal('estimated_lifetime_years', 5, 2)->nullable();
            $table->decimal('total_cost_of_ownership', 12, 2)->nullable()->comment('Calculated total cost over lifetime');
            $table->decimal('cost_per_use', 10, 2)->nullable();
            $table->decimal('revenue_generated', 12, 2)->nullable()->comment('Total revenue attributed to this equipment');
            $table->decimal('roi_percentage', 5, 2)->nullable()->comment('Return on investment percentage');
            $table->date('roi_calculation_date')->nullable();
            $table->json('depreciation_schedule')->nullable();
            $table->string('asset_tag')->nullable();
            $table->string('insurance_policy_number')->nullable();
            $table->decimal('insurance_value', 12, 2)->nullable();
            $table->date('insurance_renewal_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('equipment_financial_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->date('transaction_date');
            $table->enum('transaction_type', [
                'purchase', 'maintenance', 'repair', 'calibration', 'consumables', 
                'licensing', 'insurance', 'revenue', 'depreciation', 'disposal', 'other'
            ]);
            $table->decimal('amount', 12, 2);
            $table->boolean('is_expense')->default(true);
            $table->string('vendor_name')->nullable();
            $table->string('invoice_number')->nullable();
            $table->string('invoice_file_path')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('payment_reference')->nullable();
            $table->string('cost_center')->nullable();
            $table->string('budget_code')->nullable();
            $table->string('approved_by')->nullable();
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            
            // Indexes for financial reporting with custom short names
            $table->index('transaction_date', 'eq_fin_trans_date_idx');
            $table->index(['equipment_id', 'transaction_date'], 'eq_fin_trans_eq_date_idx');
            $table->index(['transaction_type', 'is_expense'], 'eq_fin_trans_type_exp_idx');
        });
        
        // Create equipment ROI metrics table
        Schema::create('equipment_roi_calculations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->date('calculation_date');
            $table->date('period_start');
            $table->date('period_end');
            $table->integer('period_length_months');
            $table->decimal('total_costs', 12, 2);
            $table->decimal('total_revenue', 12, 2);
            $table->decimal('net_benefit', 12, 2);
            $table->decimal('roi_percentage', 5, 2);
            $table->decimal('monthly_average_cost', 10, 2);
            $table->decimal('monthly_average_revenue', 10, 2);
            $table->integer('utilization_hours');
            $table->decimal('cost_per_hour', 10, 2);
            $table->decimal('revenue_per_hour', 10, 2);
            $table->integer('procedures_count')->nullable();
            $table->decimal('cost_per_procedure', 10, 2)->nullable();
            $table->decimal('revenue_per_procedure', 10, 2)->nullable();
            $table->json('cost_breakdown')->nullable();
            $table->json('revenue_breakdown')->nullable();
            $table->text('analysis_notes')->nullable();
            $table->foreignId('calculated_by')->constrained('users');
            $table->timestamps();
            
            // Indexes for ROI analysis with custom short names
            $table->index('calculation_date', 'eq_roi_calc_date_idx');
            $table->index(['equipment_id', 'period_start', 'period_end'], 'eq_roi_period_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_roi_calculations');
        Schema::dropIfExists('equipment_financial_transactions');
        Schema::dropIfExists('equipment_financial_data');
    }
};