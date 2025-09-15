<?php
namespace App\Services;

use App\Models\Bed;
use App\Models\BedReservation;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BedService
{
    /**
     * Create a new bed record
     *
     * @param array $data
     * @return Bed
     */
    public function create(array $data): Bed
    {
        return Bed::create($data);
    }

    /**
     * Update an existing bed record
     *
     * @param Bed $bed
     * @param array $data
     * @return Bed
     */
    public function update(Bed $bed, array $data): Bed
    {
        $bed->update($data);
        return $bed->fresh();
    }

    /**
     * Delete a bed record
     *
     * @param Bed $bed
     * @return bool
     */
    public function delete(Bed $bed): bool
    {
        return $bed->delete();
    }

    /**
     * Update bed status
     *
     * @param Bed $bed
     * @param array $data
     * @return Bed
     */
    public function updateStatus(Bed $bed, array $data): Bed
    {
        $bed->update([
            'status' => $data['status'],
            'notes' => $data['notes'] ?? null,
        ]);

        return $bed->fresh();
    }

    /**
     * Reserve a bed
     *
     * @param Bed $bed
     * @param array $data
     * @return BedReservation
     */
    public function reserve(Bed $bed, array $data): BedReservation
    {
        // Check if bed is available
        if ($bed->status !== 'available') {
            throw new \Exception('Bed is not available for reservation');
        }

        // Create reservation
        $reservation = BedReservation::create([
            'bed_id' => $bed->id,
            'patient_id' => $data['patient_id'],
            'reserved_by' => $data['reserved_by'],
            'reserved_at' => now(),
            'expected_admission_date' => $data['expected_admission_date'] ?? null,
            'expected_discharge_date' => $data['expected_discharge_date'] ?? null,
            'status' => 'pending',
            'notes' => $data['notes'] ?? null,
            'priority' => $data['priority'] ?? 'normal',
        ]);

        // Update bed status
        $bed->update([
            'status' => 'reserved',
        ]);

        return $reservation;
    }

    /**
     * Confirm a bed reservation
     *
     * @param BedReservation $reservation
     * @return BedReservation
     */
    public function confirmReservation(BedReservation $reservation): BedReservation
    {
        $reservation->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);

        // Update bed status
        $reservation->bed->update([
            'status' => 'occupied',
            'current_patient_id' => $reservation->patient_id,
        ]);

        return $reservation->fresh();
    }

    /**
     * Cancel a bed reservation
     *
     * @param BedReservation $reservation
     * @return BedReservation
     */
    public function cancelReservation(BedReservation $reservation): BedReservation
    {
        $reservation->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        // Update bed status back to available
        $reservation->bed->update([
            'status' => 'available',
            'current_patient_id' => null,
        ]);

        return $reservation->fresh();
    }

    /**
     * Get bed availability
     *
     * @param array $filters
     * @return array
     */
    public function getAvailability(array $filters = []): array
    {
        $query = Bed::query()
            ->with(['facility', 'bedType'])
            ->where('status', 'available');

        if (isset($filters['facility_id'])) {
            $query->where('facility_id', $filters['facility_id']);
        }

        if (isset($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        if (isset($filters['bed_type_id'])) {
            $query->where('bed_type_id', $filters['bed_type_id']);
        }

        return $query->get()->toArray();
    }
}