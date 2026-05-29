<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Administrator',
            'nisn' => 'ADMIN',
            'password' => Hash::make('ADMIN123'),
            'role' => 'admin',
            'saldo' => 0,
        ]);
    }
}
