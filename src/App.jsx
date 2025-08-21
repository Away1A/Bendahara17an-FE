import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Pemasukan from "./pages/Pemasukan";
import Pengeluaran from "./pages/Pengeluaran";
import Laporan from "./pages/Laporan";
import LaporanGuest from "./pages/LaporanGuest";
import AcaraGuest from "./pages/AcaraGuest";
import DokumentasiGuest from "./pages/DokumentasiGuest";
import Pendaftaran from "./pages/Pendaftaran";
import PengajuanMaker from "./pages/pengajuan/PengajuanMaker";
import PengajuanChecker from "./pages/pengajuan/PengajuanChecker";
import PengajuanApprover from "./pages/pengajuan/PengajuanApprover";
import PengajuanAdmin from "./pages/pengajuan/pengajuanAdmin";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  const { auth } = useAuth(); // auth: { token, role, user }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Tampilkan Navbar hanya jika sudah login */}
        {auth.token && <Navbar />}

        <main className={`${auth.token ? "min-h-screen" : ""}`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/laporan/guest" element={<LaporanGuest />} />
            <Route path="/acara/guest" element={<AcaraGuest />} />
            <Route path="/dokumentasi/guest" element={<DokumentasiGuest />} />

            {/* Route utama diarahkan berdasarkan login */}
            <Route
              path="/"
              element={
                auth.token ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/laporan/guest" replace />
                )
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/pemasukan"
              element={
                <PrivateRoute>
                  <Pemasukan />
                </PrivateRoute>
              }
            />
            <Route
              path="/pendaftaran"
              element={
                <PrivateRoute>
                  <Pendaftaran />
                </PrivateRoute>
              }
            />
            <Route
              path="/pengeluaran"
              element={
                <PrivateRoute>
                  <Pengeluaran />
                </PrivateRoute>
              }
            />
            <Route
              path="/laporan"
              element={
                <PrivateRoute>
                  <Laporan />
                </PrivateRoute>
              }
            />
            <Route
              path="/pengajuan/admin"
              element={
                <PrivateRoute>
                  <PengajuanAdmin />
                </PrivateRoute>
              }
            />
            <Route
              path="/pengajuan/maker"
              element={
                <PrivateRoute>
                  <PengajuanMaker />
                </PrivateRoute>
              }
            />
            <Route
              path="/pengajuan/checker"
              element={
                <PrivateRoute>
                  <PengajuanChecker />
                </PrivateRoute>
              }
            />
            <Route
              path="/pengajuan/approver"
              element={
                <PrivateRoute>
                  <PengajuanApprover />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
