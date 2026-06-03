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
            $request->validate([
                'nominal' => 'required|numeric|min:10000'
            ]);

            // ====================================================================
            // PERBAIKAN LOGIKA: CEK TOTAL TOP UP BULAN INI (BUKAN SALDO SAAT INI)
            // ====================================================================
            $currentMonth = date('m');
            $currentYear = date('Y');

            // Menjumlahkan semua histori transaksi "ISI SALDO" milik siswa di bulan dan tahun ini
            $totalTopupBulanIni = \App\Models\Transaction::where('student_id', $id)
                ->where('title', 'ISI SALDO')
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->sum('amount');

            // Jika total top up bulan ini + yang mau diisi melebihi 5 juta, tolak!
            if (($totalTopupBulanIni + $nominalInput) > 5000000) {
                return response()->json([
                    'status' => 'error_limit',
                    'message' => 'Batas maksimum pengisian saldo Anda bulan ini (Rp5.000.000) telah terpenuhi.'
                ], 403);
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

    // ====================================================================
    // FITUR BARU: EDIT MASSAL (KENAIKAN KELAS / PINDAH JURUSAN)
    // ====================================================================
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'kelas_awal' => 'required',
            'kelas_akhir' => 'required',
            'jurusan_awal' => 'required',
            'jurusan_akhir' => 'required',
        ]);

        // Mencari siswa yang cocok dengan kriteria awal, lalu menimpanya dengan data baru
        $updatedCount = Student::where('kelas', $request->kelas_awal)
                               ->where('jurusan', $request->jurusan_awal)
                               ->update([
                                   'kelas' => $request->kelas_akhir,
                                   'jurusan' => $request->jurusan_akhir
                               ]);

        if ($updatedCount > 0) {
            return response()->json(['message' => "$updatedCount data siswa berhasil diperbarui!"], 200);
        } else {
            return response()->json(['message' => 'Tidak ada data siswa yang cocok untuk diubah.'], 404);
        }
    }

    // ====================================================================
    // FITUR BARU: HAPUS MASSAL (BULK DELETE)
    // ====================================================================
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'kelas' => 'required',
            'jurusan' => 'required',
        ]);

        // Menghapus permanen seluruh data siswa yang cocok dengan kriteria
        $deletedCount = Student::where('kelas', $request->kelas)
                               ->where('jurusan', $request->jurusan)
                               ->delete();

        if ($deletedCount > 0) {
            return response()->json(['message' => "$deletedCount data akun siswa berhasil dihapus permanen!"], 200);
        } else {
            return response()->json(['message' => 'Tidak ada data siswa yang cocok untuk dihapus.'], 404);
        }
    }
}
