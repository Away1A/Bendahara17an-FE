import { useEffect, useState } from "react";
import api from "../api";

const getToday = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

export default function Laporan() {
  const [rekap, setRekap] = useState({
    rekap_pemasukan: [],
    rekap_pengeluaran: [],
  });
  const [summary, setSummary] = useState({});
  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = () => {
    const params = { start_date: startDate, end_date: endDate };

    api.get("/laporan/rekap", { params }).then((res) => setRekap(res.data));
    api.get("/laporan/summary", { params }).then((res) => setSummary(res.data));
  };

  const downloadExcel = () => {
    const url = `http://localhost:3001/api/laporan-pdf/download-excel?start_date=${startDate}&end_date=${endDate}`;
    window.open(url, "_blank");
  };
  const downloadPdf = () => {
    const url = `http://localhost:3001/api/laporan-pdf?start_date=${startDate}&end_date=${endDate}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📋 Laporan Keuangan</h2>

      {/* Filter Tanggal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div>
          <label className="block text-sm font-medium">Dari Tanggal</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-3 py-2 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Sampai Tanggal</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-3 py-2 rounded-md shadow-sm"
          />
        </div>
        <div className="flex flex-row gap-2 mt-2 sm:mt-6">
          <button
            onClick={downloadPdf}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow-md transition text-sm"
          >
            📥 Unduh PDF
          </button>
          <button
            onClick={downloadExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-md transition text-sm"
          >
            🧾 Unduh CSV
          </button>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatBox
          title="Total Pemasukan"
          value={summary.total_pemasukan}
          color="green"
        />
        <StatBox
          title="Total Pengeluaran"
          value={summary.total_pengeluaran}
          color="red"
        />
        <StatBox title="Saldo Saat Ini" value={summary.saldo} color="blue" />
      </div>

      {/* Detail Rekap */}
      <div className="grid md:grid-cols-2 gap-6">
        <RekapBox
          title="📈 Pemasukan per Kategori"
          data={rekap.rekap_pemasukan}
          color="green"
        />
        <RekapBox
          title="📉 Pengeluaran per Kategori"
          data={rekap.rekap_pengeluaran}
          color="red"
        />
      </div>
    </div>
  );
}

// Komponen Statistik Box
function StatBox({ title, value, color }) {
  const bg = {
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-100 text-blue-800",
  };

  return (
    <div className={`p-4 rounded-lg shadow border ${bg[color]}`}>
      <h4 className="text-sm font-medium">{title}</h4>
      <p className="text-xl font-bold mt-1">
        Rp {value?.toLocaleString() || 0}
      </p>
    </div>
  );
}

// Komponen Rekap Box
function RekapBox({ title, data, color }) {
  const badge = {
    green: "bg-green-200 text-green-900",
    red: "bg-red-200 text-red-900",
  };

  return (
    <div className="bg-white border shadow-sm rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <ul className="space-y-2 text-sm">
        {data.length === 0 && <li className="text-gray-500">Tidak ada data</li>}
        {data.map((item, i) => (
          <li key={i} className="flex justify-between items-center">
            <span className="font-medium">{item.kategori || "Lainnya"}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badge[color]}`}
            >
              Rp {item.total.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
