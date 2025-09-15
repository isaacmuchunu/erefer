<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EquipmentMaintenanceRecordResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'equipment_id' => $this->equipment_id,
            'equipment' => $this->whenLoaded('equipment', function () {
                return [
                    'id' => $this->equipment->id,
                    'name' => $this->equipment->name,
                    'code' => $this->equipment->code,
                ];
            }),
            'maintenance_date' => $this->maintenance_date,
            'maintenance_type' => $this->maintenance_type,
            'status' => $this->status,
            'performed_by' => $this->performed_by,
            'notes' => $this->notes,
            'completion_date' => $this->completion_date,
            'cost' => $this->cost,
            'parts_used' => $this->parts_used,
            'downtime_hours' => $this->downtime_hours,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}