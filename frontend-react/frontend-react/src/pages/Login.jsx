import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    // State untuk menangkap inputan
    const [nisn, setNisn] = useState("");
    const [password, setPassword] = useState("");

    // Fungsi saat tombol Login ditekan
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            // Mengirim request ke Laravel
            const response = await axios.post(
                "http://127.0.0.1:8000/api/edufin-login",
                {
                    nisn: nisn,
                    password: password,
                },
            );

            // Cek role yang login
            const userRole =
                response.data?.data?.role?.toLowerCase() ||
                response.data?.role?.toLowerCase();

            if (userRole === "admin") {
                navigate("/admin");
            } else if (userRole === "student") {
                // Menyimpan data siswa ke memori browser
                localStorage.setItem(
                    "student_data",
                    JSON.stringify(response.data.data),
                );

                navigate("/user");
            } else {
                alert(
                    "Terhubung ke server, tapi role tidak dikenali. Cek isi datanya: " +
                        JSON.stringify(response.data),
                );
            }
        } catch (error) {
            alert(
                "Gagal Login: " +
                    (error.response?.data?.message ||
                        "Terjadi kesalahan sistem atau server mati"),
            );
        }
    };

    return (
        // PERBAIKAN 1: Gunakan min-h-[100dvh] agar aman dari address bar browser HP
        <div className="min-h-[100dvh] flex items-center justify-center bg-[#0B1220] p-4 sm:p-6 font-sans">
            {/* PERBAIKAN 2: Padding dan rounding dikecilkan di HP (p-6), normal di laptop (sm:p-10) */}
            <div className="bg-[#1C2333] w-full max-w-md rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 flex flex-col items-center shadow-2xl border border-gray-800/50">
                {/* Logo */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 mb-4">
                    <div className="w-full h-full bg-[#2D60FF] rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-3xl sm:text-4xl">
                            E
                        </span>
                    </div>
                </div>

                {/* Judul EDUFIN */}
                <h1 className="text-white text-xl sm:text-2xl font-bold tracking-widest mb-8 sm:mb-10 uppercase">
                    EDUFIN
                </h1>

                <form onSubmit={handleLogin} className="w-full">
                    {/* Input NISN */}
                    <div className="relative mb-4 sm:mb-5">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg
                                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="NISN"
                            value={nisn}
                            onChange={(e) => setNisn(e.target.value)}
                            // PERBAIKAN 3: Text input lebih kecil di HP (text-sm), padding dikurangi sedikit
                            className="w-full bg-transparent border-2 border-white/90 text-white rounded-full py-3 sm:py-3.5 pl-11 sm:pl-12 pr-4 text-sm sm:text-base focus:outline-none focus:border-[#4285F4] transition-colors placeholder-white/80 font-medium"
                            required
                        />
                    </div>

                    {/* Input Password */}
                    <div className="relative mb-5">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg
                                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent border-2 border-white/90 text-white rounded-full py-3 sm:py-3.5 pl-11 sm:pl-12 pr-12 text-sm sm:text-base focus:outline-none focus:border-[#4285F4] transition-colors placeholder-white/80 font-medium"
                            required
                        />
                        <div
                            className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                            onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? (
                                <svg
                                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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
                                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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

                    <button
                        type="submit"
                        className="w-full bg-[#4285F4] hover:bg-[#2b6ce0] text-white font-bold py-3 sm:py-3.5 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 mt-6 sm:mt-8 text-sm sm:text-base">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
