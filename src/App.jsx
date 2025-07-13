import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Pemasukan from "./pages/Pemasukan";
import Pengeluaran from "./pages/Pengeluaran";
import Laporan from "./pages/Laporan";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  const { auth } = useAuth(); // ambil dari context

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {auth.token && <Navbar />} {/* langsung sync navbar */}
        <main className={`${auth.token ? "p-4 max-w-6xl mx-auto" : ""}`}>
          <Routes>
            <Route path="/login" element={<Login />} />

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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
