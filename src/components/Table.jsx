import { useState, useMemo } from "react";
import Swal from "sweetalert2";
import api from "../api";

export default function Table({
  data = [],
  setData,
  type = "pemasukan",
  onReload,
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const [editData, setEditData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const dataKeys = data.length
    ? Object.keys(data[0]).filter((key) => key !== "id")
    : [];

  const headers = ["No", ...dataKeys, "Aksi"];

  const formatDate = (iso) => {
    if (!iso) return "";
    const date = new Date(iso);
    return date.toISOString().slice(0, 10);
  };

  const filteredData = useMemo(() => {
    return data.filter((row) =>
      Object.values(row).join(" ").toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = filteredData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const displayHeader = (key) => {
    const labelMap = {
      tanggal: "Tanggal",
      sumber: "Sumber",
      keperluan: "Keperluan",
      kategori: "Kategori",
      jumlah: "Jumlah (Rp)",
      keterangan: "Metode Pembayaran",
    };
    return labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  const getEndpoint = (id) => `/${type}/${id}`;

  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data yang dihapus tidak bisa dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      await api.delete(getEndpoint(id), {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (typeof onReload === "function") {
        await onReload();
      } else if (typeof setData === "function") {
        setData((prev) => prev.filter((item) => item.id !== id));
      }

      Swal.fire({
        icon: "success",
        title: "Terhapus!",
        text: "Data berhasil dihapus",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat menghapus data",
      });
    }
  };

  const handleEdit = (row) => {
    setEditData(row);
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(getEndpoint(editData.id), editData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (typeof onReload === "function") {
        await onReload();
      } else if (typeof setData === "function") {
        setData((prev) =>
          prev.map((item) => (item.id === editData.id ? editData : item))
        );
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data berhasil diperbarui",
        timer: 1500,
        showConfirmButton: false,
      });

      setShowModal(false);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat mengupdate data",
      });
    }
  };

  if (!data.length)
    return (
      <div className="mt-6 text-center text-gray-500 italic">
        Tidak ada data untuk ditampilkan.
      </div>
    );

  return (
    <div className="space-y-5 mt-6">
      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Cari data..."
        className="border border-gray-300 px-4 py-2 rounded-lg w-full md:w-1/2 text-sm focus:ring-2 focus:ring-red-500 transition"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-red-600 text-white sticky top-0">
            <tr>
              {headers.map((h, idx) => (
                <th
                  key={idx}
                  className="p-3 text-left whitespace-nowrap font-semibold"
                >
                  {idx === 0 ? "No" : h === "Aksi" ? "Aksi" : displayHeader(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-gray-100 transition border-b last:border-b-0"
              >
                <td className="p-3 text-center">
                  {(page - 1) * itemsPerPage + idx + 1}
                </td>
                {dataKeys.map((key, j) => (
                  <td key={j} className="p-3 whitespace-nowrap">
                    {key === "jumlah"
                      ? `Rp ${parseInt(row[key] || 0).toLocaleString("id-ID")}`
                      : key === "keterangan"
                      ? row[key] === "TUNAI"
                        ? "Tunai"
                        : row[key]
                        ? "Non-Tunai"
                        : "-"
                      : key === "tanggal"
                      ? new Date(row[key]).toLocaleDateString("id-ID")
                      : row[key] || "-"}
                  </td>
                ))}
                <td className="p-3 whitespace-nowrap flex gap-2">
                  <button
                    onClick={() => handleEdit(row)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row md:justify-between items-center gap-3 text-sm text-gray-600">
        <span>
          Menampilkan {paginatedData.length} dari {filteredData.length} data
          (halaman {page} dari {totalPages})
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-1.5 rounded border bg-white hover:bg-gray-50 disabled:opacity-40"
          >
            &larr; Sebelumnya
          </button>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-1.5 rounded border bg-white hover:bg-gray-50 disabled:opacity-40"
          >
            Selanjutnya &rarr;
          </button>
        </div>
      </div>

      {/* Modal Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">
              Edit Data {type === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
            </h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              {dataKeys.map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">
                    {displayHeader(key)}
                  </label>
                  {key === "tanggal" ? (
                    <input
                      type="date"
                      value={formatDate(editData[key])}
                      onChange={(e) =>
                        setEditData({ ...editData, [key]: e.target.value })
                      }
                      className="border rounded w-full px-3 py-2"
                    />
                  ) : (
                    <input
                      type="text"
                      value={editData[key] || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, [key]: e.target.value })
                      }
                      className="border rounded w-full px-3 py-2"
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
