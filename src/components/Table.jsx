import { useState, useMemo } from "react";

export default function Table({ data }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const dataKeys = data.length
    ? Object.keys(data[0]).filter((key) => key !== "id")
    : [];

  const headers = ["No", ...dataKeys];

  const formatDate = (iso) => {
    const date = new Date(iso);
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  const filteredData = useMemo(() => {
    return data.filter((row) =>
      Object.values(row).join(" ").toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const displayHeader = (key) => {
    switch (key) {
      case "tanggal":
        return "Tanggal";
      case "sumber":
        return "Sumber";
      case "keperluan":
        return "Keperluan";
      case "kategori":
        return "Kategori";
      case "jumlah":
        return "Jumlah (Rp)";
      case "keterangan":
        return "Metode Pembayaran";
      default:
        return key.charAt(0).toUpperCase() + key.slice(1);
    }
  };

  if (!data.length)
    return <p className="text-gray-500 italic mt-4">Belum ada data.</p>;

  return (
    <div className="space-y-4 mt-4">
      <input
        type="text"
        placeholder="Cari data..."
        className="border px-3 py-2 rounded w-full md:w-1/2 text-sm"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      <div
        className="overflow-x-auto border rounded"
        style={{ minHeight: "250px" }}
      >
        <table className="min-w-full text-sm">
          <thead className="bg-red-600 text-white">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="p-3 text-left whitespace-nowrap">
                  {i === 0 ? "No" : displayHeader(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, i) => (
              <tr
                key={i}
                className="even:bg-gray-50 hover:bg-gray-100 transition"
              >
                <td className="p-3 border-t text-center">
                  {(page - 1) * itemsPerPage + i + 1}
                </td>
                {dataKeys.map((key, j) => (
                  <td key={j} className="p-3 border-t whitespace-nowrap">
                    {key === "jumlah"
                      ? `Rp ${parseInt(row[key]).toLocaleString("id-ID")}`
                      : key === "keterangan"
                      ? row[key] === "TUNAI"
                        ? "Tunai"
                        : "Non-Tunai"
                      : key === "tanggal"
                      ? formatDate(row[key])
                      : row[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Menampilkan {paginatedData.length} dari {filteredData.length} data
        </span>
        <div className="space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            &larr; Sebelumnya
          </button>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            Selanjutnya &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
