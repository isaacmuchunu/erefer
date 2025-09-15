<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Referral;
use App\Models\Patient;
use App\Models\Facility;
use App\Models\Doctor;
use App\Models\Specialty;
use App\Models\BedType;

class ReferralFactory extends Factory
{
    protected $model = Referral::class;

    public function definition(): array
    {
        return [
            'referral_number' => Str::random(10),
            'patient_id' => Patient::factory(),
            'referring_facility_id' => Facility::factory(),
            'referring_doctor_id' => Doctor::factory(),
            'receiving_facility_id' => Facility::factory(),
            'receiving_doctor_id' => Doctor::factory(),
            'specialty_id' => Specialty::factory(),
            'urgency' => fake()->randomElement(['emergency', 'urgent', 'semi_urgent', 'routine']),
            'type' => fake()->randomElement(['consultation', 'treatment', 'admission', 'surgery', 'diagnostic']),
            'clinical_summary' => fake()->paragraph(),
            'reason_for_referral' => fake()->sentence(),
            'vital_signs' => ['blood_pressure' => '120/80', 'heart_rate' => 80, 'temperature' => 36.6],
            'investigations_done' => [fake()->word()],
            'current_medications' => [fake()->word()],
            'treatment_given' => fake()->sentence(),
            'transport_required' => fake()->randomElement(['none', 'ambulance', 'air_ambulance', 'patient_transport']),
            'response_deadline' => fake()->dateTimeBetween('now', '+1 week'),
            'bed_required' => fake()->boolean(),
            'bed_type_id' => BedType::factory(),
            'status' => fake()->randomElement(['pending', 'accepted', 'rejected', 'in_transit', 'arrived', 'completed', 'cancelled', 'expired']),
            'referred_at' => now(),
        ];
    }
}