<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'location' => ['nullable', 'string', 'max:255'],
            'acquisition_value' => ['required', 'integer', 'min:1'],
            'acquisition_date' => ['required', 'date'],
            'acquisition_year' => ['required', 'integer', 'min:2000'],
            'useful_life' => ['required', 'integer', 'min:1'],
            'residual_value' => ['nullable', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
        ];
    }
}
