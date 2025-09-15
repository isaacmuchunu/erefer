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
        Schema::table('users', function (Blueprint $table) {
            // Add new RBAC-related fields if they don't exist
            if (!Schema::hasColumn('users', 'role_id')) {
                $table->foreignId('role_id')->nullable()->after('role')->constrained()->onDelete('set null');
            }
            
            if (!Schema::hasColumn('users', 'permissions')) {
                $table->json('permissions')->nullable()->after('role_id'); // User-specific permissions
            }
            
            if (!Schema::hasColumn('users', 'last_password_change')) {
                $table->timestamp('last_password_change')->nullable()->after('password');
            }
            
            if (!Schema::hasColumn('users', 'password_expires_at')) {
                $table->timestamp('password_expires_at')->nullable()->after('last_password_change');
            }
            
            if (!Schema::hasColumn('users', 'failed_login_attempts')) {
                $table->integer('failed_login_attempts')->default(0)->after('password_expires_at');
            }
            
            if (!Schema::hasColumn('users', 'locked_until')) {
                $table->timestamp('locked_until')->nullable()->after('failed_login_attempts');
            }
            
            if (!Schema::hasColumn('users', 'must_change_password')) {
                $table->boolean('must_change_password')->default(false)->after('locked_until');
            }
            
            if (!Schema::hasColumn('users', 'security_questions')) {
                $table->json('security_questions')->nullable()->after('must_change_password');
            }
            
            if (!Schema::hasColumn('users', 'preferences')) {
                $table->json('preferences')->nullable()->after('notification_preferences');
            }
            
            // Add indexes for better performance
            $table->index(['role', 'status']);
            $table->index('failed_login_attempts');
            $table->index('locked_until');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role_id',
                'permissions',
                'last_password_change',
                'password_expires_at',
                'failed_login_attempts',
                'locked_until',
                'must_change_password',
                'security_questions',
                'preferences'
            ]);
        });
    }
};