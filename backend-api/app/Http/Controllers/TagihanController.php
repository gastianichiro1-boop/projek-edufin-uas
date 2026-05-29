<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tagihan;
use App\Models\User;

class TagihanController extends Controller
{
    // --- FITUR ADMIN --- //

    // 1. Melihat semua tagihan beserta nama siswanya
    public function index()
    {
        $tagihan = Tagihan::with('user:id,name,nisn')->get();
        return response()->json(['success' => true, 'data' => $tagihan], 200);
    }

    // 2. Membuat tagihan baru untuk siswa tertentu
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'nama_tagihan' => 'required|string',
            'nominal' => 'required|integer',
        ]);

        $tagihan = Tagihan::create([
            'user_id' => $request->user_id,
            'nama_tagihan' => $request->nama_tagihan,
            'nominal' => $request->nominal,
            'status' => 'belum lunas'
        ]);

        return response()->json(['success' => true, 'message' => 'Tagihan berhasil dibuat', 'data' => $tagihan], 201);
    }

    // 3. Mengedit data tagihan
    public function update(Request $request, $id)
    {
        $tagihan = Tagihan::findOrFail($id);
        $tagihan->update($request->only(['nama_tagihan', 'nominal', 'status']));

        return response()->json(['success' => true, 'message' => 'Tagihan berhasil diupdate', 'data' => $tagihan], 200);
    }

    // 4. Menghapus tagihan
    public function destroy($id)
    {
        Tagihan::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Tagihan berhasil dihapus'], 200);
    }


    // --- FITUR SISWA --- //

    // 5. Fitur simulasi pembayaran memotong saldo
    public function bayar($id)
    {
        $tagihan = Tagihan::findOrFail($id);

        // Cek apakah tagihan sudah lunas
        if ($tagihan->status === 'lunas') {
            return response()->json(['success' => false, 'message' => 'Tagihan ini sudah lunas!'], 400);
        }

        // Cari data siswa yang memiliki tagihan ini
        $siswa = User::findOrFail($tagihan->user_id);

        // Cek apakah saldo siswa mencukupi
        if ($siswa->saldo < $tagihan->nominal) {
            return response()->json(['success' => false, 'message' => 'Saldo tidak mencukupi untuk simulasi pembayaran'], 400);
        }

        // Proses Pembayaran: Potong saldo siswa
        $siswa->saldo -= $tagihan->nominal;
        $siswa->save();

        // Ubah status tagihan menjadi lunas
        $tagihan->status = 'lunas';
        $tagihan->save();

        return response()->json(['success' => true, 'message' => 'Pembayaran SPP berhasil! Saldo telah dipotong.'], 200);
    }
}
