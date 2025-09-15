<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmergencyAlertRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['hospital_admin', 'super_admin', 'dispatcher']);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'type' => 'required|in:mass_casualty,disaster,epidemic,facility_emergency,system_wide',
            'severity' => 'required|in:low,medium,high,critical',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'affected_areas' => 'nullable|array',
            'affected_facilities' => 'nullable|array',
            'affected_facilities.*' => 'exists:facilities,id',
            'response_actions' => 'nullable|array',
            'alert_start' => 'nullable|date|after_or_equal:now',
            'alert_end' => 'nullable|date|after:alert_start',
            'status' => 'sometimes|in:active,resolved,cancelled',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'type.required' => 'Alert type is required.',
            'type.in' => 'Invalid alert type.',
            'severity.required' => 'Severity level is required.',
            'severity.in' => 'Invalid severity level.',
            'title.required' => 'Alert title is required.',
            'affected_facilities.*.exists' => 'One or more selected facilities do not exist.',
            'alert_start.after_or_equal' => 'Alert start time cannot be in the past.',
            'alert_end.after' => 'Alert end time must be after the start time.',
        ];
    }
}