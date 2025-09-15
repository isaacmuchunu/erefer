<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\BedResource;
use App\Http\Resources\DoctorResource;

class DepartmentResource extends JsonResource
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
            'name' => $this->name,
            'facility_id' => $this->facility_id,
            'beds_count' => $this->whenCounted('beds'),
            'doctors_count' => $this->whenCounted('doctors'),
            'beds' => BedResource::collection($this->whenLoaded('beds')),
            'doctors' => DoctorResource::collection($this->whenLoaded('doctors')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}