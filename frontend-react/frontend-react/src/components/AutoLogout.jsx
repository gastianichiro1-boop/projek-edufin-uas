import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AutoLogout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const timeoutRef = useRef(null);

    // Waktu maksimal tidak aktif: 5 Menit (5 * 60 * 1000 milidetik)
    const INACTIVITY_TIME = 5 * 60 * 1000;

    const handleLogout = () => {
        // 1. Bersihkan semua kunci sesi di memori lokal
        localStorage.removeItem("student_data");
        localStorage.removeItem("admin_data");
        localStorage.removeItem("role");

        // 2. Beri peringatan dan tendang ke halaman login
        alert(
            "Sesi Anda telah habis karena tidak ada aktivitas selama 5 menit. Silakan login kembali demi keamanan.",
        );
        navigate("/login");
    };

    const resetTimer = () => {
        // Hapus timer lama
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Jangan jalankan timer hitung mundur jika pengguna sedang berada di halaman login
        if (location.pathname === "/login" || location.pathname === "/") {
            return;
        }

        // Mulai hitung mundur 5 menit yang baru
        timeoutRef.current = setTimeout(handleLogout, INACTIVITY_TIME);
    };

    useEffect(() => {
        // Daftar aktivitas fisik yang dianggap sebagai "Interaksi"
        const events = [
            "mousemove",
            "mousedown",
            "keypress",
            "scroll",
            "touchstart",
        ];

        // Pasang pendeteksi ke seluruh layar web
        events.forEach((event) => {
            window.addEventListener(event, resetTimer);
        });

        // Jalankan timer pertama kali saat komponen dimuat
        resetTimer();

        // Bersihkan memori saat pengguna keluar
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach((event) => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [location.pathname]); // Timer juga di-reset setiap kali pindah halaman

    return null; // Robot ini tidak memiliki wujud visual (invisible)
};

export default AutoLogout;
