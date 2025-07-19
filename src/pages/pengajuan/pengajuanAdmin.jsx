import { useEffect, useState } from "react";
import api from "../../api";
import { CheckCircle, Clock, Ban, ThumbsUp, FileCheck2 } from "lucide-react";

export default function PengajuanAdmin() {
  const [pengajuan, setPengajuan] = useState([]);
  const [loading, setLoading] = useState(true);

  const boxBgClass = (status) => {
    switch (status) {
      case "submitted":
        return "bg-white border-gray-200";
      case "checking":
        return "bg-yellow-50 border-yellow-200";
      case "approved":
        return "bg-blue-50 border-blue-200";
      case "rejected":
        return "bg-red-50 border-red-200";
      case "done":
        return "bg-green-50 border-green-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  const fetchData = async () => {
    try {
      const res = await api.get("/pengajuan/all");
      setPengajuan(res.data);
    } catch (err) {
      console.error("Gagal memuat pengajuan:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDone = async (id) => {
    try {
      await api.patch(`/pengajuan/done/${id}`);
      fetchData();
    } catch (err) {
      console.error("Gagal mengubah status menjadi done:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statusBadge = (status) => {
    const base =
      "inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-full font-semibold shadow-sm";
    switch (status) {
      case "submitted":
        return (
          <span className={`${base} bg-gray-100 text-gray-700`}>
            <Clock size={14} className="text-gray-500" /> Submitted
          </span>
        );
      case "checking":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-800`}>
            <FileCheck2 size={14} className="text-yellow-600" /> Checking
          </span>
        );
      case "approved":
        return (
          <span className={`${base} bg-blue-100 text-blue-800`}>
            <ThumbsUp size={14} className="text-blue-600" /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className={`${base} bg-red-100 text-red-800`}>
            <Ban size={14} className="text-red-600" /> Rejected
          </span>
        );
      case "done":
        return (
          <span className={`${base} bg-green-100 text-green-800`}>
            <CheckCircle size={14} className="text-green-600" /> Done
          </span>
        );
      default:
        return <span className={base}>{status}</span>;
    }
  };

  const formatDate = (dateStr) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-red-700">
        Riwayat Pengajuan Dana
      </h2>

      {loading ? (
        <p className="text-gray-700">Memuat data...</p>
      ) : pengajuan.length === 0 ? (
        <p className="text-gray-600">Belum ada pengajuan.</p>
      ) : (
        <div className="space-y-6">
          {pengajuan.map((item) => (
            <div
              key={item.id}
              className={`border rounded-2xl p-6 shadow-md hover:shadow-lg transition ${boxBgClass(
                item.status
              )}`}
            >
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-gray-800">
                    {item.judul}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{item.deskripsi}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                    <span>
                      📌 Divisi:{" "}
                      <span className="font-semibold">{item.divisi}</span>
                    </span>
                    <span>
                      💰 Jumlah:{" "}
                      <span className="font-semibold">
                        Rp{item.jumlah.toLocaleString()}
                      </span>
                    </span>
                    <span>📅 {formatDate(item.tanggal_pengajuan)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end justify-between gap-3">
                  {statusBadge(item.status)}
                  {item.status === "approved" && (
                    <button
                      onClick={() => handleSetDone(item.id)}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition"
                    >
                      Tandai Selesai
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
