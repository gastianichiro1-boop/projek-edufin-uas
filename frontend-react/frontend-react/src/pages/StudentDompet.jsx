import { useState, useEffect } from "react";
import axios from "axios";
import SidebarSiswa from "../components/SidebarSiswa";

export default function StudentDompet() {
    const [studentData, setStudentData] = useState(null);
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

    // State Modal Top Up
    const [showTopupModal, setShowTopupModal] = useState(false);
    const [topupStep, setTopupStep] = useState(1);
    const [selectedMethod, setSelectedMethod] = useState("");
    const [selectedProvider, setSelectedProvider] = useState("");
    const [nominal, setNominal] = useState("");
    const [loading, setLoading] = useState(false);

    // State Histori & Detail Trx
    const [history, setHistory] = useState([]);
    const [txDetail, setTxDetail] = useState(null);
    const [selectedTx, setSelectedTx] = useState(null);

    // ==========================================
    // STATE BARU: Limit Saldo 5 Juta
    // ==========================================
    const [showLimitModal, setShowLimitModal] = useState(false); // Pop-up Foto 1
    const [showLimitTooltip, setShowLimitTooltip] = useState(false); // Pop-up Foto 2 (Tooltip 8 Detik)

    // FUNGSI UTAMA: Mengambil seluruh riwayat dari Database
    const fetchDompetData = async (id) => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/transactions/${id}`,
            );
            // Mengurutkan dari yang terbaru
            const sortedHistory = res.data.sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at),
            );
            setHistory(sortedHistory);
        } catch (err) {
            console.error("Gagal mengambil histori:", err);
            setHistory([]);
        }
    };

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("student_data"));
        if (data) {
            setStudentData(data);
            fetchDompetData(data.id);
        }
    }, []);

    // ==========================================
    // EFEK TIMER 8 DETIK UNTUK TOOLTIP (FOTO 2)
    // ==========================================
    useEffect(() => {
        // Cek total pengisian saldo bulan ini dari history
        if (studentData && history.length > 0) {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            const totalTopupBulanIni = history
                .filter((tx) => {
                    const txDate = new Date(tx.created_at);
                    return (
                        tx.title === "ISI SALDO" &&
                        txDate.getMonth() === currentMonth &&
                        txDate.getFullYear() === currentYear
                    );
                })
                .reduce((sum, tx) => sum + parseInt(tx.amount || 0), 0);

            // Jika total top up >= 5.000.000, munculkan tooltip 8 detik
            if (totalTopupBulanIni >= 5000000) {
                setShowLimitTooltip(true);
                const timer = setTimeout(() => {
                    setShowLimitTooltip(false);
                }, 8000); // Hilang setelah 8 detik

                // Bersihkan timer jika komponen ditutup
                return () => clearTimeout(timer);
            } else {
                setShowLimitTooltip(false);
            }
        }
    }, [studentData, history]);

    // ==========================================
    // PERBAIKAN LOGIKA: CEK LIMIT DULU, LALU CATAT HISTORI
    // ==========================================
    const handleTopup = async () => {
        if (parseInt(nominal) < 10000 || parseInt(nominal) > 5000000) {
            alert("Maksimal Rp 5.000.000");
            return;
        }
        setLoading(true);
        try {
            // 1. UPDATE SALDO & CEK LIMIT DULU KE LARAVEL
            const updateSaldo = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/students/topup/${studentData.id}`,
                { nominal },
            );

            // 2. JIKA LARAVEL MENGIZINKAN (TIDAK KENA LIMIT), BARU CATAT HISTORI TRANSAKSI
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/transactions`,
                {
                    student_id: studentData.id,
                    title: "ISI SALDO",
                    subtitle: selectedProvider,
                    amount: nominal,
                },
            );

            // 3. Perbarui LocalStorage
            const updatedData = {
                ...studentData,
                saldo: updateSaldo.data.saldo_baru,
            };
            localStorage.setItem("student_data", JSON.stringify(updatedData));
            setStudentData(updatedData);

            // 4. Refresh data histori langsung dari database
            fetchDompetData(studentData.id);

            const now = new Date();
            setTxDetail({
                tanggal: now.toLocaleDateString("id-ID"),
                waktu: now
                    .toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                    .replace(":", " . "),
                keterangan: `Isi Saldo Melalui\n${selectedMethod === "BANK" ? "Transfer Bank" : "E - Wallet"} ${selectedProvider}`,
            });

            setTimeout(() => {
                setLoading(false);
                setTopupStep(4);
            }, 1000);
        } catch (error) {
            setLoading(false);
            // ==========================================
            // LOGIKA MENANGKAP ERROR LIMIT DARI LARAVEL
            // ==========================================
            if (
                error.response?.status === 403 &&
                error.response?.data?.status === "error_limit"
            ) {
                setShowTopupModal(false); // Tutup modal top up
                setShowLimitModal(true); // Munculkan modal Limit (Foto 1)
            } else {
                alert(
                    "Gagal memproses transaksi: " +
                        (error.response?.data?.message || "Terjadi kesalahan"),
                );
            }
        }
    };

    if (!studentData) return null;

    return (
        <div className="min-h-screen w-full bg-[#051125] flex relative overflow-hidden">
            <div className="z-50 relative">
                <SidebarSiswa activeMenu="dompet" />
            </div>

            <main className="flex-1 flex flex-col relative z-10 h-screen overflow-hidden custom-font">
                {/* Bagian Profil & Saldo */}
                <div
                    className={`flex flex-col items-center w-full pt-12 transition-all duration-700 z-20 ${isHistoryExpanded ? "opacity-0 -translate-y-20 pointer-events-none" : "opacity-100"}`}>
                    <div className="bg-[#0B1A3A]/70 backdrop-blur-xl border border-white/5 rounded-full pl-3 pr-16 py-3 flex items-center gap-6 shadow-2xl mb-10 min-w-[500px]">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#4A78C5] bg-gray-800 flex items-center justify-center">
                            <img
                                src="/images/profil.png"
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src =
                                        "https://i.pravatar.cc/150?u=a042581f4e29026704d";
                                }}
                            />
                        </div>
                        <div className="text-white">
                            <h2 className="text-[20px] font-bold tracking-[0.2em] uppercase">
                                {studentData.nama_lengkap}
                            </h2>
                            <p className="font-mono tracking-widest text-[13px] text-gray-400">
                                .... .... ....{" "}
                                {studentData.nisn?.slice(-4) || "0000"}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center text-white mt-8 relative">
                        <p className="text-[17px] font-bold tracking-[0.1em] mb-2">
                            Saldo Dompetmu
                        </p>
                        <div className="flex items-center gap-6 relative">
                            <h1 className="text-[75px] font-light tracking-widest">
                                Rp.{" "}
                                {parseInt(studentData.saldo || 0)
                                    .toLocaleString("id-ID")
                                    .replace(/,/g, ".")}
                            </h1>

                            <div className="relative flex items-center">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowTopupModal(true);
                                        setTopupStep(1);
                                        setNominal("");
                                    }}
                                    className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-3xl font-light transition-all duration-300 hover:scale-110 hover:bg-white/20 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] backdrop-blur-sm cursor-pointer z-50 outline-none pb-1">
                                    +
                                </button>

                                {/* TOOLTIP 8 DETIK (FOTO 2) */}
                                {showLimitTooltip && (
                                    <div className="absolute left-full ml-6 w-64 bg-[#4B4051] text-white p-4 rounded-2xl shadow-2xl z-50 animate-fade-in-up">
                                        <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-[#4B4051]"></div>
                                        <p className="text-[9px] font-bold tracking-widest leading-relaxed uppercase text-center">
                                            Batas maksimum pengisian saldo anda
                                            bulan ini (Rp5.000.000) telah
                                            terpenuhi
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* HISTORI TRANSAKSI */}
                <div
                    className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[160%] bg-gradient-to-b from-[#0B3CC4] to-[#04122B] flex flex-col items-center pt-8 transition-all duration-700 z-10 ${isHistoryExpanded ? "h-[95vh]" : "h-[50vh]"}`}
                    style={{
                        borderTopLeftRadius: "50% 15%",
                        borderTopRightRadius: "50% 15%",
                        boxShadow: "0 -20px 60px rgba(11, 60, 196, 0.4)",
                        borderTop: "1px solid rgba(255,255,255,0.3)",
                    }}>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setIsHistoryExpanded(!isHistoryExpanded);
                        }}
                        className="text-white/60 hover:text-white mb-10 mt-1 outline-none cursor-pointer z-50 transition-colors">
                        <svg
                            className={`w-8 h-8 transition-transform duration-700 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] ${isHistoryExpanded ? "rotate-180" : "rotate-0"}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 8l6 8H6z"
                            />
                        </svg>
                    </button>

                    <div
                        className={`w-[60%] flex flex-col gap-5 px-4 overflow-y-auto custom-scrollbar ${isHistoryExpanded ? "h-full pb-20" : "h-[180px] overflow-hidden"}`}>
                        {history.length === 0 ? (
                            <div className="flex justify-center items-center h-32">
                                <p className="text-white/60 italic tracking-widest text-sm font-medium bg-white/5 px-8 py-3 rounded-full border border-white/10">
                                    Belum ada riwayat transaksi.
                                </p>
                            </div>
                        ) : (
                            history.map((item) => {
                                const isPengeluaran =
                                    item.title
                                        .toUpperCase()
                                        .includes("PEMBAYARAN") ||
                                    item.title.toUpperCase().includes("DONASI");

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedTx(item)}
                                        className={`bg-[#1C46A2]/40 backdrop-blur-md border ${isPengeluaran ? "border-red-400/20 hover:bg-red-900/40" : "border-white/20 hover:bg-[#1C46A2]/70"} rounded-[2rem] px-10 py-5 flex items-center justify-between w-full flex-shrink-0 cursor-pointer transition-colors shadow-[0_10px_20px_rgba(0,0,0,0.2)]`}>
                                        <div className="text-white w-1/3 text-left">
                                            <p className="font-bold text-sm tracking-[0.2em]">
                                                {item.title}
                                            </p>
                                            <p className="text-[10px] text-white/70 tracking-[0.2em] font-bold uppercase">
                                                {item.subtitle}
                                            </p>
                                        </div>
                                        <div
                                            className={`w-1/3 text-center font-bold text-[17px] tracking-[0.1em] ${isPengeluaran ? "text-red-300" : "text-white"}`}>
                                            {isPengeluaran ? "- Rp. " : "Rp. "}
                                            {parseInt(item.amount)
                                                .toLocaleString("id-ID")
                                                .replace(/,/g, ".")}
                                        </div>
                                        <div className="w-1/3 flex items-center justify-end gap-5 text-white font-bold text-[11px] tracking-[0.2em]">
                                            {new Date(
                                                item.created_at,
                                            ).toLocaleDateString("id-ID")}
                                            <div
                                                className={`w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-sm ${isPengeluaran ? "bg-red-500/20" : "bg-white/10"}`}>
                                                <svg
                                                    className="w-3 h-3 text-white ml-0.5"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>

            {/* ========================================================================= */}
            {/* 1. POP-UP DETAIL TRANSAKSI (RIWAYAT YANG DIKLIK) */}
            {/* ========================================================================= */}
            {selectedTx && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <button
                        onClick={() => setSelectedTx(null)}
                        className="absolute bottom-10 left-10 bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 px-10 rounded-full border border-white/20 shadow-xl transition-all hover:-translate-y-1 z-50 backdrop-blur-md">
                        Kembali
                    </button>

                    <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[3rem] p-10 w-full max-w-md shadow-[0_15px_35px_rgba(0,0,0,0.4)] relative animate-fade-in-up">
                        <button
                            onClick={() => setSelectedTx(null)}
                            className="absolute top-6 right-8 text-white/40 hover:text-white transition-colors text-2xl font-bold outline-none">
                            ✕
                        </button>

                        <div className="flex flex-col items-center pt-2">
                            <div
                                className={`w-24 h-24 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-xl border border-white/20 ${selectedTx.title.toUpperCase().includes("PEMBAYARAN") || selectedTx.title.toUpperCase().includes("DONASI") ? "bg-red-500/80 shadow-red-500/30" : "bg-[#4285F4]/90 shadow-[#4285F4]/40"}`}>
                                <svg
                                    className="w-12 h-12 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    {selectedTx.title
                                        .toUpperCase()
                                        .includes("DONASI") ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                        />
                                    ) : selectedTx.title
                                          .toUpperCase()
                                          .includes("PEMBAYARAN") ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    ) : (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    )}
                                </svg>
                            </div>

                            <h3 className="text-white text-2xl font-bold mb-8 tracking-[0.1em] uppercase text-center">
                                Detail
                                <br />
                                {selectedTx.title}
                            </h3>

                            <div className="w-full flex flex-col gap-5 text-white px-2">
                                <p className="text-xs text-gray-300 mb-1 tracking-[0.15em] font-medium uppercase opacity-80">
                                    Rincian Transaksi
                                </p>

                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="font-bold tracking-wide text-sm">
                                        Nominal :
                                    </span>
                                    <span
                                        className={`font-bold tracking-wider text-[15px] ${selectedTx.title.toUpperCase().includes("PEMBAYARAN") || selectedTx.title.toUpperCase().includes("DONASI") ? "text-red-400" : "text-white"}`}>
                                        {selectedTx.title
                                            .toUpperCase()
                                            .includes("PEMBAYARAN") ||
                                        selectedTx.title
                                            .toUpperCase()
                                            .includes("DONASI")
                                            ? "- "
                                            : ""}{" "}
                                        Rp.{" "}
                                        {parseInt(selectedTx.amount)
                                            .toLocaleString("id-ID")
                                            .replace(/,/g, ".")}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="font-bold tracking-wide text-sm">
                                        Metode/Keterangan :
                                    </span>
                                    <span className="text-gray-200 tracking-wider text-sm font-medium uppercase">
                                        {selectedTx.subtitle}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="font-bold tracking-wide text-sm">
                                        Tanggal :
                                    </span>
                                    <span className="text-gray-200 tracking-wider text-sm font-medium">
                                        {new Date(
                                            selectedTx.created_at,
                                        ).toLocaleDateString("id-ID")}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-1 mt-1">
                                    <span className="font-bold tracking-wide text-sm">
                                        Status :
                                    </span>
                                    <span className="bg-[#00B14F]/90 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest border border-green-400/20 backdrop-blur-md shadow-sm">
                                        Berhasil
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* 2. POP-UP MODAL TOP UP (ISI SALDO) */}
            {/* ========================================================================= */}
            {showTopupModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    {topupStep === 4 && (
                        <button
                            onClick={() => setShowTopupModal(false)}
                            className="absolute bottom-10 left-10 bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 px-10 rounded-full border border-white/20 shadow-xl transition-all hover:-translate-y-1 z-50 backdrop-blur-md">
                            Kembali
                        </button>
                    )}

                    <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[3rem] p-10 w-full max-w-md shadow-[0_15px_35px_rgba(0,0,0,0.4)] relative animate-fade-in-up">
                        {!loading && topupStep < 4 && (
                            <button
                                onClick={() => setShowTopupModal(false)}
                                className="absolute top-6 right-8 text-white/40 hover:text-white transition-colors text-2xl font-bold outline-none">
                                ✕
                            </button>
                        )}

                        {topupStep === 1 && (
                            <div className="flex flex-col gap-5 pt-4">
                                <h3 className="text-white text-center font-bold text-2xl tracking-wide mb-4">
                                    Pilih Metode Isi Saldo
                                </h3>
                                <button
                                    onClick={() => {
                                        setSelectedMethod("BANK");
                                        setTopupStep(2);
                                    }}
                                    className="bg-white/5 hover:bg-[#2D60FF]/80 text-white py-5 rounded-2xl border border-white/10 transition-all font-bold tracking-widest shadow-md outline-none">
                                    Transfer Bank
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedMethod("EWALLET");
                                        setTopupStep(2);
                                    }}
                                    className="bg-white/5 hover:bg-[#2D60FF]/80 text-white py-5 rounded-2xl border border-white/10 transition-all font-bold tracking-widest shadow-md outline-none">
                                    E - Wallet
                                </button>
                            </div>
                        )}

                        {topupStep === 2 && (
                            <div className="flex flex-col gap-4 pt-4 h-[350px] overflow-y-auto custom-scrollbar-light pr-2">
                                <h3 className="text-white text-center font-bold text-2xl tracking-wide mb-4">
                                    Pilih{" "}
                                    {selectedMethod === "BANK"
                                        ? "Bank"
                                        : "E-Wallet"}
                                </h3>
                                {selectedMethod === "BANK" ? (
                                    <>
                                        {[
                                            "BCA",
                                            "MANDIRI",
                                            "BNI",
                                            "BRI",
                                            "BSI",
                                        ].map((bank) => (
                                            <button
                                                key={bank}
                                                onClick={() => {
                                                    setSelectedProvider(bank);
                                                    setTopupStep(3);
                                                }}
                                                className="bg-white/5 hover:bg-white/15 text-white py-4 rounded-xl border border-white/10 tracking-widest font-semibold transition-colors outline-none">
                                                {bank}
                                            </button>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        {[
                                            "DANA",
                                            "GOPAY",
                                            "OVO",
                                            "SHOPEEPAY",
                                            "LINKAJA",
                                        ].map((ewallet) => (
                                            <button
                                                key={ewallet}
                                                onClick={() => {
                                                    setSelectedProvider(
                                                        ewallet,
                                                    );
                                                    setTopupStep(3);
                                                }}
                                                className="bg-white/5 hover:bg-white/15 text-white py-4 rounded-xl border border-white/10 tracking-widest font-semibold transition-colors outline-none">
                                                {ewallet}
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}

                        {topupStep === 3 && (
                            <div className="flex flex-col gap-8 pt-4">
                                <h3 className="text-white text-center font-bold text-2xl tracking-wide">
                                    Masukkan Nominal
                                </h3>
                                <input
                                    type="text"
                                    value={nominal}
                                    onChange={(e) =>
                                        setNominal(
                                            e.target.value.replace(
                                                /[^0-9]/g,
                                                "",
                                            ),
                                        )
                                    }
                                    placeholder="Maksimal Rp 5.000.000"
                                    className="bg-transparent border-b-2 border-white/20 focus:border-[#2D60FF] py-4 px-6 text-white text-center text-3xl font-bold tracking-widest outline-none transition-colors placeholder-white/30"
                                />
                                <button
                                    onClick={handleTopup}
                                    disabled={loading || !nominal}
                                    className={`py-4 rounded-full font-bold flex items-center justify-center gap-3 transition-all tracking-widest shadow-lg outline-none ${loading || !nominal ? "bg-white/10 text-white/40 cursor-not-allowed border border-white/5" : "bg-[#4285F4] hover:bg-blue-600 text-white"}`}>
                                    {loading ? (
                                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        "KONFIRMASI"
                                    )}
                                </button>
                            </div>
                        )}

                        {topupStep === 4 && txDetail && (
                            <div className="flex flex-col items-center pt-2">
                                <div className="w-24 h-24 bg-[#4285F4]/90 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(66,133,244,0.4)] border border-white/20">
                                    <svg
                                        className="w-14 h-14 text-white"
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
                                <h3 className="text-white text-2xl font-bold mb-8 tracking-[0.1em]">
                                    Isi Saldo Berhasil
                                </h3>
                                <div className="w-full flex flex-col gap-5 text-white px-2">
                                    <p className="text-xs text-gray-300 mb-1 tracking-[0.15em] font-medium uppercase opacity-80">
                                        Detail Transaksi
                                    </p>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="font-bold tracking-wide text-sm">
                                            Tanggal :
                                        </span>
                                        <span className="text-gray-200 tracking-wider text-sm font-medium">
                                            {txDetail.tanggal}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="font-bold tracking-wide text-sm">
                                            Waktu :
                                        </span>
                                        <span className="text-gray-200 tracking-wider text-sm font-medium">
                                            {txDetail.waktu}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-1 mt-1">
                                        <span className="font-bold tracking-wide text-sm">
                                            Status :
                                        </span>
                                        <span className="bg-[#00B14F]/90 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest border border-green-400/20 backdrop-blur-md shadow-sm">
                                            Berhasil
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-start mt-2">
                                        <span className="font-bold tracking-wide text-sm">
                                            Keterangan :
                                        </span>
                                        <span className="text-right text-gray-200 text-sm tracking-wide whitespace-pre-wrap leading-relaxed font-medium">
                                            {txDetail.keterangan}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* 3. POP-UP LIMIT SALDO PENUH (Sesuai Foto 1) */}
            {/* ========================================================================= */}
            {showLimitModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-fade-in-up">
                    <div className="bg-[#1C3A6B]/80 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-10 w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center">
                        <p className="text-white font-bold tracking-widest leading-loose text-[11px] uppercase mb-8">
                            Batas maksimum pengisian
                            <br />
                            saldo anda bulan ini
                            <br />
                            <span className="text-[#FF4D4D] font-extrabold text-[12px]">
                                (Rp5.000.000)
                            </span>
                            <br />
                            Telah terpenuhi. Silakan
                            <br />
                            lakukan pengisian kembali
                            <br />
                            di bulan depan.
                        </p>
                        <button
                            onClick={() => setShowLimitModal(false)}
                            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-12 py-3 rounded-full font-bold tracking-widest uppercase transition-all hover:scale-105 outline-none text-xs">
                            OK
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
                .custom-font { font-family: 'Montserrat', sans-serif; }
                .custom-scrollbar::-webkit-scrollbar { width: 12px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin-block: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.8); border-radius: 20px; border: 3px solid transparent; background-clip: padding-box; }
                .custom-scrollbar-light::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar-light::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-light::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
                .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
