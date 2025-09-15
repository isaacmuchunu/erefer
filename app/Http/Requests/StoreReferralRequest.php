<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReferralRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Or add your authorization logic
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'patient_id' => 'required|exists:patients,id',
            'referring_facility_id' => 'required|exists:facilities,id',
            'receiving_facility_id' => 'required|exists:facilities,id',
            'referring_doctor_id' => 'required|exists:doctors,id',
            'specialty_id' => 'required|exists:specialties,id',
            'urgency' => 'required|in:emergency,urgent,semi_urgent,routine',
            'clinical_summary' => 'required|string',
            'reason_for_referral' => 'required|string',
            'notes' => 'nullable|string',
        ];
    }
}