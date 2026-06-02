import { useState, useEffect } from "react";
import axios from "axios";
import SidebarAdmin from "../components/SidebarAdmin";

export default function AdminTagihan() {
    // 1. STATE UTAMA
    const [students, setStudents] = useState([]);
    const [bills, setBills] = useState([]); // Sekarang diawali dengan array kosong
    const [activeKelas, setActiveKelas] = useState("X");
    const [searchQuery, setSearchQuery] = useState("");

    // 2. STATE UNTUK POP-UP (MODAL)
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // 3. STATE UNTUK FORM TAMBAH TAGIHAN
    const [jenisTagihan, setJenisTagihan] = useState("");
    const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState("");
    const [nominal, setNominal] = useState("");

    // MENGAMBIL DATA DARI LARAVEL SAAT HALAMAN DIBUKA
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Ambil data siswa
                const resStudents = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/students`,
                );
                setStudents(resStudents.data);

                // Ambil semua data tagihan
                const resBills = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/bills`,
                );
                setBills(resBills.data);
            } catch (error) {
                console.error("Gagal mengambil data dari server:", error);
            }
        };
        fetchData();
    }, []);

    // Filter Ganda (Kelas & Pencarian)
    const filteredStudents = students.filter((student) => {
        const matchKelas =
            student.kelas?.toUpperCase() === activeKelas.toUpperCase();
        const matchSearch =
            student.nama_lengkap
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            student.nisn?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchKelas && matchSearch;
    });

    // FUNGSI VALIDASI KETAT NOMINAL (Hanya angka)
    const handleNominalChange = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, "");
        if (value.startsWith("0") && value.length > 1) {
            value = value.substring(1);
        }
        setNominal(value);
    };

    // FUNGSI MENGUBAH FORMAT TANGGAL SQL (YYYY-MM-DD) KE INDONESIA
    const formatTanggal = (tanggal) => {
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

    // FUNGSI SIMPAN TAGIHAN KE DATABASE LARAVEL
    const handleSimpanTagihan = async () => {
        if (!jenisTagihan || !tanggalJatuhTempo || !nominal) {
            alert("Harap isi semua kolom!");
            return;
        }

        try {
            // Data yang dikirim ke Laravel (Sesuai dengan Request Validator)
            const payload = {
                student_id: selectedStudent.id,
                jenis_tagihan: jenisTagihan,
                jatuh_tempo: tanggalJatuhTempo,
                nominal: nominal,
            };

            // Tembak API
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/bills`,
                payload,
            );

            // Tambahkan data baru dari server ke state React agar langsung muncul
            setBills([response.data.data, ...bills]);

            // Reset Form & Tutup Modal
            setJenisTagihan("");
            setTanggalJatuhTempo("");
            setNominal("");
            setShowAddModal(false);

            // Optional: Beri notifikasi sukses
            alert("Berhasil menambahkan tagihan permanen!");
        } catch (error) {
            console.error(
                "Gagal menyimpan tagihan:",
                error.response?.data || error.message,
            );
            alert("Terjadi kesalahan saat menyimpan ke database.");
        }
    };

    return (
        <div className="min-h-[100dvh] w-full bg-[#023474] flex font-sans">
            <SidebarAdmin activeMenu="tagihan" />

            <main className="flex-1 p-8 flex flex-col relative overflow-hidden h-screen">
                {/* Top Actions */}
                <div className="flex justify-end items-center mb-8">
                    <div className="relative w-96">
                        <input
                            type="text"
                            placeholder="Cari Berdasarkan Nama / NISN"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#4E5364] text-white placeholder-gray-300 rounded-full py-3 px-6 pr-12 outline-none border-none focus:ring-2 focus:ring-[#2D60FF] transition-all"
                        />
                        <svg
                            className="absolute right-4 top-3.5 w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Tabel Data Tagihan */}
                <div className="bg-[#282C3E] rounded-[2.5rem] flex-1 border border-white/5 shadow-2xl overflow-hidden flex flex-col">
                    <div className="px-8 py-6 flex-1 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left text-white">
                            <thead className="sticky top-0 bg-[#282C3E] z-10">
                                <tr className="border-b border-white/10">
                                    <th className="py-4 text-xl font-bold">
                                        Nama
                                    </th>
                                    <th className="py-4 text-xl font-bold">
                                        NISN
                                    </th>
                                    <th className="py-4 text-xl font-bold">
                                        Jurusan
                                    </th>
                                    <th className="py-4 text-xl font-bold">
                                        Kelas
                                    </th>
                                    <th className="py-4 text-center">
                                        <div className="bg-[#1C2031] inline-block px-4 py-2 rounded-xl text-xs font-bold leading-tight shadow-md border border-white/5">
                                            Total siswa
                                            <br />
                                            Kelas {activeKelas} :{" "}
                                            {filteredStudents.length}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <tr
                                            key={student.id}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-6 font-bold text-lg">
                                                {student.nama_lengkap}
                                            </td>
                                            <td className="py-6 font-bold text-lg">
                                                {student.nisn}
                                            </td>
                                            <td className="py-6 font-bold text-lg">
                                                {student.jurusan}
                                            </td>
                                            <td className="py-6 font-bold text-lg">
                                                {student.kelas}
                                            </td>
                                            <td className="py-6 text-center">
                                                <button
                                                    onClick={() =>
                                                        setSelectedStudent(
                                                            student,
                                                        )
                                                    }
                                                    className="text-white hover:text-[#2D60FF] transition-all transform hover:scale-110 outline-none">
                                                    <svg
                                                        className="w-8 h-8 mx-auto drop-shadow-md"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="py-12 text-center text-gray-400 italic">
                                            {searchQuery
                                                ? `Tidak ada siswa bernama/NISN "${searchQuery}" di Kelas ${activeKelas}.`
                                                : `Belum ada data siswa di Kelas ${activeKelas}.`}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Filter Kelas */}
                <div className="mt-8 flex justify-start gap-4">
                    {["X", "XI", "XII"].map((kls) => (
                        <button
                            key={kls}
                            onClick={() => setActiveKelas(kls)}
                            className={`font-bold py-3 px-10 rounded-2xl transition-colors shadow-lg outline-none ${activeKelas === kls ? "bg-[#4E5364] text-white" : "bg-[#1C2031] text-gray-400 hover:bg-[#3B415A]"}`}>
                            Kelas {kls}
                        </button>
                    ))}
                </div>
            </main>

            {/* ========================================================================================= */}
            {/* POP-UP 1: HISTORI TAGIHAN SISWA */}
            {/* ========================================================================================= */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-8 transition-opacity duration-300">
                    <div className="w-full max-w-5xl h-[80vh] bg-[#4B5563] rounded-[2.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.5)] flex flex-col relative border border-white/10 animate-fade-in-up">
                        <div className="absolute -top-16 left-0">
                            <div className="relative w-80">
                                <input
                                    type="text"
                                    placeholder="Cari Berdasarkan Jenis Tagihan"
                                    className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-3 px-6 text-sm focus:outline-none text-white placeholder-white/50 shadow-lg"
                                />
                                <svg
                                    className="w-5 h-5 absolute right-4 top-3 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24">
                                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 12.01 5 9.5S7.01 5 9.5 5 14 6.99 14 9.5 12.01 14 9.5 14z" />
                                </svg>
                            </div>
                        </div>

                        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar text-white">
                            <h2 className="text-2xl font-bold mb-6 tracking-widest uppercase">
                                Tagihan: {selectedStudent.nama_lengkap}
                            </h2>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-gray-300 text-xs tracking-[0.2em] font-bold border-b border-white/20">
                                        <th className="pb-4">KETERANGAN</th>
                                        <th className="pb-4">TANGGAL</th>
                                        <th className="pb-4">STATUS</th>
                                        <th className="pb-4 text-center">
                                            HAPUS
                                        </th>
                                        <th className="pb-4 text-center">
                                            EDIT
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bills
                                        .filter(
                                            (b) =>
                                                b.student_id ===
                                                selectedStudent.id,
                                        )
                                        .map((bill) => (
                                            <tr
                                                key={bill.id}
                                                className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                                <td className="py-6 font-bold tracking-wider text-base">
                                                    {bill.jenis_tagihan}
                                                </td>
                                                <td className="py-6 font-bold tracking-wider text-sm">
                                                    {formatTanggal(
                                                        bill.jatuh_tempo,
                                                    )}
                                                </td>
                                                <td className="py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-3.5 h-3.5 rounded-full ${bill.status === "paid" ? "bg-[#00FF57]" : "bg-[#FF0000]"} border-2 border-[#4B5563] ring-1 ${bill.status === "paid" ? "ring-[#00FF57]" : "ring-[#FF0000]"}`}></div>
                                                        <span className="font-bold text-[11px] tracking-[0.15em] uppercase">
                                                            {bill.status ===
                                                            "paid"
                                                                ? "TERBAYARKAN"
                                                                : "BELUM TERBAYARKAN"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-6 text-center">
                                                    <button className="text-red-400 hover:text-red-300 transition-colors transform hover:scale-110">
                                                        <svg
                                                            className="w-6 h-6 mx-auto"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
                                                        </svg>
                                                    </button>
                                                </td>
                                                <td className="py-6 text-center">
                                                    <button className="text-blue-400 hover:text-blue-300 transition-colors transform hover:scale-110">
                                                        <svg
                                                            className="w-6 h-6 mx-auto"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    {bills.filter(
                                        (b) =>
                                            b.student_id === selectedStudent.id,
                                    ).length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="py-10 text-center text-gray-300 italic">
                                                Belum ada histori tagihan untuk
                                                siswa ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="absolute -bottom-20 left-0 right-0 flex justify-between">
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="bg-[#4B5563] hover:bg-gray-600 px-10 py-3.5 rounded-[1.5rem] font-bold text-white shadow-xl transition-transform hover:-translate-y-1 border border-white/10">
                                Kembali
                            </button>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-[#4B5563] hover:bg-gray-600 px-10 py-3.5 rounded-[1.5rem] font-bold text-white shadow-xl flex items-center gap-3 transition-transform hover:-translate-y-1 border border-white/10">
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                TAMBAHKAN TAGIHAN
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================================= */}
            {/* POP-UP 2: FORM TAMBAH TAGIHAN */}
            {/* ========================================================================================= */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-8 transition-opacity">
                    <button
                        onClick={() => setShowAddModal(false)}
                        className="absolute bottom-10 left-10 bg-[#1F2937] border border-white/10 hover:bg-gray-800 px-10 py-4 rounded-[1.5rem] font-bold text-white shadow-2xl transition-transform hover:-translate-y-1">
                        Kembali
                    </button>

                    <div className="w-full max-w-md bg-[#1F2937] rounded-[3rem] p-10 shadow-[0_0_50px_rgba(0,0,0,0.6)] border border-white/10 flex flex-col gap-6 animate-fade-in-up">
                        <input
                            type="text"
                            placeholder="JENIS TAGIHAN"
                            value={jenisTagihan}
                            onChange={(e) =>
                                setJenisTagihan(e.target.value.toUpperCase())
                            }
                            className="w-full bg-transparent border border-white/40 rounded-full py-4 px-8 text-sm font-bold tracking-widest focus:outline-none focus:border-white text-white placeholder-white/50 transition-colors"
                        />

                        <div className="relative">
                            <input
                                type="date"
                                value={tanggalJatuhTempo}
                                onChange={(e) =>
                                    setTanggalJatuhTempo(e.target.value)
                                }
                                className="w-full bg-transparent border border-white/40 rounded-full py-4 px-8 text-sm font-bold tracking-widest focus:outline-none focus:border-white text-white placeholder-white/50 appearance-none [color-scheme:dark] transition-colors"
                                style={{
                                    color: tanggalJatuhTempo
                                        ? "white"
                                        : "rgba(255,255,255,0.5)",
                                }}
                            />
                            {!tanggalJatuhTempo && (
                                <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none text-sm font-bold tracking-widest text-white/50">
                                    TANGGAL JATUH TEMPO
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none text-white font-bold tracking-widest text-sm">
                                Rp.
                            </div>
                            <input
                                type="text"
                                placeholder="NOMINAL"
                                value={
                                    nominal
                                        ? new Intl.NumberFormat("id-ID").format(
                                              nominal,
                                          )
                                        : ""
                                }
                                onChange={handleNominalChange}
                                className="w-full bg-transparent border border-white/40 rounded-full py-4 pl-16 pr-8 text-sm font-bold tracking-widest focus:outline-none focus:border-white text-white placeholder-white/50 transition-colors"
                            />
                        </div>

                        <button
                            onClick={handleSimpanTagihan}
                            className="w-full bg-white/20 hover:bg-white/30 text-white font-bold tracking-[0.2em] py-4 rounded-full mt-4 transition-all shadow-lg hover:shadow-xl active:scale-95">
                            KONFIRMASI
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
                
                .animate-fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                
                ::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    cursor: pointer;
                    opacity: 0.8;
                }
                ::-webkit-calendar-picker-indicator:hover {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
}
