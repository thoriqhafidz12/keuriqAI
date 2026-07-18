<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInstallmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'total_price' => ['required', 'integer', 'min:1'],
            'down_payment' => ['required', 'integer', 'min:0'],
            'tenor' => ['required', 'integer', 'min:1'],
            'start_date' => ['required', 'date'],
            'monthly_amount' => ['required', 'integer', 'min:0'],
        ];
    }
}
