import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTagihan from "./pages/AdminTagihan";
import AdminBuatAkun from "./pages/AdminBuatAkun";
import StudentDashboard from "./pages/StudentDashboard";
import StudentDompet from "./pages/StudentDompet";
import StudentTagihan from "./pages/StudentTagihan";
import StudentCS from "./pages/StudentCS";
import StudentDonasi from "./pages/StudentDonasi";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rute Halaman Utama */}
                <Route path="/" element={<LandingPage />} />

                {/* Rute Halaman Login */}
                <Route path="/login" element={<Login />} />

                {/* Rute Admin Dashboard sekarang sudah aman diakses */}
                <Route path="/admin" element={<AdminDashboard />} />

                <Route path="/admin/tagihan" element={<AdminTagihan />} />

                <Route path="/admin/buat-akun" element={<AdminBuatAkun />} />

                <Route path="/user" element={<StudentDashboard />} />

                <Route path="/user/dompet" element={<StudentDompet />} />

                <Route path="/user/tagihan" element={<StudentTagihan />} />

                <Route path="/user/cs" element={<StudentCS />} />

                <Route path="/user/donasi" element={<StudentDonasi />} />

                {/* Rute Dashboard kita nonaktifkan sementara */}
                {/* <Route path="/admin" element={<AdminDashboard />} /> */}
                {/* <Route path="/user" element={<UserDashboard />} /> */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
