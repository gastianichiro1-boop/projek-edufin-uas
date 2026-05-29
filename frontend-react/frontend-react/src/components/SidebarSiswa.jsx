import { useNavigate } from "react-router-dom";

export default function SidebarSiswa({ activeMenu }) {
    const navigate = useNavigate();

    const menuItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
            path: "/user",
        },
        {
            id: "dompet",
            label: "Dompet",
            icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
            path: "/user/dompet",
        },
        {
            id: "tagihan",
            label: "Tagihan",
            icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
            path: "/user/tagihan",
        },
        {
            id: "cs",
            label: "Costumer Service",
            icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
            path: "/user/cs",
        },
        {
            id: "donasi",
            label: "Donasi",
            icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
            path: "/user/donasi",
        },
    ];

    const handleLogout = () => {
        // Logika logout bisa ditambahkan di sini nanti (menghapus token/session)
        navigate("/login");
    };

    return (
        // PERBAIKAN 1: Tambahkan h-screen agar sidebar selalu setinggi layar penuh
        <aside className="w-72 bg-[#051A3F] border-r border-white/10 flex flex-col h-screen relative z-20 shadow-2xl">
            {/* Header / Logo */}
            <div className="p-8 flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-full overflow-hidden bg-white/10">
                    <img
                        src="/images/logosmk.png"
                        alt="Logo SMK"
                        className="w-full h-full object-contain"
                    />
                </div>

                <div className="text-white font-bold leading-tight">
                    <p className="text-sm">SMK PUTRA</p>
                    <p className="text-sm">INDONESIA</p>
                    <p className="text-sm">MALANG</p>
                </div>
            </div>

            <div className="mx-8 border-b border-white/20 mb-6"></div>

            {/* Menu List */}
            {/* PERBAIKAN 2: flex-1 memastikan bagian menu ini akan mengisi SELURUH sisa ruang kosong yang ada, mendorong elemen di bawahnya ke paling ujung */}
            <div className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto">
                <p className="px-4 text-white font-bold text-lg mb-2">Menu</p>
                {menuItems.map((menu) => (
                    <button
                        key={menu.id}
                        onClick={() => navigate(menu.path)}
                        className={`flex items-center gap-4 px-6 py-4 rounded-3xl transition-all duration-300 w-full text-left ${
                            activeMenu === menu.id
                                ? "bg-white/10 border border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-md"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}>
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={menu.icon}
                            />
                        </svg>
                        <span className="font-medium text-lg">
                            {menu.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* PERBAIKAN 3: mt-auto memastikan garis pembatas dan tombol Log Out selalu ditarik paksa ke paling bawah layar */}
            <div className="mt-auto">
                <div className="mx-8 border-t border-white/20 mt-4 mb-4"></div>

                {/* Log Out */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 px-10 py-8 text-gray-400 hover:text-white transition-colors w-full text-left mb-4">
                    <svg
                        className="w-6 h-6 font-bold"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                    </svg>
                    <span className="font-bold text-lg">Log Out</span>
                </button>
            </div>
        </aside>
    );
}
