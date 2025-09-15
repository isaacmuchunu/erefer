<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDoctorRequest extends FormRequest
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
            'user_id' => 'sometimes|required|exists:users,id|unique:doctors,user_id,' . $this->doctor->id,
            'facility_id' => 'sometimes|required|exists:facilities,id',
            'specialty_ids' => 'sometimes|required|array',
            'specialty_ids.*' => 'exists:specialties,id',
            'license_number' => 'sometimes|required|string|max:100|unique:doctors,license_number,' . $this->doctor->id,
            'phone_number' => 'sometimes|required|string|max:20',
            'status' => 'sometimes|required|in:active,inactive,on_leave',
            'availability' => 'sometimes|required|in:on_duty,off_duty,on_call',
            'accepts_referrals' => 'sometimes|required|boolean',
            'consultation_fee' => 'nullable|numeric|min:0',
            'biography' => 'nullable|string',
            'availability_schedule' => 'nullable|json',
        ];
    }
}