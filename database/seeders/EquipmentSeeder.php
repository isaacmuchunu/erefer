<?php

namespace Database\Seeders;

use App\Models\Equipment;
use App\Models\Facility;
use App\Models\Department;
use Illuminate\Database\Seeder;

class EquipmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all facilities and departments to associate equipment with
        $facilities = Facility::all();
        $departments = Department::all();
        
        if ($facilities->isEmpty() || $departments->isEmpty()) {
            $this->command->info('Please run FacilitySeeder and DepartmentSeeder first');
            return;
        }
        
        // Sample equipment data
        $equipmentData = [
            [
                'name' => 'MRI Scanner',
                'code' => 'MRI-001',
                'serial_number' => 'SN12345678',
                'manufacturer' => 'Siemens',
                'model' => 'Magnetom Aera',
                'purchase_date' => now()->subYears(3),
                'warranty_expiry' => now()->addYears(2),
                'last_maintenance' => now()->subMonths(2),
                'next_maintenance_due' => now()->addMonths(4),
                'status' => 'available',
                'specifications' => json_encode([
                    'field_strength' => '1.5T',
                    'channels' => 32,
                    'weight' => '4,400 kg',
                    'dimensions' => '1.6m x 2.5m x 2.0m'
                ]),
                'cost' => 1200000.00
            ],
            [
                'name' => 'CT Scanner',
                'code' => 'CT-001',
                'serial_number' => 'CT98765432',
                'manufacturer' => 'GE Healthcare',
                'model' => 'Revolution CT',
                'purchase_date' => now()->subYears(2),
                'warranty_expiry' => now()->addYears(3),
                'last_maintenance' => now()->subMonths(1),
                'next_maintenance_due' => now()->addMonths(5),
                'status' => 'available',
                'specifications' => json_encode([
                    'slices' => 256,
                    'rotation_speed' => '0.28 seconds',
                    'weight' => '2,300 kg',
                    'dimensions' => '1.8m x 2.0m x 1.7m'
                ]),
                'cost' => 850000.00
            ],
            [
                'name' => 'Ultrasound Machine',
                'code' => 'US-001',
                'serial_number' => 'US87654321',
                'manufacturer' => 'Philips',
                'model' => 'EPIQ Elite',
                'purchase_date' => now()->subYears(1),
                'warranty_expiry' => now()->addYears(2),
                'last_maintenance' => now()->subMonths(3),
                'next_maintenance_due' => now()->addMonths(3),
                'status' => 'available',
                'specifications' => json_encode([
                    'probes' => 4,
                    'display' => '21.5 inch LED',
                    'weight' => '115 kg',
                    'dimensions' => '0.6m x 0.9m x 1.6m'
                ]),
                'cost' => 120000.00
            ],
            [
                'name' => 'X-Ray Machine',
                'code' => 'XR-001',
                'serial_number' => 'XR76543210',
                'manufacturer' => 'Carestream',
                'model' => 'DRX-Revolution',
                'purchase_date' => now()->subYears(4),
                'warranty_expiry' => now()->subYear(1),
                'last_maintenance' => now()->subMonths(6),
                'next_maintenance_due' => now()->addWeeks(2),
                'status' => 'maintenance',
                'specifications' => json_encode([
                    'detector_type' => 'Digital',
                    'power' => '32 kW',
                    'weight' => '625 kg',
                    'dimensions' => '0.6m x 1.2m x 1.9m'
                ]),
                'cost' => 95000.00
            ],
            [
                'name' => 'Ventilator',
                'code' => 'VT-001',
                'serial_number' => 'VT65432109',
                'manufacturer' => 'Medtronic',
                'model' => 'Puritan Bennett 980',
                'purchase_date' => now()->subMonths(8),
                'warranty_expiry' => now()->addYears(4),
                'last_maintenance' => now()->subMonths(1),
                'next_maintenance_due' => now()->addMonths(5),
                'status' => 'available',
                'specifications' => json_encode([
                    'modes' => 'Volume, Pressure, SIMV, CPAP',
                    'battery_life' => '4 hours',
                    'weight' => '37 kg',
                    'dimensions' => '0.4m x 0.5m x 1.3m'
                ]),
                'cost' => 35000.00
            ],
            [
                'name' => 'Defibrillator',
                'code' => 'DF-001',
                'serial_number' => 'DF54321098',
                'manufacturer' => 'Zoll',
                'model' => 'R Series',
                'purchase_date' => now()->subYears(2),
                'warranty_expiry' => now()->addYear(1),
                'last_maintenance' => now()->subMonths(4),
                'next_maintenance_due' => now()->addMonths(2),
                'status' => 'available',
                'specifications' => json_encode([
                    'energy_range' => '1-200 joules',
                    'battery_life' => '5 hours',
                    'weight' => '8 kg',
                    'dimensions' => '0.3m x 0.4m x 0.2m'
                ]),
                'cost' => 18000.00
            ],
            [
                'name' => 'Anesthesia Machine',
                'code' => 'AN-001',
                'serial_number' => 'AN43210987',
                'manufacturer' => 'Dräger',
                'model' => 'Perseus A500',
                'purchase_date' => now()->subYears(1)->subMonths(6),
                'warranty_expiry' => now()->addYears(3)->addMonths(6),
                'last_maintenance' => now()->subMonths(2),
                'next_maintenance_due' => now()->addMonths(4),
                'status' => 'available',
                'specifications' => json_encode([
                    'ventilation_modes' => 'Volume, Pressure, SIMV, PSV',
                    'flow_range' => '0-100 L/min',
                    'weight' => '130 kg',
                    'dimensions' => '0.8m x 0.9m x 1.5m'
                ]),
                'cost' => 85000.00
            ],
            [
                'name' => 'Patient Monitor',
                'code' => 'PM-001',
                'serial_number' => 'PM32109876',
                'manufacturer' => 'Philips',
                'model' => 'IntelliVue MX750',
                'purchase_date' => now()->subMonths(10),
                'warranty_expiry' => now()->addYears(2)->addMonths(2),
                'last_maintenance' => now()->subMonths(2),
                'next_maintenance_due' => now()->addMonths(4),
                'status' => 'available',
                'specifications' => json_encode([
                    'screen_size' => '19 inch',
                    'parameters' => 'ECG, SpO2, NIBP, Temp, Resp',
                    'weight' => '6.5 kg',
                    'dimensions' => '0.4m x 0.3m x 0.2m'
                ]),
                'cost' => 25000.00
            ],
            [
                'name' => 'Infusion Pump',
                'code' => 'IP-001',
                'serial_number' => 'IP21098765',
                'manufacturer' => 'B. Braun',
                'model' => 'Infusomat Space',
                'purchase_date' => now()->subYears(1)->subMonths(2),
                'warranty_expiry' => now()->addYears(1)->addMonths(10),
                'last_maintenance' => now()->subMonths(3),
                'next_maintenance_due' => now()->addMonths(3),
                'status' => 'available',
                'specifications' => json_encode([
                    'flow_rate' => '0.1-1200 ml/h',
                    'accuracy' => '±5%',
                    'weight' => '1.4 kg',
                    'dimensions' => '0.15m x 0.2m x 0.1m'
                ]),
                'cost' => 3500.00
            ],
            [
                'name' => 'Surgical Microscope',
                'code' => 'SM-001',
                'serial_number' => 'SM10987654',
                'manufacturer' => 'Zeiss',
                'model' => 'OPMI Pentero 900',
                'purchase_date' => now()->subYears(2)->subMonths(3),
                'warranty_expiry' => now()->addYears(2)->addMonths(9),
                'last_maintenance' => now()->subMonths(5),
                'next_maintenance_due' => now()->addMonth(1),
                'status' => 'maintenance',
                'specifications' => json_encode([
                    'magnification' => '1x-15x',
                    'working_distance' => '200-500 mm',
                    'weight' => '290 kg',
                    'dimensions' => '1.8m x 1.9m x 2.1m'
                ]),
                'cost' => 320000.00
            ],
        ];
        
        // Create equipment and associate with random facilities and departments
        foreach ($equipmentData as $data) {
            $facility = $facilities->random();
            $department = $departments->where('facility_id', $facility->id)->first() ?? $departments->random();
            
            Equipment::create(array_merge($data, [
                'facility_id' => $facility->id,
                'department_id' => $department->id
            ]));
        }
        
        $this->command->info('Sample equipment data seeded successfully');
    }
}