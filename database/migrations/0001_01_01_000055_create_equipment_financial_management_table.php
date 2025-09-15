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
        Schema::create('equipment_cost_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('accounting_code')->nullable();
            $table->boolean('is_capital')->default(false)->comment('Whether this is a capital expenditure category');
            $table->boolean('is_operational')->default(true)->comment('Whether this is an operational expenditure category');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes
            $table->index(['is_capital', 'is_operational'], 'eq_cost_cat_cap_op_idx');
            $table->index('is_active');
        });

        Schema::create('equipment_cost_centers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('code')->nullable();
            $table->foreignId('department_id')->nullable()->constrained('departments');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes
            $table->index(['department_id', 'is_active'], 'eq_cost_ctr_dept_active_idx');
        });

        Schema::create('equipment_budgets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('cost_center_id')->nullable()->constrained('equipment_cost_centers');
            $table->foreignId('department_id')->nullable()->constrained('departments');
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('USD');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('budget_type', ['capital', 'operational', 'maintenance', 'mixed']);
            $table->enum('status', ['draft', 'approved', 'active', 'closed', 'cancelled']);
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->dateTime('approved_at')->nullable();
            $table->text('approval_notes')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            
            // Indexes
            $table->index(['cost_center_id', 'start_date', 'end_date'], 'eq_budget_ctr_start_end_idx');
            $table->index(['department_id', 'budget_type', 'status'], 'eq_budget_dept_type_status_idx');
        });

        Schema::create('equipment_budget_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_id')->constrained('equipment_budgets');
            $table->foreignId('cost_category_id')->constrained('equipment_cost_categories');
            $table->decimal('allocated_amount', 15, 2);
            $table->text('allocation_notes')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            
            // Indexes
            $table->unique(['budget_id', 'cost_category_id'], 'eq_budget_alloc_budget_cat_unique');
        });

        if (!Schema::hasTable('equipment_financial_transactions')) {
    Schema::create('equipment_financial_transactions', function (Blueprint $table) {
        $table->id();
        $table->uuid('transaction_reference')->unique();
        $table->foreignId('equipment_id')->nullable()->constrained('equipment', indexName: 'eq_fin_trans_eq_fk');
        $table->foreignId('cost_category_id')->constrained('equipment_cost_categories');
        $table->foreignId('cost_center_id')->nullable()->constrained('equipment_cost_centers');
        $table->foreignId('budget_id')->nullable()->constrained('equipment_budgets');
        $table->decimal('amount', 15, 2);
        $table->string('currency', 3)->default('USD');
        $table->decimal('exchange_rate', 10, 6)->default(1.0);
        $table->decimal('amount_local', 15, 2)->nullable()->comment('Amount in local currency');
        $table->enum('transaction_type', [
            'purchase', 'lease_payment', 'maintenance', 'repair', 
            'upgrade', 'insurance', 'depreciation', 'disposal', 
            'training', 'certification', 'consumables', 'parts', 
            'service_contract', 'warranty', 'other'
        ]);
        $table->date('transaction_date');
        $table->text('description')->nullable();
        $table->string('invoice_number')->nullable();
        $table->string('purchase_order_number')->nullable();
        $table->string('payment_reference')->nullable();
        $table->foreignId('vendor_id')->nullable()->constrained('equipment_vendors');
        $table->enum('payment_method', [
            'cash', 'credit_card', 'bank_transfer', 'check', 
            'electronic_payment', 'internal_transfer', 'other'
        ])->nullable();
        $table->enum('payment_status', [
            'pending', 'approved', 'paid', 'partially_paid', 
            'cancelled', 'refunded', 'disputed'
        ]);
        $table->foreignId('created_by')->constrained('users');
        $table->foreignId('approved_by')->nullable()->constrained('users');
        $table->dateTime('approved_at')->nullable();
        $table->timestamps();
        
        // Indexes
        $table->index(['cost_category_id', 'transaction_type'], 'eq_fin_trans_cat_type_idx');
        $table->index(['budget_id', 'payment_status'], 'eq_fin_trans_budget_status_idx');
        $table->index('transaction_date');
    });
}

        Schema::create('equipment_transaction_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('equipment_financial_transactions');
            $table->string('attachment_type');
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_size')->nullable();
            $table->string('mime_type')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('uploaded_by')->constrained('users');
            $table->timestamps();
            
            // Indexes
            $table->index(['transaction_id', 'attachment_type'], 'eq_trans_attach_trans_type_idx');
        });

        Schema::create('equipment_depreciation_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('method_type', [
                'straight_line', 'declining_balance', 'double_declining', 
                'sum_of_years_digits', 'units_of_production', 'custom'
            ]);
            $table->json('calculation_parameters')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes
            $table->index(['method_type', 'is_active'], 'eq_depr_meth_type_active_idx');
        });

        Schema::create('equipment_depreciation_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained('equipment');
            $table->foreignId('depreciation_method_id')->constrained('equipment_depreciation_methods');
            $table->decimal('initial_value', 15, 2);
            $table->decimal('residual_value', 15, 2)->default(0);
            $table->integer('useful_life_years');
            $table->integer('useful_life_months')->nullable();
            $table->date('depreciation_start_date');
            $table->date('depreciation_end_date')->nullable();
            $table->enum('frequency', ['monthly', 'quarterly', 'semi_annually', 'annually']);
            $table->decimal('current_book_value', 15, 2);
            $table->decimal('total_depreciated_value', 15, 2)->default(0);
            $table->date('last_depreciation_date')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->constrained('users');
            $table->timestamps();
            
            // Indexes
            $table->unique('equipment_id');
            $table->index('depreciation_start_date');
        });

        Schema::create('equipment_depreciation_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained('equipment_depreciation_schedules');
            $table->foreignId('equipment_id')->constrained('equipment');
            $table->date('entry_date');
            $table->integer('period_number');
            $table->decimal('depreciation_amount', 15, 2);
            $table->decimal('book_value_before', 15, 2);
            $table->decimal('book_value_after', 15, 2);
            $table->decimal('accumulated_depreciation', 15, 2);
            $table->foreignId('transaction_id')->nullable()->constrained('equipment_financial_transactions');
            $table->enum('status', ['pending', 'posted', 'adjusted', 'reversed']);
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            
            // Indexes
            $table->index(['schedule_id', 'entry_date'], 'eq_depr_ent_sched_date_idx');
            $table->index(['equipment_id', 'period_number']);
            $table->index('status');
        });

        Schema::create('equipment_asset_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained('equipment');
            $table->foreignId('source_department_id')->nullable()->constrained('departments');
            $table->foreignId('destination_department_id')->nullable()->constrained('departments');
            $table->foreignId('source_cost_center_id')->nullable()->constrained('equipment_cost_centers');
            $table->foreignId('destination_cost_center_id')->nullable()->constrained('equipment_cost_centers');
            $table->date('transfer_date');
            $table->enum('transfer_type', ['department', 'cost_center', 'location', 'ownership', 'mixed']);
            $table->decimal('transfer_value', 15, 2)->nullable();
            $table->text('transfer_reason')->nullable();
            $table->enum('status', ['pending', 'approved', 'completed', 'cancelled', 'rejected']);
            $table->foreignId('requested_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->dateTime('approved_at')->nullable();
            $table->foreignId('completed_by')->nullable()->constrained('users');
            $table->dateTime('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['equipment_id', 'transfer_date'], 'eq_asset_trans_eq_trans_date_idx');
            $table->index(['source_department_id', 'destination_department_id'], 'eq_asset_trans_src_dest_dept_idx');
            $table->index('status');
        });

        Schema::create('equipment_financial_forecasts', function (Blueprint $table) {
            $table->id();
            $table->string('forecast_name');
            $table->text('description')->nullable();
            $table->foreignId('equipment_id')->nullable()->constrained('equipment');
            $table->foreignId('department_id')->nullable()->constrained('departments');
            $table->foreignId('cost_center_id')->nullable()->constrained('equipment_cost_centers');
            $table->date('forecast_start_date');
            $table->date('forecast_end_date');
            $table->enum('forecast_type', ['maintenance', 'operational', 'replacement', 'upgrade', 'mixed']);
            $table->enum('forecast_period', ['monthly', 'quarterly', 'semi_annually', 'annually']);
            $table->decimal('total_forecast_amount', 15, 2);
            $table->json('forecast_data')->comment('Detailed forecast data by period');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            
            // Indexes
            $table->index(['equipment_id', 'forecast_start_date', 'forecast_end_date'], 'eq_forecast_dates_idx');
            $table->index(['department_id', 'forecast_type']);
        });

        Schema::create('equipment_financial_reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_name');
            $table->text('description')->nullable();
            $table->enum('report_type', [
                'expense', 'budget_variance', 'depreciation', 'asset_value', 
                'maintenance_cost', 'total_cost_of_ownership', 'roi', 
                'forecast', 'custom'
            ]);
            $table->date('report_start_date');
            $table->date('report_end_date');
            $table->foreignId('department_id')->nullable()->constrained('departments');
            $table->foreignId('cost_center_id')->nullable()->constrained('equipment_cost_centers');
            $table->json('report_parameters')->nullable();
            $table->json('report_data')->nullable();
            $table->string('report_file_path')->nullable();
            $table->enum('status', ['generating', 'completed', 'failed', 'archived']);
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            
            // Indexes
            $table->index(['report_type', 'report_start_date', 'report_end_date'], 'eq_report_dates_idx');
            $table->index(['department_id', 'status'], 'eq_po_dept_status_idx');
        });

        Schema::create('equipment_purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('po_number')->unique();
            $table->foreignId('vendor_id')->constrained('equipment_vendors');
            $table->foreignId('department_id')->nullable()->constrained('departments');
            $table->foreignId('cost_center_id')->nullable()->constrained('equipment_cost_centers');
            $table->foreignId('budget_id')->nullable()->constrained('equipment_budgets');
            $table->date('po_date');
            $table->date('expected_delivery_date')->nullable();
            $table->decimal('total_amount', 15, 2);
            $table->string('currency', 3)->default('USD');
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('shipping_amount', 15, 2)->default(0);
            $table->enum('status', [
                'draft', 'pending_approval', 'approved', 'sent', 
                'partially_received', 'received', 'cancelled', 'closed'
            ]);
            $table->text('notes')->nullable();
            $table->string('shipping_address')->nullable();
            $table->string('billing_address')->nullable();
            $table->string('payment_terms')->nullable();
            $table->string('shipping_terms')->nullable();
            $table->foreignId('requested_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->dateTime('approved_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['vendor_id', 'po_date'], 'eq_po_vendor_date_idx');
            $table->index(['department_id', 'status'], 'eq_lease_dept_status_idx');
            $table->index('budget_id');
        });

        Schema::create('equipment_purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained('equipment_purchase_orders');
            $table->string('item_description');
            $table->string('item_number')->nullable();
            $table->string('manufacturer_part_number')->nullable();
            $table->decimal('quantity', 10, 2);
            $table->string('unit_of_measure')->default('each');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('line_total', 15, 2);
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->foreignId('equipment_model_id')->nullable()->constrained('equipment_models');
            $table->foreignId('cost_category_id')->nullable()->constrained('equipment_cost_categories');
            $table->decimal('received_quantity', 10, 2)->default(0);
            $table->enum('item_status', ['pending', 'partially_received', 'received', 'cancelled']);
            $table->timestamps();
            
            // Indexes
            $table->index('purchase_order_id');
            $table->index(['equipment_model_id', 'item_status'], 'eq_po_item_model_status_idx');
        });

        Schema::create('equipment_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number');
            $table->foreignId('vendor_id')->constrained('equipment_vendors');
            $table->foreignId('purchase_order_id')->nullable()->constrained('equipment_purchase_orders');
            $table->date('invoice_date');
            $table->date('due_date');
            $table->decimal('total_amount', 15, 2);
            $table->string('currency', 3)->default('USD');
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('shipping_amount', 15, 2)->default(0);
            $table->enum('status', [
                'received', 'under_review', 'approved', 'partially_paid', 
                'paid', 'disputed', 'cancelled'
            ]);
            $table->text('notes')->nullable();
            $table->string('payment_terms')->nullable();
            $table->foreignId('received_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->dateTime('approved_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['vendor_id', 'invoice_date'], 'eq_invoice_vendor_date_idx');
            $table->index(['purchase_order_id', 'status'], 'eq_invoice_po_status_idx');
            $table->unique(['vendor_id', 'invoice_number'], 'eq_invoice_vendor_num_unique');
        });

        Schema::create('equipment_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('equipment_invoices');
            $table->foreignId('purchase_order_item_id')->nullable()->constrained('equipment_purchase_order_items');
            $table->string('item_description');
            $table->decimal('quantity', 10, 2);
            $table->string('unit_of_measure')->default('each');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('line_total', 15, 2);
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->foreignId('equipment_id')->nullable()->constrained('equipment');
            $table->foreignId('cost_category_id')->nullable()->constrained('equipment_cost_categories');
            $table->timestamps();
            
            // Indexes
            $table->index('invoice_id');
            $table->index('purchase_order_item_id');
            $table->index('equipment_id');
        });

        Schema::create('equipment_payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_reference')->unique();
            $table->foreignId('invoice_id')->nullable()->constrained('equipment_invoices');
            $table->foreignId('vendor_id')->constrained('equipment_vendors');
            $table->date('payment_date');
            $table->decimal('payment_amount', 15, 2);
            $table->string('currency', 3)->default('USD');
            $table->enum('payment_method', [
                'cash', 'check', 'credit_card', 'bank_transfer', 
                'electronic_payment', 'wire_transfer', 'other'
            ]);
            $table->string('payment_details')->nullable()->comment('Check number, transaction ID, etc.');
            $table->foreignId('cost_center_id')->nullable()->constrained('equipment_cost_centers');
            $table->foreignId('budget_id')->nullable()->constrained('equipment_budgets');
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'processed', 'cleared', 'failed', 'voided']);
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->dateTime('approved_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['vendor_id', 'payment_date'], 'eq_pay_vendor_date_idx');
            $table->index(['invoice_id', 'status'], 'eq_pay_invoice_status_idx');
            $table->index('budget_id');
        });

        Schema::create('equipment_payment_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained('equipment_payments');
            $table->foreignId('invoice_id')->constrained('equipment_invoices');
            $table->foreignId('invoice_item_id')->nullable()->constrained('equipment_invoice_items');
            $table->decimal('allocated_amount', 15, 2);
            $table->timestamps();
            
            // Indexes
            $table->index(['payment_id', 'invoice_id'], 'eq_pay_alloc_pay_invoice_idx');
            $table->index('invoice_item_id');
        });

        Schema::create('equipment_leases', function (Blueprint $table) {
            $table->id();
            $table->string('lease_reference')->unique();
            $table->foreignId('vendor_id')->constrained('equipment_vendors');
            $table->string('lease_type');
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('lease_term_months');
            $table->decimal('monthly_payment', 15, 2);
            $table->decimal('total_lease_value', 15, 2);
            $table->string('currency', 3)->default('USD');
            $table->decimal('interest_rate', 5, 2)->nullable();
            $table->decimal('residual_value', 15, 2)->default(0);
            $table->boolean('has_purchase_option')->default(false);
            $table->decimal('purchase_option_price', 15, 2)->nullable();
            $table->text('payment_schedule')->nullable();
            $table->text('termination_conditions')->nullable();
            $table->text('renewal_terms')->nullable();
            $table->enum('status', ['active', 'pending', 'expired', 'terminated', 'renewed']);
            $table->foreignId('department_id')->nullable()->constrained('departments');
            $table->foreignId('cost_center_id')->nullable()->constrained('equipment_cost_centers');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            
            // Indexes
            $table->index(['vendor_id', 'start_date', 'end_date'], 'eq_lease_vendor_start_end_idx');
            $table->index(['department_id', 'status']);
        });

        Schema::create('equipment_lease_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lease_id')->constrained('equipment_leases');
            $table->foreignId('equipment_id')->constrained('equipment');
            $table->decimal('item_value', 15, 2);
            $table->text('item_description')->nullable();
            $table->string('serial_number')->nullable();
            $table->string('asset_tag')->nullable();
            $table->date('delivery_date')->nullable();
            $table->date('return_date')->nullable();
            $table->enum('status', ['pending', 'active', 'returned', 'purchased', 'lost', 'damaged']);
            $table->timestamps();
            
            // Indexes
            $table->index(['lease_id', 'equipment_id'], 'eq_lease_item_lease_eq_idx');
            $table->index('status');
        });

        Schema::create('equipment_lease_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lease_id')->constrained('equipment_leases');
            $table->integer('payment_number');
            $table->date('due_date');
            $table->date('payment_date')->nullable();
            $table->decimal('payment_amount', 15, 2);
            $table->decimal('principal_amount', 15, 2);
            $table->decimal('interest_amount', 15, 2);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('other_charges', 15, 2)->default(0);
            $table->string('payment_reference')->nullable();
            $table->enum('status', ['pending', 'paid', 'late', 'missed', 'partial', 'waived']);
            $table->foreignId('payment_id')->nullable()->constrained('equipment_payments');
            $table->foreignId('transaction_id')->nullable()->constrained('equipment_financial_transactions');
            $table->timestamps();
            
            // Indexes
            $table->index(['lease_id', 'payment_number']);
            $table->index(['due_date', 'status']);
        });

        Schema::create('equipment_insurance_policies', function (Blueprint $table) {
            $table->id();
            $table->string('policy_number')->unique();
            $table->string('provider_name');
            $table->string('provider_contact')->nullable();
            $table->string('policy_type');
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('coverage_amount', 15, 2);
            $table->string('currency', 3)->default('USD');
            $table->decimal('premium_amount', 15, 2);
            $table->enum('premium_frequency', ['monthly', 'quarterly', 'semi_annually', 'annually', 'one_time']);
            $table->decimal('deductible_amount', 15, 2)->default(0);
            $table->text('coverage_details')->nullable();
            $table->text('exclusions')->nullable();
            $table->text('claim_procedure')->nullable();
            $table->enum('status', ['active', 'pending', 'expired', 'cancelled', 'renewed']);
            $table->foreignId('department_id')->nullable()->constrained('departments');
            $table->foreignId('cost_center_id')->nullable()->constrained('equipment_cost_centers');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            
            // Indexes
            $table->index(['start_date', 'end_date']);
            $table->index(['department_id', 'status']);
        });

        Schema::create('equipment_insurance_policy_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('policy_id')->constrained('equipment_insurance_policies');
            $table->foreignId('equipment_id')->constrained('equipment');
            $table->decimal('insured_value', 15, 2);
            $table->text('coverage_details')->nullable();
            $table->decimal('item_premium', 15, 2)->nullable();
            $table->decimal('item_deductible', 15, 2)->nullable();
            $table->enum('status', ['active', 'pending', 'removed', 'claimed']);
            $table->timestamps();
            
            // Indexes
            $table->index(['policy_id', 'equipment_id']);
            $table->index('status');
        });

        Schema::create('equipment_insurance_claims', function (Blueprint $table) {
            $table->id();
            $table->string('claim_number')->unique();
            $table->foreignId('policy_id')->constrained('equipment_insurance_policies');
            $table->foreignId('equipment_id')->constrained('equipment');
            $table->foreignId('policy_item_id')->nullable()->constrained('equipment_insurance_policy_items');
            $table->date('incident_date');
            $table->date('claim_date');
            $table->text('incident_description');
            $table->decimal('claim_amount', 15, 2);
            $table->decimal('approved_amount', 15, 2)->nullable();
            $table->decimal('deductible_applied', 15, 2)->default(0);
            $table->enum('claim_type', ['damage', 'loss', 'theft', 'malfunction', 'other']);
            $table->enum('status', ['draft', 'submitted', 'under_review', 'approved', 'partially_approved', 'denied', 'paid', 'closed']);
            $table->text('adjuster_notes')->nullable();
            $table->date('settlement_date')->nullable();
            $table->string('settlement_reference')->nullable();
            $table->foreignId('filed_by')->constrained('users');
            $table->timestamps();
            
            // Indexes
            $table->index(['policy_id', 'claim_date']);
            $table->index(['equipment_id', 'status']);
        });

        Schema::create('equipment_warranty_claims', function (Blueprint $table) {
            $table->id();
            $table->string('claim_reference')->unique();
            $table->foreignId('equipment_id')->constrained('equipment');
            $table->foreignId('vendor_id')->nullable()->constrained('equipment_vendors');
            $table->date('claim_date');
            $table->text('issue_description');
            $table->text('warranty_coverage_details')->nullable();
            $table->enum('claim_type', ['repair', 'replacement', 'refund', 'other']);
            $table->enum('status', ['draft', 'submitted', 'under_review', 'approved', 'denied', 'in_progress', 'completed', 'cancelled']);
            $table->date('resolution_date')->nullable();
            $table->text('resolution_details')->nullable();
            $table->decimal('claim_value', 15, 2)->nullable();
            $table->string('currency', 3)->default('USD');
            $table->foreignId('filed_by')->constrained('users');
            $table->timestamps();
            
            // Indexes
            $table->index(['equipment_id', 'claim_date']);
            $table->index(['vendor_id', 'status']);
        });

        // Add financial fields to equipment table
        Schema::table('equipment', function (Blueprint $table) {
            // Acquisition details
            if (!Schema::hasColumn('equipment', 'purchase_price')) {
                $table->decimal('purchase_price', 15, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'purchase_currency')) {
                $table->string('purchase_currency', 3)->nullable()->default('USD');
            }
            if (!Schema::hasColumn('equipment', 'purchase_date')) {
                $table->date('purchase_date')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'purchase_order_number')) {
                $table->string('purchase_order_number')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'invoice_number')) {
                $table->string('invoice_number')->nullable();
            }
            
            // Financial classification
            if (!Schema::hasColumn('equipment', 'acquisition_type')) {
                $table->enum('acquisition_type', ['purchase', 'lease', 'rental', 'donation', 'transfer', 'other'])->nullable();
            }
            if (!Schema::hasColumn('equipment', 'is_capital_asset')) {
                $table->boolean('is_capital_asset')->default(false);
            }
            if (!Schema::hasColumn('equipment', 'asset_number')) {
                $table->string('asset_number')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'cost_center_id')) {
                $table->foreignId('cost_center_id')->nullable()->constrained('equipment_cost_centers');
            }
            
            // Depreciation and value
            if (!Schema::hasColumn('equipment', 'current_book_value')) {
                $table->decimal('current_book_value', 15, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'salvage_value')) {
                $table->decimal('salvage_value', 15, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'useful_life_years')) {
                $table->integer('useful_life_years')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'depreciation_start_date')) {
                $table->date('depreciation_start_date')->nullable();
            }
            
            // Warranty and insurance
            if (!Schema::hasColumn('equipment', 'under_warranty')) {
                $table->boolean('under_warranty')->default(false);
            }
            if (!Schema::hasColumn('equipment', 'warranty_expiration')) {
                $table->date('warranty_expiration')->nullable();
            }
            if (!Schema::hasColumn('equipment', 'is_insured')) {
                $table->boolean('is_insured')->default(false);
            }
            if (!Schema::hasColumn('equipment', 'insurance_policy_id')) {
                $table->foreignId('insurance_policy_id')->nullable()->constrained('equipment_insurance_policies');
            }
            
            // Leasing information
            if (!Schema::hasColumn('equipment', 'is_leased')) {
                $table->boolean('is_leased')->default(false);
            }
            if (!Schema::hasColumn('equipment', 'lease_id')) {
                $table->foreignId('lease_id')->nullable()->constrained('equipment_leases');
            }
            
            // Financial metrics
            if (!Schema::hasColumn('equipment', 'annual_maintenance_cost')) {
                $table->decimal('annual_maintenance_cost', 15, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'total_cost_to_date')) {
                $table->decimal('total_cost_to_date', 15, 2)->nullable();
            }
            if (!Schema::hasColumn('equipment', 'replacement_cost')) {
                $table->decimal('replacement_cost', 15, 2)->nullable();
            }
            
            // Indexes
            $table->index(['is_capital_asset', 'acquisition_type']);
            $table->index(['under_warranty', 'warranty_expiration']);
            $table->index(['is_insured', 'insurance_policy_id']);
            $table->index(['is_leased', 'lease_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove financial fields from equipment table
        Schema::table('equipment', function (Blueprint $table) {
            $table->dropColumn([
                'purchase_price',
                'purchase_currency',
                'purchase_date',
                'purchase_order_number',
                'invoice_number',
                'acquisition_type',
                'is_capital_asset',
                'asset_number',
                'cost_center_id',
                'current_book_value',
                'salvage_value',
                'useful_life_years',
                'depreciation_start_date',
                'under_warranty',
                'warranty_expiration',
                'is_insured',
                'insurance_policy_id',
                'is_leased',
                'lease_id',
                'annual_maintenance_cost',
                'total_cost_to_date',
                'replacement_cost'
            ]);
        });

        Schema::dropIfExists('equipment_warranty_claims');
        Schema::dropIfExists('equipment_insurance_claims');
        Schema::dropIfExists('equipment_insurance_policy_items');
        Schema::dropIfExists('equipment_insurance_policies');
        Schema::dropIfExists('equipment_lease_payments');
        Schema::dropIfExists('equipment_lease_items');
        Schema::dropIfExists('equipment_leases');
        Schema::dropIfExists('equipment_payment_allocations');
        Schema::dropIfExists('equipment_payments');
        Schema::dropIfExists('equipment_invoice_items');
        Schema::dropIfExists('equipment_invoices');
        Schema::dropIfExists('equipment_purchase_order_items');
        Schema::dropIfExists('equipment_purchase_orders');
        Schema::dropIfExists('equipment_financial_reports');
        Schema::dropIfExists('equipment_financial_forecasts');
        Schema::dropIfExists('equipment_asset_transfers');
        Schema::dropIfExists('equipment_depreciation_entries');
        Schema::dropIfExists('equipment_depreciation_schedules');
        Schema::dropIfExists('equipment_depreciation_methods');
        Schema::dropIfExists('equipment_transaction_attachments');
        Schema::dropIfExists('equipment_financial_transactions');
        Schema::dropIfExists('equipment_budget_allocations');
        Schema::dropIfExists('equipment_budgets');
        Schema::dropIfExists('equipment_cost_centers');
        Schema::dropIfExists('equipment_cost_categories');
    }
};