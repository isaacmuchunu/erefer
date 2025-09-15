<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDoctorRequest extends FormRequest
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
            'user_id' => 'required|exists:users,id|unique:doctors,user_id',
            'facility_id' => 'required|exists:facilities,id',
            'specialty_ids' => 'required|array',
            'specialty_ids.*' => 'exists:specialties,id',
            'license_number' => 'required|string|max:100|unique:doctors,license_number',
            'phone_number' => 'required|string|max:20',
            'status' => 'required|in:active,inactive,on_leave',
            'availability' => 'required|in:on_duty,off_duty,on_call',
            'accepts_referrals' => 'required|boolean',
            'consultation_fee' => 'nullable|numeric|min:0',
            'biography' => 'nullable|string',
            'availability_schedule' => 'nullable|json',
        ];
    }
}