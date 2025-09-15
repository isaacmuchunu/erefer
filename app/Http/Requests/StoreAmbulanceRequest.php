<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAmbulanceRequest extends FormRequest
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
            'facility_id' => 'required|exists:facilities,id',
            'vehicle_number' => 'required|string|max:50|unique:ambulances,vehicle_number',
            'license_plate' => 'required|string|max:20|unique:ambulances,license_plate',
            'type' => 'required|in:basic,advanced,emergency,pediatric,neonatal',
            'make_model' => 'required|string|max:100',
            'year_of_manufacture' => 'required|integer|min:1990|max:' . (date('Y') + 1),
            'equipment_inventory' => 'nullable|array',
            'capacity' => 'required|integer|min:1|max:20',
            'gps_device_info' => 'nullable|array',
            'insurance_expiry' => 'required|date|after:today',
            'license_expiry' => 'required|date|after:today',
            'last_maintenance' => 'nullable|date|before_or_equal:today',
            'next_maintenance_due' => 'required|date|after:today',
            'status' => 'required|in:available,on_trip,maintenance,out_of_service',
            'fuel_level' => 'nullable|numeric|between:0,100',
            'current_location' => 'nullable|array',
            'current_location.lat' => 'required_with:current_location|numeric|between:-90,90',
            'current_location.lng' => 'required_with:current_location|numeric|between:-180,180',
        ];
    }
}