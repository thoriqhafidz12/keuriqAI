<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => ['sometimes', 'date'],
            'type' => ['sometimes', 'string', 'in:saldo_awal,penerimaan,pengeluaran'],
            'category' => ['sometimes', 'string', 'max:100'],
            'source' => ['nullable', 'string', 'max:100'],
            'amount' => ['sometimes', 'integer', 'min:1'],
            'description' => ['nullable', 'string'],
        ];
    }
}
