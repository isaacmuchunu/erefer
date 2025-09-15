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
        Schema::table('patients', function (Blueprint $table) {
            // Add authentication fields if they don't exist
            if (!Schema::hasColumn('patients', 'password')) {
                $table->string('password')->nullable()->after('email');
            }
            
            if (!Schema::hasColumn('patients', 'email_verified_at')) {
                $table->timestamp('email_verified_at')->nullable()->after('email');
            }
            
            if (!Schema::hasColumn('patients', 'phone_verified_at')) {
                $table->timestamp('phone_verified_at')->nullable()->after('phone');
            }
            
            if (!Schema::hasColumn('patients', 'whatsapp_number')) {
                $table->string('whatsapp_number')->nullable()->after('phone');
            }
            
            if (!Schema::hasColumn('patients', 'emergency_contact_name')) {
                $table->string('emergency_contact_name')->nullable()->after('emergency_contacts');
            }
            
            if (!Schema::hasColumn('patients', 'emergency_contact_phone')) {
                $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_name');
            }
            
            if (!Schema::hasColumn('patients', 'communication_preferences')) {
                $table->json('communication_preferences')->nullable()->after('current_medications');
            }
            
            if (!Schema::hasColumn('patients', 'avatar')) {
                $table->string('avatar')->nullable()->after('communication_preferences');
            }
            
            if (!Schema::hasColumn('patients', 'remember_token')) {
                $table->rememberToken();
            }

            // Add indexes for authentication
            if (!Schema::hasIndex('patients', ['email'])) {
                $table->index('email');
            }
            
            if (!Schema::hasIndex('patients', ['phone'])) {
                $table->index('phone');
            }
            
            if (!Schema::hasIndex('patients', ['whatsapp_number'])) {
                $table->index('whatsapp_number');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn([
                'password',
                'email_verified_at',
                'phone_verified_at',
                'whatsapp_number',
                'emergency_contact_name',
                'emergency_contact_phone',
                'communication_preferences',
                'avatar',
                'remember_token',
            ]);
        });
    }
};
