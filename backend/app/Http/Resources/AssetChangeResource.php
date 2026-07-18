<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetChangeResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'field' => $this->field,
            'oldValue' => $this->old_value,
            'newValue' => $this->new_value,
            'userName' => $this->user?->name,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
