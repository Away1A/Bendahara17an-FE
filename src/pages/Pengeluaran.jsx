import { useState, useEffect } from "react";
import api from "../api";
import InputGroup from "../components/InputGroup";
import Table from "../components/Table";
import SelectKategori from "../components/SelectKategori";

export default function Pengeluaran() {
  const [form, setForm] = useState({
    tanggal: "",
    keperluan: "",
    jumlah: "",
    kategori: "",
    keterangan: "TUNAI",
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    api.get("/pengeluaran").then((res) => setData(res.data));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/pengeluaran", {
        tanggal: form.tanggal,
        jumlah: parseInt(form.jumlah),
        keperluan: form.keperluan,
        kategori: form.kategori,
        keterangan: form.keterangan,
      });
      fetchData();
      setForm({
        tanggal: "",
        keperluan: "",
        jumlah: "",
        kategori: "",
        keterangan: "TUNAI",
      });
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Gagal menyimpan");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 text-white p-6 rounded-2xl shadow-lg mb-8">
        <h2 className="text-3xl font-bold mb-2">Tambah Pengeluaran</h2>
        <p className="opacity-80">
          Catat pengeluaran harian secara rapi dan terstruktur
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-8 space-y-6 border"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup
            label="Tanggal"
            name="tanggal"
            type="date"
            value={form.tanggal}
            onChange={handleChange}
          />
          <InputGroup
            label="Keperluan"
            name="keperluan"
            value={form.keperluan}
            onChange={handleChange}
          />
          <SelectKategori value={form.kategori} onChange={handleChange} />
          <InputGroup
            label="Jumlah (Rp)"
            name="jumlah"
            type="number"
            value={form.jumlah}
            onChange={handleChange}
          />
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold mb-2">
              Metode Pembayaran
            </label>
            <select
              name="keterangan"
              value={form.keterangan}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            >
              <option value="TUNAI">Tunai</option>
              <option value="NON_TUNAI">Non-Tunai</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl shadow-md transition transform active:scale-95 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Pengeluaran"}
        </button>
      </form>

      <div className="mt-12 bg-white shadow-xl rounded-2xl p-8 border">
        <h3 className="text-2xl font-bold mb-4 text-gray-700">
          Riwayat Pengeluaran
        </h3>
        <Table
          data={data}
          columns={["tanggal", "keperluan", "kategori", "jumlah", "keterangan"]}
        />
      </div>
    </div>
  );
}
