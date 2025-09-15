<?php
namespace App\Services;

use App\Models\Facility;
use App\Models\Department;
use App\Models\FacilitySpecialty;
use Illuminate\Support\Facades\DB;

class FacilityService
{
    /**
     * Create a new facility
     *
     * @param array $data
     * @return Facility
     */
    public function createFacility(array $data): Facility
    {
        return DB::transaction(function () use ($data) {
            // Create the facility
            $facility = Facility::create([
                'name' => $data['name'],
                'type' => $data['type'],
                'address' => $data['address'],
                'city' => $data['city'],
                'state' => $data['state'],
                'postal_code' => $data['postal_code'],
                'country' => $data['country'],
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
                'phone' => $data['phone'],
                'email' => $data['email'],
                'website' => $data['website'] ?? null,
                'capacity' => $data['capacity'] ?? null,
                'status' => $data['status'] ?? 'pending',
                'is_verified' => $data['is_verified'] ?? false,
                'notes' => $data['notes'] ?? null,
            ]);

            // Add specialties if provided
            if (isset($data['specialties']) && is_array($data['specialties'])) {
                foreach ($data['specialties'] as $specialtyId) {
                    FacilitySpecialty::create([
                        'facility_id' => $facility->id,
                        'specialty_id' => $specialtyId,
                    ]);
                }
            }

            // Add departments if provided
            if (isset($data['departments']) && is_array($data['departments'])) {
                foreach ($data['departments'] as $department) {
                    Department::create([
                        'facility_id' => $facility->id,
                        'name' => $department['name'],
                        'description' => $department['description'] ?? null,
                        'contact_person' => $department['contact_person'] ?? null,
                        'contact_email' => $department['contact_email'] ?? null,
                        'contact_phone' => $department['contact_phone'] ?? null,
                        'status' => $department['status'] ?? 'active',
                    ]);
                }
            }

            return $facility;
        });
    }

    /**
     * Update an existing facility
     *
     * @param Facility $facility
     * @param array $data
     * @return Facility
     */
    public function updateFacility(Facility $facility, array $data): Facility
    {
        return DB::transaction(function () use ($facility, $data) {
            $facility->update($data);

            // Update specialties if provided
            if (isset($data['specialties']) && is_array($data['specialties'])) {
                // Remove existing specialties
                FacilitySpecialty::where('facility_id', $facility->id)->delete();

                // Add new specialties
                foreach ($data['specialties'] as $specialtyId) {
                    FacilitySpecialty::create([
                        'facility_id' => $facility->id,
                        'specialty_id' => $specialtyId,
                    ]);
                }
            }

            return $facility->fresh();
        });
    }

    /**
     * Delete a facility
     *
     * @param Facility $facility
     * @return bool
     */
    public function deleteFacility(Facility $facility): bool
    {
        return DB::transaction(function () use ($facility) {
            // Delete related records
            FacilitySpecialty::where('facility_id', $facility->id)->delete();
            Department::where('facility_id', $facility->id)->delete();

            // Delete the facility
            return $facility->delete();
        });
    }

    /**
     * Verify a facility
     *
     * @param Facility $facility
     * @return Facility
     */
    public function verify(Facility $facility): Facility
    {
        $facility->update([
            'is_verified' => true,
            'verified_at' => now(),
            'status' => 'active',
        ]);

        return $facility->fresh();
    }

    /**
     * Get facility availability
     *
     * @param Facility $facility
     * @return array
     */
    public function getAvailability(Facility $facility): array
    {
        $bedAvailability = $facility->beds()
            ->selectRaw('bed_type_id, COUNT(*) as total, SUM(CASE WHEN status = "available" THEN 1 ELSE 0 END) as available')
            ->groupBy('bed_type_id')
            ->with('bedType')
            ->get()
            ->toArray();

        $ambulanceAvailability = $facility->ambulances()
            ->selectRaw('type, COUNT(*) as total, SUM(CASE WHEN status = "available" THEN 1 ELSE 0 END) as available')
            ->groupBy('type')
            ->get()
            ->toArray();

        $doctorAvailability = $facility->doctors()
            ->selectRaw('specialty_id, COUNT(*) as total')
            ->groupBy('specialty_id')
            ->with('specialty')
            ->get()
            ->toArray();

        return [
            'beds' => $bedAvailability,
            'ambulances' => $ambulanceAvailability,
            'doctors' => $doctorAvailability,
            'updated_at' => now()->toDateTimeString(),
        ];
    }
}