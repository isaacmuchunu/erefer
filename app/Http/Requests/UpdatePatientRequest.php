<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePatientRequest extends FormRequest
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
        $patientId = $this->route('patient')->id;

        return [
            'user_id' => 'nullable|exists:users,id',
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'date_of_birth' => 'sometimes|required|date',
            'gender' => 'sometimes|required|in:male,female,other',
            'blood_group' => 'nullable|string|max:10',
            'medical_record_number' => 'sometimes|required|string|unique:patients,medical_record_number,' . $patientId,
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'medical_history' => 'nullable|json',
            'allergies' => 'nullable|json',
        ];
    }
}