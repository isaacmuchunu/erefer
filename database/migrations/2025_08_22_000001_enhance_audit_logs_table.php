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
        Schema::table('audit_logs', function (Blueprint $table) {
            // Add new columns for enhanced audit logging
            if (!Schema::hasColumn('audit_logs', 'url')) {
                $table->string('url')->nullable()->after('user_agent');
            }
            
            if (!Schema::hasColumn('audit_logs', 'method')) {
                $table->string('method', 10)->nullable()->after('url');
            }
            
            if (!Schema::hasColumn('audit_logs', 'description')) {
                $table->text('description')->nullable()->after('method');
            }
            
            if (!Schema::hasColumn('audit_logs', 'severity')) {
                $table->enum('severity', ['info', 'low', 'medium', 'high', 'critical', 'warning'])
                      ->default('info')
                      ->after('description');
            }
            
            if (!Schema::hasColumn('audit_logs', 'tags')) {
                $table->json('tags')->nullable()->after('severity');
            }

            // Add indexes for better performance
            if (!Schema::hasIndex('audit_logs', ['user_id', 'created_at'])) {
                $table->index(['user_id', 'created_at'], 'audit_logs_user_date_idx');
            }
            
            if (!Schema::hasIndex('audit_logs', ['action'])) {
                $table->index('action');
            }
            
            if (!Schema::hasIndex('audit_logs', ['severity'])) {
                $table->index('severity');
            }
            
            if (!Schema::hasIndex('audit_logs', ['model_type', 'model_id'])) {
                $table->index(['model_type', 'model_id'], 'audit_logs_model_idx');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropColumn([
                'url',
                'method', 
                'description',
                'severity',
                'tags'
            ]);
            
            $table->dropIndex('audit_logs_user_date_idx');
            $table->dropIndex(['action']);
            $table->dropIndex(['severity']);
            $table->dropIndex('audit_logs_model_idx');
        });
    }
};
