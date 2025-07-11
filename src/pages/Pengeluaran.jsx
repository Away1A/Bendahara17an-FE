import { useState, useEffect } from "react";
import api from "../api";
import InputGroup from "../components/InputGroup";
import Table from "../components/Table";
import SelectKategori from "../components/SelectKategori";

export default function Pengeluaran() {
  const [form, setForm] = useState({
    tanggal: "",
    sumber: "",
    keperluan: "",
    kategori: "",
    keterangan: "TUNAI", // default, sekarang ini adalah metode
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
        jumlah: "",
        keperluan: "",
        kategori: "",
        keterangan: "TUNAI", // default
      });
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Gagal menyimpan");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Tambah Pengeluaran</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md border rounded-xl p-6 space-y-4"
      >
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

        <div>
          <label className="block text-sm font-medium mb-1">
            Metode Pembayaran
          </label>
          <select
            name="keterangan"
            value={form.keterangan}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
            required
          >
            <option value="TUNAI">Tunai</option>
            <option value="NON_TUNAI">Non-Tunai</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </form>

      <hr className="my-6" />

      <h3 className="text-lg font-semibold mb-2">Riwayat Pengeluaran</h3>
      <Table
        data={data}
        columns={["tanggal", "keperluan", "kategori", "jumlah", "keterangan"]}
      />
    </div>
  );
}
