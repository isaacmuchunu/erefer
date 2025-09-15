<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBedRequest extends FormRequest
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
            'department_id' => 'nullable|exists:departments,id',
            'bed_type_id' => 'required|exists:bed_types,id',
            'bed_number' => 'required|string|max:50',
            'status' => 'required|in:available,occupied,maintenance,reserved',
            'notes' => 'nullable|string',
        ];
    }
}