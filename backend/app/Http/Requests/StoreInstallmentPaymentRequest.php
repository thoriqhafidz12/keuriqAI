<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInstallmentPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $installment = $this->route('installment');

        return [
            'date' => ['required', 'date'],
            'amount' => ['required', 'integer', 'min:1'],
            'period_number' => ['required', 'integer', 'min:1', 'max:' . ($installment?->tenor ?? 99)],
            'description' => ['nullable', 'string'],
        ];
    }
}
