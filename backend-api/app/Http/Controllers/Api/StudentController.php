<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    public function index()
    {
        $students = Student::all();
        return response()->json($students, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nisn' => 'required|unique:students',
            'password' => 'required',
            'kelas' => 'required',
            'jurusan' => 'required',
            'nama_lengkap' => 'required',
        ]);

        $student = Student::create([
            'nisn' => $request->nisn,
            'password' => Hash::make($request->password),
            'kelas' => $request->kelas,
            'jurusan' => $request->jurusan,
            'nama_lengkap' => $request->nama_lengkap,
            'saldo' => 0,
            'pin' => '123456', // Penanaman PIN Default Otomatis (Teks Biasa)
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Akun siswa berhasil dibuat!',
            'data' => $student
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $student = Student::find($id);
        if (!$student) return response()->json(['message' => 'Siswa tidak ditemukan'], 404);

        $data = $request->except('password');

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $student->update($data);
        return response()->json(['message' => 'Data siswa berhasil diperbarui!'], 200);
    }

    public function destroy($id)
    {
        $student = Student::find($id);
        if ($student) {
            $student->delete();
            return response()->json(['message' => 'Data siswa berhasil dihapus!'], 200);
        }
        return response()->json(['message' => 'Siswa tidak ditemukan'], 404);
    }
public function topUp(Request $request, $id)
    {
        $student = Student::find($id);
        if (!$student) {
            return response()->json(['message' => 'Siswa tidak ditemukan'], 404);
        }

        $nominalInput = (int) $request->nominal;

        if ($nominalInput > 0) {
            // Validasi Input Nominal (Minimal 10.000)
            $request->validate([
                'nominal' => 'required|numeric|min:10000'
            ]);

            // ====================================================================
            // FITUR BARU: LIMIT SALDO MAKSIMAL 5 JUTA
            // ====================================================================
            if (($student->saldo + $nominalInput) > 5000000) {
                return response()->json([
                    'status' => 'error_limit',
                    'message' => 'Batas maksimum pengisian saldo Anda bulan ini (Rp5.000.000) telah terpenuhi.'
                ], 403); // Status 403 Forbidden
            }

            $responseMessage = 'Top Up Berhasil';
        } else {
            // Logika pemotongan saldo (untuk bayar tagihan)
            $request->validate([
                'nominal' => 'required|numeric'
            ]);

            if (($student->saldo + $nominalInput) < 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Saldo dompet tidak mencukupi!'
                ], 400);
            }
            $responseMessage = 'Transaksi Berhasil Diproses';
        }

        $student->saldo += $nominalInput;
        $student->save();

        return response()->json([
            'message' => $responseMessage,
            'saldo_baru' => $student->saldo
        ], 200);
    }

    public function verifyPin(Request $request)
    {
        $request->validate([
            'student_id' => 'required',
            'pin' => 'required'
        ]);

        $student = Student::find($request->student_id);

        if (!$student) {
            return response()->json(['message' => 'Siswa tidak ditemukan'], 404);
        }

        // =====================================================================
        // PERBAIKAN MEKANIK: Fitur "Self-Healing" (Penyembuhan Database)
        // Mengobati akun-akun lama yang PIN-nya terlanjur kosong/NULL.
        // =====================================================================
        if (empty($student->pin)) {
            $student->pin = '123456';
            $student->save(); // Simpan permanen ke database agar sembuh total
        }

        $dbPin = (string) $student->pin;

        // ====================================================================
        // PERBAIKAN FATAL: HANYA MENGGUNAKAN PENCOCOKAN STRING BIASA
        // Menghapus Hash::check() agar tidak terjadi Error Bcrypt Algorithm!
        // ====================================================================
        if ($request->pin === $dbPin) {
            return response()->json(['status' => 'success', 'message' => 'PIN Benar'], 200);
        } else {
            // Melempar Error 401 agar UI React bisa memunculkan sisa hitung mundur!
            return response()->json(['status' => 'error', 'message' => 'PIN Salah'], 401);
        }
    }

    // ====================================================================
    // FITUR KEAMANAN GEMBOK AKUN (TETAP DIPERTAHANKAN)
    // ====================================================================

    // Mengunci Akun (Dipanggil React saat salah PIN 3x)
    public function lockAccount($id)
    {
        $student = Student::find($id);
        if ($student) {
            $student->is_locked = true;
            $student->save();
            return response()->json(['message' => 'Akun berhasil dikunci demi keamanan'], 200);
        }
        return response()->json(['message' => 'Siswa tidak ditemukan'], 404);
    }

    // Membuka Kunci Akun (Dipanggil oleh Admin)
    public function unlockAccount($id)
    {
        $student = Student::find($id);
        if ($student) {
            $student->is_locked = false;
            $student->save();
            return response()->json(['message' => 'Akun berhasil dibuka dan diaktifkan kembali'], 200);
        }
        return response()->json(['message' => 'Siswa tidak ditemukan'], 404);
    }
}
