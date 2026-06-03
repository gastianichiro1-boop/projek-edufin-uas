<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\AuthController as EdufinAuthController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\BillController;
use Illuminate\Support\Facades\Artisan;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// 1. Rute Terbuka (Publik) - Siapapun bisa akses untuk Login
Route::post('/edufin-login', [EdufinAuthController::class, 'login']);

// 2. Rute Fitur Utama EDUFIN
Route::post('/create-student', [StudentController::class, 'store']);
Route::get('/students', [StudentController::class, 'index']);
Route::put('/students/{id}', [StudentController::class, 'update']);
Route::delete('/students/{id}', [StudentController::class, 'destroy']);

// 3. Fitur Keuangan & Dompet Siswa
Route::post('/students/topup/{id}', [StudentController::class, 'topUp']);
Route::post('/students/verify-pin', [StudentController::class, 'verifyPin']);

// 4. Fitur Histori Transaksi
Route::get('/transactions/{student_id}', [TransactionController::class, 'index']);
Route::post('/transactions', [TransactionController::class, 'store']);

// 5. Fitur Tagihan (Bills)
Route::get('/bills', [BillController::class, 'index']);
Route::get('/bills/student/{student_id}', [BillController::class, 'getStudentBills']);
Route::post('/bills', [BillController::class, 'store']);
Route::put('/bills/{id}/pay', [BillController::class, 'payBill']);

//6. Lock Akun Bila Pin 3 X Salah
Route::put('/students/{id}/lock', [StudentController::class, 'lockAccount']);
Route::put('/students/{id}/unlock', [StudentController::class, 'unlockAccount']);


