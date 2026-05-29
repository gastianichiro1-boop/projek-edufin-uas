<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->string('title'); // Contoh: "ISI SALDO"
            $table->string('subtitle'); // Contoh: "MANDIRI"
            $table->decimal('amount', 15, 2); // Nominal transaksi
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Menghapus tabel jika perintah migrate:rollback dijalankan
        Schema::dropIfExists('transactions');
    }
};
