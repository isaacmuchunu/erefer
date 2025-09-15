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
        Schema::create('equipment_vendors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('vendor_code')->nullable();
            $table->text('description')->nullable();
            $table->string('vendor_type')->nullable()->comment('manufacturer, supplier, service provider, etc');
            $table->string('contact_person')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('website')->nullable();
            $table->string('address_line1')->nullable();
            $table->string('address_line2')->nullable();
            $table->string('city')->nullable();
            $table->string('state_province')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country')->nullable();
            $table->string('tax_id')->nullable();
            $table->string('payment_terms')->nullable();
            $table->integer('response_time_hours')->nullable()->comment('Typical response time for service calls');
            $table->text('service_capabilities')->nullable();
            $table->text('certifications')->nullable();
            $table->decimal('vendor_rating', 3, 2)->nullable()->comment('Rating from 0.00 to 5.00');
            $table->date('relationship_since')->nullable();
            $table->boolean('is_preferred_vendor')->default(false);
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Ensure unique vendor codes
            $table->unique('vendor_code');
        });

        Schema::create('equipment_service_contracts', function (Blueprint $table) {
            $table->id();
            $table->string('contract_number');
            $table->foreignId('vendor_id')->constrained('equipment_vendors');
            $table->enum('contract_type', [
                'warranty', 'service_only', 'parts_only', 'full_service', 
                'preventive_maintenance', 'time_materials', 'other'
            ]);
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('auto_renewal')->default(false);
            $table->integer('renewal_notice_days')->nullable();
            $table->decimal('annual_cost', 12, 2)->nullable();
            $table->string('billing_frequency')->nullable()->comment('monthly, quarterly, annually, etc');
            $table->string('billing_contact')->nullable();
            $table->string('payment_terms')->nullable();
            $table->integer('response_time_hours')->nullable();
            $table->text('service_level_agreement')->nullable();
            $table->text('coverage_details')->nullable();
            $table->text('exclusions')->nullable();
            $table->text('cancellation_terms')->nullable();
            $table->string('contract_file_path')->nullable();
            $table->foreignId('negotiated_by')->nullable()->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->dateTime('approved_at')->nullable();
            $table->enum('status', ['draft', 'active', 'expired', 'cancelled', 'renewed']);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for contract management
            $table->index('contract_number');
            $table->index('start_date');
            $table->index('end_date');
            $table->index(['vendor_id', 'status']);
        });

        Schema::create('equipment_contract_coverage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained('equipment_service_contracts');
            $table->foreignId('equipment_id')->constrained();
            $table->date('coverage_start_date')->nullable();
            $table->date('coverage_end_date')->nullable();
            $table->decimal('equipment_specific_cost', 12, 2)->nullable();
            $table->text('coverage_details')->nullable()->comment('Equipment-specific coverage details');
            $table->text('exclusions')->nullable()->comment('Equipment-specific exclusions');
            $table->integer('response_time_hours')->nullable()->comment('Equipment-specific response time');
            $table->integer('preventive_maintenance_frequency_days')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Ensure unique contract-equipment combinations
            $table->unique(['contract_id', 'equipment_id']);
        });

        Schema::create('equipment_service_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number');
            $table->foreignId('equipment_id')->constrained();
            $table->foreignId('contract_id')->nullable()->constrained('equipment_service_contracts');
            $table->foreignId('vendor_id')->nullable()->constrained('equipment_vendors');
            $table->foreignId('requested_by')->constrained('users');
            $table->dateTime('requested_at');
            $table->enum('request_type', [
                'repair', 'preventive_maintenance', 'installation', 'calibration', 
                'inspection', 'consultation', 'upgrade', 'other'
            ]);
            $table->enum('priority', ['low', 'medium', 'high', 'critical', 'emergency']);
            $table->text('problem_description');
            $table->text('troubleshooting_performed')->nullable();
            $table->string('equipment_status')->nullable()->comment('operational, partial failure, complete failure');
            $table->boolean('patient_impact')->default(false);
            $table->text('patient_impact_details')->nullable();
            $table->dateTime('vendor_notified_at')->nullable();
            $table->string('vendor_reference_number')->nullable();
            $table->string('vendor_contact_person')->nullable();
            $table->dateTime('scheduled_service_date')->nullable();
            $table->enum('status', [
                'submitted', 'acknowledged', 'scheduled', 'in_progress', 
                'parts_ordered', 'completed', 'cancelled', 'on_hold'
            ]);
            $table->text('status_notes')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for service request tracking
            $table->index('request_number');
            $table->index('requested_at');
            $table->index(['equipment_id', 'status']);
            $table->index(['vendor_id', 'status']);
        });

        Schema::create('equipment_service_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_request_id')->constrained('equipment_service_requests');
            $table->string('visit_reference_number')->nullable();
            $table->dateTime('visit_start');
            $table->dateTime('visit_end')->nullable();
            $table->string('technician_name');
            $table->string('technician_contact')->nullable();
            $table->string('technician_company')->nullable();
            $table->enum('visit_type', ['on_site', 'remote', 'depot_repair']);
            $table->text('service_performed')->nullable();
            $table->text('findings')->nullable();
            $table->text('resolution')->nullable();
            $table->text('recommendations')->nullable();
            $table->json('parts_replaced')->nullable();
            $table->json('parts_ordered')->nullable();
            $table->decimal('labor_hours', 5, 2)->nullable();
            $table->decimal('labor_cost', 10, 2)->nullable();
            $table->decimal('parts_cost', 10, 2)->nullable();
            $table->decimal('travel_cost', 10, 2)->nullable();
            $table->decimal('total_cost', 10, 2)->nullable();
            $table->boolean('covered_by_contract')->default(false);
            $table->string('invoice_number')->nullable();
            $table->date('invoice_date')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->dateTime('verified_at')->nullable();
            $table->enum('equipment_status_after_service', ['fully_operational', 'partially_operational', 'non_operational', 'pending_parts']);
            $table->date('follow_up_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for service visit tracking
            $table->index('visit_start');
            $table->index(['service_request_id', 'equipment_status_after_service'], 'eq_serv_visit_req_status_idx');
        });

        Schema::create('equipment_vendor_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('equipment_vendors');
            $table->foreignId('evaluated_by')->constrained('users');
            $table->date('evaluation_date');
            $table->enum('evaluation_period', ['quarterly', 'semi_annual', 'annual', 'ad_hoc']);
            $table->date('period_start')->nullable();
            $table->date('period_end')->nullable();
            $table->decimal('response_time_rating', 3, 2)->nullable()->comment('Rating from 0.00 to 5.00');
            $table->decimal('quality_rating', 3, 2)->nullable()->comment('Rating from 0.00 to 5.00');
            $table->decimal('communication_rating', 3, 2)->nullable()->comment('Rating from 0.00 to 5.00');
            $table->decimal('technical_expertise_rating', 3, 2)->nullable()->comment('Rating from 0.00 to 5.00');
            $table->decimal('value_for_money_rating', 3, 2)->nullable()->comment('Rating from 0.00 to 5.00');
            $table->decimal('documentation_rating', 3, 2)->nullable()->comment('Rating from 0.00 to 5.00');
            $table->decimal('overall_rating', 3, 2)->nullable()->comment('Rating from 0.00 to 5.00');
            $table->text('strengths')->nullable();
            $table->text('areas_for_improvement')->nullable();
            $table->text('incidents_of_note')->nullable();
            $table->boolean('recommend_continued_use')->default(true);
            $table->text('action_items')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for vendor evaluation tracking
            $table->index('evaluation_date');
            $table->index(['vendor_id', 'evaluation_period']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_vendor_evaluations');
        Schema::dropIfExists('equipment_service_visits');
        Schema::dropIfExists('equipment_service_requests');
        Schema::dropIfExists('equipment_contract_coverage');
        Schema::dropIfExists('equipment_service_contracts');
        Schema::dropIfExists('equipment_vendors');
    }
};