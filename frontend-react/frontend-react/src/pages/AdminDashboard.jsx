import { useState, useEffect } from "react";
import axios from "axios";
import SidebarAdmin from "../components/SidebarAdmin";

export default function AdminDashboard() {
    const [students, setStudents] = useState([]);
    const [activeJurusan, setActiveJurusan] = useState("FI");
    const [activeKelas, setActiveKelas] = useState("X");
    const [searchTerm, setSearchTerm] = useState("");

    // State untuk Interaksi UI Baru
    const [isActionOpen, setIsActionOpen] = useState(false);
    const [actionMode, setActionMode] = useState("none");

    // State untuk Pop-up Modals
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // State untuk Pop-up Buka Kunci
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [studentToUnlock, setStudentToUnlock] = useState(null);

    // ==========================================
    // STATE FITUR EDIT SELURUH SISWA (BULK UPDATE)
    // ==========================================
    const [showBulkEditModal, setShowBulkEditModal] = useState(false);
    const [bulkEditData, setBulkEditData] = useState({
        kelasAwal: "",
        kelasAkhir: "",
        jurusanAwal: "",
        jurusanAkhir: "",
    });

    // ==========================================
    // STATE BARU: FITUR HAPUS MASSAL (BULK DELETE)
    // ==========================================
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [showBulkDeleteConfirmModal, setShowBulkDeleteConfirmModal] = useState(false);
    const [bulkDeleteData, setBulkDeleteData] = useState({ kelas: "", jurusan: "" });
    const [deleteCountdown, setDeleteCountdown] = useState(5);

    // Menarik data dari Laravel
    const fetchStudents = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/students`,
            );
            setStudents(response.data);
        } catch (error) {
            console.error("Gagal mengambil data:", error);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // TIMER UNTUK TOMBOL IYA (HAPUS MASSAL)
    useEffect(() => {
        let timer;
        if (showBulkDeleteConfirmModal && deleteCountdown > 0) {
            timer = setTimeout(() => setDeleteCountdown(deleteCountdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [showBulkDeleteConfirmModal, deleteCountdown]);

    // Filter Data (Pencarian, Kelas, Jurusan)
    const filteredStudents = students.filter((student) => {
        const matchJurusan =
            student.jurusan?.toUpperCase() === activeJurusan.toUpperCase();
        const matchKelas =
            student.kelas?.toUpperCase() === activeKelas.toUpperCase();
        const keyword = searchTerm.toLowerCase();
        const matchSearch =
            (student.nama_lengkap &&
                student.nama_lengkap.toLowerCase().includes(keyword)) ||
            (student.nisn && student.nisn.toLowerCase().includes(keyword));

        return matchJurusan && matchKelas && matchSearch;
    });

    // ================= LOGIKA KLIK GANDA (Batal & Reset) =================
    const handleDoubleClickCancel = () => {
        setIsActionOpen(false);
        setActionMode("none");
        setShowDeleteModal(false);
        setShowEditModal(false);
        setShowUnlockModal(false);
        setShowBulkEditModal(false);
        setShowBulkDeleteModal(false);
        setShowBulkDeleteConfirmModal(false);
        setSelectedStudent(null);
        setStudentToUnlock(null);
        setBulkEditData({
            kelasAwal: "",
            kelasAkhir: "",
            jurusanAwal: "",
            jurusanAkhir: "",
        });
        setBulkDeleteData({ kelas: "", jurusan: "" });
        setDeleteCountdown(5); // Reset timer ke 5
    };

    // ================= LOGIKA BUKA KUNCI AKUN =================
    const confirmUnlock = async () => {
        if (!studentToUnlock) return;
        try {
            await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/students/${studentToUnlock.id}/unlock`,
            );
            fetchStudents();
            handleDoubleClickCancel();
        } catch (error) {
            alert("Gagal membuka kunci akun!");
        }
    };

    // ================= LOGIKA HAPUS (DELETE SATUAN) =================
    const confirmDelete = async () => {
        if (!selectedStudent) return;
        try {
            await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/students/${selectedStudent.id}`,
            );
            fetchStudents();
            handleDoubleClickCancel();
        } catch (error) {
            alert("Gagal menghapus data!");
        }
    };

    // ================= LOGIKA UBAH SATUAN (EDIT) =================
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
                `${import.meta.env.VITE_API_BASE_URL}/students/${selectedStudent.id}`,
                selectedStudent,
            );
            fetchStudents();
            handleDoubleClickCancel();
            alert("Data berhasil diperbarui!");
        } catch (error) {
            alert("Gagal mengubah data! Pastikan NISN tidak bentrok.");
        }
    };

    // ================= LOGIKA UBAH MASSAL (BULK EDIT) =================
    const handleBulkEditChange = (e) => {
        setBulkEditData({
            ...bulkEditData,
            [e.target.name]: e.target.value,
        });
    };

    const confirmBulkEdit = async (e) => {
        e.preventDefault();
        // Validasi form agar tidak ada yang kosong
        if (
            !bulkEditData.kelasAwal ||
            !bulkEditData.kelasAkhir ||
            !bulkEditData.jurusanAwal ||
            !bulkEditData.jurusanAkhir
        ) {
            alert("Mohon lengkapi semua pilihan!");
            return;
        }

        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/students/bulk-update`,
                {
                    kelas_awal: bulkEditData.kelasAwal,
                    kelas_akhir: bulkEditData.kelasAkhir,
                    jurusan_awal: bulkEditData.jurusanAwal,
                    jurusan_akhir: bulkEditData.jurusanAkhir,
                },
            );
            fetchStudents();
            handleDoubleClickCancel();
            alert(response.data.message);
        } catch (error) {
            alert(
                error.response?.data?.message ||
                    "Gagal memperbarui data siswa secara massal.",
            );
        }
    };

    // ================= LOGIKA HAPUS MASSAL (BULK DELETE) =================
    const handleBulkDeleteChange = (e) => {
        setBulkDeleteData({
            ...bulkDeleteData,
            [e.target.name]: e.target.value,
        });
    };

    const triggerBulkDeleteConfirm = (e) => {
        e.preventDefault();
        if (!bulkDeleteData.kelas || !bulkDeleteData.jurusan) {
            alert("Mohon pilih kelas dan jurusan!");
            return;
        }
        setShowBulkDeleteModal(false);
        setDeleteCountdown(5); // Set ulang timer 5 detik
        setShowBulkDeleteConfirmModal(true); // Munculkan pop-up konfirmasi
    };

    const executeBulkDelete = async () => {
        if (deleteCountdown > 0) return; // Kunci fungsi jika timer belum habis
        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/students/bulk-delete`,
                {
                    data: bulkDeleteData, // Untuk metode DELETE, body request dikirim via 'data'
                }
            );
            fetchStudents();
            handleDoubleClickCancel();
            alert(response.data.message);
        } catch (error) {
            alert(
                error.response?.data?.message ||
                    "Gagal menghapus data massal.",
            );
            handleDoubleClickCancel();
        }
    };

    return (
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
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                <div className="bg-[#282C3E] rounded-3xl flex-1 border border-white/5 shadow-2xl overflow-hidden flex flex-col relative">
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
                                    <th className="py-4 w-12 text-center"></th>
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

                                            <td className="py-6 text-center">
                                                {student.is_locked && (
                                                    <button
                                                        onClick={() => {
                                                            setStudentToUnlock(
                                                                student,
                                                            );
                                                            setShowUnlockModal(
                                                                true,
                                                            );
                                                        }}
                                                        className="text-yellow-500 hover:text-yellow-400 hover:scale-110 transition-transform outline-none">
                                                        <svg
                                                            className="w-7 h-7 drop-shadow-md mx-auto"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20">
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </button>
                                                )}
                                            </td>

                                            <td className="py-6 text-right relative">
                                                <div
                                                    className={`absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-3 transition-all duration-300 ${actionMode !== "none" ? "opacity-100 z-10" : "opacity-0 pointer-events-none -z-10"}`}>
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
                                                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-5 rounded-full text-sm shadow-lg transition-transform hover:scale-105">
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
                                                                );
                                                                setShowEditModal(
                                                                    true,
                                                                );
                                                            }}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-5 rounded-full text-sm shadow-lg transition-transform hover:scale-105">
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
                                            colSpan="6"
                                            className="py-12 text-center text-gray-400 italic">
                                            {searchTerm
                                                ? `Pencarian "${searchTerm}" tidak ditemukan.`
                                                : `Belum ada data siswa untuk Jurusan ${activeJurusan} Kelas ${activeKelas}.`}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Tombol AKSI MASSAL (Muncul saat mode Edit / Delete) */}
                    <div
                        className={`absolute bottom-6 right-8 transition-all duration-500 ${actionMode === "edit" || actionMode === "delete" ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-10 pointer-events-none"}`}>
                        {actionMode === "edit" && (
                            <button
                                onClick={() => setShowBulkEditModal(true)}
                                className="bg-[#2D60FF] hover:bg-blue-600 text-white font-bold tracking-widest uppercase py-3.5 px-8 rounded-full shadow-[0_10px_20px_rgba(45,96,255,0.4)] transition-transform hover:scale-105 text-xs outline-none">
                                Edit Seluruh Siswa
                            </button>
                        )}
                        {actionMode === "delete" && (
                            <button
                                onClick={() => setShowBulkDeleteModal(true)}
                                className="bg-[#FF0000] hover:bg-red-700 text-white font-bold tracking-widest uppercase py-3.5 px-8 rounded-full shadow-[0_10px_20px_rgba(255,0,0,0.4)] transition-transform hover:scale-105 text-xs outline-none">
                                Hapus Seluruh Siswa
                            </button>
                        )}
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

                    <div className="flex items-center gap-3">
                        <div
                            className={`flex items-center gap-3 transition-all duration-500 ease-out ${isActionOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10 pointer-events-none"}`}>
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
                        <button
                            onClick={() => {
                                setIsActionOpen(!isActionOpen);
                                if (isActionOpen) setActionMode("none");
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

            {/* ================= MODAL BULK EDIT ================= */}
            {showBulkEditModal && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity animate-fade-in-up"
                    onDoubleClick={handleDoubleClickCancel}>
                    <div
                        className="bg-[#283247]/90 backdrop-blur-2xl border border-[#4285F4]/40 rounded-[2.5rem] p-10 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col relative"
                        onDoubleClick={(e) => e.stopPropagation()}>
                        <form
                            onSubmit={confirmBulkEdit}
                            className="flex flex-col gap-6">
                            <div className="flex flex-col">
                                <label className="text-white font-bold tracking-wider text-sm mb-2 uppercase">
                                    Awal Kelas
                                </label>
                                <select
                                    name="kelasAwal"
                                    value={bulkEditData.kelasAwal}
                                    onChange={handleBulkEditChange}
                                    className="bg-[#1C2235] text-gray-300 rounded-full py-4 px-6 appearance-none outline-none border border-transparent focus:border-[#4285F4] shadow-inner font-medium text-xs tracking-widest"
                                    required>
                                    <option
                                        value=""
                                        disabled
                                        className="text-gray-500">
                                        KELAS YANG INGIN DI UBAH
                                    </option>
                                    <option value="X">X (SEPULUH)</option>
                                    <option value="XI">XI (SEBELAS)</option>
                                    <option value="XII">XII (DUA BELAS)</option>
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label className="text-white font-bold tracking-wider text-sm mb-2 uppercase">
                                    Naik Kelas
                                </label>
                                <select
                                    name="kelasAkhir"
                                    value={bulkEditData.kelasAkhir}
                                    onChange={handleBulkEditChange}
                                    className="bg-[#1C2235] text-gray-300 rounded-full py-4 px-6 appearance-none outline-none border border-transparent focus:border-[#4285F4] shadow-inner font-medium text-xs tracking-widest"
                                    required>
                                    <option
                                        value=""
                                        disabled
                                        className="text-gray-500">
                                        NAIK KELAS BERAPA
                                    </option>
                                    <option value="X">X (SEPULUH)</option>
                                    <option value="XI">XI (SEBELAS)</option>
                                    <option value="XII">XII (DUA BELAS)</option>
                                    <option value="ALUMNI">
                                        LULUS / ALUMNI
                                    </option>
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label className="text-white font-bold tracking-wider text-sm mb-2 uppercase">
                                    Jurusan Awal
                                </label>
                                <select
                                    name="jurusanAwal"
                                    value={bulkEditData.jurusanAwal}
                                    onChange={handleBulkEditChange}
                                    className="bg-[#1C2235] text-gray-300 rounded-full py-4 px-6 appearance-none outline-none border border-transparent focus:border-[#4285F4] shadow-inner font-medium text-xs tracking-widest"
                                    required>
                                    <option
                                        value=""
                                        disabled
                                        className="text-gray-500">
                                        JURUSAN YANG INGIN DI UBAH
                                    </option>
                                    <option value="FI">
                                        FARMASI INDUSTRI (FI)
                                    </option>
                                    <option value="TKI">
                                        TEKNIK KIMIA INDUSTRI (TKI)
                                    </option>
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label className="text-white font-bold tracking-wider text-sm mb-2 uppercase">
                                    Jurusan Akhir
                                </label>
                                <select
                                    name="jurusanAkhir"
                                    value={bulkEditData.jurusanAkhir}
                                    onChange={handleBulkEditChange}
                                    className="bg-[#1C2235] text-gray-300 rounded-full py-4 px-6 appearance-none outline-none border border-transparent focus:border-[#4285F4] shadow-inner font-medium text-xs tracking-widest"
                                    required>
                                    <option
                                        value=""
                                        disabled
                                        className="text-gray-500">
                                        FINAL JURUSAN YANG DITETAPKAN
                                    </option>
                                    <option value="FI">
                                        FARMASI INDUSTRI (FI)
                                    </option>
                                    <option value="TKI">
                                        TEKNIK KIMIA INDUSTRI (TKI)
                                    </option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="mt-4 bg-[#2D60FF] hover:bg-blue-600 text-white font-bold py-4 px-10 rounded-full shadow-[0_10px_20px_rgba(45,96,255,0.4)] transition-transform hover:scale-105 uppercase tracking-widest text-sm mx-auto w-3/4 outline-none">
                                KONFIRMASI
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= MODAL BULK DELETE (HAPUS MASSAL FORM) ================= */}
            {showBulkDeleteModal && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity animate-fade-in-up"
                    onDoubleClick={handleDoubleClickCancel}>
                    <div
                        className="bg-[#283247]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col relative"
                        onDoubleClick={(e) => e.stopPropagation()}>
                        <form
                            onSubmit={triggerBulkDeleteConfirm}
                            className="flex flex-col gap-6">
                            {/* KELAS */}
                            <div className="flex flex-col">
                                <label className="text-white font-bold tracking-wider text-sm mb-2 uppercase">
                                    Kelas
                                </label>
                                <select
                                    name="kelas"
                                    value={bulkDeleteData.kelas}
                                    onChange={handleBulkDeleteChange}
                                    className="bg-[#1C2235] text-gray-300 rounded-full py-4 px-6 appearance-none outline-none border border-transparent focus:border-[#2D60FF] shadow-inner font-medium text-xs tracking-widest"
                                    required>
                                    <option
                                        value=""
                                        disabled
                                        className="text-gray-500">
                                        PILIH KELAS YANG INGIN DI HAPUS
                                    </option>
                                    <option value="X">X (SEPULUH)</option>
                                    <option value="XI">XI (SEBELAS)</option>
                                    <option value="XII">XII (DUA BELAS)</option>
                                </select>
                            </div>
                            {/* JURUSAN */}
                            <div className="flex flex-col">
                                <label className="text-white font-bold tracking-wider text-sm mb-2 uppercase">
                                    Jurusan
                                </label>
                                <select
                                    name="jurusan"
                                    value={bulkDeleteData.jurusan}
                                    onChange={handleBulkDeleteChange}
                                    className="bg-[#1C2235] text-gray-300 rounded-full py-4 px-6 appearance-none outline-none border border-transparent focus:border-[#2D60FF] shadow-inner font-medium text-xs tracking-widest"
                                    required>
                                    <option
                                        value=""
                                        disabled
                                        className="text-gray-500">
                                        PILIH JURUSAN YANG INGIN DI HAPUS
                                    </option>
                                    <option value="FI">
                                        FARMASI INDUSTRI (FI)
                                    </option>
                                    <option value="TKI">
                                        TEKNIK KIMIA INDUSTRI (TKI)
                                    </option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="mt-4 bg-[#2D60FF] hover:bg-blue-600 text-white font-bold py-4 px-10 rounded-full shadow-[0_10px_20px_rgba(45,96,255,0.4)] transition-transform hover:scale-105 uppercase tracking-widest text-sm mx-auto w-3/4 outline-none">
                                KONFIRMASI
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= MODAL BULK DELETE KONFIRMASI (TIMER 5 DETIK) ================= */}
            {showBulkDeleteConfirmModal && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center transition-opacity animate-fade-in-up"
                    onDoubleClick={handleDoubleClickCancel}>
                    <div
                        className="bg-[#4E5364] rounded-[2rem] p-10 max-w-md w-full shadow-2xl flex flex-col items-center text-center border border-white/10"
                        onDoubleClick={(e) => e.stopPropagation()}>
                        <p className="text-white font-bold tracking-widest text-[11px] mb-10 uppercase leading-loose">
                            Data akun siswa ini akan <br />
                            dihapus secara permanen. <br />
                            Pastikan anda yakin <br />
                            sebelum melanjutkan <br />
                            proses ini.
                        </p>
                        <div className="flex gap-6 w-full justify-center">
                            <button
                                onClick={handleDoubleClickCancel}
                                className="bg-[#2D60FF] hover:bg-blue-600 text-white font-bold tracking-widest uppercase py-3 px-8 rounded-full shadow-[0_5px_15px_rgba(45,96,255,0.4)] transition-transform hover:scale-105 outline-none text-xs w-32">
                                Tidak
                            </button>
                            <button
                                onClick={executeBulkDelete}
                                disabled={deleteCountdown > 0}
                                className={`font-bold tracking-widest uppercase py-3 px-8 rounded-full transition-all outline-none text-xs w-32 shadow-[0_5px_15px_rgba(255,0,0,0.4)] ${deleteCountdown > 0 ? "bg-red-600/50 cursor-not-allowed text-white/70" : "bg-[#FF0000] hover:bg-red-700 hover:scale-105 text-white"}`}>
                                {deleteCountdown > 0
                                    ? `( ${deleteCountdown} ) IYA`
                                    : "IYA"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL BUKA KUNCI (UNLOCK) ================= */}
            {showUnlockModal && studentToUnlock && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity animate-fade-in-up"
                    onDoubleClick={handleDoubleClickCancel}>
                    <div
                        className="bg-[#4E5364] rounded-[2rem] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center border border-white/10"
                        onDoubleClick={(e) => e.stopPropagation()}>
                        <h3 className="text-white font-bold tracking-widest text-sm mb-8 uppercase leading-relaxed">
                            APAKAH INGIN MEMBUKA <br /> AKUN SISWA TERSEBUT ?
                        </h3>
                        <div className="flex gap-4 w-full justify-center">
                            <button
                                onClick={() => setShowUnlockModal(false)}
                                className="bg-[#4285F4] hover:bg-blue-600 text-white font-bold py-2.5 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 outline-none">
                                Tidak
                            </button>
                            <button
                                onClick={confirmUnlock}
                                className="bg-[#FF0000] hover:bg-red-700 text-white font-bold py-2.5 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 outline-none">
                                Iya
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL HAPUS SATUAN ================= */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity"
                    onDoubleClick={handleDoubleClickCancel}>
                    <div
                        className="bg-[#282C3E] rounded-[3rem] p-12 max-w-lg w-full shadow-2xl flex flex-col items-center text-center border border-white/10"
                        onDoubleClick={(e) => e.stopPropagation()}>
                        <h2 className="text-white font-bold mb-8 uppercase tracking-wide text-lg leading-relaxed">
                            Tindakan ini akan mengapus <br /> seluruh data akun,
                            apakah anda yakin ?
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

            {/* ================= MODAL UBAH SATUAN (EDIT) ================= */}
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

            <style>{`
                .animate-fade-in-up { animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}