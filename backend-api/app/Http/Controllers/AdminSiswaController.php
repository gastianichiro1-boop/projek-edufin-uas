<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSiswaController extends Controller
{
    // 1. Menampilkan semua daftar siswa (Read)
    public function index()
    {
        // Hanya mengambil user yang memiliki role 'siswa'
        $siswa = User::where('role', 'siswa')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar data siswa',
            'data' => $siswa
        ], 200);
    }

    // 2. Menambahkan siswa baru (Create)
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'nisn' => 'required|string|unique:users,nisn',
            'password' => 'required|string|min:6',
        ]);

        $siswa = User::create([
            'name' => $request->name,
            'nisn' => $request->nisn,
            'password' => Hash::make($request->password),
            'role' => 'siswa',
            'saldo' => 0,
            'pin' => '123456', // <--- TAMBAHAN BARIS REVISI KITA
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Akun siswa berhasil dibuat!',
            'data' => $siswa
        ], 201);
    }

    // 3. Mengedit data siswa (Update)
    public function update(Request $request, $id)
    {
        $siswa = User::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'nisn' => 'sometimes|string|unique:users,nisn,' . $siswa->id,
            'password' => 'nullable|string|min:6',
        ]);

        $siswa->update([
            'name' => $request->name ?? $siswa->name,
            'nisn' => $request->nisn ?? $siswa->nisn,
            // Jika password diisi, maka acak password baru. Jika tidak, gunakan yang lama.
            'password' => $request->password ? Hash::make($request->password) : $siswa->password,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data siswa berhasil diupdate!',
            'data' => $siswa
        ], 200);
    }

    // 4. Menghapus data siswa (Delete)
    public function destroy($id)
    {
        $siswa = User::findOrFail($id);
        $siswa->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data siswa berhasil dihapus!'
        ], 200);
    }
}
