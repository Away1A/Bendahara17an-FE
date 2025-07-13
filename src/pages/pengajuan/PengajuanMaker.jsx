import { useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ClipboardEdit,
  FileText,
  Layers,
  DollarSign,
  Send,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function PengajuanMaker() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    divisi: "Acara",
    jumlah: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/pengajuan", {
        ...form,
        jumlah: parseInt(form.jumlah),
        dibuat_oleh: auth.user?.id,
      });
      setSuccess("✅ Pengajuan berhasil dikirim.");
      setForm({
        judul: "",
        deskripsi: "",
        divisi: "Acara",
        jumlah: "",
      });
      setTimeout(() => {
        navigate("/pengajuan/maker");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("❌ Gagal mengirim pengajuan. Pastikan semua data valid.");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-2">
        <ClipboardEdit size={22} /> Form Pengajuan Dana
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-md flex items-center gap-2 mb-4 text-sm">
          <XCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-md flex items-center gap-2 mb-4 text-sm">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-1">
            <FileText size={14} className="inline mr-1" />
            Judul Pengajuan
          </label>
          <input
            type="text"
            name="judul"
            value={form.judul}
            onChange={handleChange}
            required
            placeholder="Contoh: Panggung Malam Puncak"
            className="w-full border border-gray-300 focus:ring-2 focus:ring-red-400 rounded-md px-3 py-2 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            <FileText size={14} className="inline mr-1" />
            Deskripsi Kebutuhan
          </label>
          <textarea
            name="deskripsi"
            value={form.deskripsi}
            onChange={handleChange}
            rows={3}
            placeholder="Contoh: Rigging panggung, videotron, sound system..."
            className="w-full border border-gray-300 focus:ring-2 focus:ring-red-400 rounded-md px-3 py-2 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            <Layers size={14} className="inline mr-1" />
            Divisi
          </label>
          <select
            name="divisi"
            value={form.divisi}
            onChange={handleChange}
            className="w-full border border-gray-300 focus:ring-2 focus:ring-red-400 rounded-md px-3 py-2 transition"
            required
          >
            <option value="Acara">Acara</option>
            <option value="Konsumsi">Konsumsi</option>
            <option value="Pubdok">Pubdok</option>
            <option value="Logistik">Logistik</option>
            <option value="Sekretariat">Sekretariat</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            <DollarSign size={14} className="inline mr-1" />
            Jumlah Dana (Rp)
          </label>
          <input
            type="number"
            name="jumlah"
            value={form.jumlah}
            onChange={handleChange}
            required
            placeholder="Contoh: 5000000"
            className="w-full border border-gray-300 focus:ring-2 focus:ring-red-400 rounded-md px-3 py-2 transition"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 justify-center px-5 py-2 rounded-md transition shadow"
          >
            <Send size={16} /> Kirim Pengajuan
          </button>
        </div>
      </form>
    </div>
  );
}
