<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Asset;
use App\Models\User;

class AssetSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        if (!$user) return;

        $assets = [
            [
                'register_number' => 'REG-202607-001',
                'name' => 'Laptop MacBook Pro',
                'category' => 'Elektronik',
                'location' => 'Kantor Pusat',
                'acquisition_value' => 18000000,
                'acquisition_date' => '2023-01-15',
                'acquisition_year' => 2023,
                'useful_life' => 4,
                'residual_value' => 2000000,
                'description' => 'Laptop untuk pekerjaan pengembangan',
            ],
            [
                'register_number' => 'REG-202607-002',
                'name' => 'Meja Kantor',
                'category' => 'Perabotan',
                'location' => 'Ruang Meeting',
                'acquisition_value' => 3000000,
                'acquisition_date' => '2022-06-01',
                'acquisition_year' => 2022,
                'useful_life' => 5,
                'residual_value' => 500000,
                'description' => 'Meja meeting utama',
            ],
        ];

        foreach ($assets as $asset) {
            Asset::create([
                'user_id' => $user->id,
                ...$asset,
            ]);
        }
    }
}
