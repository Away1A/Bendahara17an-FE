import { useEffect, useState } from "react";
import GuestNavbar from "../components/NavGuest";
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
import {
  FiDownload,
  FiLock,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiPieChart,
  FiBarChart2,
} from "react-icons/fi";

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
  const [saldoTotal, setSaldoTotal] = useState(0); // ✅ tambahkan state saldo total

  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = () => {
    setLoading(true);
    const params = { start_date: startDate, end_date: endDate };

    Promise.all([
      api.get("/laporan/rekap", { params }),
      api.get("/laporan/summary", { params }),
      api.get("/laporan/saldo"), // ✅ ambil saldo total
    ])
      .then(([rekapRes, summaryRes, saldoRes]) => {
        setRekap(rekapRes.data);
        setSummary(summaryRes.data);
        setSaldoTotal(saldoRes.data.saldo); // ✅ simpan saldo total
      })
      .finally(() => setLoading(false));
  };

  const downloadExcel = () => {
    const url = `https://f251a22357e8.ngrok-free.app/api/laporan-pdf/download-excel?start_date=${startDate}&end_date=${endDate}`;
    window.open(url, "_blank");
  };

  const downloadPdf = () => {
    const url = `https://f251a22357e8.ngrok-free.app/api/laporan-pdf?start_date=${startDate}&end_date=${endDate}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <GuestNavbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FiPieChart className="mr-3 text-blue-600" />
                Laporan Keuangan
              </h1>
              <p className="text-gray-600 mt-1">Forum Remaja RW 09</p>
            </div>
          </div>

          {/* Filters & Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex flex-col justify-end">
                <div className="flex gap-3">
                  <button
                    onClick={downloadPdf}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-md"
                  >
                    <FiDownload />
                    PDF
                  </button>
                  <button
                    onClick={downloadExcel}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-md"
                  >
                    <FiDownload />
                    Excel
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatBox
              title="Total Pemasukan"
              value={summary.total_pemasukan}
              color="green"
              icon={<FiTrendingUp className="text-xl" />}
            />
            <StatBox
              title="Total Pengeluaran"
              value={summary.total_pengeluaran}
              color="red"
              icon={<FiTrendingDown className="text-xl" />}
            />
            <StatBox
              title="Saldo Saat Ini"
              value={saldoTotal} // ✅ gunakan saldoTotal di sini
              color="blue"
              icon={<FiDollarSign className="text-xl" />}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-5">
              <div className="flex items-center gap-2 mb-5">
                <FiBarChart2 className="text-blue-600 text-xl" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Perbandingan Kategori
                </h3>
              </div>
              <CombinedBarChart
                pemasukan={rekap.rekap_pemasukan}
                pengeluaran={rekap.rekap_pengeluaran}
                loading={loading}
              />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-5">
              <div className="flex items-center gap-2 mb-5">
                <FiTrendingUp className="text-blue-600 text-xl" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Trend Pemasukan
                </h3>
              </div>
              <LineChart data={rekap} loading={loading} />
            </div>
          </div>

          {/* Breakdown Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RekapBox
              title="Pemasukan per Kategori"
              data={rekap.rekap_pemasukan}
              color="green"
              icon={<FiTrendingUp className="text-green-600" />}
              loading={loading}
            />
            <RekapBox
              title="Pengeluaran per Kategori"
              data={rekap.rekap_pengeluaran}
              color="red"
              icon={<FiTrendingDown className="text-red-600" />}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </>
  );
}

// Improved StatBox Component
function StatBox({ title, value, color, icon }) {
  const colors = {
    green: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
    },
    red: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
  };

  const selectedColor = colors[color] || colors.blue;

  return (
    <div
      className={`border rounded-xl p-5 ${selectedColor.bg} ${selectedColor.border} transition-all hover:shadow-md`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${selectedColor.text}`}>
            Rp {value?.toLocaleString("id-ID") || "0"}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${selectedColor.bg}`}>{icon}</div>
      </div>
    </div>
  );
}

// RekapBox Component with loading state
function RekapBox({ title, data, color, icon, loading }) {
  const badgeColors = {
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="border-b border-gray-200 px-5 py-4 flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Tidak ada data</p>
        ) : (
          <ul className="space-y-3">
            {data.map((item, i) => (
              <li
                key={i}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
              >
                <span className="font-medium text-gray-700">
                  {item.kategori || "Lainnya"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColors[color]}`}
                >
                  Rp {item.total.toLocaleString("id-ID")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// CombinedBarChart with loading state
function CombinedBarChart({ pemasukan, pengeluaran, loading }) {
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
        backgroundColor: "rgba(52, 211, 153, 0.7)",
        borderColor: "rgba(52, 211, 153, 1)",
        borderWidth: 1,
      },
      {
        label: "Pengeluaran",
        data: getData(pengeluaran),
        backgroundColor: "rgba(239, 68, 68, 0.7)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="h-80">
      {loading ? (
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Bar
          data={chartData}
          options={{
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top",
                labels: {
                  font: {
                    size: 13,
                  },
                },
              },
            },
            scales: {
              x: {
                beginAtZero: true,
                grid: {
                  color: "rgba(0, 0, 0, 0.05)",
                },
              },
              y: {
                grid: {
                  display: false,
                },
              },
            },
          }}
        />
      )}
    </div>
  );
}

// LineChart with loading state
function LineChart({ data, loading }) {
  const labels = data.rekap_pemasukan.map(
    (d, i) => d.kategori || `Kategori ${i + 1}`
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Pemasukan",
        data: data.rekap_pemasukan.map((d) => d.total),
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        pointBackgroundColor: "#fff",
        pointBorderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="h-80">
      {loading ? (
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top",
                labels: {
                  font: {
                    size: 13,
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: "rgba(0, 0, 0, 0.05)",
                },
              },
              x: {
                grid: {
                  display: false,
                },
              },
            },
          }}
        />
      )}
    </div>
  );
}
