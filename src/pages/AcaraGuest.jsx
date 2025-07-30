import { useEffect, useState } from "react";
import GuestNavbar from "../components/NavGuest";
import TablePendaftaran from "../components/TablePendaftaran";
import api from "../api";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function AcaraGuest() {
  const [pendaftar, setPendaftar] = useState([]);
  const [loading, setLoading] = useState(true);

  const posters = [
    "/poster1.png",
    "/poster2.jpg",
    "/poster3.jpg",
    "/poster4.jpg",
    "/poster5.jpg",
    "/poster6.jpg",
  ];

  useEffect(() => {
    const fetchPendaftar = async () => {
      try {
        const res = await api.get("pendaftaran/all");
        setPendaftar(res.data || []);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
        setPendaftar([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPendaftar();
  }, []);

  return (
    <>
      <GuestNavbar />
      <main className="px-4 sm:px-6 lg:px-8 py-12 max-w-5xl mx-auto space-y-12">
        <h1 className="text-4xl font-bold text-center text-gray-800">
          Informasi Acara & Pendaftaran
        </h1>

        {/* Section Rundown Acara */}
        <section className="bg-white shadow rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            📋 Rundown Acara
          </h2>
          <p className="text-gray-600 mb-3">
            Silakan unduh file rundown acara dalam format Excel berikut:
          </p>
          <a
            href="/rundown.xlsx"
            download
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
          >
            📥 Download Rundown Acara
          </a>
        </section>

        {/* Section Poster Carousel */}
        <section className="bg-white shadow rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            📢 Poster Acara
          </h2>
          <Swiper
            spaceBetween={16}
            slidesPerView={1.2}
            breakpoints={{
              640: { slidesPerView: 1.5 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {posters.map((src, idx) => (
              <SwiperSlide key={idx} className="flex justify-center">
                <img
                  src={src}
                  alt={`Poster ${idx + 1}`}
                  className="h-[420px] object-contain rounded-md shadow-lg"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* Video Tutorial */}
        <section className="mb-12 bg-white shadow rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Video Tutorial Perlombaan
          </h2>
          <div className="aspect-video w-full max-w-3xl mx-auto">
            <iframe
              src="https://drive.google.com/file/d/19qQVcLk1h76OXu1rvYvzPmRDflM1Q0wg/preview"
              width="100%"
              height="360"
              allow="autoplay"
              allowFullScreen
              className="rounded shadow w-full h-full"
            />
          </div>
        </section>

        {/* Section Tabel Pendaftar */}
        <section className="bg-white shadow rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            👥 Daftar Peserta Lomba Anak - anak
          </h2>
          {loading ? (
            <p className="text-gray-500">Memuat data peserta...</p>
          ) : pendaftar.length === 0 ? (
            <p className="text-red-500">Belum ada peserta terdaftar.</p>
          ) : (
            <TablePendaftaran data={pendaftar} />
          )}
        </section>
      </main>
    </>
  );
}
