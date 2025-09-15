<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BedResource extends JsonResource
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
            'department_id' => $this->department_id,
            'bed_type_id' => $this->bed_type_id,
            'bed_number' => $this->bed_number,
            'room_number' => $this->room_number,
            'status' => $this->status,
            'equipment' => $this->equipment,
            'notes' => $this->notes,
            'last_occupied_at' => $this->last_occupied_at,
            'available_from' => $this->available_from,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'facility' => $this->whenLoaded('facility'),
            'department' => $this->whenLoaded('department'),
            'bed_type' => $this->whenLoaded('bedType'),
        ];
    }
}