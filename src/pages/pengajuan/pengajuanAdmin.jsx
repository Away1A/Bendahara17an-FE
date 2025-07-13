import { useEffect, useState } from "react";
import api from "../../api";
import { CheckCircle, Clock, Ban, ThumbsUp, FileCheck2 } from "lucide-react";

export default function PengajuanAdmin() {
  const [pengajuan, setPengajuan] = useState([]);
  const [loading, setLoading] = useState(true);

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
      "inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium";
    switch (status) {
      case "submitted":
        return (
          <span className={`${base} bg-gray-100 text-gray-700`}>
            <Clock size={14} className="text-gray-500" />
            Submitted
          </span>
        );
      case "checking":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-800`}>
            <FileCheck2 size={14} className="text-yellow-600" />
            Checking
          </span>
        );
      case "approved":
        return (
          <span className={`${base} bg-blue-100 text-blue-800`}>
            <ThumbsUp size={14} className="text-blue-600" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className={`${base} bg-red-100 text-red-800`}>
            <Ban size={14} className="text-red-600" />
            Rejected
          </span>
        );
      case "done":
        return (
          <span className={`${base} bg-green-100 text-green-800`}>
            <CheckCircle size={14} className="text-green-600" />
            Done
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
    <div>
      <h2 className="text-2xl font-bold mb-6 text-red-700">
        🧾 Riwayat Pengajuan Dana
      </h2>

      {loading ? (
        <p>Memuat data...</p>
      ) : pengajuan.length === 0 ? (
        <p className="text-gray-600">Belum ada pengajuan.</p>
      ) : (
        <div className="space-y-5">
          {pengajuan.map((item) => (
            <div
              key={item.id}
              className={`border border-gray-200 rounded-lg p-5 bg-white shadow-sm transition hover:shadow-md ${
                item.status === "done"
                  ? "bg-green-50"
                  : item.status === "approved"
                  ? "bg-blue-50"
                  : item.status === "rejected"
                  ? "bg-red-50"
                  : ""
              }`}
            >
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                {/* Informasi Utama */}
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {item.judul}
                  </h3>
                  <p className="text-sm text-gray-600">{item.deskripsi}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-700">
                    <span>
                      📌 Divisi: <strong>{item.divisi}</strong>
                    </span>
                    <span>
                      💰 Jumlah:{" "}
                      <strong>Rp{item.jumlah.toLocaleString()}</strong>
                    </span>
                    <span>
                      📅 Tanggal: {formatDate(item.tanggal_pengajuan)}
                    </span>
                  </div>
                </div>

                {/* Status & Aksi */}
                <div className="flex flex-col items-start md:items-end justify-between gap-2">
                  {statusBadge(item.status)}

                  {item.status === "approved" && (
                    <button
                      onClick={() => handleSetDone(item.id)}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1.5 rounded-md shadow"
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
