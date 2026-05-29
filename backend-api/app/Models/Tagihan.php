<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tagihan extends Model
{
    use HasFactory;

    // Mengizinkan kolom ini diisi
    protected $fillable = [
        'user_id',
        'nama_tagihan',
        'nominal',
        'status',
    ];

    // Relasi: Setiap tagihan pasti dimiliki oleh 1 user (siswa)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
