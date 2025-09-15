<?php
namespace App\Services;

use App\Models\Referral;
use App\Models\ReferralDocument;
use App\Models\ReferralFeedback;
use App\Models\Facility;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class ReferralService
{
    /**
     * Create a new referral
     *
     * @param array $data
     * @return Referral
     */
    public function create(array $data): Referral
    {
        return DB::transaction(function () use ($data) {
            // Create the referral
            $referral = Referral::create([
                'patient_id' => $data['patient_id'],
                'referring_facility_id' => $data['referring_facility_id'],
                'referring_doctor_id' => $data['referring_doctor_id'],
                'receiving_facility_id' => $data['receiving_facility_id'],
                'receiving_doctor_id' => $data['receiving_doctor_id'] ?? null,
                'specialty_id' => $data['specialty_id'],
                'urgency' => $data['urgency'] ?? 'normal',
                'status' => 'pending',
                'reason' => $data['reason'],
                'clinical_information' => $data['clinical_information'] ?? null,
                'transport_required' => $data['transport_required'] ?? false,
                'bed_type_required' => $data['bed_type_required'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            // Handle documents if provided
            if (isset($data['documents']) && is_array($data['documents'])) {
                foreach ($data['documents'] as $document) {
                    $path = $document->store('referral-documents/' . $referral->id);
                    
                    ReferralDocument::create([
                        'referral_id' => $referral->id,
                        'file_path' => $path,
                        'file_name' => $document->getClientOriginalName(),
                        'file_type' => $document->getClientMimeType(),
                        'file_size' => $document->getSize(),
                        'uploaded_by' => Auth::id(),
                    ]);
                }
            }

            return $referral;
        });
    }

    /**
     * Update an existing referral
     *
     * @param Referral $referral
     * @param array $data
     * @return Referral
     */
    public function update(Referral $referral, array $data): Referral
    {
        return DB::transaction(function () use ($referral, $data) {
            $referral->update($data);

            // Handle documents if provided
            if (isset($data['documents']) && is_array($data['documents'])) {
                foreach ($data['documents'] as $document) {
                    $path = $document->store('referral-documents/' . $referral->id);
                    
                    ReferralDocument::create([
                        'referral_id' => $referral->id,
                        'file_path' => $path,
                        'file_name' => $document->getClientOriginalName(),
                        'file_type' => $document->getClientMimeType(),
                        'file_size' => $document->getSize(),
                        'uploaded_by' => Auth::id(),
                    ]);
                }
            }

            return $referral->fresh();
        });
    }

    /**
     * Update referral status
     *
     * @param Referral $referral
     * @param array $data
     * @return Referral
     */
    public function updateStatus(Referral $referral, array $data): Referral
    {
        $oldStatus = $referral->status;
        $newStatus = $data['status'];

        $referral->update([
            'status' => $newStatus,
            'notes' => $data['notes'] ?? $referral->notes,
        ]);

        // Update timestamps based on status
        switch ($newStatus) {
            case 'accepted':
                $referral->update(['accepted_at' => now()]);
                break;
            case 'rejected':
                $referral->update(['rejected_at' => now()]);
                break;
            case 'cancelled':
                $referral->update(['cancelled_at' => now()]);
                break;
            case 'completed':
                $referral->update(['completed_at' => now()]);
                break;
        }

        return $referral->fresh();
    }

    /**
     * Add feedback to a referral
     *
     * @param Referral $referral
     * @param array $data
     * @return ReferralFeedback
     */
    public function addFeedback(Referral $referral, array $data): ReferralFeedback
    {
        $feedback = ReferralFeedback::create([
            'referral_id' => $referral->id,
            'user_id' => Auth::id(),
            'rating' => $data['rating'],
            'comments' => $data['comments'] ?? null,
            'feedback_type' => $data['feedback_type'] ?? 'general',
        ]);

        return $feedback;
    }

    /**
     * Find suitable facilities for a referral
     *
     * @param array $criteria
     * @return array
     */
    public function findSuitableFacilities(array $criteria): array
    {
        $query = Facility::query()
            ->with(['specialties', 'departments'])
            ->where('status', 'active');

        // Filter by specialty if provided
        if (isset($criteria['specialty_id'])) {
            $query->whereHas('specialties', function ($q) use ($criteria) {
                $q->where('specialty_id', $criteria['specialty_id']);
            });
        }

        // Filter by bed type if provided
        if (isset($criteria['bed_type_id'])) {
            $query->whereHas('beds', function ($q) use ($criteria) {
                $q->where('bed_type_id', $criteria['bed_type_id'])
                  ->where('status', 'available');
            });
        }

        // Filter by location if provided
        if (isset($criteria['latitude']) && isset($criteria['longitude']) && isset($criteria['distance'])) {
            $lat = $criteria['latitude'];
            $lng = $criteria['longitude'];
            $distance = $criteria['distance']; // in kilometers

            $query->selectRaw(
                "*, 
                (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance", 
                [$lat, $lng, $lat]
            )
            ->having('distance', '<=', $distance)
            ->orderBy('distance');
        }

        return $query->get()->toArray();
    }

    /**
     * Accept a referral.
     *
     * @param Referral $referral
     * @return Referral
     */
    public function accept(Referral $referral): Referral
    {
        return $this->updateStatus($referral, ['status' => 'accepted']);
    }

    /**
     * Reject a referral.
     *
     * @param Referral $referral
     * @param string|null $reason
     * @return Referral
     */
    public function reject(Referral $referral, ?string $reason = null): Referral
    {
        return $this->updateStatus($referral, [
            'status' => 'rejected',
            'notes' => $reason,
        ]);
    }

    /**
     * Complete a referral.
     *
     * @param Referral $referral
     * @return Referral
     */
    public function complete(Referral $referral): Referral
    {
        return $this->updateStatus($referral, ['status' => 'completed']);
    }

    /**
     * Upload a document for a referral.
     *
     * @param Referral $referral
     * @param \Illuminate\Http\UploadedFile $document
     * @return \App\Models\ReferralDocument
     */
    public function uploadDocument(Referral $referral, \Illuminate\Http\UploadedFile $document, array $data): ReferralDocument
    {
        $path = $document->store('referral-documents/' . $referral->id);

        return ReferralDocument::create([
            'referral_id' => $referral->id,
            'file_path' => $path,
            'file_name' => $document->getClientOriginalName(),
            'file_type' => $document->getClientMimeType(),
            'file_size' => $document->getSize(),
            'uploaded_by' => Auth::id(),
        ]);
    }
}