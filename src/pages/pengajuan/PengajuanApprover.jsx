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
    const base = "px-2 py-1 text-xs font-semibold rounded";
    const variants = {
      checking: "bg-yellow-100 text-yellow-700",
      approved: "bg-blue-100 text-blue-700",
      rejected: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`${base} ${variants[status] || "bg-gray-200 text-gray-700"}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
        <ClipboardList size={22} />
        Persetujuan Pengajuan Dana
      </h2>

      {pengajuan.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
          Tidak ada pengajuan yang menunggu persetujuan.
        </div>
      ) : (
        <div className="space-y-5">
          {pengajuan.map((item) => (
            <div
              key={item.id}
              className="bg-white shadow-md rounded-md border p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-semibold text-gray-800 mb-1">
                    {item.judul}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">{item.deskripsi}</p>
                  <p className="text-sm text-gray-500">Divisi: {item.divisi}</p>
                  <p className="text-sm text-gray-500">
                    Jumlah:{" "}
                    <span className="font-medium">
                      Rp{item.jumlah.toLocaleString()}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Status: {statusBadge(item.status)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 mt-2">
                  <button
                    onClick={() => handleAction(item.id, "approved")}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-md shadow"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(item.id, "rejected")}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-md shadow"
                  >
                    <XCircle size={16} />
                    Tolak
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
