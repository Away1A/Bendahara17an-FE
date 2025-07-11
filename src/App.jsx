import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Pemasukan from "./pages/Pemasukan";
import Pengeluaran from "./pages/Pengeluaran";
import Dashboard from "./pages/Dashboard";
import Laporan from "./pages/Laporan";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="p-4 max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pemasukan" element={<Pemasukan />} />
            <Route path="/pengeluaran" element={<Pengeluaran />} />
            <Route path="/laporan" element={<Laporan />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
