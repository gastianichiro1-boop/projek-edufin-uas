<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB; // <-- TAMBAHAN WAJIB UNTUK TRANSACTION

class BillController extends Controller
{
    // 1. Mengambil SEMUA tagihan (Untuk Admin)
    public function index()
    {
        // Mengambil tagihan beserta data siswa yang terkait
        $bills = Bill::with('student')->orderBy('created_at', 'desc')->get();
        return response()->json($bills, 200);
    }

    // 2. Mengambil tagihan KHUSUS untuk 1 Siswa (Untuk halaman Siswa)
    public function getStudentBills($student_id)
    {
        $bills = Bill::where('student_id', $student_id)
                     ->orderBy('created_at', 'desc')
                     ->get();
        return response()->json($bills, 200);
    }

    // 3. Menyimpan Tagihan Baru dari Admin
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:students,id',
            'jenis_tagihan' => 'required|string|max:255',
            'jatuh_tempo' => 'required|date',
            'nominal' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        $bill = Bill::create([
            'student_id' => $request->student_id,
            'jenis_tagihan' => $request->jenis_tagihan,
            'jatuh_tempo' => $request->jatuh_tempo,
            'nominal' => $request->nominal,
            'status' => 'unpaid' // Status default selalu belum lunas
        ]);

        return response()->json([
            'message' => 'Tagihan berhasil ditambahkan!',
            'data' => $bill
        ], 201);
    }

    // 4. Memproses Pembayaran (Ubah status jadi Lunas & Potong Saldo)
    public function payBill($id)
    {
        $bill = Bill::find($id);

        if (!$bill) {
            return response()->json(['message' => 'Tagihan tidak ditemukan'], 404);
        }

        if ($bill->status === 'paid') {
            return response()->json(['message' => 'Tagihan ini sudah lunas sebelumnya'], 400);
        }

        // Cari data siswa yang memiliki tagihan ini
        $student = Student::find($bill->student_id);

        if (!$student) {
            return response()->json(['message' => 'Data siswa tidak ditemukan'], 404);
        }

        // Validasi ekstra di sisi Server: Pastikan saldo benar-benar cukup
        if ($student->saldo < $bill->nominal) {
            return response()->json(['message' => 'Saldo dompet tidak mencukupi'], 400);
        }

        // Gunakan DB Transaction agar jika terjadi error, uang dan data aman
        try {
            DB::transaction(function () use ($bill, $student) {
                // 1. Ubah status tagihan jadi Lunas
                $bill->status = 'paid';
                $bill->save();

                // 2. Potong saldo siswa di Database secara permanen
                $student->saldo -= $bill->nominal;
                $student->save();
            });

            return response()->json([
                'message' => 'Pembayaran berhasil, tagihan lunas dan saldo terpotong!',
                'data' => [
                    'bill' => $bill,
                    'sisa_saldo' => $student->saldo
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan sistem saat memproses pembayaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
