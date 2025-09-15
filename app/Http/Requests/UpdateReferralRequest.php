<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReferralRequest extends FormRequest
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
            'receiving_facility_id' => 'sometimes|required|exists:facilities,id',
            'receiving_doctor_id' => 'sometimes|required|exists:doctors,id',
            'specialty_id' => 'sometimes|required|exists:specialties,id',
            'urgency' => 'sometimes|required|in:emergency,urgent,semi_urgent,routine',
            'status' => 'sometimes|required|in:pending,accepted,rejected,completed,in_transit',
            'clinical_summary' => 'sometimes|required|string',
            'reason_for_referral' => 'sometimes|required|string',
            'notes' => 'nullable|string',
        ];
    }
}