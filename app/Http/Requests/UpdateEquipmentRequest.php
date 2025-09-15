<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEquipmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Adjust based on your authorization logic
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'facility_id' => 'sometimes|required|exists:facilities,id',
            'department_id' => 'sometimes|required|exists:departments,id',
            'name' => 'sometimes|required|string|max:255',
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('equipment', 'code')->ignore($this->equipment->id),
            ],
            'serial_number' => 'sometimes|required|string|max:100',
            'manufacturer' => 'sometimes|required|string|max:100',
            'model' => 'sometimes|required|string|max:100',
            'purchase_date' => 'sometimes|required|date',
            'warranty_expiry' => 'sometimes|nullable|date|after_or_equal:purchase_date',
            'last_maintenance' => 'sometimes|nullable|date',
            'next_maintenance_due' => 'sometimes|nullable|date|after_or_equal:today',
            'status' => 'sometimes|required|in:available,in_use,maintenance,out_of_order',
            'specifications' => 'sometimes|nullable|json',
            'cost' => 'sometimes|required|numeric|min:0',
            'notes' => 'sometimes|nullable|string',
        ];
    }
}