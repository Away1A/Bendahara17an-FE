/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useRef, useState, useMemo } from "react";
import { FiX, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import CountUp from "react-countup";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler
);

// Util: ubah "Rp 1.234.567" atau "1.234.567" -> 1234567 (number)
const toNumber = (v) => {
  if (typeof v === "number") return v;
  if (v == null) return 0;
  const s = String(v).replace(/[^\d-]/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

// Util: clamp persentase 0..100
const clampPct = (v) => {
  const n = toNumber(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
};

const LiveModal = ({ isOpen, onClose }) => {
  const [dataRT, setDataRT] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simpan total terakhir per RT agar CountUp start dari nilai sebelumnya (bukan dari awal)
  const prevTotals = useRef({});

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/pemasukan/live-sumbangan-rt");

        const mapped =
          res.data?.data?.map((rt, idx) => {
            const key = rt?.sumber ?? `rt-${idx}`;
            const totalNow = toNumber(rt?.total);

            // previous = total lama (jika belum ada, pakai totalNow agar tidak animasi dari nol)
            const previous = prevTotals.current[key] ?? totalNow;

            // update cache ke nilai terbaru untuk siklus berikutnya
            prevTotals.current[key] = totalNow;

            return {
              ...rt,
              sumber: rt?.sumber ?? key,
              total: totalNow,
              previous,
              pct_of_total: clampPct(rt?.pct_of_total),
              trend: Array.isArray(rt?.trend) ? rt.trend.map(toNumber) : [],
            };
          }) ?? [];

        setDataRT(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // === Ringkasan untuk header ===
  const totalSumbangan = useMemo(
    () => dataRT.reduce((sum, rt) => sum + toNumber(rt.total), 0),
    [dataRT]
  );
  const jumlahRTAktif = useMemo(
    () => dataRT.filter((rt) => toNumber(rt.total) > 0).length,
    [dataRT]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-2 sm:p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] sm:h-[95vh] relative overflow-hidden flex flex-col border border-gray-700"
        >
          {/* Close button (atas) */}
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
            onClick={onClose}
            aria-label="Tutup"
            title="Tutup"
          >
            <FiX size={28} />
          </button>

          {/* Header + Ringkasan */}
          <div className="px-6 py-5 border-b border-gray-700 bg-white/5 backdrop-blur-lg flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="bg-gradient-to-r from-green-400 to-teal-500 text-white text-xs sm:text-sm px-6 sm:px-8 py-2 sm:py-3 rounded-full shadow-lg"
              >
                LIVE
              </motion.div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 drop-shadow-lg">
                  📊 Live Report Sumbangan RT
                </h2>
                <p className="text-xs sm:text-sm text-gray-400">
                  Update real-time {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Statistik Ringkas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
              <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400">Total Sumbangan</p>
                <p className="text-lg sm:text-xl font-bold text-green-400">
                  Rp{" "}
                  <CountUp
                    key={`sum-${totalSumbangan}`} // re-animate saat total berubah
                    start={0}
                    end={totalSumbangan}
                    duration={2.2}
                    separator="."
                  />
                </p>
              </div>
              <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400">Jumlah RT Aktif</p>
                <p className="text-lg sm:text-xl font-bold text-cyan-400">
                  <CountUp
                    key={`aktif-${jumlahRTAktif}`}
                    start={0}
                    end={jumlahRTAktif}
                    duration={1.8}
                  />
                </p>
              </div>
            </div>
          </div>

          {/* Running Ticker */}
          <div className="bg-gradient-to-r from-green-900/30 to-cyan-900/30 backdrop-blur-md border-b border-gray-700 overflow-hidden shadow-inner">
            <div className="flex animate-marquee whitespace-nowrap text-xs sm:text-sm py-2">
              {dataRT.map((rt) => (
                <div
                  key={rt.sumber}
                  className="flex items-center mx-6 bg-gray-800/60 px-4 py-1 rounded-lg shadow-md border border-gray-700"
                >
                  <span className="font-semibold text-gray-200 truncate">
                    {rt.sumber}:
                  </span>
                  <span
                    className={`ml-2 font-bold ${
                      rt.total >= rt.previous
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    Rp{" "}
                    <CountUp
                      key={`ticker-${rt.sumber}-${rt.total}`}
                      start={rt.previous}
                      end={rt.total}
                      duration={3}
                      separator="."
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Body (grid cards) */}
          <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-950 to-gray-900">
            {loading ? (
              <div className="text-center py-20 text-gray-500 animate-pulse">
                Loading...
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {dataRT.map((rt, idx) => {
                  const trendUp = rt.total >= rt.previous;
                  const trendColor = trendUp
                    ? "text-green-400"
                    : "text-red-400";
                  const nominalLevel = rt.total >= 1000000 ? "high" : "low";
                  return (
                    <motion.div
                      key={rt.sumber}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="bg-gray-800/60 border border-gray-700 rounded-xl p-5 shadow-lg hover:shadow-green-500/20 transition"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-lg text-white">
                          {rt.sumber}
                        </h3>
                        {trendUp ? (
                          <FiTrendingUp className="text-green-400" />
                        ) : (
                          <FiTrendingDown className="text-red-400" />
                        )}
                      </div>

                      <div className={`text-2xl font-extrabold ${trendColor}`}>
                        Rp{" "}
                        <CountUp
                          key={`card-${rt.sumber}-${rt.total}`}
                          start={rt.previous}
                          end={rt.total}
                          duration={4}
                          separator="."
                        />
                      </div>

                      <div className="mt-3">
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                          <div
                            className={`h-2 rounded-full ${
                              trendUp ? "bg-green-400" : "bg-red-400"
                            }`}
                            style={{ width: `${rt.pct_of_total}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 truncate">
                          {rt.pct_of_total}% dari total
                        </span>
                      </div>

                      <div className="h-24 mt-4">
                        <Line
                          data={{
                            labels: rt.trend.map((_, i) => i + 1),
                            datasets: [
                              {
                                data: rt.trend,
                                borderColor:
                                  nominalLevel === "high"
                                    ? "#34D399"
                                    : "#F87171",
                                backgroundColor:
                                  nominalLevel === "high"
                                    ? "rgba(52,211,153,0.2)"
                                    : "rgba(248,113,113,0.2)",
                                fill: true,
                                tension: 0.4,
                                pointRadius: 0,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            plugins: { legend: { display: false } },
                            scales: {
                              x: { display: false },
                              y: { display: false },
                            },
                            maintainAspectRatio: false,
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer dengan tombol Close */}
          <div className="border-t border-gray-700 bg-black/40 backdrop-blur p-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl shadow hover:from-red-600 hover:to-pink-700 transition transform hover:scale-105"
            >
              Tutup
            </button>
          </div>
        </motion.div>

        <style jsx>{`
          @keyframes marquee {
            0% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};

export default LiveModal;
