<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DoctorResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'facility_id' => $this->facility_id,
            'medical_license_number' => $this->medical_license_number,
            'license_expiry' => $this->license_expiry,
            'qualifications' => $this->qualifications,
            'years_of_experience' => $this->years_of_experience,
            'languages_spoken' => $this->languages_spoken,
            'bio' => $this->bio,
            'consultation_fee' => $this->consultation_fee,
            'accepts_referrals' => $this->accepts_referrals,
            'max_daily_referrals' => $this->max_daily_referrals,
            'rating' => $this->rating,
            'rating_count' => $this->rating_count,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user' => $this->whenLoaded('user'),
            'facility' => $this->whenLoaded('facility'),
            'specialties' => $this->whenLoaded('specialties'),
        ];
    }
}