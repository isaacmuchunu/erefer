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
        Schema::create('equipment_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained()->onDelete('cascade');
            $table->foreignId('source_facility_id')->constrained('facilities');
            $table->foreignId('source_department_id')->nullable()->constrained('departments');
            $table->foreignId('destination_facility_id')->constrained('facilities');
            $table->foreignId('destination_department_id')->nullable()->constrained('departments');
            $table->foreignId('requested_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->dateTime('requested_at');
            $table->dateTime('approved_at')->nullable();
            $table->dateTime('transfer_date')->nullable();
            $table->dateTime('received_at')->nullable();
            $table->foreignId('received_by')->nullable()->constrained('users');
            $table->enum('status', ['pending', 'approved', 'in_transit', 'completed', 'cancelled', 'rejected'])->default('pending');
            $table->text('reason')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->string('transfer_document_number')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_transfers');
    }
};