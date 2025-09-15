<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEquipmentRequest extends FormRequest
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
            'facility_id' => 'required|exists:facilities,id',
            'department_id' => 'required|exists:departments,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:equipment,code',
            'serial_number' => 'required|string|max:100',
            'manufacturer' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'purchase_date' => 'required|date',
            'warranty_expiry' => 'nullable|date|after_or_equal:purchase_date',
            'last_maintenance' => 'nullable|date',
            'next_maintenance_due' => 'nullable|date|after_or_equal:today',
            'status' => 'required|in:available,in_use,maintenance,out_of_order',
            'specifications' => 'nullable|json',
            'cost' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ];
    }
}