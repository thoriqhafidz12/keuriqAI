<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaction;
use App\Models\User;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        if (!$user) return;

        $transactions = [
            [
                'date' => '2024-01-01',
                'type' => 'saldo_awal',
                'category' => 'Saldo Awal',
                'amount' => 2000000,
                'description' => 'Saldo awal tahun 2024',
            ],
            [
                'date' => '2024-01-05',
                'type' => 'penerimaan',
                'category' => 'Gaji',
                'source' => 'Gaji',
                'amount' => 5000000,
                'description' => 'Gaji Januari',
            ],
            [
                'date' => '2024-01-10',
                'type' => 'pengeluaran',
                'category' => 'Makan',
                'amount' => 500000,
                'description' => 'Makan siang sekeluarga',
            ],
            [
                'date' => '2024-01-15',
                'type' => 'penerimaan',
                'category' => 'Bonus',
                'source' => 'Bonus',
                'amount' => 3000000,
                'description' => 'Bonus akhir tahun',
            ],
            [
                'date' => '2024-02-01',
                'type' => 'pengeluaran',
                'category' => 'Listrik',
                'amount' => 450000,
                'description' => 'Tagihan listrik Januari',
            ],
            [
                'date' => '2024-02-05',
                'type' => 'penerimaan',
                'category' => 'Gaji',
                'source' => 'Gaji',
                'amount' => 5000000,
                'description' => 'Gaji Februari',
            ],
            [
                'date' => '2024-02-10',
                'type' => 'pengeluaran',
                'category' => 'BBM',
                'amount' => 300000,
                'description' => 'Bensin Pertamax',
            ],
            [
                'date' => '2024-03-01',
                'type' => 'pengeluaran',
                'category' => 'Internet',
                'amount' => 350000,
                'description' => 'Internet bulanan',
            ],
        ];

        foreach ($transactions as $tx) {
            Transaction::create([
                'user_id' => $user->id,
                ...$tx,
            ]);
        }
    }
}
