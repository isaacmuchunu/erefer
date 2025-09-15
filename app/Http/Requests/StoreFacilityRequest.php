<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFacilityRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:hospital,clinic,specialty_center,laboratory,pharmacy',
            'level' => 'required|string|in:primary,secondary,tertiary,quaternary',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'zip_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
            'phone_number' => 'required|string|max:20',
            'email' => 'required|email|max:255|unique:facilities,email',
            'website' => 'nullable|url|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'operating_hours' => 'nullable|string|max:255',
            'emergency_services' => 'required|boolean',
            'ambulance_services' => 'required|boolean',
            'accepts_referrals' => 'required|boolean',
            'total_beds' => 'required|integer|min:0',
            'available_beds' => 'required|integer|min:0|lte:total_beds',
        ];
    }
}