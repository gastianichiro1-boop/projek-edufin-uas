<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class SaldoController extends Controller
{
    // Fitur simulasi isi saldo (Top-Up)
    public function topup(Request $request, $id)
    {
        // 1. Validasi: Pastikan nominal yang diisi minimal Rp 1.000
        $request->validate([
            'nominal' => 'required|integer|min:1000'
        ]);

        // 2. Cari data siswa berdasarkan ID
        $siswa = User::findOrFail($id);

        // 3. Tambahkan nominal ke saldo saat ini
        $siswa->saldo += $request->nominal;
        $siswa->save();

        return response()->json([
            'success' => true,
            'message' => 'Simulasi Top-Up berhasil! Saldo telah bertambah.',
            'data' => [
                'name' => $siswa->name,
                'nisn' => $siswa->nisn,
                'saldo_sekarang' => $siswa->saldo
            ]
        ], 200);
    }
}
