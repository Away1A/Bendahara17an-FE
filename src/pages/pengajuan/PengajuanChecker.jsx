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
    const base =
      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium shadow-sm";
    const variants = {
      submitted: "bg-gray-100 text-gray-800",
      checking: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800",
      done: "bg-green-100 text-green-800",
    };
    return (
      <span className={`${base} ${variants[status] || "bg-gray-100"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h2 className="text-3xl font-bold text-yellow-700 mb-8 flex items-center gap-3">
        <ClipboardCheck size={28} />
        Pemeriksaan Pengajuan Dana
      </h2>

      {loading ? (
        <div className="text-gray-500 text-center py-10">
          Memuat data pengajuan...
        </div>
      ) : pengajuan.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg shadow-sm text-center">
          Tidak ada pengajuan yang menunggu pemeriksaan.
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
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-3">
                  {statusBadge(item.status)}

                  <button
                    onClick={() => handleKirimApproval(item.id)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2 text-sm px-5 py-2 rounded-md shadow-md transition"
                  >
                    <Send size={16} /> Kirim ke Approval
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
