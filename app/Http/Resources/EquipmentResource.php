<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EquipmentResource extends JsonResource
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
            'facility_id' => $this->facility_id,
            'facility' => $this->whenLoaded('facility', function () {
                return [
                    'id' => $this->facility->id,
                    'name' => $this->facility->name,
                ];
            }),
            'department_id' => $this->department_id,
            'department' => $this->whenLoaded('department', function () {
                return [
                    'id' => $this->department->id,
                    'name' => $this->department->name,
                ];
            }),
            'name' => $this->name,
            'code' => $this->code,
            'serial_number' => $this->serial_number,
            'manufacturer' => $this->manufacturer,
            'model' => $this->model,
            'purchase_date' => $this->purchase_date,
            'warranty_expiry' => $this->warranty_expiry,
            'last_maintenance' => $this->last_maintenance,
            'next_maintenance_due' => $this->next_maintenance_due,
            'status' => $this->status,
            'specifications' => $this->specifications,
            'cost' => $this->cost,
            'is_available' => $this->isAvailable,
            'needs_maintenance' => $this->needsMaintenance,
            'is_under_warranty' => $this->isUnderWarranty,
            'age' => $this->age,
            'maintenance_records' => EquipmentMaintenanceRecordResource::collection(
                $this->whenLoaded('maintenanceRecords')
            ),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}