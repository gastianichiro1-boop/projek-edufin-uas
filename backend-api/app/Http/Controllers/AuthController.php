<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'nisn' => 'required',
            'password' => 'required'
        ]);

        // Cek Admin
        if ($request->nisn === 'ADMIN' && $request->password === 'ADMIN123') {
            return response()->json([
                'role' => 'admin',
                'message' => 'Selamat datang, Admin!'
            ], 200);
        }

        // Cek Siswa
        $student = Student::where('nisn', $request->nisn)->first();

        // JIKA NISN TIDAK DITEMUKAN SAMA SEKALI
        if (!$student) {
            return response()->json([
                'message' => 'Gagal: NISN tidak terdaftar di sistem!'
            ], 401);
        }

        // JIKA NISN ADA, TAPI PASSWORD SALAH
        if (!Hash::check($request->password, $student->password)) {
            return response()->json([
                'message' => 'Gagal: Password yang Anda masukkan salah!'
            ], 401);
        }

        // JIKA SEMUANYA BENAR
        return response()->json([
            'role' => 'student',
            'data' => $student,
            'message' => 'Login berhasil!'
        ], 200);
    }
}
