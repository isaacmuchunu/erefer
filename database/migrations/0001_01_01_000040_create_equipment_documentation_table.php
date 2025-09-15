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
        Schema::create('equipment_document_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_required')->default(false);
            $table->boolean('requires_regular_updates')->default(false);
            $table->integer('update_frequency_months')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Ensure unique document type names
            $table->unique('name');
        });

        Schema::create('equipment_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->nullable()->constrained();
            $table->foreignId('equipment_category_id')->nullable()->constrained('equipment_categories');
            $table->foreignId('document_type_id')->constrained('equipment_document_types');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('version')->nullable();
            $table->string('language')->default('en');
            $table->string('file_path');
            $table->string('file_type')->nullable()->comment('pdf, doc, video, etc');
            $table->integer('file_size_kb')->nullable();
            $table->date('publication_date')->nullable();
            $table->date('effective_date')->nullable();
            $table->date('expiration_date')->nullable();
            $table->string('publisher')->nullable();
            $table->string('author')->nullable();
            $table->string('document_number')->nullable()->comment('Manufacturer document ID');
            $table->boolean('is_current_version')->default(true);
            $table->foreignId('uploaded_by')->nullable()->constrained('users');
            $table->dateTime('uploaded_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->dateTime('approved_at')->nullable();
            $table->text('keywords')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for document management with custom names
            $table->index(['equipment_id', 'document_type_id'], 'ed_equip_doctype_idx');
            $table->index('is_current_version', 'ed_current_version_idx');
            $table->index('expiration_date', 'ed_exp_date_idx');
        });

        Schema::create('equipment_document_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('equipment_documents');
            $table->string('section_name');
            $table->integer('section_number')->nullable();
            $table->text('content_summary')->nullable();
            $table->integer('start_page')->nullable();
            $table->integer('end_page')->nullable();
            $table->string('bookmark_reference')->nullable();
            $table->text('keywords')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Index for document section lookup with custom name
            $table->index(['document_id', 'section_number'], 'eds_doc_section_idx');
        });

        Schema::create('equipment_document_access_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('equipment_documents');
            $table->foreignId('user_id')->nullable()->constrained();
            $table->dateTime('accessed_at');
            $table->string('access_type')->comment('view, download, print, etc');
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->string('device_info')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Index for access tracking with custom names
            $table->index(['document_id', 'accessed_at'], 'edal_doc_access_idx');
            $table->index(['user_id', 'accessed_at'], 'edal_user_access_idx');
        });

        if (!Schema::hasTable('equipment_procedures')) {
    Schema::create('equipment_procedures', function (Blueprint $table) {
        $table->id();
        $table->foreignId('equipment_id')->nullable()->constrained();
        $table->foreignId('equipment_category_id')->nullable()->constrained('equipment_categories');
        $table->string('procedure_name');
        $table->text('description')->nullable();
        $table->enum('procedure_type', [
            'operation', 'maintenance', 'cleaning', 'calibration', 
            'troubleshooting', 'safety', 'emergency', 'other'
        ]);
        $table->text('prerequisites')->nullable();
        $table->json('procedure_steps')->nullable()->comment('Ordered steps to perform the procedure');
        $table->json('required_tools')->nullable();
        $table->json('required_parts')->nullable();
        $table->json('safety_precautions')->nullable();
        $table->integer('estimated_duration_minutes')->nullable();
        $table->string('skill_level_required')->nullable();
        $table->foreignId('related_document_id')->nullable()->constrained('equipment_documents');
        $table->string('video_tutorial_url')->nullable();
        $table->foreignId('created_by')->nullable()->constrained('users');
        $table->foreignId('approved_by')->nullable()->constrained('users');
        $table->dateTime('approved_at')->nullable();
        $table->date('effective_date')->nullable();
        $table->date('review_date')->nullable();
        $table->string('version')->nullable();
        $table->boolean('is_current_version')->default(true);
        $table->text('notes')->nullable();
        $table->timestamps();
        
        // Indexes for procedure management with custom names
        $table->index(['equipment_id', 'procedure_type'], 'ep_equip_proctype_idx');
        $table->index('is_current_version', 'ep_current_version_idx');
    });
}

        Schema::create('equipment_procedure_executions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('procedure_id')->constrained('equipment_procedures');
            $table->foreignId('equipment_id')->constrained();
            $table->foreignId('performed_by')->constrained('users');
            $table->dateTime('started_at');
            $table->dateTime('completed_at')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->enum('status', ['in_progress', 'completed', 'aborted', 'failed']);
            $table->json('step_results')->nullable()->comment('Results for each procedure step');
            $table->text('outcome')->nullable();
            $table->text('issues_encountered')->nullable();
            $table->text('resolution_actions')->nullable();
            $table->json('measurements_recorded')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->dateTime('verified_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for procedure execution tracking with custom names
            $table->index(['equipment_id', 'started_at'], 'epe_equip_start_idx');
            $table->index(['procedure_id', 'status'], 'epe_proc_status_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_procedure_executions');
        Schema::dropIfExists('equipment_procedures');
        Schema::dropIfExists('equipment_document_access_logs');
        Schema::dropIfExists('equipment_document_sections');
        Schema::dropIfExists('equipment_documents');
        Schema::dropIfExists('equipment_document_types');
    }
};