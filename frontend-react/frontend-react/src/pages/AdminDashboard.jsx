import { useState, useEffect } from "react";
import axios from "axios";
import SidebarAdmin from "../components/SidebarAdmin";

export default function AdminDashboard() {
    const [students, setStudents] = useState([]);
    const [activeJurusan, setActiveJurusan] = useState("FI");
    const [activeKelas, setActiveKelas] = useState("X");

    // State untuk Interaksi UI Baru
    const [isActionOpen, setIsActionOpen] = useState(false); // Membuka sub-bar action
    const [actionMode, setActionMode] = useState("none"); // 'none', 'delete', atau 'edit'

    // State untuk Pop-up Modals
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null); // Menyimpan data siswa yang dipilih

    // Menarik data dari Laravel
    const fetchStudents = async () => {
        try {
            const response = await axios.get(
                "http://127.0.0.1:8000/api/students",
            );
            setStudents(response.data);
        } catch (error) {
            console.error("Gagal mengambil data:", error);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // Filter Data
    const filteredStudents = students.filter(
        (student) =>
            student.jurusan?.toUpperCase() === activeJurusan.toUpperCase() &&
            student.kelas?.toUpperCase() === activeKelas.toUpperCase(),
    );

    // ================= LOGIKA KLIK GANDA (DOUBLE CLICK) =================
    const handleDoubleClickCancel = () => {
        setIsActionOpen(false);
        setActionMode("none");
        setShowDeleteModal(false);
        setShowEditModal(false);
        setSelectedStudent(null);
    };

    // ================= LOGIKA HAPUS (DELETE) =================
    const confirmDelete = async () => {
        if (!selectedStudent) return;
        try {
            await axios.delete(
                `http://127.0.0.1:8000/api/students/${selectedStudent.id}`,
            );
            fetchStudents(); // Refresh data
            handleDoubleClickCancel(); // Tutup semua pop-up
        } catch (error) {
            alert("Gagal menghapus data!");
        }
    };

    // ================= LOGIKA UBAH (EDIT) =================
    const handleEditChange = (e) => {
        setSelectedStudent({
            ...selectedStudent,
            [e.target.name]: e.target.value,
        });
    };

    const confirmEdit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `http://127.0.0.1:8000/api/students/${selectedStudent.id}`,
                selectedStudent,
            );
            fetchStudents(); // Refresh data
            handleDoubleClickCancel(); // Tutup semua pop-up
            alert(
                "Data berhasil diperbarui! Siswa sekarang bisa login pakai NISN baru.",
            );
        } catch (error) {
            alert(
                "Gagal mengubah data! Pastikan NISN tidak bentrok dengan siswa lain.",
            );
        }
    };

    return (
        // Event onDoubleClick dipasang di pembungkus paling luar agar bisa diklik di mana saja
        <div
            className="min-h-screen w-full bg-[#023474] flex font-sans"
            onDoubleClick={handleDoubleClickCancel}>
            <SidebarAdmin activeMenu="data-siswa" />

            <main className="flex-1 p-8 flex flex-col relative overflow-hidden">
                {/* Top Actions */}
                <div className="flex justify-between items-center mb-8">
                    <div className="relative w-96">
                        <input
                            type="text"
                            placeholder="Cari Berdasarkan Nama / NISN"
                            className="w-full bg-[#4E5364] text-white placeholder-gray-300 rounded-full py-3 px-6 pr-12 outline-none border-none focus:ring-2 focus:ring-blue-400"
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

                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveJurusan("FI")}
                            className={`font-bold py-3 px-8 rounded-3xl transition-colors ${activeJurusan === "FI" ? "bg-[#4E5364] text-white" : "bg-[#1C2031] text-gray-400"}`}>
                            FI
                        </button>
                        <button
                            onClick={() => setActiveJurusan("TKI")}
                            className={`font-bold py-3 px-8 rounded-3xl transition-colors ${activeJurusan === "TKI" ? "bg-[#4E5364] text-white" : "bg-[#1C2031] text-gray-400"}`}>
                            TKI
                        </button>
                    </div>
                </div>

                {/* Tabel Konten */}
                <div className="bg-[#282C3E] rounded-3xl flex-1 border border-white/5 shadow-2xl overflow-hidden flex flex-col">
                    <div className="px-8 py-6 flex-1">
                        <table className="w-full text-left text-white">
                            <thead>
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
                                    <th className="py-4 text-right">
                                        <div className="bg-[#1C2031] inline-block px-3 py-2 rounded-lg text-xs font-bold text-center leading-tight">
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
                                            <td className="py-6 text-right">
                                                {/* Munculkan tombol aksi di tabel sesuai mode yang dipilih di pojok kanan bawah */}
                                                <div
                                                    className={`transition-opacity duration-300 ${actionMode !== "none" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                                                    {actionMode ===
                                                        "delete" && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedStudent(
                                                                    student,
                                                                );
                                                                setShowDeleteModal(
                                                                    true,
                                                                );
                                                            }}
                                                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-5 rounded-full text-sm shadow-lg transition-transform hover:scale-105">
                                                            HAPUS
                                                        </button>
                                                    )}
                                                    {actionMode === "edit" && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedStudent(
                                                                    {
                                                                        ...student,
                                                                        password:
                                                                            "",
                                                                    },
                                                                ); // Set password kosong untuk jaga-jaga
                                                                setShowEditModal(
                                                                    true,
                                                                );
                                                            }}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-5 rounded-full text-sm shadow-lg transition-transform hover:scale-105">
                                                            EDIT
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="py-12 text-center text-gray-400 italic">
                                            Belum ada data siswa untuk Jurusan{" "}
                                            {activeJurusan} Kelas {activeKelas}.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bottom Menu & Floating Actions */}
                <div className="mt-8 flex justify-between items-end relative">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveKelas("X")}
                            className={`font-bold py-3 px-8 rounded-3xl transition-colors ${activeKelas === "X" ? "bg-[#4E5364] text-white" : "bg-[#1C2031] text-gray-400"}`}>
                            Kelas X
                        </button>
                        <button
                            onClick={() => setActiveKelas("XI")}
                            className={`font-bold py-3 px-8 rounded-3xl transition-colors ${activeKelas === "XI" ? "bg-[#4E5364] text-white" : "bg-[#1C2031] text-gray-400"}`}>
                            Kelas XI
                        </button>
                        <button
                            onClick={() => setActiveKelas("XII")}
                            className={`font-bold py-3 px-8 rounded-3xl transition-colors ${activeKelas === "XII" ? "bg-[#4E5364] text-white" : "bg-[#1C2031] text-gray-400"}`}>
                            Kelas XII
                        </button>
                    </div>

                    {/* Area Floating Action Buttons */}
                    <div className="flex items-center gap-3">
                        {/* Sub-bar Aksi (Tersembunyi sampai Pensil Besar diklik) */}
                        <div
                            className={`flex items-center gap-3 transition-all duration-500 ease-out ${isActionOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10 pointer-events-none"}`}>
                            {/* Tombol Hapus (Merah) */}
                            <button
                                onClick={() => setActionMode("delete")}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-lg ${actionMode === "delete" ? "bg-red-600/30 border-2 border-red-500" : "bg-[#1C2031] hover:bg-red-600/20"}`}>
                                <svg
                                    className="w-5 h-5 text-red-500"
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

                            {/* Tombol Edit (Biru) */}
                            <button
                                onClick={() => setActionMode("edit")}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-lg ${actionMode === "edit" ? "bg-blue-600/30 border-2 border-blue-500" : "bg-[#1C2031] hover:bg-blue-600/20"}`}>
                                <svg
                                    className="w-5 h-5 text-blue-400"
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
                        </div>

                        {/* Tombol Pensil Besar Utama */}
                        <button
                            onClick={() => {
                                setIsActionOpen(!isActionOpen);
                                if (isActionOpen) setActionMode("none"); // Reset mode jika sub-bar ditutup
                            }}
                            className="w-14 h-14 bg-[#1E2235] border-2 border-white rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform z-10">
                            {isActionOpen ? (
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </main>

            {/* ================= MODAL HAPUS (Sesuai Foto 2) ================= */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity"
                    onDoubleClick={handleDoubleClickCancel}>
                    <div
                        className="bg-[#282C3E] rounded-[3rem] p-12 max-w-lg w-full shadow-2xl flex flex-col items-center text-center border border-white/10"
                        onDoubleClick={(e) => e.stopPropagation()}>
                        <h2 className="text-white font-bold mb-8 uppercase tracking-wide text-lg leading-relaxed">
                            Tindakan ini akan mengapus
                            <br />
                            seluruh data akun, apakah anda yakin ?
                        </h2>
                        <button
                            onClick={confirmDelete}
                            className="bg-[#FF0000] hover:bg-red-700 text-white font-bold py-3 px-16 rounded-full shadow-[0_0_15px_rgba(255,0,0,0.5)] transition-all transform hover:scale-105">
                            KONFIRMASI
                        </button>
                        <p className="text-gray-400 mt-6 text-sm font-medium">
                            *(Klik dua kali di luar area ini untuk Batal)
                        </p>
                    </div>
                </div>
            )}

            {/* ================= MODAL UBAH / EDIT ================= */}
            {showEditModal && selectedStudent && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity"
                    onDoubleClick={handleDoubleClickCancel}>
                    <div
                        className="bg-[#282C3E] rounded-[3rem] p-10 max-w-xl w-full shadow-2xl border border-white/10"
                        onDoubleClick={(e) => e.stopPropagation()}>
                        <h2 className="text-white text-2xl font-bold mb-8 text-center uppercase tracking-wide">
                            Edit Data Siswa
                        </h2>

                        <form
                            onSubmit={confirmEdit}
                            className="flex flex-col gap-4">
                            <input
                                type="text"
                                name="nama_lengkap"
                                value={selectedStudent.nama_lengkap}
                                onChange={handleEditChange}
                                required
                                placeholder="Nama Lengkap"
                                className="w-full bg-transparent border border-white/30 rounded-full py-3 px-6 text-white focus:outline-none focus:border-blue-400"
                            />
                            <input
                                type="text"
                                name="nisn"
                                value={selectedStudent.nisn}
                                onChange={handleEditChange}
                                required
                                placeholder="NISN"
                                className="w-full bg-transparent border border-white/30 rounded-full py-3 px-6 text-white focus:outline-none focus:border-blue-400"
                            />
                            <input
                                type="password"
                                name="password"
                                value={selectedStudent.password || ""}
                                onChange={handleEditChange}
                                placeholder="Password Baru (Kosongkan jika tidak diubah)"
                                className="w-full bg-transparent border border-white/30 rounded-full py-3 px-6 text-white focus:outline-none focus:border-blue-400"
                            />

                            <div className="flex gap-4">
                                <select
                                    name="kelas"
                                    value={selectedStudent.kelas}
                                    onChange={handleEditChange}
                                    className="w-1/2 bg-transparent border border-white/30 rounded-full py-3 px-6 text-white focus:outline-none focus:border-blue-400 appearance-none">
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
                                <select
                                    name="jurusan"
                                    value={selectedStudent.jurusan}
                                    onChange={handleEditChange}
                                    className="w-1/2 bg-transparent border border-white/30 rounded-full py-3 px-6 text-white focus:outline-none focus:border-blue-400 appearance-none">
                                    <option value="FI" className="text-black">
                                        FI
                                    </option>
                                    <option value="TKI" className="text-black">
                                        TKI
                                    </option>
                                </select>
                            </div>

                            <div className="mt-6 flex gap-4 justify-center">
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-full shadow-lg transition-transform hover:scale-105">
                                    SIMPAN
                                </button>
                            </div>
                            <p className="text-gray-400 mt-2 text-center text-sm">
                                *(Klik dua kali di luar area ini untuk Batal)
                            </p>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
