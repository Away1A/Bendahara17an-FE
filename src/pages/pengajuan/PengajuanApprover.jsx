import { useEffect, useState } from "react";
import api from "../../api";
import { CheckCircle, XCircle, ClipboardList } from "lucide-react";

export default function PengajuanApprover() {
  const [pengajuan, setPengajuan] = useState([]);

  const fetchPengajuan = async () => {
    try {
      const res = await api.get("/pengajuan/status/checking");
      setPengajuan(res.data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.patch(`/pengajuan/approve/${id}`, { action });
      fetchPengajuan();
    } catch (err) {
      console.error(`Gagal ${action} pengajuan:`, err);
    }
  };

  useEffect(() => {
    fetchPengajuan();
  }, []);

  const statusBadge = (status) => {
    const base =
      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium shadow-sm";
    const variants = {
      checking: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`${base} ${variants[status] || "bg-gray-100 text-gray-700"}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h2 className="text-3xl font-bold text-blue-700 mb-8 flex items-center gap-3">
        <ClipboardList size={28} />
        Persetujuan Pengajuan Dana
      </h2>

      {pengajuan.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-lg shadow text-center">
          Tidak ada pengajuan yang menunggu persetujuan.
        </div>
      ) : (
        <div className="space-y-6">
          {pengajuan.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 shadow hover:shadow-lg transition p-6"
            >
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {item.judul}
                  </h3>
                  <p className="text-sm text-gray-600">{item.deskripsi}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-700 mt-3">
                    <span>
                      📁 Divisi: <strong>{item.divisi}</strong>
                    </span>
                    <span>
                      💰 Jumlah:{" "}
                      <strong>Rp{item.jumlah.toLocaleString()}</strong>
                    </span>
                    <span>Status: {statusBadge(item.status)}</span>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-3">
                  <button
                    onClick={() => handleAction(item.id, "approved")}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 text-sm px-5 py-2 rounded-md shadow-md transition"
                  >
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button
                    onClick={() => handleAction(item.id, "rejected")}
                    className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 text-sm px-5 py-2 rounded-md shadow-md transition"
                  >
                    <XCircle size={16} /> Tolak
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
