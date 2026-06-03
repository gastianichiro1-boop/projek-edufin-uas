<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    // Memastikan model ini mengarah ke tabel students di phpMyAdmin
    protected $table = 'students';

    /**
     * Kolom yang diizinkan untuk diisi secara massal
     */
    protected $fillable = [
        'nisn',
        'password',
        'kelas',
        'jurusan',
        'nama_lengkap',
        'saldo',
        'pin',
        'is_locked' // <--- INI WAJIB ADA agar angka 123456 tidak diblokir dan tidak menjadi NULL
    ];

    protected $hidden = [
        'password',
    ];
}
