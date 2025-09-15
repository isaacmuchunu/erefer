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
        Schema::create('equipment_locations', function (Blueprint $table) {
            $table->id();
            $table->string('location_name');
            $table->text('description')->nullable();
            $table->foreignId('facility_id')->constrained();
            $table->foreignId('department_id')->nullable()->constrained();
            $table->string('building')->nullable();
            $table->string('floor')->nullable();
            $table->string('room')->nullable();
            $table->string('area')->nullable();
            $table->string('position')->nullable();
            $table->string('cabinet')->nullable();
            $table->string('shelf')->nullable();
            $table->decimal('gps_latitude', 10, 7)->nullable();
            $table->decimal('gps_longitude', 10, 7)->nullable();
            $table->string('map_reference')->nullable();
            $table->json('indoor_coordinates')->nullable()->comment('Indoor positioning coordinates');
            $table->boolean('is_storage_location')->default(false);
            $table->boolean('is_active')->default(true);
            $table->text('access_instructions')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for locations
            $table->index(['facility_id', 'department_id'], 'eq_loc_fac_dept_idx');
            $table->index(['building', 'floor', 'room'], 'eq_location_bfr_idx');
            $table->index('is_storage_location');
        });

        Schema::create('equipment_location_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->foreignId('location_id')->nullable()->constrained('equipment_locations');
            $table->foreignId('previous_location_id')->nullable()->constrained('equipment_locations');
            $table->dateTime('moved_at');
            $table->foreignId('moved_by')->nullable()->constrained('users');
            $table->string('movement_type')->comment('transfer, maintenance, storage, deployment, etc.');
            $table->string('movement_reference')->nullable()->comment('Reference to transfer, maintenance, etc.');
            $table->text('reason')->nullable();
            $table->string('condition_before')->nullable();
            $table->string('condition_after')->nullable();
            $table->boolean('is_temporary')->default(false);
            $table->dateTime('expected_return_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for location history
            $table->index(['equipment_id', 'moved_at'], 'eq_loc_hist_eq_moved_idx');
            $table->index(['location_id', 'moved_at'], 'eq_loc_hist_loc_moved_idx');
            $table->index('movement_type');
        });

        Schema::create('equipment_location_zones', function (Blueprint $table) {
            $table->id();
            $table->string('zone_name');
            $table->text('description')->nullable();
            $table->foreignId('facility_id')->constrained();
            $table->enum('zone_type', ['storage', 'clinical', 'laboratory', 'maintenance', 'quarantine', 'disposal', 'other']);
            $table->json('boundary_coordinates')->nullable()->comment('Coordinates defining the zone boundary');
            $table->string('map_reference')->nullable();
            $table->string('color_code')->nullable()->comment('For visualization');
            $table->json('access_requirements')->nullable()->comment('Requirements for accessing this zone');
            $table->json('environmental_conditions')->nullable()->comment('Temperature, humidity, etc.');
            $table->boolean('is_restricted')->default(false);
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for zones
            $table->index(['facility_id', 'zone_type'], 'eq_loc_zone_fac_type_idx');
            $table->index('is_restricted');
        });

        Schema::create('equipment_location_zone_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained('equipment_locations');
            $table->foreignId('zone_id')->constrained('equipment_location_zones');
            $table->dateTime('assigned_at');
            $table->foreignId('assigned_by')->nullable()->constrained('users');
            $table->text('reason')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Ensure a location can only be assigned to a zone once (when active)
            $table->unique(['location_id', 'zone_id', 'is_active'], 'unique_active_zone_assignment');
            
            // Indexes for zone assignments
            $table->index(['zone_id', 'is_active'], 'eq_loc_zone_asgn_active_idx');
        });

        Schema::create('equipment_tracking_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->enum('tag_type', ['rfid', 'nfc', 'barcode', 'qrcode', 'bluetooth', 'gps', 'other']);
            $table->string('tag_identifier')->comment('Tag ID, serial number, etc.');
            $table->dateTime('activated_at');
            $table->foreignId('activated_by')->nullable()->constrained('users');
            $table->dateTime('expires_at')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('model')->nullable();
            $table->json('technical_specifications')->nullable();
            $table->decimal('battery_level', 5, 2)->nullable()->comment('For active tags');
            $table->dateTime('battery_last_checked')->nullable();
            $table->dateTime('last_maintenance_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Ensure tag identifiers are unique per type
            $table->unique(['tag_type', 'tag_identifier']);
            
            // Indexes for tracking tags
            $table->index(['equipment_id', 'is_active'], 'eq_track_tag_eq_active_idx');
            $table->index(['tag_type', 'is_active'], 'eq_track_tag_type_active_idx');
        });

        Schema::create('equipment_location_scans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained();
            $table->foreignId('tag_id')->nullable()->constrained('equipment_tracking_tags');
            $table->dateTime('scanned_at');
            $table->foreignId('scanned_by')->nullable()->constrained('users');
            $table->foreignId('location_id')->nullable()->constrained('equipment_locations');
            $table->string('scan_type')->comment('manual, automated, inventory, maintenance, etc.');
            $table->string('scanner_identifier')->nullable()->comment('Device ID that performed the scan');
            $table->decimal('gps_latitude', 10, 7)->nullable();
            $table->decimal('gps_longitude', 10, 7)->nullable();
            $table->json('indoor_coordinates')->nullable();
            $table->string('scan_reference')->nullable()->comment('Reference to inventory check, etc.');
            $table->string('equipment_status')->nullable()->comment('Status observed during scan');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for location scans
            $table->index(['equipment_id', 'scanned_at'], 'eq_loc_scan_eq_scanned_idx');
            $table->index(['location_id', 'scanned_at'], 'eq_loc_scan_loc_scanned_idx');
            $table->index('scan_type');
        });

        Schema::create('equipment_location_beacons', function (Blueprint $table) {
            $table->id();
            $table->string('beacon_identifier');
            $table->foreignId('location_id')->constrained('equipment_locations');
            $table->enum('beacon_type', ['bluetooth', 'wifi', 'ultrasonic', 'infrared', 'other']);
            $table->string('manufacturer')->nullable();
            $table->string('model')->nullable();
            $table->json('technical_specifications')->nullable();
            $table->string('signal_strength')->nullable();
            $table->string('coverage_radius')->nullable();
            $table->decimal('battery_level', 5, 2)->nullable();
            $table->dateTime('battery_last_checked')->nullable();
            $table->dateTime('last_maintenance_date')->nullable();
            $table->dateTime('installed_at');
            $table->foreignId('installed_by')->nullable()->constrained('users');
            $table->dateTime('last_signal_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Ensure beacon identifiers are unique
            $table->unique('beacon_identifier');
            
            // Indexes for beacons
            $table->index(['location_id', 'is_active'], 'eq_loc_beacon_loc_active_idx');
            $table->index(['beacon_type', 'is_active'], 'eq_loc_beacon_type_active_idx');
        });

        Schema::create('equipment_location_maps', function (Blueprint $table) {
            $table->id();
            $table->string('map_name');
            $table->text('description')->nullable();
            $table->foreignId('facility_id')->constrained();
            $table->string('building')->nullable();
            $table->string('floor')->nullable();
            $table->enum('map_type', ['floor_plan', 'site_plan', 'zone_map', 'evacuation_plan', 'other']);
            $table->string('file_path')->comment('Path to the map file');
            $table->string('file_type')->comment('SVG, PNG, JPG, etc.');
            $table->integer('width_pixels')->nullable();
            $table->integer('height_pixels')->nullable();
            $table->decimal('scale_factor', 10, 4)->nullable()->comment('Pixels to meters conversion');
            $table->json('reference_points')->nullable()->comment('Coordinate reference points');
            $table->json('map_features')->nullable()->comment('Doors, walls, etc.');
            $table->dateTime('last_updated_at');
            $table->foreignId('last_updated_by')->nullable()->constrained('users');
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for maps
            $table->index(['facility_id', 'building', 'floor'], 'eq_map_facility_bf_idx');
            $table->index(['map_type', 'is_active'], 'eq_loc_map_type_active_idx');
        });

        Schema::create('equipment_location_map_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('map_id')->constrained('equipment_location_maps');
            $table->morphs('mappable'); // Can reference equipment, locations, zones, etc.
            $table->json('coordinates')->comment('Position on the map');
            $table->string('icon_type')->nullable();
            $table->string('icon_color')->nullable();
            $table->string('label')->nullable();
            $table->json('display_properties')->nullable()->comment('Size, rotation, etc.');
            $table->boolean('is_visible')->default(true);
            $table->integer('z_index')->default(0)->comment('Layering order');
            $table->text('tooltip_content')->nullable();
            $table->json('interaction_behavior')->nullable()->comment('Click actions, etc.');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes for map items
            $table->index(['map_id', 'is_active'], 'eq_loc_map_item_map_active_idx');
            $table->index(['mappable_type', 'mappable_id'], 'eq_loc_map_item_mappable_idx');
        });

        // Add location tracking fields to equipment table
        Schema::table('equipment', function (Blueprint $table) {
            $table->foreignId('current_location_id')->nullable()->after('status')
                ->constrained('equipment_locations');
            $table->dateTime('location_last_verified_at')->nullable()->after('current_location_id');
            $table->foreignId('location_verified_by')->nullable()->after('location_last_verified_at')
                ->constrained('users');
            $table->string('location_verification_method')->nullable()->after('location_verified_by')
                ->comment('scan, visual, inventory check, etc.');
            $table->boolean('requires_location_tracking')->default(true)->after('location_verification_method');
            $table->integer('location_check_frequency_days')->nullable()->after('requires_location_tracking')
                ->comment('How often location should be verified');
            $table->dateTime('next_location_check_due')->nullable()->after('location_check_frequency_days');
            
            // Add index for location tracking
            $table->index(['current_location_id', 'location_last_verified_at'], 'eq_current_loc_verified_idx');
            $table->index('next_location_check_due');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove location tracking fields from equipment table
        Schema::table('equipment', function (Blueprint $table) {
            $table->dropIndex(['current_location_id', 'location_last_verified_at']);
            $table->dropIndex('next_location_check_due');
            $table->dropForeign(['current_location_id']);
            $table->dropForeign(['location_verified_by']);
            $table->dropColumn([
                'current_location_id',
                'location_last_verified_at',
                'location_verified_by',
                'location_verification_method',
                'requires_location_tracking',
                'location_check_frequency_days',
                'next_location_check_due'
            ]);
        });

        Schema::dropIfExists('equipment_location_map_items');
        Schema::dropIfExists('equipment_location_maps');
        Schema::dropIfExists('equipment_location_beacons');
        Schema::dropIfExists('equipment_location_scans');
        Schema::dropIfExists('equipment_tracking_tags');
        Schema::dropIfExists('equipment_location_zone_assignments');
        Schema::dropIfExists('equipment_location_zones');
        Schema::dropIfExists('equipment_location_history');
        Schema::dropIfExists('equipment_locations');
    }
};