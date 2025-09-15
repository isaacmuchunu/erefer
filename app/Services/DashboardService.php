<?php
namespace App\Services;

use App\Models\Referral;
use App\Models\Facility;
use App\Models\Ambulance;
use App\Models\EmergencyAlert;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class DashboardService
{
    /**
     * Get dashboard overview data
     *
     * @param array $filters
     * @return array
     */
    public function getOverview(array $filters = []): array
    {
        $facilityId = $filters['facility_id'] ?? Auth::user()->facility_id ?? null;
        $startDate = $filters['start_date'] ?? now()->subDays(30)->toDateString();
        $endDate = $filters['end_date'] ?? now()->toDateString();
        $referralQuery = Referral::query()
            ->whereBetween('created_at', [$startDate, $endDate]);
        if ($facilityId) {
            $referralQuery->where(function ($query) use ($facilityId) {
                $query->where('referring_facility_id', $facilityId)
                      ->orWhere('receiving_facility_id', $facilityId);
            });
        }
        $referralStats = $referralQuery->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();
        $bedQuery = \App\Models\Bed::query();
        if ($facilityId) {
            $bedQuery->where('facility_id', $facilityId);
        }
        $bedStats = $bedQuery->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();
        $ambulanceQuery = Ambulance::query();
        if ($facilityId) {
            $ambulanceQuery->where('facility_id', $facilityId);
        }
        $ambulanceStats = $ambulanceQuery->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();
        $alertQuery = EmergencyAlert::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'desc')
            ->limit(5);
        if ($facilityId) {
            $alertQuery->where('facility_id', $facilityId);
        }
        $recentAlerts = $alertQuery->get()->toArray();
        $totalPatients = Patient::count();
        $activeFacilities = Facility::where('status', 'active')->count();
        $urgentReferrals = $referralQuery->clone()->whereIn('urgency', ['emergency', 'urgent'])->count();
        $completedReferrals = $referralStats['completed'] ?? 0;
        $avgResponseTime = $referralQuery->clone()
            ->whereNotNull('accepted_at')
            ->select(DB::raw('AVG(TIMESTAMPDIFF(MINUTE, created_at, accepted_at)) as avg_time'))
            ->first()
            ->avg_time ?? 0;
        $recentReferralsQuery = Referral::query()
            ->with(['patient', 'referringFacility', 'receivingFacility'])
            ->select('id', 'referral_number', 'patient_id', 'urgency', 'status', 'created_at', 'referring_facility_id', 'receiving_facility_id')
            ->latest()
            ->limit(5);
        if ($facilityId) {
            $recentReferralsQuery->where(function ($query) use ($facilityId) {
                $query->where('referring_facility_id', $facilityId)
                      ->orWhere('receiving_facility_id', $facilityId);
            });
        }
        $recentReferrals = $recentReferralsQuery->get()->map(function($referral) {
                return [
                    'id' => $referral->id,
                    'referral_number' => $referral->referral_number,
                    'patient_name' => $referral->patient ? $referral->patient->first_name . ' ' . $referral->patient->last_name : 'Unknown',
                    'urgency' => $referral->urgency,
                    'status' => $referral->status,
                    'created_at' => $referral->created_at->toDateTimeString(),
                    'referring_facility' => $referral->referringFacility->name ?? 'Unknown',
                    'receiving_facility' => $referral->receivingFacility->name ?? 'Unknown',
                ];
            })->toArray();

        $recentPatientsQuery = Patient::query()
            ->select('id', 'first_name', 'last_name', 'date_of_birth', 'status', 'created_at')
            ->latest()
            ->limit(5);
        if ($facilityId) {
            $recentPatientsQuery->where('facility_id', $facilityId);
        }
        $recentPatients = $recentPatientsQuery->get()->map(function($patient) {
            return [
                'id' => $patient->id,
                'name' => $patient->first_name . ' ' . $patient->last_name,
                'date_of_birth' => $patient->date_of_birth,
                'status' => $patient->status,
                'created_at' => $patient->created_at->toDateTimeString(),
            ];
        })->toArray();

        return [
            'totalReferrals' => array_sum($referralStats),
            'pendingReferrals' => $referralStats['pending'] ?? 0,
            'completedReferrals' => $completedReferrals,
            'urgentReferrals' => $urgentReferrals,
            'totalPatients' => $totalPatients,
            'activeFacilities' => $activeFacilities,
            'availableBeds' => $bedStats['available'] ?? 0,
            'totalBeds' => array_sum($bedStats),
            'averageResponseTime' => round($avgResponseTime, 2),
            'recentReferrals' => $recentReferrals,
            'recentPatients' => $recentPatients,
            'alerts' => $recentAlerts,
        ];
    }

    /**
     * Get referral statistics
     *
     * @param array $filters
     * @return array
     */
    public function getReferralStats(array $filters = []): array
    {
        // Get user's facility if applicable
    $facilityId = $filters['facility_id'] ?? Auth::user()->facility_id ?? null;
    
    // Define date range
    $startDate = $filters['start_date'] ?? now()->subDays(30)->toDateString();
        $endDate = $filters['end_date'] ?? now()->toDateString();
        
        // Base query for referrals
        $referralQuery = Referral::query()
            ->whereBetween('created_at', [$startDate, $endDate]);
            
        // Filter by facility if provided
        if ($facilityId) {
            $referralQuery->where(function ($query) use ($facilityId) {
                $query->where('referring_facility_id', $facilityId)
                      ->orWhere('receiving_facility_id', $facilityId);
            });
        }
        
        // Get referrals by day
        $referralsByDay = $referralQuery->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('count', 'date')
            ->toArray();
        
        // Get referrals by specialty
        $referralsBySpecialty = $referralQuery->select(
                'specialty_id',
                DB::raw('count(*) as count')
            )
            ->with('specialty')
            ->groupBy('specialty_id')
            ->orderBy('count', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'specialty_id' => $item->specialty_id,
                    'specialty_name' => $item->specialty->name ?? 'Unknown',
                    'count' => $item->count,
                ];
            })
            ->toArray();
        
        // Get referrals by urgency
        $referralsByUrgency = $referralQuery->select(
                'urgency',
                DB::raw('count(*) as count')
            )
            ->groupBy('urgency')
            ->orderBy('count', 'desc')
            ->get()
            ->pluck('count', 'urgency')
            ->toArray();
        
        // Calculate average response time
        $avgResponseTime = $referralQuery
            ->whereNotNull('accepted_at')
            ->select(DB::raw('AVG(TIMESTAMPDIFF(MINUTE, created_at, accepted_at)) as avg_time'))
            ->first()
            ->avg_time ?? 0;
        
        return [
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'total_referrals' => array_sum($referralsByDay),
            'by_day' => $referralsByDay,
            'by_specialty' => $referralsBySpecialty,
            'by_urgency' => $referralsByUrgency,
            'avg_response_time_minutes' => round($avgResponseTime, 2),
        ];
    }

    /**
     * Get capacity status
     *
     * @param array $filters
     * @return array
     */
    public function getCapacityStatus(array $filters = []): array
    {
        // Get facilities
        $facilityQuery = Facility::query()->where('status', 'active');
        
        // Filter by facility if provided
        if (isset($filters['facility_id'])) {
            $facilityQuery->where('id', $filters['facility_id']);
        }
        
        $facilities = $facilityQuery->get();
        
        $capacityData = [];
        
        foreach ($facilities as $facility) {
            // Get bed stats
            $bedStats = \App\Models\Bed::where('facility_id', $facility->id)
                ->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get()
                ->pluck('count', 'status')
                ->toArray();
            
            // Get ambulance stats
            $ambulanceStats = Ambulance::where('facility_id', $facility->id)
                ->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get()
                ->pluck('count', 'status')
                ->toArray();
            
            $capacityData[] = [
                'facility_id' => $facility->id,
                'facility_name' => $facility->name,
                'beds' => [
                    'total' => array_sum($bedStats),
                    'available' => $bedStats['available'] ?? 0,
                    'occupied' => $bedStats['occupied'] ?? 0,
                    'reserved' => $bedStats['reserved'] ?? 0,
                    'availability_percentage' => array_sum($bedStats) > 0 
                        ? round((($bedStats['available'] ?? 0) / array_sum($bedStats)) * 100, 2) 
                        : 0,
                ],
                'ambulances' => [
                    'total' => array_sum($ambulanceStats),
                    'available' => $ambulanceStats['available'] ?? 0,
                    'dispatched' => $ambulanceStats['dispatched'] ?? 0,
                    'availability_percentage' => array_sum($ambulanceStats) > 0 
                        ? round((($ambulanceStats['available'] ?? 0) / array_sum($ambulanceStats)) * 100, 2) 
                        : 0,
                ],
                'last_updated' => now()->toDateTimeString(),
            ];
        }
        
        return $capacityData;
    }

    /**
     * Get real-time alerts
     *
     * @param array $filters
     * @return array
     */
    public function getRealTimeAlerts(array $filters = []): array
    {
        // Get user's facility if applicable
    $facilityId = $filters['facility_id'] ?? Auth::user()->facility_id ?? null;
    
    // Base query for alerts
    $alertQuery = EmergencyAlert::query()
            ->with(['creator'])
            ->orderBy('created_at', 'desc')
            ->limit($filters['limit'] ?? 10);
            
        // Filter by facility if provided
        if ($facilityId) {
            $alertQuery->where('facility_id', $facilityId);
        }
        
        // Filter by severity if provided
        if (isset($filters['severity'])) {
            $alertQuery->where('severity', $filters['severity']);
        }
        
        // Filter by type if provided
        if (isset($filters['type'])) {
            $alertQuery->where('type', $filters['type']);
        }
        
        return $alertQuery->get()->toArray();
    }
}