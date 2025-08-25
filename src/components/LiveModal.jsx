/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useRef, useState } from "react";
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
import api from "../api";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler
);

const LiveModal = ({ isOpen, onClose }) => {
  const [dataRT, setDataRT] = useState([]);
  const [loading, setLoading] = useState(false);
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
        setDataRT(
          res.data.data.map((rt) => {
            prevTotals.current[rt.sumber] =
              prevTotals.current[rt.sumber] || rt.total;
            return { ...rt, previous: prevTotals.current[rt.sumber] };
          })
        );
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4">
      <div className="bg-gray-900 text-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] sm:h-[95vh] relative overflow-hidden flex flex-col">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
          onClick={onClose}
        >
          <FiX size={28} />
        </button>

        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700 grid grid-cols-[auto_1fr] gap-3 sm:gap-4 items-center">
          <div className="bg-green-600 text-xs sm:text-sm px-6 sm:px-8 py-2 sm:py-3 rounded-full animate-pulse text-center">
            LIVE
          </div>
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate">
              📊 Live Report Sumbangan RT
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 truncate">
              Update real-time {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Ticker atas */}
        <div className="bg-gray-800 border-b border-gray-700 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap text-xs sm:text-sm py-1 sm:py-2">
            {dataRT.map((rt) => (
              <div key={rt.sumber} className="flex items-center mx-4 sm:mx-6">
                <span className="font-semibold truncate">{rt.sumber}:</span>
                <span
                  className={`ml-1 sm:ml-2 ${
                    rt.total >= rt.previous ? "text-green-400" : "text-red-400"
                  }`}
                >
                  Rp{" "}
                  <CountUp
                    start={rt.previous}
                    end={rt.total}
                    duration={5}
                    separator="."
                  />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-2 sm:px-4 py-2">
          {loading ? (
            <div className="text-center py-16 sm:py-20 text-gray-400">
              Loading...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm border-collapse min-w-[600px] sm:min-w-full">
                <thead className="bg-gray-800 text-gray-300 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 text-left">RT</th>
                    <th className="px-2 sm:px-4 py-2 text-right">Total</th>
                    <th className="px-2 sm:px-4 py-2 text-center">Tren</th>
                    <th className="px-2 sm:px-4 py-2 text-left">Kontribusi</th>
                    <th className="px-2 sm:px-4 py-2 text-center">Grafik</th>
                  </tr>
                </thead>
                <tbody>
                  {dataRT.map((rt, idx) => {
                    const trendUp = rt.total >= rt.previous;
                    const trendColor = trendUp
                      ? "text-green-400"
                      : "text-red-400";
                    const nominalLevel = rt.total >= 1000000 ? "high" : "low";
                    return (
                      <tr
                        key={rt.sumber}
                        className={`${
                          idx % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                        } hover:bg-gray-700 transition`}
                      >
                        <td className="px-2 sm:px-4 py-2 font-semibold truncate">
                          {rt.sumber}
                        </td>
                        <td
                          className={`px-2 sm:px-4 py-2 text-right ${trendColor}`}
                        >
                          Rp{" "}
                          <CountUp
                            start={rt.previous}
                            end={rt.total}
                            duration={6}
                            separator="."
                          />
                        </td>
                        <td className="px-2 sm:px-4 py-2 text-center">
                          {trendUp ? (
                            <FiTrendingUp className="inline text-green-400" />
                          ) : (
                            <FiTrendingDown className="inline text-red-400" />
                          )}
                        </td>
                        <td className="px-2 sm:px-4 py-2 min-w-[80px]">
                          <div className="w-full bg-gray-600 rounded-full h-2 mb-1">
                            <div
                              className={`h-2 rounded-full ${
                                trendUp ? "bg-green-500" : "bg-red-500"
                              }`}
                              style={{ width: `${rt.pct_of_total}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400 truncate">
                            {rt.pct_of_total}% dari total
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 w-32 sm:w-40">
                          <Line
                            data={{
                              labels: rt.trend.map((_, i) => i + 1),
                              datasets: [
                                {
                                  data: rt.trend,
                                  borderColor:
                                    nominalLevel === "high"
                                      ? "#10B981"
                                      : "#EF4444",
                                  backgroundColor:
                                    nominalLevel === "high"
                                      ? "rgba(16,185,129,0.2)"
                                      : "rgba(239,68,68,0.2)",
                                  fill: true,
                                  tension: 0.3,
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
};

export default LiveModal;
