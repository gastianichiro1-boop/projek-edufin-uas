<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    use HasFactory;

    // Mengizinkan kolom ini diisi secara massal via API
    protected $fillable = [
        'student_id',
        'jenis_tagihan',
        'jatuh_tempo',
        'nominal',
        'status'
    ];

    // Mendefinisikan relasi: Setiap tagihan (Bill) dimiliki oleh satu Siswa (Student)
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
