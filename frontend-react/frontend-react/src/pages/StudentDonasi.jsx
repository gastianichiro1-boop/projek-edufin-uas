import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // <-- PENTING: Untuk navigasi logout otomatis
import SidebarSiswa from "../components/SidebarSiswa";

export default function StudentDonasi() {
    const navigate = useNavigate(); // Inisialisasi satpam pengusir
    const [studentData, setStudentData] = useState(null);

    // State Modal & Alur
    const [step, setStep] = useState(0); // 0: Tutup, 1: Pilih Metode, 2: Input Saldo, 3: PIN, 4: Sukses, 5: TERKUNCI
    const [amount, setAmount] = useState("");
    const [pin, setPin] = useState("");
    const [attempts, setAttempts] = useState(3);
    const [pinError, setPinError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("student_data"));
        if (data) setStudentData(data);
    }, []);

    // Validasi: Hanya Angka & Format Ribuan
    const handleAmountChange = (e) => {
        // Ambil nilai murni
        const rawValue = e.target.value.replace(/[^0-9]/g, "");
        setAmount(rawValue);
    };

    const isBalanceEnough =
        studentData && parseInt(amount || 0) <= studentData.saldo;

    // FUNGSI PENGUSIR KETIKA AKUN TERKUNCI
    const handleKeluarTerkunci = () => {
        localStorage.removeItem("student_data");
        localStorage.removeItem("role");
        setStep(0);
        navigate("/login");
    };

    // Logika Final Bayar Donasi dengan Verifikasi PIN Database
    const handleConfirmDonasi = async () => {
        setLoading(true);
        setPinError(""); // Reset error sebelumnya

        try {
            // 1. Verifikasi PIN ke Backend Laravel
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/students/verify-pin`,
                {
                    student_id: studentData.id,
                    pin: pin,
                },
            );

            // 2. Jika sukses (PIN Benar), simpan Transaksi ke Database
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/transactions`,
                {
                    student_id: studentData.id,
                    title: "DONASI",
                    subtitle: "Bantuan Teman Sebaya",
                    amount: amount,
                },
            );

            // 3. Update Saldo di Database
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/students/topup/${studentData.id}`,
                {
                    nominal: -parseInt(amount),
                },
            );

            // 4. Update Local Storage agar halaman lain ikut update
            const updatedData = {
                ...studentData,
                saldo: res.data.saldo_baru,
            };
            localStorage.setItem("student_data", JSON.stringify(updatedData));
            setStudentData(updatedData);

            setStep(4); // Pindah ke layar sukses
            setAttempts(3); // Reset percobaan PIN
        } catch (error) {
            // Menangkap error dari backend
            if (error.response && error.response.status === 401) {
                // Logika jika PIN Salah
                const sisa = attempts - 1;
                setAttempts(sisa);
                setPin("");

                if (sisa > 0) {
                    setPinError(`PIN Salah! Sisa percobaan ${sisa}x`);
                } else {
                    // ==========================================
                    // PERBAIKAN: EKSEKUSI PENGUNCIAN AKUN KE BACKEND
                    // ==========================================
                    try {
                        // Tembak API Laravel untuk mengunci status akun di database secara permanen
                        await axios.put(
                            `${import.meta.env.VITE_API_BASE_URL}/students/${studentData.id}/lock`,
                        );
                    } catch (lockError) {
                        console.error(
                            "Gagal mengirim perintah kunci akun ke server:",
                            lockError,
                        );
                    }
                    setStep(5); // TAMPILKAN LAYAR MERAH TERKUNCI (STEP 5)
                }
            } else {
                // Logika jika error koneksi atau saldo tidak cukup dari server
                alert("Gagal memproses donasi. Pastikan koneksi stabil.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!studentData) return null;

    return (
        <div className="min-h-screen w-full bg-[#051125] flex font-sans overflow-hidden">
            <SidebarSiswa activeMenu="donasi" />

            <main className="flex-1 p-6 lg:p-10 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                {/* SECTION 1: QUOTE */}
                <div className="bg-[#0B1A3A] border border-white/10 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between shadow-2xl">
                    <div className="md:w-2/3 text-white">
                        <h2 className="text-3xl font-bold mb-4 tracking-widest uppercase">
                            Quotes
                        </h2>
                        <p className="italic text-gray-300 leading-relaxed text-lg">
                            "Setiap anak adalah penulis bagi kisahnya sendiri.
                            Namun, terkadang mereka kehabisan tinta dan kertas
                            untuk melanjutkan bab sekolah. Maukah kalian menjadi
                            bagian dari tinta yang membuat cerita mereka
                            berlanjut?"
                        </p>
                    </div>
                    <img
                        src="/images/donasi1.png"
                        className="w-32 h-32 object-contain mt-6 md:mt-0"
                        alt="Icon"
                    />
                </div>

                {/* SECTION 2: MAIN DONASI */}
                <div className="bg-[#0B3CC4] rounded-[2rem] p-10 flex flex-col items-center justify-center relative min-h-[400px] shadow-2xl border border-white/20">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <img
                            src="/images/donasi2.png"
                            className="w-64 h-64 object-contain"
                            alt="Donation"
                        />

                        <div className="text-center md:text-left text-white">
                            <h1 className="text-5xl font-bold mb-2 tracking-tighter">
                                Donasi Yukk
                            </h1>
                            <h2 className="text-4xl font-light mb-8 opacity-90">
                                Untuk Pembangunan Sekolah Kita
                            </h2>
                            <button
                                onClick={() => {
                                    setStep(1);
                                    setAmount(""); // Reset nilai saat mulai baru
                                }}
                                className="bg-[#051125] hover:bg-black text-white px-12 py-4 rounded-full font-bold tracking-widest transition-all transform hover:scale-105 shadow-xl border border-white/10 outline-none">
                                Donasi
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* ========================================================================= */}
            {/* POP UP GLASSES MODAL SYSTEM */}
            {/* ========================================================================= */}
            {step > 0 && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 transition-all">
                    {/* Wadah Glassmorphism Utama */}
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative animate-fade-in-up flex flex-col items-center text-center">
                        {/* Tombol Close (Disembunyikan jika Step 5 / Terkunci) */}
                        {step !== 5 && (
                            <button
                                onClick={() => setStep(0)}
                                className="absolute top-5 right-6 text-white/50 hover:text-white text-xl transition-colors outline-none z-50">
                                ✕
                            </button>
                        )}

                        {/* ================= STEP 1: QR & PILIH METODE ================= */}
                        {step === 1 && (
                            <div className="flex flex-col items-center w-full gap-6 mt-4">
                                <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl shadow-inner border border-white/30">
                                    <img
                                        src="/images/qr.jpeg"
                                        className="w-40 h-40 object-contain rounded-xl"
                                        alt="QR Code"
                                    />
                                </div>
                                <p className="text-white font-medium tracking-wide text-sm text-center">
                                    SCAN QR INI UNTUK <br /> DONASI
                                </p>

                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold tracking-wider py-4 rounded-2xl flex items-center justify-center gap-3 transition-all mt-2 outline-none group shadow-md">
                                    BANTU DENGAN SALDO WEB
                                    <svg
                                        className="w-5 h-5 transition-transform group-hover:translate-x-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                                        />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* ================= STEP 2: INPUT NOMINAL SALDO ================= */}
                        {step === 2 && (
                            <div className="flex flex-col items-center w-full gap-8 mt-2">
                                <div className="w-full bg-white/10 border border-white/20 rounded-2xl p-6 flex flex-col items-center shadow-inner relative overflow-hidden">
                                    <p className="text-white/80 text-[10px] tracking-widest uppercase mb-4 z-10">
                                        SISA SALDO ANDA{" "}
                                        {studentData.saldo.toLocaleString(
                                            "id-ID",
                                        )}
                                    </p>

                                    {/* Format Angka Real-Time (Ribuan) */}
                                    <input
                                        type="text"
                                        value={
                                            amount
                                                ? new Intl.NumberFormat(
                                                      "id-ID",
                                                  ).format(amount)
                                                : ""
                                        }
                                        onChange={handleAmountChange}
                                        placeholder="0"
                                        className="w-full bg-transparent text-center text-4xl font-light text-white tracking-widest outline-none z-10 placeholder:text-white/20"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent z-0 pointer-events-none"></div>
                                </div>

                                {!isBalanceEnough && amount !== "" && (
                                    <p className="text-red-400 font-bold text-xs tracking-widest animate-pulse -mt-4">
                                        SALDO TIDAK CUKUP
                                    </p>
                                )}

                                <button
                                    onClick={() =>
                                        isBalanceEnough && setStep(3)
                                    }
                                    disabled={
                                        !isBalanceEnough ||
                                        amount === "" ||
                                        amount === "0"
                                    }
                                    className={`w-full py-4 rounded-2xl font-bold tracking-widest transition-all shadow-md outline-none
                                        ${
                                            isBalanceEnough &&
                                            amount !== "" &&
                                            amount !== "0"
                                                ? "bg-[#2A4365] hover:bg-[#32527B] text-white border border-white/20"
                                                : "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
                                        }`}>
                                    BAYAR
                                </button>
                            </div>
                        )}

                        {/* ================= STEP 3: INPUT PIN ================= */}
                        {step === 3 && (
                            <div className="flex flex-col items-center w-full gap-8 mt-4">
                                <div className="w-full bg-white/10 border border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center shadow-inner min-h-[120px] relative">
                                    <div className="flex gap-4 z-10">
                                        {[...Array(6)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-3 h-3 rounded-full transition-all duration-200 
                                                    ${pin.length > i ? "bg-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-white/30"}`}></div>
                                        ))}
                                    </div>

                                    <input
                                        type="password"
                                        maxLength="6"
                                        autoFocus
                                        value={pin}
                                        onChange={(e) =>
                                            setPin(
                                                e.target.value.replace(
                                                    /[^0-9]/g,
                                                    "",
                                                ),
                                            )
                                        }
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-text z-20"
                                    />
                                </div>

                                {pinError && (
                                    <p className="text-red-400 font-bold text-xs tracking-widest -mt-4">
                                        {pinError}
                                    </p>
                                )}

                                <button
                                    onClick={handleConfirmDonasi}
                                    disabled={pin.length < 6 || loading}
                                    className="w-full bg-[#2A4365] hover:bg-[#32527B] text-white py-4 rounded-2xl font-bold tracking-widest transition-all shadow-md border border-white/20 outline-none flex justify-center disabled:bg-white/5 disabled:text-white/30 disabled:border-white/5 disabled:cursor-not-allowed">
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        "KONFIRMASI"
                                    )}
                                </button>
                            </div>
                        )}

                        {/* ================= STEP 4: SUKSES ================= */}
                        {step === 4 && (
                            <div className="flex flex-col items-center text-center gap-4 text-white mt-4">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(34,197,94,0.4)] mb-2">
                                    <svg
                                        className="w-8 h-8 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="3"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold uppercase tracking-widest">
                                    Donasi Berhasil
                                </h3>
                                <p className="text-sm opacity-80 mb-4">
                                    Terima kawan opetku! sudah berdonasi kepada
                                    kami sebesar Rp{" "}
                                    {parseInt(amount).toLocaleString("id-ID")}
                                </p>
                                <button
                                    onClick={() => setStep(0)}
                                    className="w-full bg-white/20 hover:bg-white/30 border border-white/20 py-3 rounded-2xl font-bold tracking-widest transition-colors outline-none">
                                    SELESAI
                                </button>
                            </div>
                        )}

                        {/* ================= STEP 5: PERINGATAN AKUN TERKUNCI ================= */}
                        {step === 5 && (
                            <div className="flex flex-col items-center text-center gap-4 text-white mt-2 w-full">
                                <svg
                                    className="w-20 h-20 text-yellow-500 mb-2 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.8}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                <p className="text-white font-bold tracking-widest leading-relaxed text-xs mb-4 uppercase">
                                    MAAF, AKUN ANDA TERKUNCI, SILAKAN MENUJU TU
                                    SEKOLAH UNTUK MEMINTA MEMBUKA AKUN ANDA
                                    KEMBALI
                                </p>
                                <button
                                    onClick={handleKeluarTerkunci}
                                    className="w-full bg-[#2D60FF] hover:bg-blue-600 border border-blue-400/50 py-4 rounded-2xl font-bold tracking-widest uppercase transition-all hover:scale-105 outline-none shadow-lg">
                                    KELUAR
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }
                .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
