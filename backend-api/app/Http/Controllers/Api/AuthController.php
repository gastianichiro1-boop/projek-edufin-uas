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
        // 1. Pastikan NISN dan Password diisi
        $request->validate([
            'nisn' => 'required',
            'password' => 'required'
        ]);

        // 2. CEK ADMIN: Jika yang dimasukkan adalah ADMIN dan ADMIN123
        if ($request->nisn === 'ADMIN' && $request->password === 'ADMIN123') {
            return response()->json([
                'role' => 'admin',
                'message' => 'Selamat datang, Admin!'
            ], 200);
        }

        // 3. CEK SISWA: Cari NISN di tabel students
        $student = Student::where('nisn', $request->nisn)->first();

        // Jika siswa ketemu DAN passwordnya cocok dengan yang diacak (Hash)
        if ($student && Hash::check($request->password, $student->password)) {

            // ==========================================
            // FITUR KEAMANAN: CEK GEMBOK AKUN
            // ==========================================
            if ($student->is_locked) {
                return response()->json([
                    'message' => 'Akun Terkunci',
                    'is_locked' => true // Penanda khusus untuk React
                ], 403); // Status 403: Forbidden (Dilarang Masuk)
            }
            // ==========================================

            return response()->json([
                'role' => 'student',
                'data' => $student,
                'message' => 'Login berhasil!'
            ], 200);
        }

        // 4. Jika keduanya salah
        return response()->json([
            'message' => 'NISN atau Password salah!'
        ], 401); // 401 artinya Unauthorized (Gagal Login)
    }
}
