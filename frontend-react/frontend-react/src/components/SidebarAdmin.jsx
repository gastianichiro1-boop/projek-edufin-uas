import { useNavigate } from "react-router-dom";

export default function SidebarAdmin({ activeMenu }) {
    const navigate = useNavigate();

    // Fungsi kecil untuk menentukan gaya tombol (menyala jika aktif, redup jika tidak)
    const getMenuClass = (menuName) => {
        return activeMenu === menuName
            ? "flex items-center gap-4 bg-[#3B415A] text-white p-4 rounded-r-3xl w-[90%] transition-colors"
            : "flex items-center gap-4 text-gray-400 hover:bg-[#3B415A]/50 p-4 rounded-r-3xl w-[90%] transition-colors";
    };

    return (
        <aside className="w-72 bg-[#1E2235] flex flex-col border-r border-[#1E2235] text-white shrink-0">
            {/* Header Brand */}
            <div className="flex items-center gap-3 px-8 mt-8 mb-10">
                <div className="w-8 h-8 bg-[#2D60FF] rounded flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">E</span>
                </div>
                <span className="text-white font-bold text-xl tracking-widest uppercase">
                    EDUFIN
                </span>
            </div>

            {/* Profile Section */}
            <div className="px-6 mb-8">
                <h3 className="text-white font-bold mb-4 ml-2">Profile</h3>
                <div className="border border-white/20 rounded-2xl p-4 flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center">
                        <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold">Admin</span>
                        <span className="text-[10px] text-gray-300">
                            Nadya Fistana
                        </span>
                    </div>
                </div>
                {/* Tombol Log Out yang sudah dihidupkan */}
                <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-3 text-gray-300 ml-2 hover:text-white transition-colors">
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                    </svg>
                    <span className="font-semibold text-sm">Log Out</span>
                </button>
            </div>

            {/* Garis Pemisah */}
            <div className="h-px bg-white/10 mx-6 mb-6"></div>

            {/* Menu Section */}
            <div className="px-2 flex-1">
                <h3 className="text-white font-bold mb-4 ml-6">Menu</h3>
                <nav className="flex flex-col gap-2">
                    <button
                        onClick={() => navigate("/admin")}
                        className={getMenuClass("data-siswa")}>
                        <div className="ml-2 w-6 h-6">
                            <svg
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                        <span className="font-semibold text-sm text-left leading-tight">
                            Kelola Data
                            <br />
                            Siswa
                        </span>
                    </button>

                    <button
                        onClick={() => navigate("/admin/tagihan")}
                        className={getMenuClass("tagihan")}>
                        <div className="ml-2 w-6 h-6">
                            <svg
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <span className="font-semibold text-sm text-left leading-tight">
                            Kelola Tagihan
                            <br />
                            Siswa
                        </span>
                    </button>

                    <button
                        onClick={() => navigate("/admin/buat-akun")}
                        className={getMenuClass("buat-akun")}>
                        <div className="ml-2 w-6 h-6">
                            <svg
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                        <span className="font-semibold text-sm text-left leading-tight">
                            Pembuatan Akun
                            <br />
                            Siswa
                        </span>
                    </button>
                </nav>
            </div>
        </aside>
    );
}
