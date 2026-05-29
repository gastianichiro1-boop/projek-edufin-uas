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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('nisn')->unique(); // NISN tidak boleh ada yang sama
            $table->string('password');
            $table->string('kelas');
            $table->string('jurusan');
            $table->string('nama_lengkap');

            // --- TAMBAHAN BARU ---
            $table->bigInteger('saldo')->default(0); // Default saldo awal adalah 0
            $table->string('pin', 6)->nullable(); // PIN 6 digit, nullable agar akun lama tidak error

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
