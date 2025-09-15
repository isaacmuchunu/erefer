<?php

namespace Database\Factories;

use App\Models\Equipment;
use App\Models\EquipmentMaintenanceRecord;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EquipmentMaintenanceRecord>
 */
class EquipmentMaintenanceRecordFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = EquipmentMaintenanceRecord::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $equipment = Equipment::inRandomOrder()->first() ?? Equipment::factory()->create();
        
        $maintenanceDate = $this->faker->dateTimeBetween('-1 year', 'now');
        $status = $this->faker->randomElement(['scheduled', 'in_progress', 'completed', 'cancelled']);
        
        $completionDate = null;
        if ($status === 'completed') {
            $completionDate = (clone $maintenanceDate)->modify('+' . $this->faker->numberBetween(1, 5) . ' days');
        }
        
        $maintenanceTypes = [
            'preventive',
            'corrective',
            'predictive',
            'condition_based',
            'emergency',
            'calibration',
            'inspection',
            'software_update',
            'hardware_upgrade',
            'cleaning'
        ];
        
        return [
            'equipment_id' => $equipment->id,
            'maintenance_date' => $maintenanceDate,
            'maintenance_type' => $this->faker->randomElement($maintenanceTypes),
            'status' => $status,
            'performed_by' => $this->faker->name(),
            'notes' => $this->faker->paragraph(),
            'completion_date' => $completionDate,
            'cost' => $this->faker->randomFloat(2, 50, 5000),
            'parts_used' => $status === 'completed' ? json_encode([
                ['name' => $this->faker->word(), 'quantity' => $this->faker->numberBetween(1, 5), 'cost' => $this->faker->randomFloat(2, 10, 1000)],
                ['name' => $this->faker->word(), 'quantity' => $this->faker->numberBetween(1, 3), 'cost' => $this->faker->randomFloat(2, 10, 500)]
            ]) : null,
            'downtime_hours' => $status === 'completed' ? $this->faker->randomFloat(1, 0.5, 48) : null,
        ];
    }
    
    /**
     * Indicate that the maintenance is scheduled.
     *
     * @return static
     */
    public function scheduled()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'scheduled',
                'completion_date' => null,
                'parts_used' => null,
                'downtime_hours' => null,
            ];
        });
    }
    
    /**
     * Indicate that the maintenance is in progress.
     *
     * @return static
     */
    public function inProgress()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'in_progress',
                'completion_date' => null,
                'parts_used' => null,
                'downtime_hours' => null,
            ];
        });
    }
    
    /**
     * Indicate that the maintenance is completed.
     *
     * @return static
     */
    public function completed()
    {
        return $this->state(function (array $attributes) {
            $maintenanceDate = $attributes['maintenance_date'] ?? $this->faker->dateTimeBetween('-1 year', '-1 day');
            $completionDate = (clone $maintenanceDate)->modify('+' . $this->faker->numberBetween(1, 5) . ' days');
            
            return [
                'status' => 'completed',
                'completion_date' => $completionDate,
                'parts_used' => json_encode([
                    ['name' => $this->faker->word(), 'quantity' => $this->faker->numberBetween(1, 5), 'cost' => $this->faker->randomFloat(2, 10, 1000)],
                    ['name' => $this->faker->word(), 'quantity' => $this->faker->numberBetween(1, 3), 'cost' => $this->faker->randomFloat(2, 10, 500)]
                ]),
                'downtime_hours' => $this->faker->randomFloat(1, 0.5, 48),
            ];
        });
    }
    
    /**
     * Indicate that the maintenance is cancelled.
     *
     * @return static
     */
    public function cancelled()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'cancelled',
                'completion_date' => null,
                'parts_used' => null,
                'downtime_hours' => null,
                'notes' => 'Maintenance cancelled: ' . $this->faker->sentence(),
            ];
        });
    }
    
    /**
     * Indicate that the maintenance is preventive.
     *
     * @return static
     */
    public function preventive()
    {
        return $this->state(function (array $attributes) {
            return [
                'maintenance_type' => 'preventive',
                'notes' => 'Routine preventive maintenance: ' . $this->faker->sentence(),
            ];
        });
    }
    
    /**
     * Indicate that the maintenance is corrective.
     *
     * @return static
     */
    public function corrective()
    {
        return $this->state(function (array $attributes) {
            return [
                'maintenance_type' => 'corrective',
                'notes' => 'Corrective maintenance due to failure: ' . $this->faker->sentence(),
            ];
        });
    }
}