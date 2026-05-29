<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * Menampilkan histori transaksi milik siswa tertentu
     */
    public function index($student_id)
    {
        // Mengambil transaksi berdasarkan ID siswa, terbaru di atas
        $transactions = Transaction::where('student_id', $student_id)
                                   ->orderBy('created_at', 'desc')
                                   ->get();

        return response()->json($transactions);
    }

    /**
     * Menyimpan transaksi baru (Top Up atau Pembayaran)
     */
    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'title'      => 'required|string',
            'subtitle'   => 'required|string',
            'amount'     => 'required|numeric',
        ]);

        $transaction = Transaction::create([
            'student_id' => $request->student_id,
            'title'      => $request->title,
            'subtitle'   => $request->subtitle,
            'amount'     => $request->amount,
        ]);

        return response()->json([
            'message' => 'Transaksi berhasil dicatat',
            'data'    => $transaction
        ], 201);
    }
}
