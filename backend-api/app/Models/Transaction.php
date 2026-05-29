<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    // Mengizinkan field ini untuk diisi (Mass Assignment)
    protected $fillable = ['student_id', 'title', 'subtitle', 'amount'];
}
