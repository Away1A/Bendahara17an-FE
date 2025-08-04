import { useMemo, useState, useEffect } from "react";
import { Users, Trophy, Home, Loader2 } from "lucide-react";
import { Menu } from "@headlessui/react";

export default function TablePendaftaran({ data }) {
  const [search, setSearch] = useState("");
  const [selectedRT, setSelectedRT] = useState("Semua");
  const [selectedLomba, setSelectedLomba] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500); // simulate loading
    return () => clearTimeout(timer);
  }, [data]);

  const groupByPeserta = (data) => {
    const map = new Map();
    for (const row of data) {
      const key = `${row.nama}|${row.usia}|${row.rt}`;
      if (!map.has(key)) {
        map.set(key, { ...row, lomba: [row.lomba] });
      } else {
        map.get(key).lomba.push(row.lomba);
      }
    }
    return Array.from(map.values());
  };

  const filtered = useMemo(() => {
    const grouped = groupByPeserta(data);

    return grouped.filter((row) => {
      if (selectedRT !== "Semua" && row.rt !== selectedRT) return false;
      if (selectedLomba !== "Semua" && !row.lomba.includes(selectedLomba))
        return false;
      return [row.nama, row.usia, row.rt, ...row.lomba]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
    });
  }, [data, search, selectedRT, selectedLomba]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const rtOptions = useMemo(() => {
    const unique = Array.from(new Set(data.map((d) => d.rt)));
    return ["Semua", ...unique];
  }, [data]);

  const lombaOptions = useMemo(() => {
    const all = new Set();
    for (const d of data) all.add(d.lomba);
    return ["Semua", ...Array.from(all)];
  }, [data]);

  return (
    <div className="space-y-6 mt-8 prose prose-sm max-w-none">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <input
          type="text"
          placeholder="🔍 Cari nama, RT, lomba..."
          className="border border-gray-300 px-4 py-2 rounded-lg w-full md:w-1/3 text-sm focus:ring-2 focus:ring-purple-500 transition"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <div className="flex flex-wrap gap-3 text-sm">
          <select
            className="border px-3 py-1 rounded-lg"
            value={selectedRT}
            onChange={(e) => {
              setSelectedRT(e.target.value);
              setPage(1);
            }}
          >
            {rtOptions.map((rt) => (
              <option key={rt} value={rt}>
                {rt === "Semua" ? "Semua RT" : `RT ${rt}`}
              </option>
            ))}
          </select>

          <select
            className="border px-3 py-1 rounded-lg"
            value={selectedLomba}
            onChange={(e) => {
              setSelectedLomba(e.target.value);
              setPage(1);
            }}
          >
            {lombaOptions.map((lomba) => (
              <option key={lomba} value={lomba}>
                {lomba === "Semua" ? "Semua Lomba" : lomba}
              </option>
            ))}
          </select>

          <span className="flex items-center gap-1 text-gray-600">
            <Users className="w-4 h-4" />
            {filtered.length} Peserta
          </span>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center text-gray-500 py-10">
          <Loader2 className="animate-spin inline-block w-6 h-6 mr-2" />
          Memuat data peserta...
        </div>
      ) : !filtered.length ? (
        <div className="text-center text-gray-500 italic">
          Tidak ada data pendaftar.
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {paginated.map((row, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow hover:shadow-md transition space-y-3"
              >
                <div className="text-lg font-semibold text-purple-700">
                  👤 {row.nama}
                </div>
                <div className="text-sm text-gray-700 flex items-center gap-2">
                  🎂 Usia: <span className="font-medium">{row.usia}</span>
                </div>
                <div className="text-sm text-gray-700 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  RT {row.rt}
                </div>

                <div className="pt-2">
                  <div className="text-sm text-gray-600 mb-1">
                    Lomba Diikuti:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {row.lomba.map((l, i) => (
                      <span
                        key={i}
                        className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
                      >
                        <Trophy className="w-3 h-3" />
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-500 pt-2">
                  Total: {row.lomba.length} lomba
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded-lg text-sm border ${
                    page === i + 1
                      ? "bg-purple-600 text-white"
                      : "bg-white text-gray-700"
                  }`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
