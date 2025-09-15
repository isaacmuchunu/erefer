<?php

namespace Database\Factories;

use App\Models\Equipment;
use App\Models\Facility;
use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Equipment>
 */
class EquipmentFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Equipment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $facility = Facility::inRandomOrder()->first() ?? Facility::factory()->create();
        $department = Department::where('facility_id', $facility->id)->inRandomOrder()->first() 
            ?? Department::factory()->create(['facility_id' => $facility->id]);
        
        $purchaseDate = $this->faker->dateTimeBetween('-5 years', '-1 month');
        $warrantyYears = $this->faker->numberBetween(1, 5);
        $warrantyExpiry = (clone $purchaseDate)->modify("+{$warrantyYears} years");
        
        $lastMaintenance = $this->faker->dateTimeBetween($purchaseDate, 'now');
        $nextMaintenanceDue = (clone $lastMaintenance)->modify('+6 months');
        
        $equipmentTypes = [
            'MRI Scanner' => ['Siemens', 'GE Healthcare', 'Philips'],
            'CT Scanner' => ['GE Healthcare', 'Siemens', 'Canon Medical'],
            'X-Ray Machine' => ['Carestream', 'Philips', 'Siemens'],
            'Ultrasound' => ['Philips', 'GE Healthcare', 'Samsung'],
            'Patient Monitor' => ['Philips', 'GE Healthcare', 'Mindray'],
            'Ventilator' => ['Medtronic', 'Dräger', 'Hamilton Medical'],
            'Defibrillator' => ['Zoll', 'Philips', 'Stryker'],
            'Anesthesia Machine' => ['Dräger', 'GE Healthcare', 'Mindray'],
            'Infusion Pump' => ['B. Braun', 'Baxter', 'BD'],
            'Surgical Microscope' => ['Zeiss', 'Leica', 'Olympus'],
            'ECG Machine' => ['GE Healthcare', 'Philips', 'Schiller'],
            'Dialysis Machine' => ['Fresenius', 'Baxter', 'Nipro'],
            'Sterilizer' => ['Steris', 'Getinge', 'Tuttnauer'],
            'Surgical Table' => ['Steris', 'Getinge', 'Skytron'],
            'Surgical Light' => ['Steris', 'Getinge', 'Skytron'],
        ];
        
        $equipmentType = $this->faker->randomElement(array_keys($equipmentTypes));
        $manufacturer = $this->faker->randomElement($equipmentTypes[$equipmentType]);
        
        $models = [
            'Siemens' => ['Magnetom Aera', 'Somatom Force', 'Artis Q', 'Multix Impact'],
            'GE Healthcare' => ['Revolution CT', 'Optima MR450w', 'Carescape R860', 'Vivid E95'],
            'Philips' => ['Ingenia Ambition', 'EPIQ Elite', 'IntelliVue MX750', 'Azurion 7'],
            'Carestream' => ['DRX-Revolution', 'DRX-Evolution Plus', 'OnSight 3D'],
            'Medtronic' => ['Puritan Bennett 980', 'Capnostream 35', 'Nellcor Bedside'],
            'Dräger' => ['Perseus A500', 'Evita V800', 'Atlan A350', 'Fabius Plus'],
            'Zoll' => ['R Series', 'X Series', 'AED Plus', 'AED 3'],
            'B. Braun' => ['Infusomat Space', 'Perfusor Space', 'Omniflow', 'Outlook ES'],
            'Zeiss' => ['OPMI Pentero 900', 'KINEVO 900', 'TIVATO 700', 'EXTARO 300'],
            'Fresenius' => ['5008S', '6008 CAREsystem', '4008S classix', '2008K'],
            'Steris' => ['Harmony LED', 'Amsco 600', 'V-PRO maX', 'Reliance Vision'],
            'Baxter' => ['Prismaflex', 'Spectrum IQ', 'Flo-Gard', 'Colleague'],
            'Mindray' => ['BeneView T8', 'A7', 'DC-80', 'HyBase 6100'],
            'Canon Medical' => ['Aquilion ONE', 'Vantage Orian', 'Aplio i-series', 'Infinix-i'],
            'Samsung' => ['RS85', 'HS70A', 'GM85', 'WS80A'],
            'Hamilton Medical' => ['HAMILTON-G5', 'HAMILTON-C6', 'HAMILTON-T1', 'HAMILTON-MR1'],
            'Stryker' => ['LIFEPAK 15', 'ProCuity', 'SDC3', 'Neptune 3'],
            'Leica' => ['M530 OHX', 'ARveo', 'M320', 'PROvido'],
            'Olympus' => ['VISERA ELITE II', 'EVIS X1', 'OTV-S300', 'CV-190'],
            'Schiller' => ['CARDIOVIT AT-102', 'CARDIOVIT FT-1', 'ARGUS PRO LifeCare 2'],
            'Nipro' => ['Surdial X', 'DBB-EXA', 'Diamax', 'Solacea'],
            'Getinge' => ['Maquet Magnus', 'Servo-u', 'GSS67H', 'PowerLED II'],
            'Tuttnauer' => ['EZ11Plus', '3870EA', '2540MK', 'T-Edge'],
            'Skytron' => ['6302', 'Aurora 4', 'GS70', 'UltraSlide'],
            'BD' => ['Alaris System', 'Pyxis MedStation', 'FACSymphony', 'Vacutainer'],
        ];
        
        $model = isset($models[$manufacturer]) ? $this->faker->randomElement($models[$manufacturer]) : $this->faker->word . ' ' . $this->faker->numberBetween(100, 9000);
        
        $statusOptions = ['available', 'in_use', 'maintenance', 'out_of_order'];
        $status = $this->faker->randomElement($statusOptions);
        
        // Generate specifications based on equipment type
        $specifications = [];
        switch ($equipmentType) {
            case 'MRI Scanner':
                $specifications = [
                    'field_strength' => $this->faker->randomElement(['1.5T', '3T', '7T']),
                    'channels' => $this->faker->numberBetween(8, 64),
                    'weight' => $this->faker->numberBetween(4000, 7000) . ' kg',
                    'dimensions' => $this->faker->numberBetween(1, 2) . 'm x ' . 
                                   $this->faker->numberBetween(2, 3) . 'm x ' . 
                                   $this->faker->numberBetween(2, 3) . 'm'
                ];
                break;
            case 'CT Scanner':
                $specifications = [
                    'slices' => $this->faker->randomElement([16, 32, 64, 128, 256, 320]),
                    'rotation_speed' => $this->faker->randomFloat(2, 0.2, 0.5) . ' seconds',
                    'weight' => $this->faker->numberBetween(1500, 3000) . ' kg',
                    'dimensions' => $this->faker->numberBetween(1, 2) . 'm x ' . 
                                   $this->faker->numberBetween(1, 3) . 'm x ' . 
                                   $this->faker->numberBetween(1, 2) . 'm'
                ];
                break;
            default:
                $specifications = [
                    'weight' => $this->faker->numberBetween(10, 1000) . ' kg',
                    'dimensions' => $this->faker->numberBetween(0, 2) . 'm x ' . 
                                   $this->faker->numberBetween(0, 2) . 'm x ' . 
                                   $this->faker->numberBetween(0, 2) . 'm',
                    'power' => $this->faker->numberBetween(100, 2000) . ' W',
                    'connectivity' => $this->faker->randomElement(['Bluetooth', 'WiFi', 'Ethernet', 'None'])
                ];
        }
        
        return [
            'facility_id' => $facility->id,
            'department_id' => $department->id,
            'name' => $equipmentType,
            'code' => strtoupper(substr($equipmentType, 0, 2)) . '-' . $this->faker->unique()->numberBetween(1000, 9999),
            'serial_number' => strtoupper($this->faker->bothify('??###??##?###')),
            'manufacturer' => $manufacturer,
            'model' => $model,
            'purchase_date' => $purchaseDate,
            'warranty_expiry' => $warrantyExpiry,
            'last_maintenance' => $lastMaintenance,
            'next_maintenance_due' => $nextMaintenanceDue,
            'status' => $status,
            'specifications' => json_encode($specifications),
            'cost' => $this->faker->randomFloat(2, 1000, 2000000),
        ];
    }
    
    /**
     * Indicate that the equipment is operational.
     *
     * @return static
     */
    public function operational()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'operational',
            ];
        });
    }
    
    /**
     * Indicate that the equipment needs maintenance.
     *
     * @return static
     */
    public function needsMaintenance()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'needs_maintenance',
                'next_maintenance_due' => now()->subDays($this->faker->numberBetween(1, 30)),
            ];
        });
    }
    
    /**
     * Indicate that the equipment is under repair.
     *
     * @return static
     */
    public function underRepair()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'under_repair',
            ];
        });
    }
    
    /**
     * Indicate that the equipment is out of service.
     *
     * @return static
     */
    public function outOfService()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'out_of_service',
            ];
        });
    }
    
    /**
     * Indicate that the equipment is retired.
     *
     * @return static
     */
    public function retired()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'retired',
            ];
        });
    }
}