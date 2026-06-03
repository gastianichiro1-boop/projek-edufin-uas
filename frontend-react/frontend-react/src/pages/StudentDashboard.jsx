import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // <-- INTEGRASI BARU: Jalur Penghubung Halaman
import SidebarSiswa from "../components/SidebarSiswa";

export default function StudentDashboard() {
    const navigate = useNavigate(); // Inisialisasi mesin router navigasi

    // STATE UI
    const [isContactExpanded, setIsContactExpanded] = useState(false);
    const [selectedNews, setSelectedNews] = useState(null);
    const [isCopied, setIsCopied] = useState(false);

    // STATE DATA
    const [studentData, setStudentData] = useState({
        id: null,
        nama_lengkap: "Memuat...",
        nisn: "0000000000",
        kelas: "-",
        jurusan: "-",
        saldo: 0,
    });
    const [tagihanData, setTagihanData] = useState([]);
    const [newsData, setNewsData] = useState([]);
    const [loadingTagihan, setLoadingTagihan] = useState(true);

    // INITIAL FETCH
    useEffect(() => {
        const savedData = localStorage.getItem("student_data");
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            setStudentData(parsedData);
            fetchTagihanSiswa(parsedData.id);
        }
        fetchNews();
    }, []);

    const fetchTagihanSiswa = async (studentId) => {
        try {
            setLoadingTagihan(true);
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/bills/student/${studentId}`,
            );
            // Filter hanya tagihan yang belum lunas
            setTagihanData(response.data.filter((b) => b.status === "unpaid"));
        } catch (error) {
            console.error("Gagal mengambil tagihan:", error);
        } finally {
            setLoadingTagihan(false);
        }
    };

    const fetchNews = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/news`,
            );
            setNewsData(res.data);
        } catch (err) {
            console.error("Gagal ambil berita:", err);
            // Fallback Dummy Data dengan isi berita yang realistis
            setNewsData([
                {
                    id: 1,
                    title: "Presiden Prabowo Turun Tangan Untuk Kunjungan Ke Sekolah di Indonesia",
                    img: "/images/donasi1.jpg",
                    content:
                        "Presiden Republik Indonesia, Bapak Prabowo Subianto, baru-baru ini melakukan kunjungan kerja ke berbagai sekolah vokasi di wilayah Jawa Timur and Jawa Tengah. Kunjungan ini bertujuan untuk memantau langsung implementasi program Makan Siang Gratis dan memastikan fasilitas pendidikan memadai bagi seluruh siswa di tingkat menengah kejuruan.\n\nDalam kunjungannya, beliau berinteraksi langsung dengan para guru dan siswa, mendengarkan aspirasi mereka terkait kebutuhan alat praktik. Presiden juga menjanjikan tambahan alokasi dana pendidikan pada APBN tahun depan yang dikhususkan untuk memperbaiki infrastruktur sekolah yang sudah tidak layak pakai dan memperbarui alat-alat laboratorium agar sesuai dengan standar industri masa kini.",
                },
                {
                    id: 2,
                    title: "Gubernur Jawa Timur Mendatangi Sekolah Untuk Bantuan Keuangan",
                    img: "/images/donasi2.jfif",
                    content:
                        "Pemerintah Provinsi Jawa Timur terus berkomitmen untuk meningkatkan kualitas pendidikan vokasi. Gubernur Jawa Timur secara resmi telah meluncurkan program Bantuan Keuangan Khusus (BKK) yang ditujukan untuk sekolah-sekolah kejuruan (SMK) di seluruh provinsi. Program strategis ini berfokus pada peningkatan kualitas alat praktik di bengkel dan laboratorium sekolah.\n\nDalam kunjungannya ke SMK Putra Indonesia Malang, Gubernur secara simbolis menyerahkan bantuan senilai Rp 500 juta. Dana tersebut diharapkan dapat langsung digunakan oleh pihak sekolah untuk memperbarui perangkat pembelajaran, sehingga dapat mendukung terciptanya lulusan SMK yang unggul, siap kerja, dan kompeten bersaing di dunia industri global.",
                },
            ]);
        }
    };

    const handleCopyNisn = () => {
        if (studentData.nisn) {
            navigator.clipboard.writeText(studentData.nisn);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const formatTanggal = (tanggal) => {
        if (!tanggal) return "-";
        const dateObj = new Date(tanggal);
        return `${dateObj.getDate()} / ${dateObj.getMonth() + 1} / ${dateObj.getFullYear()}`;
    };

    return (
        <div className="h-screen w-full bg-gradient-to-br from-[#02112A] via-[#051C42] to-[#0A2A66] flex font-sans overflow-hidden">
            <SidebarSiswa activeMenu="dashboard" />

            <main className="flex-1 p-4 lg:p-10 flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-10 h-screen overflow-y-auto lg:overflow-hidden custom-scrollbar">
                {/* ============================================================== */}
                {/* KOLOM KIRI (Profil & Pemberitahuan) */}
                {/* ============================================================== */}
                <div className="lg:col-span-7 flex flex-col gap-6 lg:gap-10 w-full h-full min-h-0 pb-10 lg:pb-0">
                    {/* --- KOTAK PROFIL --- */}
                    <div className="bg-gradient-to-b from-[#08265E] to-[#06183D] border border-[#16387A] rounded-[2.5rem] p-8 shadow-2xl relative flex-shrink-0">
                        <div className="flex flex-col md:flex-row items-center w-full relative">
                            <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-[4px] border-[#08265E] shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-20 flex-shrink-0 bg-gray-800 relative">
                                <img
                                    src="/images/profil.png"
                                    alt="Profil"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src =
                                            "https://i.pravatar.cc/150?img=11";
                                    }}
                                />
                            </div>

                            <div className="bg-[#10347A] border border-[#1E489E] rounded-3xl py-5 px-8 flex-1 shadow-inner md:-ml-8 md:pl-14 w-full mt-4 md:mt-0 text-center md:text-left z-10">
                                <h2 className="text-white text-xl lg:text-2xl font-bold tracking-widest mb-2 uppercase drop-shadow-md truncate">
                                    Holla , {studentData.nama_lengkap}
                                </h2>
                                <div className="flex items-center justify-center md:justify-start gap-4">
                                    <span className="text-white font-bold tracking-widest text-base">
                                        NISN
                                    </span>
                                    <span className="text-white text-base tracking-[0.4em] font-medium font-mono">
                                        {studentData.nisn?.split("").join(" ")}
                                    </span>
                                    <button
                                        onClick={handleCopyNisn}
                                        className="text-white/60 hover:text-white transition-colors relative outline-none cursor-pointer">
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            />
                                        </svg>
                                        {isCopied && (
                                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-black text-[10px] font-bold py-1 px-2 rounded-[0.5rem]">
                                                Disalin!
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-6 lg:gap-12 mt-10 w-full pl-0 md:pl-20">
                            <div className="bg-[#184291] border border-[#2B5AC2] rounded-3xl w-24 h-24 lg:w-28 lg:h-28 flex flex-col items-center justify-center shadow-lg transition-transform hover:-translate-y-1">
                                <svg
                                    className="w-10 h-10 text-white mb-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 14l9-5-9-5-9 5 9 5z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 14v7"
                                    />
                                </svg>
                                <p className="text-white text-[9px] lg:text-[10px] font-bold text-center tracking-widest uppercase leading-tight">
                                    Kelas
                                    <br />
                                    {studentData.kelas}
                                </p>
                            </div>
                            <div className="bg-[#184291] border border-[#2B5AC2] rounded-3xl w-24 h-24 lg:w-28 lg:h-28 flex flex-col items-center justify-center shadow-lg transition-transform hover:-translate-y-1 px-2">
                                <svg
                                    className="w-10 h-10 text-white mb-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                    />
                                </svg>
                                <p className="text-white text-[9px] lg:text-[10px] font-bold text-center tracking-widest uppercase leading-tight">
                                    Jurusan
                                    <br />
                                    {studentData.jurusan}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* --- KOTAK PEMBERITAHUAN --- */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <h2 className="text-white text-2xl lg:text-3xl font-bold tracking-[0.15em] mb-4 drop-shadow-md flex-shrink-0">
                            Pemberitahuan
                        </h2>

                        <div className="bg-gradient-to-b from-[#08265E] to-[#06183D] border border-[#16387A] rounded-[2.5rem] p-6 lg:p-8 shadow-2xl flex flex-col gap-4 flex-1 overflow-y-auto custom-scrollbar-light pr-4">
                            {loadingTagihan ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                </div>
                            ) : tagihanData.length > 0 ? (
                                tagihanData.map((tagihan) => (
                                    /* ============================================================== */
                                    /* PERBAIKAN: ONCLICK PENGHUBUNG LANGSUNG KE HALAMAN TAGIHAN      */
                                    /* ============================================================== */
                                    <div
                                        key={tagihan.id}
                                        onClick={() =>
                                            navigate("/user/tagihan", {
                                                state: {
                                                    autoOpenBill: tagihan,
                                                },
                                            })
                                        }
                                        className="bg-[#12367A] border border-[#234FA8] rounded-full px-6 py-5 lg:px-8 lg:py-6 flex justify-between items-center shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-[#1a4696] cursor-pointer flex-shrink-0">
                                        <div className="text-white">
                                            <p className="font-bold text-sm lg:text-base tracking-widest mb-1 uppercase drop-shadow-sm">
                                                {tagihan.jenis_tagihan}
                                            </p>
                                            <p className="text-[10px] lg:text-xs tracking-[0.1em] font-semibold text-gray-300">
                                                JATUH TEMPO{" "}
                                                {formatTanggal(
                                                    tagihan.jatuh_tempo,
                                                )}
                                            </p>
                                        </div>
                                        <div className="text-white font-bold text-base lg:text-xl tracking-wider">
                                            Rp.{" "}
                                            {parseInt(tagihan.nominal)
                                                .toLocaleString("id-ID")
                                                .replace(/,/g, ".")}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <p className="text-gray-400 italic text-base">
                                        Tidak ada tagihan tertunda.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ============================================================== */}
                {/* KOLOM KANAN (Kontak & Berita) */}
                {/* ============================================================== */}
                <div className="lg:col-span-5 flex flex-col gap-6 lg:gap-10 w-full h-full min-h-0 pb-10 lg:pb-0">
                    {/* --- KOTAK KONTAK --- */}
                    <div className="flex-shrink-0">
                        <h2 className="text-white text-2xl lg:text-3xl font-bold tracking-[0.15em] mb-1 drop-shadow-md">
                            Kontak
                        </h2>
                        <h3 className="text-sm tracking-[0.15em] text-gray-300 mb-4">
                            Layanan Akademik
                        </h3>

                        <div className="bg-gradient-to-b from-[#08265E] to-[#06183D] border border-[#16387A] rounded-[2.5rem] p-6 shadow-2xl flex flex-col items-center">
                            <div
                                className={`w-full flex flex-col gap-4 transition-all duration-500 ease-in-out overflow-hidden ${isContactExpanded ? "max-h-[300px]" : "max-h-[90px]"}`}>
                                <div className="bg-[#12367A] border border-[#234FA8] rounded-3xl p-5 flex items-center shadow-lg w-full">
                                    <div className="text-white">
                                        <p className="font-bold text-lg tracking-wider mb-1">
                                            Staff TU SMK
                                        </p>
                                        <p className="text-xs text-gray-300 tracking-[0.1em]">
                                            081249947388
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className={`bg-[#12367A] border border-[#234FA8] rounded-3xl p-5 flex items-center shadow-lg w-full transition-opacity duration-500 ${isContactExpanded ? "opacity-100" : "opacity-0"}`}>
                                    <div className="text-white">
                                        <p className="font-bold text-lg tracking-wider mb-1">
                                            Pembimbing Kelas
                                        </p>
                                        <p className="text-xs text-gray-300 tracking-[0.1em]">
                                            081244231678
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() =>
                                    setIsContactExpanded(!isContactExpanded)
                                }
                                className="mt-4 text-white hover:text-blue-300 outline-none cursor-pointer">
                                <svg
                                    className={`w-7 h-7 transition-transform duration-500 ${isContactExpanded ? "rotate-180" : "rotate-0"}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* --- KOTAK BERITA --- */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <h2 className="text-white text-2xl lg:text-3xl font-bold tracking-[0.15em] mb-4 drop-shadow-md flex-shrink-0">
                            Tentang Donasi
                        </h2>

                        <div className="flex flex-col gap-4 flex-1 overflow-y-auto custom-scrollbar-light pr-4 pb-2">
                            {newsData.map((news) => (
                                <div
                                    key={news.id}
                                    className="bg-gradient-to-r from-[#0C2A6B] to-[#0A2052] border border-[#1E438D] rounded-3xl p-5 flex items-center justify-between shadow-xl transition-transform hover:-translate-y-1 cursor-pointer flex-shrink-0"
                                    onClick={() => setSelectedNews(news)}>
                                    <div className="flex-1 pr-4 text-white">
                                        <p className="font-bold text-xs lg:text-sm leading-snug mb-3 line-clamp-3 tracking-wide drop-shadow-sm">
                                            {news.title}
                                        </p>
                                        <span className="text-[9px] lg:text-[10px] text-gray-300 hover:text-white flex items-center gap-1 uppercase tracking-widest outline-none">
                                            Informasi Selengkapnya
                                            <svg
                                                className="w-3 h-3"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </span>
                                    </div>
                                    <div className="w-24 h-16 lg:w-32 lg:h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 shadow-md">
                                        <img
                                            src={news.img || news.image_url}
                                            alt="News"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src =
                                                    "https://via.placeholder.com/150";
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* MODAL BERITA */}
            {selectedNews && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-8">
                    <button
                        onClick={() => setSelectedNews(null)}
                        className="absolute bottom-6 left-6 bg-[#1C2333] text-white font-bold py-2 px-6 rounded-full border border-white/10 shadow-2xl z-50 text-sm cursor-pointer">
                        Kembali
                    </button>
                    <div className="bg-[#08265E]/90 backdrop-blur-2xl border border-white/30 rounded-[3rem] p-8 max-w-2xl w-full h-[80vh] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col relative animate-fade-in-up">
                        <div className="overflow-y-auto pr-4 custom-scrollbar-light h-full flex flex-col gap-6">
                            <div className="w-full h-48 lg:h-64 rounded-3xl overflow-hidden border border-white/20 shadow-lg flex-shrink-0 bg-gray-800">
                                <img
                                    src={
                                        selectedNews.img ||
                                        selectedNews.image_url
                                    }
                                    alt="Detail"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="text-white font-bold text-sm lg:text-lg leading-relaxed whitespace-pre-wrap">
                                {selectedNews.content}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 10px; }
                .custom-scrollbar-light::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar-light::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
                .custom-scrollbar-light::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar-light::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 10px; }
                .animate-fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
