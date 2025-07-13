// src/pages/pengajuan/PengajuanChecker.jsx
import { useEffect, useState } from "react";
import api from "../../api";
import { ClipboardCheck, Send } from "lucide-react";

export default function PengajuanChecker() {
  const [pengajuan, setPengajuan] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPengajuan = async () => {
    try {
      const res = await api.get("/pengajuan/status/submitted");
      setPengajuan(res.data);
    } catch (err) {
      console.error("Gagal memuat pengajuan:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKirimApproval = async (id) => {
    try {
      await api.patch(`/pengajuan/send/${id}`);
      fetchPengajuan();
    } catch (err) {
      console.error("Gagal mengirim ke approval:", err);
    }
  };

  useEffect(() => {
    fetchPengajuan();
  }, []);

  const statusBadge = (status) => {
    const base = "px-2 py-1 text-xs rounded font-medium";
    const variants = {
      submitted: "bg-gray-200 text-gray-800",
      checking: "bg-yellow-100 text-yellow-700",
      approved: "bg-blue-100 text-blue-700",
      rejected: "bg-red-100 text-red-700",
      done: "bg-green-100 text-green-700",
    };
    return (
      <span className={`${base} ${variants[status] || "bg-gray-100"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-yellow-600 mb-6 flex items-center gap-2">
        <ClipboardCheck size={22} />
        Pemeriksaan Pengajuan Dana
      </h2>

      {loading ? (
        <p className="text-gray-600">Memuat data pengajuan...</p>
      ) : pengajuan.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          Tidak ada pengajuan yang menunggu pemeriksaan.
        </div>
      ) : (
        <div className="space-y-4">
          {pengajuan.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md p-5 border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg text-gray-800">
                    {item.judul}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">{item.deskripsi}</p>
                  <p className="text-sm text-gray-500">Divisi: {item.divisi}</p>
                  <p className="text-sm text-gray-500">
                    Jumlah: Rp{item.jumlah.toLocaleString()}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  {statusBadge(item.status)}
                  <button
                    onClick={() => handleKirimApproval(item.id)}
                    className="flex items-center gap-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm shadow mt-2"
                  >
                    <Send size={14} />
                    Kirim ke Approval
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
