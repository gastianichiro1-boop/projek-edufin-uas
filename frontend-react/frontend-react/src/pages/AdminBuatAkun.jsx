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

        setFormData({ ...formData, [name]: finalValue });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/create-student",
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
        } catch (error) {
            console.error("Error dari API:", error.response?.data);
            alert("Gagal menyimpan data! Pastikan NISN belum pernah dipakai.");
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#023474] flex font-sans">
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
                        {/* Input NISN (Sudah kebal dari huruf dan simbol) */}
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
                        <div className="relative w-full">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                placeholder="Password"
                                required
                                onChange={handleChange}
                                // Tambahkan pr-14 agar teks yang diketik tidak menabrak ikon mata
                                className="w-full bg-transparent border border-white rounded-full py-4 pl-8 pr-14 text-white placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:border-2 transition-all"
                            />
                            <div
                                className="absolute inset-y-0 right-0 pr-5 flex items-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                                onClick={() => setShowPassword(!showPassword)}>
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

                        {/* Dropdown untuk Kelas */}
                        <select
                            name="kelas"
                            value={formData.kelas}
                            required
                            onChange={handleChange}
                            className="w-full bg-transparent border border-white rounded-full py-4 px-8 text-white focus:outline-none focus:border-blue-400 focus:border-2 transition-all appearance-none cursor-pointer">
                            <option value="" disabled className="text-black">
                                Pilih Kelas
                            </option>
                            <option value="X" className="text-black">
                                Kelas X
                            </option>
                            <option value="XI" className="text-black">
                                Kelas XI
                            </option>
                            <option value="XII" className="text-black">
                                Kelas XII
                            </option>
                        </select>

                        {/* Dropdown untuk Jurusan */}
                        <select
                            name="jurusan"
                            value={formData.jurusan}
                            required
                            onChange={handleChange}
                            className="w-full bg-transparent border border-white rounded-full py-4 px-8 text-white focus:outline-none focus:border-blue-400 focus:border-2 transition-all appearance-none cursor-pointer">
                            <option value="" disabled className="text-black">
                                Pilih Jurusan
                            </option>
                            <option value="FI" className="text-black">
                                FI
                            </option>
                            <option value="TKI" className="text-black">
                                TKI
                            </option>
                        </select>

                        {/* Input Nama Lengkap (Sudah kebal dari angka dan simbol) */}
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
                            className="mt-6 mx-auto bg-[#B3B6C2] hover:bg-white text-black font-bold py-3 px-14 rounded-full shadow-lg transition-colors text-lg">
                            Konfirmasi
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
