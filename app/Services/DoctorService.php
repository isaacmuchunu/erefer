<?php
namespace App\Services;

use App\Models\Doctor;
use App\Models\DoctorSpecialty;
use Illuminate\Support\Facades\DB;

class DoctorService
{
    /**
     * Create a new doctor
     *
     * @param array $data
     * @return Doctor
     */
    public function create(array $data): Doctor
    {
        return DB::transaction(function () use ($data) {
            // Create the doctor
            $doctor = Doctor::create([
                'user_id' => $data['user_id'] ?? null,
                'facility_id' => $data['facility_id'],
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'license_number' => $data['license_number'],
                'status' => $data['status'] ?? 'active',
                'notes' => $data['notes'] ?? null,
            ]);

            // Add specialties if provided
            if (isset($data['specialties']) && is_array($data['specialties'])) {
                foreach ($data['specialties'] as $specialtyId) {
                    DoctorSpecialty::create([
                        'doctor_id' => $doctor->id,
                        'specialty_id' => $specialtyId,
                    ]);
                }
            }

            return $doctor;
        });
    }

    /**
     * Update an existing doctor
     *
     * @param Doctor $doctor
     * @param array $data
     * @return Doctor
     */
    public function update(Doctor $doctor, array $data): Doctor
    {
        return DB::transaction(function () use ($doctor, $data) {
            $doctor->update($data);

            // Update specialties if provided
            if (isset($data['specialties']) && is_array($data['specialties'])) {
                // Remove existing specialties
                DoctorSpecialty::where('doctor_id', $doctor->id)->delete();

                // Add new specialties
                foreach ($data['specialties'] as $specialtyId) {
                    DoctorSpecialty::create([
                        'doctor_id' => $doctor->id,
                        'specialty_id' => $specialtyId,
                    ]);
                }
            }

            return $doctor->fresh();
        });
    }

    /**
     * Delete a doctor
     *
     * @param Doctor $doctor
     * @return bool
     */
    public function delete(Doctor $doctor): bool
    {
        return DB::transaction(function () use ($doctor) {
            // Delete related records
            DoctorSpecialty::where('doctor_id', $doctor->id)->delete();

            // Delete the doctor
            return $doctor->delete();
        });
    }

    /**
     * Update doctor availability/schedule
     *
     * @param Doctor $doctor
     * @param array $schedule
     * @return Doctor
     */
    public function updateSchedule(Doctor $doctor, array $schedule): Doctor
    {
        $doctor->update([
            'schedule' => json_encode($schedule),
            'schedule_updated_at' => now(),
        ]);

        return $doctor->fresh();
    }

    /**
     * Get doctor availability
     *
     * @param Doctor $doctor
     * @param string|null $date
     * @return array
     */
    public function getAvailability(Doctor $doctor, ?string $date = null): array
    {
        // If no date is provided, use today
        $date = $date ?? now()->toDateString();
        
        // Get doctor's schedule
        $schedule = json_decode($doctor->schedule, true) ?? [];
        
        // Get day of week for the given date
        $dayOfWeek = strtolower(date('l', strtotime($date)));
        
        // Get availability for the given day
        $daySchedule = $schedule[$dayOfWeek] ?? [];
        
        // Get referrals for the given date to check for conflicts
        $referrals = $doctor->referrals()
            ->whereDate('created_at', $date)
            ->get()
            ->toArray();
        
        return [
            'doctor' => $doctor->toArray(),
            'date' => $date,
            'day_of_week' => $dayOfWeek,
            'schedule' => $daySchedule,
            'referrals' => $referrals,
        ];
    }

    /**
     * Get doctor statistics
     *
     * @param Doctor $doctor
     * @param array $filters
     * @return array
     */
    public function getStatistics(Doctor $doctor, array $filters = []): array
    {
        // Define date range
        $startDate = $filters['start_date'] ?? now()->subMonths(3)->toDateString();
        $endDate = $filters['end_date'] ?? now()->toDateString();
        
        // Get referrals in date range
        $referrals = $doctor->referrals()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();
        
        // Calculate statistics
        $totalReferrals = $referrals->count();
        $acceptedReferrals = $referrals->where('status', 'accepted')->count();
        $rejectedReferrals = $referrals->where('status', 'rejected')->count();
        $pendingReferrals = $referrals->where('status', 'pending')->count();
        $completedReferrals = $referrals->where('status', 'completed')->count();
        
        // Calculate average response time
        $responseTimes = $referrals->filter(function ($referral) {
            return $referral->status !== 'pending' && $referral->accepted_at;
        })->map(function ($referral) {
            $createdAt = new \DateTime($referral->created_at);
            $respondedAt = new \DateTime($referral->accepted_at ?? $referral->rejected_at);
            return $createdAt->diff($respondedAt)->format('%h');
        });
        
        $avgResponseTime = $responseTimes->count() > 0 ? $responseTimes->avg() : 0;
        
        return [
            'doctor' => $doctor->toArray(),
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'referrals' => [
                'total' => $totalReferrals,
                'accepted' => $acceptedReferrals,
                'rejected' => $rejectedReferrals,
                'pending' => $pendingReferrals,
                'completed' => $completedReferrals,
            ],
            'performance' => [
                'acceptance_rate' => $totalReferrals > 0 ? ($acceptedReferrals / $totalReferrals) * 100 : 0,
                'completion_rate' => $acceptedReferrals > 0 ? ($completedReferrals / $acceptedReferrals) * 100 : 0,
                'avg_response_time_hours' => $avgResponseTime,
            ],
        ];
    }
}