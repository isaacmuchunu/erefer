<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFacilityRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|in:hospital,clinic,specialty_center,laboratory,pharmacy',
            'level' => 'sometimes|required|string|in:primary,secondary,tertiary,quaternary',
            'address' => 'sometimes|required|string|max:255',
            'city' => 'sometimes|required|string|max:100',
            'state' => 'sometimes|required|string|max:100',
            'zip_code' => 'sometimes|required|string|max:20',
            'country' => 'sometimes|required|string|max:100',
            'phone_number' => 'sometimes|required|string|max:20',
            'email' => 'sometimes|required|email|max:255|unique:facilities,email,' . $this->facility->id,
            'website' => 'nullable|url|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'operating_hours' => 'nullable|string|max:255',
            'emergency_services' => 'sometimes|required|boolean',
            'ambulance_services' => 'sometimes|required|boolean',
            'accepts_referrals' => 'sometimes|required|boolean',
            'total_beds' => 'sometimes|required|integer|min:0',
            'available_beds' => 'sometimes|required|integer|min:0|lte:total_beds',
        ];
    }
}