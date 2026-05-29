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
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            // Relasi ke tabel students (jika data siswa dihapus, tagihannya ikut terhapus)
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');

            $table->string('jenis_tagihan');
            $table->date('jatuh_tempo');

            // Decimal dengan total 12 digit, 2 digit di belakang koma (untuk uang)
            $table->decimal('nominal', 12, 2);

            // Status tagihan: unpaid (Belum Lunas) atau paid (Lunas)
            $table->enum('status', ['unpaid', 'paid'])->default('unpaid');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
