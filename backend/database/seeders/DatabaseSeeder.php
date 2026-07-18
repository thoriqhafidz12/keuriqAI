<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            DefaultUserSeeder::class,
            TransactionSeeder::class,
            InstallmentSeeder::class,
            AssetSeeder::class,
        ]);
    }
}
