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
        Schema::create('equipment_disposals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->foreignId('facility_id')->constrained();
            $table->foreignId('requested_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->date('request_date');
            $table->date('approval_date')->nullable();
            $table->date('disposal_date')->nullable();
            $table->enum('disposal_method', ['recycling', 'donation', 'sale', 'destruction', 'return_to_vendor', 'other'])->default('recycling');
            $table->enum('status', ['pending', 'approved', 'completed', 'rejected', 'cancelled'])->default('pending');
            $table->text('reason_for_disposal')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->decimal('book_value', 10, 2)->nullable()->comment('Remaining value at time of disposal');
            $table->decimal('disposal_value', 10, 2)->nullable()->comment('Amount received if sold');
            $table->string('recipient_details')->nullable()->comment('If donated or sold');
            $table->string('disposal_certificate_number')->nullable();
            $table->string('disposal_certificate_file')->nullable();
            $table->boolean('data_wiped')->default(false)->comment('For electronic equipment');
            $table->string('data_wipe_certificate')->nullable();
            $table->text('environmental_compliance_notes')->nullable();
            $table->json('compliance_documents')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->comment('Final verification of disposal');
            $table->date('verified_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_disposals');
    }
};