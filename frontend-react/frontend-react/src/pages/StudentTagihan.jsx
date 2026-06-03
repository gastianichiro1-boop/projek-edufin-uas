import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // <-- TAMBAHAN: Untuk menendang siswa ke halaman login
import SidebarSiswa from "../components/SidebarSiswa";

export default function StudentTagihan() {
    const navigate = useNavigate(); // Inisialisasi router navigasi
    const [studentData, setStudentData] = useState({ id: null, saldo: 0 });
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    // STATE MANAJEMEN POP-UP
    // 0: Tutup, 1: Detail Bayar, 2: PIN, 3: Sukses, 4: OVERDUE, 5: AKUN TERKUNCI KEAMANAN
    const [selectedBill, setSelectedBill] = useState(null);
    const [step, setStep] = useState(0);

    // STATE PIN
    const [pin, setPin] = useState("");
    const [attempts, setAttempts] = useState(3);
    const [pinError, setPinError] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const savedData = JSON.parse(localStorage.getItem("student_data"));
        if (savedData) {
            setStudentData(savedData);
            fetchBills(savedData.id);
        }
    }, []);

    const fetchBills = async (studentId) => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/bills/student/${studentId}`,
            );
            setBills(response.data);
        } catch (error) {
            console.error("Gagal mengambil data tagihan:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- FUNGSI FORMAT TANGGAL ---
    const formatTanggal = (tanggal) => {
        if (!tanggal) return "-";
        const dateObj = new Date(tanggal);
        const months = [
            "JANUARI",
            "FEBRUARI",
            "MARET",
            "APRIL",
            "MEI",
            "JUNI",
            "JULI",
            "AGUSTUS",
            "SEPTEMBER",
            "OKTOBER",
            "NOVEMBER",
            "DESEMBER",
        ];
        return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    };

    // --- FUNGSI CEK JATUH TEMPO ---
    const isOverdue = (tanggal) => {
        if (!tanggal) return false;
        const dueDate = new Date(tanggal);
        dueDate.setHours(23, 59, 59, 999);
        const now = new Date();
        return now > dueDate;
    };

    // --- LOGIKA INTERAKSI ---
    const handleBukaDetail = (bill) => {
        setSelectedBill(bill);
        setStep(1);
    };

    const handleBukaOverdue = (bill) => {
        setSelectedBill(bill);
        setStep(4);
    };

    const handleLanjutKePin = () => {
        setStep(2);
        setPin("");
        setPinError("");
    };

    // --- FUNGSI TOMBOL KELUAR JIKA AKUN TERKUNCI ---
    const handleKeluarTerkunci = () => {
        localStorage.removeItem("student_data");
        localStorage.removeItem("role");
        setStep(0);
        navigate("/login"); // Kembali ke gerbang login utama
    };

    // --- LOGIKA VERIFIKASI PIN & BAYAR (SUDAH DISINKRONKAN DENGAN AUTOMATIC LOCK) ---
    const handlePinSubmit = async () => {
        setIsProcessing(true);
        setPinError("");

        try {
            // 1. Verifikasi PIN ke Backend Laravel
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/students/verify-pin`,
                {
                    student_id: studentData.id,
                    pin: pin,
                },
            );

            // 2. Tembak API Laravel untuk mengubah status tagihan jadi 'paid' SEKALIGUS potong saldo
            const resPay = await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/bills/${selectedBill.id}/pay`,
            );

            // 3. CATAT KE HISTORI TRANSAKSI DOMPET
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/transactions`,
                {
                    student_id: studentData.id,
                    title: "PEMBAYARAN TAGIHAN",
                    subtitle: selectedBill.jenis_tagihan,
                    amount: selectedBill.nominal,
                },
            );

            // 4. Update Saldo di memori lokal
            const updatedStudent = {
                ...studentData,
                saldo: resPay.data.data.sisa_saldo,
            };
            setStudentData(updatedStudent);
            localStorage.setItem(
                "student_data",
                JSON.stringify(updatedStudent),
            );

            // 5. Update status tabel lokal agar langsung berubah jadi "Lunas" di layar
            setBills(
                bills.map((b) =>
                    b.id === selectedBill.id ? { ...b, status: "paid" } : b,
                ),
            );

            setStep(3); // Pindah ke layar struk sukses
            setAttempts(3); // Reset percobaan PIN
        } catch (error) {
            if (error.response && error.response.status === 401) {
                const sisaPercobaan = attempts - 1;
                setAttempts(sisaPercobaan);
                setPin("");

                if (sisaPercobaan <= 0) {
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
                    setStep(5); // LANGSUNG BUKA POP-UP COCOK DENGAN FOTO 1 (TPA ALERTS)
                } else {
                    setPinError(`PIN Salah! Sisa percobaan: ${sisaPercobaan}x`);
                }
            } else {
                const errorMessage =
                    error.response?.data?.message ||
                    "Gagal memproses pembayaran ke server. Pastikan koneksi stabil.";
                alert(errorMessage);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-screen w-full bg-[#051125] flex font-sans overflow-hidden">
            <SidebarSiswa activeMenu="tagihan" />

            <main className="flex-1 flex flex-col p-4 lg:p-10 relative z-10 h-screen">
                {/* HEADER QUOTE */}
                <div className="flex-shrink-0 bg-[#122A5A] rounded-[2rem] p-6 lg:p-10 flex flex-col lg:flex-row items-center justify-between shadow-2xl border border-white/5 mb-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-white text-2xl lg:text-4xl font-bold tracking-widest mb-4 uppercase">
                            Quote from Ayubi
                        </h2>
                        <p className="text-gray-300 text-sm lg:text-xl italic font-medium leading-relaxed">
                            "Investasi terbaik bagi masa depan adalah{" "}
                            <br className="hidden lg:block" /> pendidikan yang
                            layak."
                        </p>
                    </div>
                    <div className="flex-shrink-0 w-24 h-24 lg:w-40 lg:h-40 mt-6 lg:mt-0 overflow-hidden">
                        <img
                            src="/images/tagihan.png"
                            alt="Anime"
                            className="w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
                            onError={(e) => {
                                e.target.src =
                                    "https://via.placeholder.com/200x200?text=Anime+Icon";
                            }}
                        />
                    </div>
                </div>

                {/* TABEL TAGIHAN */}
                <div className="bg-[#082753]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {loading ? (
                            <div className="flex items-center justify-center h-full pt-10">
                                <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <table className="w-full text-left border-separate border-spacing-y-4">
                                <thead className="sticky top-0 bg-[#082753] z-10">
                                    <tr className="text-white/60 text-[10px] lg:text-sm tracking-[0.2em] uppercase font-bold">
                                        <th className="px-4 pb-4">
                                            Jenis Tagihan
                                        </th>
                                        <th className="px-4 pb-4">
                                            Jatuh Tempo
                                        </th>
                                        <th className="px-4 pb-4">Status</th>
                                        <th className="px-4 pb-4 text-center">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bills.length > 0 ? (
                                        bills.map((bill) => (
                                            <tr
                                                key={bill.id}
                                                className="bg-white/5 hover:bg-white/10 transition-colors">
                                                <td className="px-4 py-5 rounded-l-2xl text-white font-bold text-sm lg:text-base tracking-wider uppercase">
                                                    {bill.jenis_tagihan}
                                                </td>
                                                <td className="px-4 py-5 text-gray-300 font-bold text-xs lg:text-sm tracking-widest">
                                                    {formatTanggal(
                                                        bill.jatuh_tempo,
                                                    )}
                                                </td>
                                                <td className="px-4 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full shadow-[0_0_10px] ${bill.status === "paid" ? "bg-[#00FF57] shadow-[#00FF57]" : "bg-[#FF0000] shadow-[#FF0000]"}`}></div>
                                                        <span
                                                            className={`text-[9px] lg:text-[11px] font-bold tracking-widest uppercase ${bill.status === "paid" ? "text-[#00FF57]" : "text-[#FF4D4D]"}`}>
                                                            {bill.status ===
                                                            "paid"
                                                                ? "Lunas"
                                                                : "Belum Lunas"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 rounded-r-2xl text-center">
                                                    {bill.status === "paid" ? (
                                                        <button className="bg-green-600 cursor-default text-white text-[9px] lg:text-[10px] font-bold py-2 px-6 rounded-full tracking-widest shadow-lg opacity-80">
                                                            LUNAS
                                                        </button>
                                                    ) : isOverdue(
                                                          bill.jatuh_tempo,
                                                      ) ? (
                                                        <button
                                                            onClick={() =>
                                                                handleBukaOverdue(
                                                                    bill,
                                                                )
                                                            }
                                                            className="bg-gray-500 hover:bg-gray-400 text-white text-[9px] lg:text-[10px] font-bold py-2 px-6 rounded-full tracking-widest transition-transform hover:scale-105 shadow-lg">
                                                            DETAIL
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                handleBukaDetail(
                                                                    bill,
                                                                )
                                                            }
                                                            className="bg-[#E42E2E] hover:bg-red-600 text-white text-[9px] lg:text-[10px] font-bold py-2 px-6 rounded-full tracking-widest transition-transform hover:scale-105 shadow-lg animate-pulse">
                                                            BAYAR
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="text-center py-10 text-gray-400 italic">
                                                Kamu tidak memiliki riwayat
                                                tagihan apapun.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>

            {/* POP-UP 1: DETAIL NORMAL */}
            {step === 1 && selectedBill && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in-up">
                    <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative">
                        <button
                            onClick={() => setStep(0)}
                            className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors text-xl">
                            ✕
                        </button>
                        <h3 className="text-white text-2xl font-bold tracking-widest text-center mb-6 border-b border-white/10 pb-4">
                            DETAIL TAGIHAN
                        </h3>
                        <div className="flex flex-col gap-4 mb-8 text-white">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm tracking-widest">
                                    Jenis
                                </span>
                                <span className="font-bold uppercase">
                                    {selectedBill.jenis_tagihan}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm tracking-widest">
                                    Jatuh Tempo
                                </span>
                                <span className="font-bold">
                                    {formatTanggal(selectedBill.jatuh_tempo)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm tracking-widest">
                                    Sisa Saldo Anda
                                </span>
                                <span className="font-bold text-[#4285F4]">
                                    Rp.{" "}
                                    {parseInt(studentData.saldo).toLocaleString(
                                        "id-ID",
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10 mt-2">
                                <span className="font-bold tracking-widest text-sm">
                                    TOTAL BAYAR
                                </span>
                                <span className="font-bold text-xl text-[#FF4D4D]">
                                    Rp.{" "}
                                    {parseInt(
                                        selectedBill.nominal,
                                    ).toLocaleString("id-ID")}
                                </span>
                            </div>
                        </div>

                        {studentData.saldo >= parseInt(selectedBill.nominal) ? (
                            <button
                                onClick={handleLanjutKePin}
                                className="w-full bg-[#E42E2E] hover:bg-red-600 text-white font-bold tracking-widest py-4 rounded-full transition-all shadow-lg active:scale-95">
                                BAYAR SEKARANG
                            </button>
                        ) : (
                            <div className="text-center">
                                <button
                                    disabled
                                    className="w-full bg-white/5 border border-white/10 text-white/30 font-bold tracking-widest py-4 rounded-full cursor-not-allowed mb-3">
                                    SALDO TIDAK CUKUP
                                </button>
                                <p className="text-xs text-red-400 italic">
                                    Silakan isi saldo dompet Anda terlebih
                                    dahulu.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* POP-UP 2: INPUT PIN */}
            {step === 2 && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-fade-in-up">
                    <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-10 w-full max-w-sm shadow-2xl relative flex flex-col items-center text-center">
                        <button
                            onClick={() => setStep(0)}
                            className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors text-xl">
                            ✕
                        </button>
                        <div className="w-full bg-white/10 border border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center shadow-inner min-h-[120px] relative mb-6">
                            <div className="flex gap-4 z-10">
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-3 h-3 rounded-full transition-all duration-200 ${pin.length > i ? "bg-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-white/30"}`}></div>
                                ))}
                            </div>
                            <input
                                type="password"
                                maxLength="6"
                                autoFocus
                                value={pin}
                                onChange={(e) =>
                                    setPin(
                                        e.target.value.replace(/[^0-9]/g, ""),
                                    )
                                }
                                className="absolute inset-0 w-full h-full opacity-0 cursor-text z-20"
                            />
                        </div>
                        {pinError && (
                            <p className="text-red-400 font-bold text-xs tracking-widest -mt-2 mb-4">
                                {pinError}
                            </p>
                        )}
                        <button
                            onClick={handlePinSubmit}
                            disabled={pin.length < 6 || isProcessing}
                            className="w-full bg-[#2A4365] hover:bg-[#32527B] text-white py-4 rounded-2xl font-bold tracking-widest transition-all shadow-md border border-white/20 outline-none flex justify-center disabled:bg-white/5 disabled:text-white/30 disabled:border-white/5 disabled:cursor-not-allowed">
                            {isProcessing ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                "KONFIRMASI"
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* POP-UP 3: STRUK SUKSES */}
            {step === 3 && selectedBill && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in-up">
                    <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-10 w-full max-w-sm shadow-2xl flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-[#00B14F] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,177,79,0.5)]">
                            <svg
                                className="w-10 h-10 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h3 className="text-white text-2xl font-bold tracking-widest mb-2 uppercase">
                            PEMBAYARAN LUNAS
                        </h3>
                        <p className="text-gray-400 text-xs mb-8">
                            Terima kasih, tagihan Anda telah terbayar.
                        </p>
                        <div className="w-full bg-white/5 p-5 rounded-2xl border border-white/10 mb-8">
                            <p className="text-gray-400 text-xs tracking-widest mb-1">
                                Nominal Pembayaran
                            </p>
                            <p className="text-white text-xl font-bold mb-4">
                                Rp.{" "}
                                {parseInt(selectedBill.nominal).toLocaleString(
                                    "id-ID",
                                )}
                            </p>
                            <p className="text-gray-400 text-xs tracking-widest mb-1">
                                Untuk Pembayaran
                            </p>
                            <p className="text-white font-bold uppercase">
                                {selectedBill.jenis_tagihan}
                            </p>
                        </div>
                        <button
                            onClick={() => setStep(0)}
                            className="w-full bg-white/10 hover:bg-white/20 text-white font-bold tracking-widest py-4 rounded-full transition-all border border-white/10">
                            TUTUP
                        </button>
                    </div>
                </div>
            )}

            {/* POP-UP 4: OVERDUE */}
            {step === 4 && selectedBill && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in-up">
                    <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-10 w-full max-w-sm shadow-2xl relative flex flex-col items-center text-center">
                        <button
                            onClick={() => setStep(0)}
                            className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors text-xl outline-none">
                            ✕
                        </button>
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-500/50">
                            <svg
                                className="w-10 h-10 text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-white text-xl font-bold tracking-widest mb-2 uppercase">
                            TAGIHAN KADALUARSA
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed mb-8">
                            Silakan datang ke ruang Tata Usaha (TU) sekolah
                            untuk melakukan pembayaran tagihan{" "}
                            <strong className="text-white">
                                {selectedBill.jenis_tagihan}
                            </strong>{" "}
                            karena telah melewati batas jatuh tempo (
                            {formatTanggal(selectedBill.jatuh_tempo)}).
                        </p>
                        <button
                            onClick={() => setStep(0)}
                            className="w-full bg-[#1C4188]/60 hover:bg-[#1C4188] text-white font-bold tracking-widest py-4 rounded-full transition-all shadow-lg border border-blue-400/30 outline-none backdrop-blur-md">
                            MENGERTI
                        </button>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* POP-UP 5: PERINGATAN AKUN TERKUNCI (COCOK DENGAN FOTO 1) */}
            {/* ========================================================================= */}
            {step === 5 && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in-up">
                    <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-10 w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative flex flex-col items-center text-center">
                        {/* Ikon Segitiga Tanda Seru Kuning Besar */}
                        <svg
                            className="w-24 h-24 text-yellow-500 mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]"
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

                        {/* Pesan Blokir Akun */}
                        <p className="text-white font-bold tracking-widest leading-relaxed text-sm max-w-sm mb-8 uppercase">
                            MAAF, AKUN ANDA TERKUNCI, SILAKAN MENUJU TU SEKOLAH
                            UNTUK MEMINTA MEMBUKA AKUN ANDA KEMBALI
                        </p>

                        {/* Tombol Eksekusi Logout */}
                        <button
                            onClick={handleKeluarTerkunci}
                            className="bg-[#2D60FF] hover:bg-blue-600 px-14 py-3.5 rounded-full font-bold text-white shadow-xl transition-all hover:scale-105 tracking-widest text-xs uppercase outline-none">
                            KELUAR
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }
                .animate-fade-in-up { animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
