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
    <div className="max-w-2xl mx-auto bg-white p-10 rounded-3xl shadow-xl border border-gray-100 space-y-6">
      <h2 className="text-3xl font-bold text-red-700 mb-4 flex items-center gap-3">
        <ClipboardEdit size={28} /> Form Pengajuan Dana
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm shadow">
          <XCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm shadow">
          <CheckCircle size={18} /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold mb-2">
            <FileText size={16} className="inline mr-2" /> Judul Pengajuan
          </label>
          <input
            type="text"
            name="judul"
            value={form.judul}
            onChange={handleChange}
            required
            placeholder="Contoh: Panggung Malam Puncak"
            className="w-full border border-gray-300 focus:ring-4 focus:ring-red-400 rounded-xl px-4 py-3 transition text-sm shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">
            <FileText size={16} className="inline mr-2" /> Deskripsi Kebutuhan
          </label>
          <textarea
            name="deskripsi"
            value={form.deskripsi}
            onChange={handleChange}
            rows={4}
            placeholder="Contoh: Rigging panggung, videotron, sound system..."
            className="w-full border border-gray-300 focus:ring-4 focus:ring-red-400 rounded-xl px-4 py-3 transition text-sm shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">
            <Layers size={16} className="inline mr-2" /> Divisi
          </label>
          <select
            name="divisi"
            value={form.divisi}
            onChange={handleChange}
            className="w-full border border-gray-300 focus:ring-4 focus:ring-red-400 rounded-xl px-4 py-3 transition text-sm shadow-sm"
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
          <label className="block text-sm font-bold mb-2">
            <DollarSign size={16} className="inline mr-2" /> Jumlah Dana (Rp)
          </label>
          <input
            type="number"
            name="jumlah"
            value={form.jumlah}
            onChange={handleChange}
            required
            placeholder="Contoh: 5000000"
            className="w-full border border-gray-300 focus:ring-4 focus:ring-red-400 rounded-xl px-4 py-3 transition text-sm shadow-sm"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center gap-3 justify-center px-5 py-3 rounded-xl transition shadow-lg text-sm font-bold"
          >
            <Send size={18} /> Kirim Pengajuan
          </button>
        </div>
      </form>
    </div>
  );
}
