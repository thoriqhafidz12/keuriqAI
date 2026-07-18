<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'location' => ['nullable', 'string', 'max:255'],
            'acquisition_value' => ['sometimes', 'integer', 'min:1'],
            'acquisition_date' => ['sometimes', 'date'],
            'acquisition_year' => ['sometimes', 'integer', 'min:2000'],
            'useful_life' => ['sometimes', 'integer', 'min:1'],
            'residual_value' => ['nullable', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
        ];
    }
}
