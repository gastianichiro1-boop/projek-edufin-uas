<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * Kolom yang diizinkan untuk diisi secara massal (Mass Assignment)
     */
    protected $fillable = [
        'name',
        'nisn',      // Wajib ada
        'password',
        'role',      // Wajib ada
        'saldo',
        'pin',    // Wajib ada
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }
}
