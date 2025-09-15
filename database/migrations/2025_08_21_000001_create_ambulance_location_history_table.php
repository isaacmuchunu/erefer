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
        Schema::create('ambulance_location_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ambulance_id')->constrained()->onDelete('cascade');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->decimal('accuracy', 8, 2)->nullable()->comment('GPS accuracy in meters');
            $table->decimal('speed', 8, 2)->nullable()->comment('Speed in km/h');
            $table->decimal('heading', 6, 2)->nullable()->comment('Direction in degrees');
            $table->decimal('altitude', 8, 2)->nullable()->comment('Altitude in meters');
            $table->string('source')->default('gps')->comment('Source of location data: gps, manual, estimated');
            $table->timestamp('recorded_at');
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['ambulance_id', 'recorded_at']);
            $table->index('recorded_at');
            $table->index(['latitude', 'longitude']);
        });

        Schema::create('ambulance_geofences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ambulance_dispatch_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['pickup', 'destination', 'waypoint', 'restricted_area']);
            $table->decimal('center_latitude', 10, 7);
            $table->decimal('center_longitude', 10, 7);
            $table->integer('radius_meters')->default(100);
            $table->boolean('is_active')->default(true);
            $table->timestamp('entered_at')->nullable();
            $table->timestamp('exited_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['ambulance_dispatch_id', 'type']);
            $table->index(['center_latitude', 'center_longitude']);
            $table->index('is_active');
        });

        Schema::create('ambulance_route_tracking', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ambulance_dispatch_id')->constrained()->onDelete('cascade');
            $table->json('planned_route')->nullable()->comment('Original planned route from mapping service');
            $table->json('actual_route')->nullable()->comment('Actual route taken based on GPS tracking');
            $table->decimal('planned_distance_km', 8, 2)->nullable();
            $table->decimal('actual_distance_km', 8, 2)->nullable();
            $table->integer('planned_duration_minutes')->nullable();
            $table->integer('actual_duration_minutes')->nullable();
            $table->decimal('fuel_consumed_liters', 8, 2)->nullable();
            $table->json('traffic_conditions')->nullable();
            $table->json('route_deviations')->nullable()->comment('Points where route deviated from plan');
            $table->decimal('efficiency_score', 5, 2)->nullable()->comment('Route efficiency percentage');
            $table->timestamps();
            
            // Indexes
            $table->index('ambulance_dispatch_id');
            $table->index('efficiency_score');
        });

        Schema::create('ambulance_performance_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ambulance_id')->constrained()->onDelete('cascade');
            $table->date('metric_date');
            $table->integer('total_dispatches')->default(0);
            $table->integer('completed_dispatches')->default(0);
            $table->decimal('average_response_time_minutes', 8, 2)->nullable();
            $table->decimal('average_transport_time_minutes', 8, 2)->nullable();
            $table->decimal('total_distance_km', 10, 2)->default(0);
            $table->decimal('fuel_consumed_liters', 8, 2)->default(0);
            $table->decimal('fuel_efficiency_km_per_liter', 8, 2)->nullable();
            $table->integer('maintenance_alerts')->default(0);
            $table->decimal('utilization_percentage', 5, 2)->nullable();
            $table->json('performance_scores')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->unique(['ambulance_id', 'metric_date']);
            $table->index('metric_date');
            $table->index('utilization_percentage');
        });

        Schema::create('ambulance_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ambulance_id')->constrained()->onDelete('cascade');
            $table->foreignId('ambulance_dispatch_id')->nullable()->constrained()->onDelete('cascade');
            $table->enum('alert_type', [
                'geofence_entry', 'geofence_exit', 'speed_violation', 'route_deviation',
                'maintenance_due', 'fuel_low', 'emergency_button', 'communication_lost',
                'arrival_delay', 'equipment_malfunction'
            ]);
            $table->enum('severity', ['low', 'medium', 'high', 'critical']);
            $table->string('title');
            $table->text('description');
            $table->json('location_data')->nullable();
            $table->json('metadata')->nullable();
            $table->boolean('acknowledged')->default(false);
            $table->foreignId('acknowledged_by')->nullable()->constrained('users');
            $table->timestamp('acknowledged_at')->nullable();
            $table->boolean('resolved')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['ambulance_id', 'alert_type']);
            $table->index(['severity', 'acknowledged']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ambulance_alerts');
        Schema::dropIfExists('ambulance_performance_metrics');
        Schema::dropIfExists('ambulance_route_tracking');
        Schema::dropIfExists('ambulance_geofences');
        Schema::dropIfExists('ambulance_location_history');
    }
};
