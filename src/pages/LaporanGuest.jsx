/* eslint-disable no-unused-vars */
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
  FiPieChart,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiBarChart2,
} from "react-icons/fi";

import LiveModal from "../components/LiveModal";

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
  const [saldoTotal, setSaldoTotal] = useState(0);

  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());
  const [loading, setLoading] = useState(true);

  // state popup live report
  const [liveOpen, setLiveOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = () => {
    setLoading(true);
    const params = { start_date: startDate, end_date: endDate };

    Promise.all([
      api.get("/laporan/rekap", { params }),
      api.get("/laporan/summary", { params }),
      api.get("/laporan/saldo"),
    ])
      .then(([rekapRes, summaryRes, saldoRes]) => {
        setRekap(rekapRes.data);
        setSummary(summaryRes.data);
        setSaldoTotal(saldoRes.data.saldo);
      })
      .finally(() => setLoading(false));
  };

  const downloadExcel = () => {
    const url = `https://tarka.ngrok.app/forum-remaja/api/laporan-pdf/download-excel?start_date=${startDate}&end_date=${endDate}`;
    window.open(url, "_blank");
  };

  const downloadPdf = () => {
    const url = `https://tarka.ngrok.app/forum-remaja/api/laporan-pdf?start_date=${startDate}&end_date=${endDate}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <GuestNavbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800">
        <div>
          {/* Header Section */}
          <section className="relative overflow-hidden pt-20 pb-28 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white">
            {/* Background Decoration */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
              <div className="absolute -top-20 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full text-sm text-yellow-200 mb-6 shadow-md">
                <span className="text-yellow-300">📊</span>
                Laporan Keuangan
              </div>

              {/* Title */}
              <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight max-w-4xl mx-auto">
                Transparansi <span className="text-yellow-300">Keuangan</span>
                <br />
                Forum Remaja RW.09
              </h1>

              {/* Description */}
              <p className="mt-6 text-lg sm:text-xl text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
                Lihat detail pemasukan, pengeluaran, dan saldo terkini yang
                dikelola secara terbuka & akuntabel.
              </p>
            </div>

            {/* Live Report Section */}
            <div className="relative z-10 max-w-6xl mx-auto mt-16 px-6">
              <div className="group relative rounded-3xl overflow-hidden bg-white/90 backdrop-blur-xl shadow-2xl transition transform hover:scale-[1.02] hover:shadow-[0_25px_80px_rgba(0,0,0,0.3)]">
                <button
                  onClick={() => setLiveOpen(true)}
                  className="relative flex flex-col md:flex-row items-center gap-6 w-full px-8 py-10 text-slate-900 text-left"
                  aria-haspopup="dialog"
                  aria-expanded={liveOpen}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-200 to-indigo-50 shadow-lg flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-indigo-600"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M5 3v18l15-9L5 3z" />
                      </svg>
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 ring-2 ring-white animate-ping" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
                      Live Report Sirkulir RT 01 – RT 06
                    </h3>
                    <p className="mt-4 text-base text-slate-600 max-w-2xl leading-relaxed">
                      Laporan real-time yang transparan untuk setiap RT.
                      Didesain agar mudah diakses seluruh warga dengan tampilan
                      informatif dan terpercaya.
                    </p>

                    {/* Info */}
                    <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Realtime Update
                      </span>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-700">
                        Klik untuk melihat detail laporan
                      </span>
                    </div>
                  </div>

                  {/* Chevron */}
                  <div className="flex-shrink-0 text-slate-500 group-hover:translate-x-1 transition-transform">
                    <svg
                      className="w-8 h-8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              </div>

              {/* Sponsor Section */}
              <div className="mt-14 text-center">
                <h4 className="text-lg font-semibold text-blue-100 mb-6 tracking-wide uppercase">
                  Sponsor Pendukung
                </h4>
                <div className="flex flex-wrap items-center justify-center gap-8">
                  {["/indomobil.png", "/PNG WHITE.png", "/adipura.png"].map(
                    (src, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition shadow-md"
                      >
                        <img
                          src={src}
                          alt={`Sponsor ${i + 1}`}
                          className="w-40 sm:w-48 h-40 sm:h-48 object-contain"
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Filters & Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-10 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* LIVE BUTTON (di atas 'Dari Tanggal') */}
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dari Tanggal
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  />
                </div>
              </div>

              {/* Sampai Tanggal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                />
              </div>

              {/* Tombol Aksi */}
              <div className="flex gap-3">
                <button
                  onClick={downloadPdf}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                >
                  <FiDownload className="text-lg" />
                  PDF
                </button>
                <button
                  onClick={downloadExcel}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                >
                  <FiDownload className="text-lg" />
                  Excel
                </button>
              </div>
            </div>
          </div>
          <LiveModal isOpen={liveOpen} onClose={() => setLiveOpen(false)}>
            {/* children opsional, bisa diisi konten tambahan */}
            <div className="text-center mt-4">
              <p className="text-gray-600 dark:text-gray-300">
                Memuat data sumbangan RT terbaru...
              </p>
            </div>
          </LiveModal>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-4 md:px-6">
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
function StatBox({ title, value, color = "blue", icon }) {
  const colors = {
    green: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      iconBg: "bg-green-100",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      iconBg: "bg-red-100",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      iconBg: "bg-blue-100",
    },
  };

  const selectedColor = colors[color] || colors.blue;

  return (
    <div
      className={`border rounded-xl p-5 ${selectedColor.bg} ${selectedColor.border} transition-shadow duration-300 hover:shadow-md`}
      role="region"
      aria-label={`${title} statistic`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${selectedColor.text}`}>
            Rp {value?.toLocaleString("id-ID") ?? "0"}
          </p>
        </div>
        <div
          className={`p-2 rounded-lg ${selectedColor.iconBg} flex items-center justify-center`}
          aria-hidden="true"
        >
          {icon}
        </div>
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
