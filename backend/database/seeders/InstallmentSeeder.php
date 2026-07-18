<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Installment;
use App\Models\User;

class InstallmentSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        if (!$user) return;

        $installments = [
            [
                'name' => 'Motor Honda Beat',
                'total_price' => 20000000,
                'down_payment' => 5000000,
                'tenor' => 12,
                'start_date' => '2024-01-01',
                'monthly_amount' => 1250000,
                'status' => 'active',
            ],
            [
                'name' => 'Laptop ASUS',
                'total_price' => 12000000,
                'down_payment' => 2000000,
                'tenor' => 10,
                'start_date' => '2024-02-01',
                'monthly_amount' => 1000000,
                'status' => 'active',
            ],
        ];

        foreach ($installments as $inst) {
            Installment::create([
                'user_id' => $user->id,
                ...$inst,
            ]);
        }
    }
}
