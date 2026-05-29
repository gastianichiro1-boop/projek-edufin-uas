import { useState, useEffect, useRef } from "react";
import SidebarSiswa from "../components/SidebarSiswa";

export default function StudentCS() {
    const bottomRef = useRef(null);

    // Opsi Level 1 (Menu Utama)
    const initialOptions = [
        "Kendala Isi Saldo",
        "Kendala Pembayaran Tagihan",
        "Kendala Dengan PIN",
    ];

    // State Chat
    const [messages, setMessages] = useState([
        { id: 1, sender: "cs", type: "options", content: initialOptions },
    ]);
    const [isTyping, setIsTyping] = useState(false);

    // Fungsi Auto-Scroll ke bawah setiap kali ada pesan baru
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Logika Pemrosesan Bot CS
    const handleOptionClick = (optionText) => {
        const newUserMsg = {
            id: Date.now(),
            sender: "user",
            type: "text",
            content: optionText,
        };
        setMessages((prev) => [...prev, newUserMsg]);
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
            let nextResponse = null;

            if (optionText === "Kendala Isi Saldo") {
                nextResponse = {
                    id: Date.now(),
                    sender: "cs",
                    type: "options",
                    content: [
                        "Sudah Isi Saldo Namun Saldo Belum Terisi",
                        "Metode Pembayaran E-Wallet/Bank Error",
                    ],
                };
            } else if (optionText === "Kendala Pembayaran Tagihan") {
                nextResponse = {
                    id: Date.now(),
                    sender: "cs",
                    type: "options",
                    content: [
                        "Tombol Bayar Tidak Bisa Diklik",
                        "Saldo Terpotong Tapi Tagihan Belum Lunas",
                    ],
                };
            } else if (optionText === "Kendala Dengan PIN") {
                nextResponse = {
                    id: Date.now(),
                    sender: "cs",
                    type: "options",
                    content: [
                        "Lupa PIN Pembayaran",
                        "PIN Terblokir Karena Salah 3x",
                    ],
                };
            } else if (
                optionText === "Sudah Isi Saldo Namun Saldo Belum Terisi"
            ) {
                nextResponse = {
                    id: Date.now(),
                    sender: "cs",
                    type: "text",
                    isSolution: true,
                    content:
                        "Solusi Untuk Anda :\n1. Lakukan Refresh Web Pada Browser\n2. Hubungi Staff TU Melalui WhatsApp",
                };
            } else if (optionText === "Metode Pembayaran E-Wallet/Bank Error") {
                nextResponse = {
                    id: Date.now(),
                    sender: "cs",
                    type: "text",
                    isSolution: true,
                    content:
                        "Solusi Untuk Anda :\n1. Pastikan aplikasi E-Wallet Anda tidak sedang gangguan.\n2. Coba gunakan metode transfer bank lain yang tersedia.",
                };
            } else if (optionText === "Tombol Bayar Tidak Bisa Diklik") {
                nextResponse = {
                    id: Date.now(),
                    sender: "cs",
                    type: "text",
                    isSolution: true,
                    content:
                        "Solusi Untuk Anda :\n1. Pastikan Saldo Dompet Anda mencukupi nominal tagihan.\n2. Jika saldo cukup namun masih error, silakan log out lalu login kembali.",
                };
            } else if (
                optionText === "Saldo Terpotong Tapi Tagihan Belum Lunas"
            ) {
                nextResponse = {
                    id: Date.now(),
                    sender: "cs",
                    type: "text",
                    isSolution: true,
                    content:
                        "Solusi Untuk Anda :\n1. Jangan melakukan pembayaran ulang!\n2. Segera tangkap layar (screenshot) histori transaksi dan kirimkan ke Staff TU untuk verifikasi manual.",
                };
            } else if (optionText === "Lupa PIN Pembayaran") {
                nextResponse = {
                    id: Date.now(),
                    sender: "cs",
                    type: "text",
                    isSolution: true,
                    content:
                        "Solusi Untuk Anda :\n1. Fitur reset PIN mandiri sedang dalam pengembangan.\n2. Silakan hubungi Admin Sekolah untuk melakukan Reset PIN.",
                };
            } else if (optionText === "PIN Terblokir Karena Salah 3x") {
                nextResponse = {
                    id: Date.now(),
                    sender: "cs",
                    type: "text",
                    isSolution: true,
                    content:
                        "Solusi Untuk Anda :\nSistem keamanan kami telah mengunci akun Anda sementara. Silakan temui Staff Tata Usaha (TU) membawa Kartu Pelajar untuk membuka blokir.",
                };
            }

            if (nextResponse) {
                setMessages((prev) => [...prev, nextResponse]);

                if (nextResponse.isSolution) {
                    setTimeout(() => {
                        setMessages((prev) => [
                            ...prev,
                            {
                                id: Date.now() + 1,
                                sender: "cs",
                                type: "options",
                                content: initialOptions,
                            },
                        ]);
                    }, 2000);
                }
            }
        }, 800);
    };

    return (
        <div className="min-h-[100dvh] w-full bg-[#051125] flex font-sans overflow-hidden">
            <SidebarSiswa activeMenu="cs" />

            {/* MAIN CONTENT AREA */}
            {/* Ditambahkan padding atas ekstra agar ada ruang untuk 'topi/notch' */}
            <main className="flex-1 flex flex-col relative z-10 h-[100dvh] p-4 lg:p-10 pt-20 lg:pt-24">
                {/* WADAH UTAMA KACA */}
                <div className="flex-1 bg-[#0B2559]/30 backdrop-blur-2xl border border-white/10 rounded-[2rem] lg:rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col relative min-h-0">
                    {/* ORNAMEN KEPALA (NOTCH) CS - Diperbaiki Posisinya! */}
                    {/* Menggunakan tinggi penuh di atas border (-top-12 atau -top-16) sehingga duduk manis di atas garis kotak */}
                    <div className="absolute -top-12 lg:-top-16 left-1/2 transform -translate-x-1/2 w-32 lg:w-48 h-12 lg:h-16 bg-[#082753] backdrop-blur-xl border-t border-l border-r border-white/10 rounded-t-[1.5rem] lg:rounded-t-[2rem] z-20 flex items-center justify-center shadow-[0_-5px_20px_rgba(0,0,0,0.2)]">
                        {/* IKON CS SIMPLE DAN ELEGAN */}
                        <svg
                            className="w-6 h-6 lg:w-8 lg:h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round">
                            <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                        </svg>
                    </div>

                    {/* RUANG CHAT (SCROLLABLE) */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 lg:px-10 flex flex-col gap-6 pt-10 lg:pt-12 pb-6 mt-2">
                        {messages.map((msg, index) => (
                            <div
                                key={msg.id}
                                className={`flex w-full animate-fade-in-up ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                style={{ animationDelay: `${index * 0.05}s` }}>
                                {/* PESAN DARI CS (Tombol Opsi) */}
                                {msg.sender === "cs" &&
                                    msg.type === "options" && (
                                        <div className="flex flex-col gap-3 max-w-[90%] lg:max-w-[70%]">
                                            {msg.content.map((opt, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() =>
                                                        handleOptionClick(opt)
                                                    }
                                                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold tracking-wide text-xs lg:text-sm py-3 px-6 lg:py-4 lg:px-8 rounded-3xl lg:rounded-full text-left transition-all duration-300 transform hover:translate-x-2 shadow-lg hover:shadow-white/10 outline-none w-fit">
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                {/* PESAN DARI CS (Teks Solusi) */}
                                {msg.sender === "cs" && msg.type === "text" && (
                                    <div className="bg-[#1C4188]/80 backdrop-blur-md border border-blue-400/30 text-white p-4 lg:p-6 rounded-3xl rounded-tl-sm max-w-[90%] lg:max-w-[70%] shadow-lg">
                                        <p className="whitespace-pre-wrap font-medium text-xs lg:text-sm leading-relaxed tracking-wide">
                                            {msg.content}
                                        </p>
                                    </div>
                                )}

                                {/* PESAN DARI USER */}
                                {msg.sender === "user" && (
                                    <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white py-3 px-6 lg:py-4 lg:px-8 rounded-3xl lg:rounded-full shadow-lg max-w-[90%] lg:max-w-[70%]">
                                        <p className="font-semibold text-xs lg:text-sm tracking-wide">
                                            {msg.content}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* ANIMASI TYPING */}
                        {isTyping && (
                            <div className="flex w-full justify-start animate-fade-in">
                                <div className="bg-white/5 border border-white/10 p-3 lg:p-4 rounded-3xl rounded-tl-sm flex gap-2 w-16 lg:w-20 justify-center shadow-md">
                                    <div
                                        className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-white/60 rounded-full animate-bounce"
                                        style={{ animationDelay: "0s" }}></div>
                                    <div
                                        className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-white/60 rounded-full animate-bounce"
                                        style={{
                                            animationDelay: "0.2s",
                                        }}></div>
                                    <div
                                        className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-white/60 rounded-full animate-bounce"
                                        style={{
                                            animationDelay: "0.4s",
                                        }}></div>
                                </div>
                            </div>
                        )}

                        {/* Jangkar Auto Scroll */}
                        <div ref={bottomRef} className="pb-2" />
                    </div>

                    {/* INPUT PALSU (Footer) - Ikon panah dihapus dan teks ditengahkan */}
                    <div className="p-4 lg:p-8 pt-0 mt-auto">
                        <div className="w-full bg-white/5 border border-white/10 rounded-full py-4 px-6 lg:py-5 lg:px-8 text-white/40 font-bold tracking-widest text-xs lg:text-sm flex items-center justify-center cursor-not-allowed shadow-inner transition-colors hover:bg-white/10">
                            <span className="truncate">
                                Pilih Permasalahan Yang Kamu Alami
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                /* Tampilan Scrollbar Khusus */
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { 
                    background: transparent; 
                    margin-top: 20px; 
                    margin-bottom: 20px; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: rgba(255, 255, 255, 0.2); 
                    border-radius: 10px; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
                    background: rgba(255, 255, 255, 0.4); 
                }
                
                .animate-fade-in-up {
                    animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    opacity: 0;
                    transform: translateY(15px);
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                
                @keyframes fadeInUp {
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
