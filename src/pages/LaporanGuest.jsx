import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

const getToday = () => new Date().toISOString().split("T")[0];

export default function LaporanGuest() {
  const [rekap, setRekap] = useState({
    rekap_pemasukan: [],
    rekap_pengeluaran: [],
  });
  const [summary, setSummary] = useState({});
  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = () => {
    const params = { start_date: startDate, end_date: endDate };
    api.get("/laporan/rekap", { params }).then((res) => setRekap(res.data));
    api.get("/laporan/summary", { params }).then((res) => setSummary(res.data));
  };

  const downloadExcel = () => {
    const url = `https://b3e413f0a83f.ngrok-free.app/api/laporan-pdf/download-excel?start_date=${startDate}&end_date=${endDate}`;
    window.open(url, "_blank");
  };

  const downloadPdf = () => {
    const url = `https://b3e413f0a83f.ngrok-free.app/api/laporan-pdf?start_date=${startDate}&end_date=${endDate}`;
    window.open(url, "_blank");
  };

  const findMax = (arr) =>
    arr.length > 0
      ? arr.reduce((a, b) => (a.total > b.total ? a : b)).kategori
      : "-";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-4 sm:px-10 space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-gray-800">
          📋 Laporan Keuangan Forum Remaja RW 09
        </h2>
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm shadow-lg"
        >
          🔐 Login
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border px-3 py-2 rounded-md shadow-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border px-3 py-2 rounded-md shadow-sm"
            />
          </div>
          <div className="flex flex-row gap-3">
            <button
              onClick={downloadPdf}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm shadow"
            >
              📥 PDF
            </button>
            <button
              onClick={downloadExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm shadow"
            >
              🧾 Excel
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CombinedBarChart
          pemasukan={rekap.rekap_pemasukan}
          pengeluaran={rekap.rekap_pengeluaran}
        />
        <LineChart data={rekap} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <div className="bg-white p-6 rounded-xl shadow-lg space-y-2">
        <h3 className="text-lg font-semibold mb-3">📊 Ringkasan Tambahan</h3>
        <ul className="text-sm space-y-1">
          <li>📥 Jumlah Transaksi Masuk: {rekap.rekap_pemasukan.length}</li>
          <li>📤 Jumlah Transaksi Keluar: {rekap.rekap_pengeluaran.length}</li>
          <li>
            🏅 Kategori Pemasukan Terbesar: {findMax(rekap.rekap_pemasukan)}
          </li>
          <li>
            🚨 Kategori Pengeluaran Terbesar: {findMax(rekap.rekap_pengeluaran)}
          </li>
        </ul>
      </div>
    </div>
  );
}

function StatBox({ title, value, color }) {
  const bg = {
    green: "bg-green-100 text-green-900",
    red: "bg-red-100 text-red-900",
    blue: "bg-blue-100 text-blue-900",
  };

  return (
    <div className={`p-5 rounded-xl border shadow-sm ${bg[color]}`}>
      <h4 className="text-sm font-medium">{title}</h4>
      <p className="text-2xl font-bold mt-1">
        Rp {value?.toLocaleString() || 0}
      </p>
    </div>
  );
}

function RekapBox({ title, data, color }) {
  const badge = {
    green: "bg-green-200 text-green-900",
    red: "bg-red-200 text-red-900",
  };

  return (
    <div className="bg-white border shadow-sm rounded-xl p-5">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
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

function CombinedBarChart({ pemasukan, pengeluaran }) {
  const labels = Array.from(
    new Set([...pemasukan, ...pengeluaran].map((i) => i.kategori || "Lainnya"))
  );
  const getData = (arr) =>
    labels.map(
      (label) =>
        arr.find((i) => (i.kategori || "Lainnya") === label)?.total || 0
    );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Pemasukan",
        data: getData(pemasukan),
        backgroundColor: "#34d399",
      },
      {
        label: "Pengeluaran",
        data: getData(pengeluaran),
        backgroundColor: "#f87171",
      },
    ],
  };
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">
        📊 Perbandingan Pemasukan & Pengeluaran
      </h3>
      <Bar
        data={chartData}
        options={{
          indexAxis: "y",
          responsive: true,
          plugins: { legend: { position: "bottom" } },
          scales: {
            x: { beginAtZero: true },
          },
        }}
      />
    </div>
  );
}

function LineChart({ data }) {
  const labels = data.rekap_pemasukan.map(
    (d, i) => d.kategori || `Kategori ${i + 1}`
  );
  const chartData = {
    labels,
    datasets: [
      {
        label: "Trend Pemasukan",
        data: data.rekap_pemasukan.map((d) => d.total),
        fill: true,
        backgroundColor: "rgba(59,130,246,0.2)",
        borderColor: "#3b82f6",
        tension: 0.3,
      },
    ],
  };
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">
        📈 Trend Pemasukan per Kategori
      </h3>
      <Line data={chartData} />
    </div>
  );
}
