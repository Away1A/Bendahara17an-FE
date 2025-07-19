import { useEffect, useState } from "react";
import api from "../api";
import CardStat from "../components/CardStat";
import Table from "../components/Table";

export default function Dashboard() {
  const [summary, setSummary] = useState({});
  const [pemasukan, setPemasukan] = useState([]);
  const [pengeluaran, setPengeluaran] = useState([]);

  const getToday = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());

  const fetchSummary = () => {
    const params = { start_date: startDate, end_date: endDate };
    api.get("/laporan/summary", { params }).then((res) => setSummary(res.data));
    api.get("/pemasukan", { params }).then((res) => setPemasukan(res.data));
    api.get("/pengeluaran", { params }).then((res) => setPengeluaran(res.data));
  };

  useEffect(() => {
    fetchSummary();
  }, [startDate, endDate]);

  return (
    <div className="space-y-10 max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800">Dashboard Keuangan</h2>

      {/* Filter Tanggal */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-4 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-700">Filter Tanggal</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-red-500 outline-none text-sm"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-red-500 outline-none text-sm"
            />
          </div>
          <button
            onClick={() => {
              const today = getToday();
              setStartDate(today);
              setEndDate(today);
            }}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition"
          >
            Hari Ini
          </button>
        </div>
      </div>

      {/* Card Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardStat
          title="Total Pemasukan"
          value={Number(summary.total_pemasukan || 0).toLocaleString("id-ID")}
          color="green"
        />
        <CardStat
          title="Total Pengeluaran"
          value={Number(summary.total_pengeluaran || 0).toLocaleString("id-ID")}
          color="red"
        />
        <CardStat
          title="Saldo Saat Ini"
          value={Number(summary.saldo || 0).toLocaleString("id-ID")}
          color="blue"
        />
      </div>

      {/* Riwayat Pemasukan */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Riwayat Pemasukan
        </h3>
        <Table
          data={pemasukan}
          columns={["tanggal", "sumber", "kategori", "jumlah", "keterangan"]}
        />
      </div>

      {/* Riwayat Pengeluaran */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Riwayat Pengeluaran
        </h3>
        <Table
          data={pengeluaran}
          columns={["tanggal", "keperluan", "kategori", "jumlah", "keterangan"]}
        />
      </div>
    </div>
  );
}
