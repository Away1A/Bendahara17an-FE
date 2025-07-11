import { useEffect, useState } from "react";
import api from "../api";
import CardStat from "../components/CardStat";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [summary, setSummary] = useState({});
  const [rekap, setRekap] = useState({
    rekap_pemasukan: [],
    rekap_pengeluaran: [],
  });

  const getToday = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());

  useEffect(() => {
    const params = { start_date: startDate, end_date: endDate };
    api.get("/laporan/summary", { params }).then((res) => setSummary(res.data));
    api.get("/laporan/rekap", { params }).then((res) => setRekap(res.data));
  }, [startDate, endDate]);

  const colorPaletteContrast = [
    "#e6194b",
    "#3cb44b",
    "#ffe119",
    "#4363d8",
    "#f58231",
    "#911eb4",
    "#46f0f0",
    "#f032e6",
    "#bcf60c",
    "#fabebe",
    "#008080",
    "#e6beff",
    "#9a6324",
    "#fffac8",
    "#800000",
  ];

  const colorPaletteGreen = [
    "#4ade80",
    "#22c55e",
    "#15803d",
    "#86efac",
    "#16a34a",
    "#166534",
    "#bbf7d0",
    "#a7f3d0",
    "#6ee7b7",
    "#34d399",
    "#10b981",
    "#059669",
  ];

  const colorPaletteRed = [
    "#f87171",
    "#ef4444",
    "#dc2626",
    "#b91c1c",
    "#fca5a5",
    "#991b1b",
    "#fecaca",
    "#f87171",
    "#fb7185",
    "#f43f5e",
    "#e11d48",
    "#be123c",
  ];

  const getColors = (palette, count) => {
    const colors = [...palette];
    while (colors.length < count) {
      colors.push(...palette);
    }
    return colors.slice(0, count);
  };

  const labels = [
    ...new Set([
      ...rekap.rekap_pemasukan.map((r) => r.kategori),
      ...rekap.rekap_pengeluaran.map((r) => r.kategori),
    ]),
  ];

  const getTotalByKategori = (data, kategori) => {
    const found = data.find((item) => item.kategori === kategori);
    return found ? parseInt(found.total) : 0;
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: "Pemasukan",
        backgroundColor: getColors(colorPaletteGreen, labels.length),
        data: labels.map((kategori) =>
          getTotalByKategori(rekap.rekap_pemasukan, kategori)
        ),
      },
      {
        label: "Pengeluaran",
        backgroundColor: getColors(colorPaletteRed, labels.length),
        data: labels.map((kategori) =>
          getTotalByKategori(rekap.rekap_pengeluaran, kategori)
        ),
      },
    ],
  };

  const pieDataPemasukan = {
    labels: rekap.rekap_pemasukan.map((item) => item.kategori),
    datasets: [
      {
        data: rekap.rekap_pemasukan.map((item) => parseInt(item.total)),
        backgroundColor: getColors(
          colorPaletteContrast,
          rekap.rekap_pemasukan.length
        ),
      },
    ],
  };

  const pieDataPengeluaran = {
    labels: rekap.rekap_pengeluaran.map((item) => item.kategori),
    datasets: [
      {
        data: rekap.rekap_pengeluaran.map((item) => parseInt(item.total)),
        backgroundColor: getColors(
          colorPaletteContrast,
          rekap.rekap_pengeluaran.length
        ),
      },
    ],
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Dashboard Keuangan</h2>

      {/* Filter Tanggal */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Dari Tanggal
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sampai Tanggal
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
        </div>
        <button
          onClick={() => {
            const today = getToday();
            setStartDate(today);
            setEndDate(today);
          }}
          className="bg-blue-100 text-blue-700 px-4 py-2 rounded text-sm mt-1"
        >
          Hari Ini
        </button>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Pie Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-4">
          <h4 className="text-md font-semibold mb-2 text-center">
            🍀 Komposisi Pemasukan
          </h4>
          <Pie data={pieDataPemasukan} />
        </div>
        <div className="bg-white rounded shadow p-4">
          <h4 className="text-md font-semibold mb-2 text-center">
            🔻 Komposisi Pengeluaran
          </h4>
          <Pie data={pieDataPengeluaran} />
        </div>
      </div>
      {/* Bar Chart */}
      <div className="bg-white rounded shadow p-4">
        <h3 className="text-lg font-semibold mb-3">📊 Rekap Kategori</h3>
        <div className="w-full overflow-x-auto">
          <Bar data={chartData} height={100} />
        </div>
      </div>
    </div>
  );
}
