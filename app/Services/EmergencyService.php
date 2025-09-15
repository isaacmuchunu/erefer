<?php
namespace App\Services;

use App\Models\EmergencyAlert;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;

class EmergencyService
{
    public function createAlert(array $data): EmergencyAlert
    {
        $payload = [
            'type' => $data['type'],
            'severity' => $data['severity'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'affected_areas' => $data['affected_areas'] ?? null,
            'affected_facilities' => $data['affected_facilities'] ?? null,
            'response_actions' => $data['response_actions'] ?? null,
            'status' => $data['status'] ?? 'active',
            'alert_start' => $data['alert_start'] ?? now(),
            'alert_end' => $data['alert_end'] ?? null,
            'created_by' => Auth::id(),
        ];

        $alert = EmergencyAlert::create($payload);

        // Generate and set alert code after creation
        $alert->update([
            'alert_code' => $alert->generateAlertCode(),
        ]);

        return $alert->fresh();
    }

    public function updateAlert(EmergencyAlert $alert, array $data): EmergencyAlert
    {
        $update = $data;

        if (($data['status'] ?? null) === 'resolved' && empty($data['alert_end'])) {
            $update['alert_end'] = now();
        }

        $alert->update($update);

        return $alert->fresh();
    }

    public function initiateMassCasualtyProtocol(array $data): array
    {
        // Placeholder logic for initiating MCP
        return [
            'incident_location' => $data['incident_location'],
            'estimated_casualties' => $data['estimated_casualties'],
            'severity_breakdown' => $data['severity_breakdown'] ?? [],
            'incident_type' => $data['incident_type'],
            'recommended_actions' => [
                'activate_emergency_operations_center',
                'notify_nearby_facilities',
                'mobilize_ambulances',
                'prepare_triage_areas',
            ],
        ];
    }

    public function mobilizeResources(array $data): array
    {
        // Placeholder logic for resource mobilization
        return [
            'alert_id' => $data['alert_id'],
            'resources_mobilized' => $data['resources_needed'],
            'priority_facilities' => $data['priority_facilities'] ?? [],
            'status' => 'in_progress',
        ];
    }
}