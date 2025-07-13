import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Pemasukan from "./pages/Pemasukan";
import Pengeluaran from "./pages/Pengeluaran";
import Laporan from "./pages/Laporan";
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

        <main className={`${auth.token ? "p-4 max-w-6xl mx-auto" : "p-4"}`}>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/"
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
