import { useState } from "react";
import axios from "axios";
import SidebarAdmin from "../components/SidebarAdmin";

export default function AdminBuatAkun() {
    const [formData, setFormData] = useState({
        nisn: "",
        password: "",
        kelas: "",
        jurusan: "",
        nama_lengkap: "",
    });

    // State baru untuk fitur hide/show password
    const [showPassword, setShowPassword] = useState(false);

    // State error password
    const [passwordError, setPasswordError] = useState("");

    // ==========================================
    // STATE PENGENDALI DROPDOWN KUSTOM MODERN
    // ==========================================
    const [openDropdown, setOpenDropdown] = useState(null);

    // Fungsi canggih untuk menangkap dan memvalidasi ketikan secara real-time
    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;

        // 1. Validasi NISN: Hanya izinkan Angka (0-9)
        if (name === "nisn") {
            finalValue = value.replace(/[^0-9]/g, "");
        }
        // 2. Validasi Nama Lengkap: Hanya izinkan Huruf (a-z, A-Z) dan Spasi
        else if (name === "nama_lengkap") {
            finalValue = value.replace(/[^a-zA-Z\s]/g, "");
        }

        // Menghilangkan pesan error saat user mengetik
        if (name === "password") {
            setPasswordError("");
        }

        setFormData({ ...formData, [name]: finalValue });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi ekstra mencegah dropdown kosong
        if (!formData.kelas || !formData.jurusan) {
            alert("Pilih Kelas dan Jurusan terlebih dahulu!");
            return;
        }

        // ==========================================
        // PERBAIKAN: Validasi Minimal 8 Karakter Password
        // ==========================================
        if (formData.password.length < 8) {
            setPasswordError("Password harus minimal 8 karakter!");
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/create-student`,
                formData,
            );

            alert("Berhasil! " + response.data.message);

            // Kosongkan form kembali setelah sukses
            setFormData({
                nisn: "",
                password: "",
                kelas: "",
                jurusan: "",
                nama_lengkap: "",
            });
            setPasswordError("");
        } catch (error) {
            console.error("Error dari API:", error.response?.data);
            alert("Gagal menyimpan data! Pastikan NISN belum pernah dipakai.");
        }
    };

    // =========================================================================
    // KOMPONEN: DROPDOWN MODERN GLASSMORPHISM
    // =========================================================================
    const renderCustomSelect = (
        name,
        value,
        placeholder,
        options,
        stateHandler,
    ) => {
        const isOpen = openDropdown === name;
        const selected = options.find((o) => o.value === value);

        return (
            <div className="relative w-full">
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(isOpen ? null : name);
                    }}
                    className={`w-full bg-transparent border rounded-full py-4 px-8 cursor-pointer flex justify-between items-center transition-all ${
                        isOpen
                            ? "border-blue-400 border-2"
                            : "border-white hover:border-blue-200"
                    }`}>
                    <span className={value ? "text-white" : "text-gray-300"}>
                        {selected ? selected.label : placeholder}
                    </span>
                    <svg
                        className={`w-5 h-5 transition-transform duration-300 ${
                            isOpen ? "rotate-180 text-blue-400" : "text-white"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>

                {isOpen && (
                    <>
                        {/* Pelindung layar untuk menutup menu jika diklik di luar */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdown(null);
                            }}></div>

                        {/* Kotak Pilihan Menu */}
                        <div className="absolute top-[110%] left-0 right-0 bg-[#1A1E2D] border border-white/20 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] overflow-hidden z-50 animate-fade-in-up py-2">
                            {options.map((opt) => (
                                <div
                                    key={opt.value}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        stateHandler({
                                            target: { name, value: opt.value },
                                        });
                                        setOpenDropdown(null);
                                    }}
                                    className={`px-8 py-4 cursor-pointer transition-colors ${
                                        value === opt.value
                                            ? "bg-blue-600/30 text-blue-400 font-bold border-l-4 border-blue-400"
                                            : "text-gray-300 hover:bg-white/10 hover:text-white border-l-4 border-transparent"
                                    }`}>
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    // Data Pilihan Dropdown
    const kelasOptions = [
        { value: "X", label: "Kelas X" },
        { value: "XI", label: "Kelas XI" },
        { value: "XII", label: "Kelas XII" },
    ];

    const jurusanOptions = [
        { value: "FI", label: "FI" },
        { value: "TKI", label: "TKI" },
    ];

    return (
        <div
            className="min-h-screen w-full bg-[#023474] flex font-sans"
            onClick={() => setOpenDropdown(null)} // Tutup dropdown jika area kosong diklik
        >
            <SidebarAdmin activeMenu="buat-akun" />

            <main className="flex-1 p-8 flex items-center justify-center relative overflow-hidden">
                <div className="w-full max-w-2xl bg-[#282C3E] rounded-[3rem] shadow-2xl flex flex-col">
                    <div className="bg-[#B3B6C2] rounded-t-[3rem] rounded-b-3xl p-10 flex items-center justify-center gap-6">
                        <div className="text-black">
                            <svg
                                className="w-20 h-20"
                                viewBox="0 0 24 24"
                                fill="currentColor">
                                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z" />
                            </svg>
                        </div>
                        <h1 className="text-black text-3xl font-medium leading-tight">
                            Create An Account
                            <br />
                            For Students
                        </h1>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="p-12 flex flex-col gap-5">
                        {/* Input NISN */}
                        <input
                            type="text"
                            name="nisn"
                            value={formData.nisn}
                            placeholder="NISN"
                            required
                            onChange={handleChange}
                            className="w-full bg-transparent border border-white rounded-full py-4 px-8 text-white placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:border-2 transition-all"
                        />

                        {/* Input Password dengan Icon Show/Hide */}
                        <div className="flex flex-col gap-1 w-full">
                            <div className="relative w-full">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    placeholder="Password"
                                    required
                                    onChange={handleChange}
                                    className={`w-full bg-transparent border rounded-full py-4 pl-8 pr-14 text-white placeholder-gray-300 focus:outline-none focus:border-2 transition-all ${
                                        passwordError
                                            ? "border-red-500 focus:border-red-500"
                                            : "border-white focus:border-blue-400"
                                    }`}
                                />
                                <div
                                    className="absolute inset-y-0 right-0 pr-5 flex items-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }>
                                    {showPassword ? (
                                        <svg
                                            className="w-6 h-6 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            className="w-6 h-6 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                            />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            {passwordError && (
                                <p className="text-red-400 font-bold text-xs tracking-widest pl-4 mt-1">
                                    {passwordError}
                                </p>
                            )}
                        </div>

                        {/* Dropdown Kelas (Smart Custom Select) */}
                        <div className="relative z-[52]">
                            {renderCustomSelect(
                                "kelas",
                                formData.kelas,
                                "Pilih Kelas",
                                kelasOptions,
                                handleChange,
                            )}
                        </div>

                        {/* Dropdown Jurusan (Smart Custom Select) */}
                        <div className="relative z-[51]">
                            {renderCustomSelect(
                                "jurusan",
                                formData.jurusan,
                                "Pilih Jurusan",
                                jurusanOptions,
                                handleChange,
                            )}
                        </div>

                        {/* Input Nama Lengkap */}
                        <input
                            type="text"
                            name="nama_lengkap"
                            value={formData.nama_lengkap}
                            placeholder="Nama Lengkap"
                            required
                            onChange={handleChange}
                            className="w-full bg-transparent border border-white rounded-full py-4 px-8 text-white placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:border-2 transition-all"
                        />

                        <button
                            type="submit"
                            className="mt-6 mx-auto bg-[#B3B6C2] hover:bg-white text-black font-bold py-3 px-14 rounded-full shadow-lg transition-colors text-lg outline-none">
                            Konfirmasi
                        </button>
                    </form>
                </div>
            </main>

            <style>{`
                .animate-fade-in-up { animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(15px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
