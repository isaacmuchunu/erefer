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
        Schema::create('equipment_permission_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes
            $table->index(['is_active', 'display_order'], 'eq_perm_cat_active_order_idx');
        });

        Schema::create('equipment_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('equipment_permission_categories');
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->string('resource_type')->nullable()->comment('Type of resource this permission applies to');
            $table->json('allowed_actions')->nullable()->comment('Actions allowed by this permission');
            $table->json('constraints')->nullable()->comment('Additional constraints on this permission');
            $table->boolean('requires_approval')->default(false);
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes
            $table->index(['category_id', 'is_active'], 'eq_perm_cat_active_idx');
            $table->index('resource_type');
            $table->index('requires_approval');
        });

        Schema::create('equipment_roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->json('metadata')->nullable()->comment('Additional role metadata');
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes
            $table->index('is_active');
        });

        Schema::create('equipment_role_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('equipment_roles');
            $table->foreignId('permission_id')->constrained('equipment_permissions');
            $table->json('constraints')->nullable()->comment('Additional constraints for this role-permission');
            $table->boolean('requires_approval')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
            
            // Ensure unique role-permission combinations
            $table->unique(['role_id', 'permission_id']);
            
            // Indexes
            $table->index('requires_approval');
        });

        Schema::create('equipment_user_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('role_id')->constrained('equipment_roles');
            $table->foreignId('facility_id')->nullable()->constrained('facilities');
            $table->foreignId('department_id')->nullable()->constrained('departments');
            $table->dateTime('valid_from')->nullable();
            $table->dateTime('valid_until')->nullable();
            $table->json('constraints')->nullable()->comment('Additional constraints for this user-role');
            $table->foreignId('assigned_by')->nullable()->constrained('users');
            $table->text('assignment_reason')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Ensure unique user-role-facility-department combinations
            $table->unique(['user_id', 'role_id', 'facility_id', 'department_id'], 'unique_user_role_scope');
            
            // Indexes
            $table->index(['user_id', 'is_active'], 'eq_user_role_active_idx');
            $table->index(['facility_id', 'department_id'], 'eq_user_role_fac_dept_idx');
            $table->index(['valid_from', 'valid_until'], 'eq_user_role_valid_idx');
        });

        Schema::create('equipment_user_direct_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('permission_id')->constrained('equipment_permissions');
            $table->foreignId('facility_id')->nullable()->constrained('facilities');
            $table->foreignId('department_id')->nullable()->constrained('departments');
            $table->dateTime('valid_from')->nullable();
            $table->dateTime('valid_until')->nullable();
            $table->json('constraints')->nullable()->comment('Additional constraints for this permission');
            $table->foreignId('assigned_by')->nullable()->constrained('users');
            $table->text('assignment_reason')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Ensure unique user-permission-facility-department combinations
            $table->unique(['user_id', 'permission_id', 'facility_id', 'department_id'], 'unique_user_permission_scope');
            
            // Indexes
            $table->index(['user_id', 'is_active'], 'eq_user_perm_active_idx');
            $table->index(['facility_id', 'department_id'], 'eq_user_perm_fac_dept_idx');
            $table->index(['valid_from', 'valid_until'], 'eq_user_perm_valid_idx');
        });

        Schema::create('equipment_access_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->foreignId('facility_id')->nullable()->constrained('facilities');
            $table->foreignId('department_id')->nullable()->constrained('departments');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes
            $table->index(['facility_id', 'department_id'], 'eq_acc_grp_fac_dept_idx');
            $table->index('is_active');
        });

        Schema::create('equipment_access_group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('equipment_access_groups');
            $table->foreignId('user_id')->constrained();
            $table->dateTime('valid_from')->nullable();
            $table->dateTime('valid_until')->nullable();
            $table->foreignId('assigned_by')->nullable()->constrained('users');
            $table->text('assignment_reason')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Ensure unique group-user combinations
            $table->unique(['group_id', 'user_id'], 'unique_group_user');
            
            // Indexes
            $table->index(['user_id', 'is_active'], 'eq_grp_mem_user_active_idx');
            $table->index(['valid_from', 'valid_until'], 'eq_grp_mem_valid_idx');
        });

        Schema::create('equipment_access_group_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('equipment_access_groups');
            $table->foreignId('permission_id')->constrained('equipment_permissions');
            $table->json('constraints')->nullable()->comment('Additional constraints for this group-permission');
            $table->foreignId('assigned_by')->nullable()->constrained('users');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Ensure unique group-permission combinations
            $table->unique(['group_id', 'permission_id'], 'unique_group_permission');
            
            // Indexes
            $table->index('is_active');
        });

        Schema::create('equipment_access_group_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('equipment_access_groups');
            $table->foreignId('role_id')->constrained('equipment_roles');
            $table->json('constraints')->nullable()->comment('Additional constraints for this group-role');
            $table->foreignId('assigned_by')->nullable()->constrained('users');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Ensure unique group-role combinations
            $table->unique(['group_id', 'role_id'], 'unique_group_role');
            
            // Indexes
            $table->index('is_active');
        });

        Schema::create('equipment_resource_access_policies', function (Blueprint $table) {
            $table->id();
            $table->string('policy_name');
            $table->text('description')->nullable();
            $table->string('resource_type')->comment('Type of resource this policy applies to');
            $table->json('resource_criteria')->nullable()->comment('Criteria to match resources');
            $table->json('access_rules')->comment('Rules defining access to matched resources');
            $table->integer('priority')->default(0)->comment('Higher priority policies are evaluated first');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes
            $table->index(['resource_type', 'is_active'], 'eq_res_policy_type_active_idx');
            $table->index(['priority', 'is_active'], 'eq_res_policy_prio_active_idx');
        });

        Schema::create('equipment_access_approval_workflows', function (Blueprint $table) {
            $table->id();
            $table->string('workflow_name');
            $table->text('description')->nullable();
            $table->string('resource_type')->comment('Type of resource this workflow applies to');
            $table->json('resource_criteria')->nullable()->comment('Criteria to match resources');
            $table->json('approval_steps')->comment('Steps in the approval workflow');
            $table->json('notification_settings')->nullable()->comment('Notification settings for this workflow');
            $table->json('escalation_rules')->nullable()->comment('Rules for escalating approvals');
            $table->integer('priority')->default(0)->comment('Higher priority workflows are evaluated first');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes
            $table->index(['resource_type', 'is_active'], 'eq_workflow_type_active_idx');
            $table->index(['priority', 'is_active'], 'eq_workflow_prio_active_idx');
        });

        Schema::create('equipment_access_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->comment('User requesting access');
            $table->string('request_type')->comment('permission, role, equipment, etc.');
            $table->morphs('resource'); // Can reference equipment, permission, role, etc.
            $table->foreignId('facility_id')->nullable()->constrained('facilities');
            $table->foreignId('department_id')->nullable()->constrained('departments');
            $table->dateTime('requested_from')->nullable();
            $table->dateTime('requested_until')->nullable();
            $table->text('request_reason');
            $table->json('request_details')->nullable()->comment('Additional details for this request');
            $table->foreignId('workflow_id')->nullable()->constrained('equipment_access_approval_workflows');
            $table->json('approval_history')->nullable()->comment('History of approvals/rejections');
            $table->foreignId('current_approver_id')->nullable()->constrained('users');
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled', 'expired']);
            $table->text('status_reason')->nullable();
            $table->dateTime('status_updated_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'status'], 'eq_access_req_user_status_idx');
            $table->index(['resource_type', 'resource_id'], 'eq_access_req_resource_idx');
            $table->index(['facility_id', 'department_id'], 'eq_access_req_fac_dept_idx');
            $table->index('current_approver_id');
        });

        Schema::create('equipment_access_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->string('action')->comment('view, edit, delete, etc.');
            $table->morphs('resource'); // Can reference equipment, maintenance, etc.
            $table->foreignId('facility_id')->nullable()->constrained('facilities');
            $table->foreignId('department_id')->nullable()->constrained('departments');
            $table->json('access_details')->nullable()->comment('Details of the access');
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->dateTime('access_time');
            $table->boolean('was_authorized')->default(true);
            $table->text('authorization_source')->nullable()->comment('Role, direct permission, etc.');
            $table->text('denial_reason')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'access_time'], 'eq_access_log_user_time_idx');
            $table->index(['resource_type', 'resource_id'], 'eq_access_log_resource_idx');
            $table->index(['facility_id', 'department_id'], 'eq_access_log_fac_dept_idx');
            $table->index('was_authorized');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_access_logs');
        Schema::dropIfExists('equipment_access_requests');
        Schema::dropIfExists('equipment_access_approval_workflows');
        Schema::dropIfExists('equipment_resource_access_policies');
        Schema::dropIfExists('equipment_access_group_roles');
        Schema::dropIfExists('equipment_access_group_permissions');
        Schema::dropIfExists('equipment_access_group_members');
        Schema::dropIfExists('equipment_access_groups');
        Schema::dropIfExists('equipment_user_direct_permissions');
        Schema::dropIfExists('equipment_user_roles');
        Schema::dropIfExists('equipment_role_permissions');
        Schema::dropIfExists('equipment_roles');
        Schema::dropIfExists('equipment_permissions');
        Schema::dropIfExists('equipment_permission_categories');
    }
};