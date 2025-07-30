import { useState, useEffect } from "react";
import api from "../api";
import InputGroup from "../components/InputGroup";
import TablePendaftaran from "../components/TablePendaftaran";

export default function Pendaftaran() {
  const [form, setForm] = useState({
    nama: "",
    usia: "",
    rt: "",
  });

  const [selectedLomba, setSelectedLomba] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendaftar, setPendaftar] = useState([]);

  const daftarLomba = [
    "Futsal anak",
    "Karengrung",
    "Sedotan botol",
    "Tiup gelas",
    "Mewarnai kaligrafi",
    "Adzan",
  ];

  const fetchData = async () => {
    const res = await api.get("/pendaftaran/all");
    setPendaftar(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleLomba = (namaLomba) => {
    if (selectedLomba.includes(namaLomba)) {
      setSelectedLomba(selectedLomba.filter((l) => l !== namaLomba));
    } else {
      setSelectedLomba([...selectedLomba, namaLomba]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama || !form.usia || !form.rt || selectedLomba.length === 0) {
      alert("Harap isi semua data dan pilih minimal satu lomba.");
      return;
    }

    setLoading(true);
    try {
      // Kirim 1 data untuk setiap lomba
      await Promise.all(
        selectedLomba.map((lomba) =>
          api.post("/pendaftaran", { ...form, lomba })
        )
      );
      setForm({ nama: "", usia: "", rt: "" });
      setSelectedLomba([]);
      fetchData();
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Gagal menyimpan data.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-6 rounded-3xl shadow-lg mb-8">
        <h1 className="text-3xl font-bold">Pendaftaran Lomba</h1>
        <p className="opacity-90 text-sm">
          Masukkan data peserta lomba di bawah ini
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-2xl p-6 space-y-4 border"
      >
        <InputGroup
          label="Nama"
          name="nama"
          value={form.nama}
          onChange={handleChange}
          required
        />
        <InputGroup
          label="Usia"
          name="usia"
          type="number"
          value={form.usia}
          onChange={handleChange}
          required
        />

        {/* Pilihan RT */}
        <div>
          <label htmlFor="rt" className="block text-sm font-medium mb-1">
            RT
          </label>
          <select
            name="rt"
            value={form.rt}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Pilih RT</option>
            {[1, 2, 3, 4, 5, 6].map((rt) => (
              <option key={rt} value={rt}>
                RT {rt}
              </option>
            ))}
          </select>
        </div>

        {/* Pilihan Lomba (Multiple bubble) */}
        <div>
          <label className="block text-sm font-medium mb-1">Lomba</label>
          <div className="flex flex-wrap gap-2">
            {daftarLomba.map((lomba) => (
              <button
                key={lomba}
                type="button"
                onClick={() => toggleLomba(lomba)}
                className={`px-4 py-2 rounded-full text-sm border ${
                  selectedLomba.includes(lomba)
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {lomba}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl"
        >
          {loading ? "Menyimpan..." : "Daftarkan"}
        </button>
      </form>

      {/* Tabel Data */}
      <TablePendaftaran data={pendaftar} />
    </div>
  );
}
