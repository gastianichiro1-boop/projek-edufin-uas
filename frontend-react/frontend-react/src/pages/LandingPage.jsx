import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    // Alat navigasi untuk berpindah halaman
    const navigate = useNavigate();

    return (
        // CONTAINER UTAMA: Full screen, background navy sangat gelap, flex center
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0B1220] p-6 text-center font-sans relative overflow-hidden">
            {/* 1. HEADER BRANDING (Pojok Kiri Atas) */}
            <div className="absolute top-8 left-8 flex items-center">
                {/* --- [MOHON GANTI BAGIAN INI DENGAN LOGO ASLI ANDA] --- */}
                <div className="w-10 h-10 bg-[#2D60FF] rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-2xl">E</span>
                </div>
                {/* -------------------------------------------------- */}

                {/* Teks Brand EDUFIN */}
                <span className="ml-3 text-white font-bold text-2xl tracking-wider uppercase">
                    EDUFIN
                </span>
            </div>

            {/* 2. AREA HERO (BAGIAN TENGAH) */}
            <div className="max-w-4xl flex flex-col items-center">
                {/* Judul Utama dengan Label 'DEMO' */}
                <div className="relative mb-10">
                    <h1 className="text-white text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
                        Dompet Digital
                        <br />
                        Pendidikan
                    </h1>

                    {/* Label DEMO miring biru */}
                    <span className="absolute -right-20 top-10 md:-right-24 md:top-14 text-2xl md:text-3xl font-bold text-[#3B82F6] rotate-[-15deg] transform scale-110 tracking-widest uppercase opacity-90">
                        DEMO
                    </span>
                </div>

                {/* --- [TEMPAT GAMBAR DOMPET] --- */}
                {/* Saya menggunakan Placeholder visual sementara. Ganti <img> ini dengan gambar asli */}
                <div className="mb-8 w-80 h-80 md:w-96 md:h-96 flex items-center justify-center hover:scale-105 transition-transform duration-300">
                    <img
                        src="images/logoedufin.png" // <--- GANTI URL INI DENGAN PATH GAMBAR DOMPET KAMU
                        alt="Dompet Digital Pendidikan EDUFIN"
                        className="w-full h-full object-contain"
                    />
                </div>
                {/* ------------------------------- */}

                {/* Teks Deskripsi */}
                <p className="text-white text-xl md:text-2xl max-w-3xl leading-relaxed opacity-90 font-light px-4">
                    Kelola pembayaran SPP, donasi, dan pinjaman pendidikan dalam
                    satu aplikasi
                </p>
            </div>

            {/* 3. TOMBOL MASUK (Pojok Kanan Bawah) */}
            <button
                // LOGIKA KLIK: Akan berpindah ke halaman /login ketika ditekan
                onClick={() => navigate("/login")}
                className="absolute bottom-10 right-10 px-10 py-4 bg-[#2D60FF] text-white font-semibold text-lg rounded-full shadow-lg shadow-blue-900/50 hover:bg-[#1a4bcf] hover:-translate-y-0.5 transition-all duration-300 ease-in-out">
                Masuk
            </button>
        </div>
    );
};

export default LandingPage;
