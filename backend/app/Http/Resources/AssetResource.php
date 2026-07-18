<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'registerNumber' => $this->register_number,
            'name' => $this->name,
            'category' => $this->category,
            'location' => $this->location,
            'acquisitionValue' => (int) $this->acquisition_value,
            'acquisitionDate' => $this->acquisition_date instanceof \DateTimeInterface ? $this->acquisition_date->format('Y-m-d') : $this->acquisition_date,
            'acquisitionYear' => (int) $this->acquisition_year,
            'usefulLife' => (int) $this->useful_life,
            'residualValue' => (int) $this->residual_value,
            'description' => $this->description,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
