import { useEffect, useState } from "react";
import GuestNavbar from "../components/NavGuest";
import TablePendaftaran from "../components/TablePendaftaran";
import api from "../api";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { BadgeCheck, CalendarDays, MapPin, Users } from "lucide-react";

export default function AcaraGuestModern() {
  const [pendaftar, setPendaftar] = useState([]);
  const [loading, setLoading] = useState(true);

  const posters = [
    "/poster1.png",
    "/poster2.jpg",
    "/poster3.jpg",
    "/poster4.jpg",
    "/poster5.jpg",
    "/poster6.jpg",
    "/poster7.jpg",
    "/poster8.jpg",
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
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800">
        {/* Hero */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pb-28 bg-gradient-to-r from-blue-900 to-indigo-800 text-white">
          {/* Overlay gelap */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/20 to-black/50"></div>
            <div className="absolute inset-0 bg-cover bg-center opacity-10"></div>
          </div>

          {/* Konten tengah */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm mb-4">
              <span className="text-yellow-200">🎉 Agenda Kegiatan RW.09</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight max-w-3xl mx-auto">
              Jadwal & Acara Spesial{" "}
              <span className="text-yellow-200">Bersama Warga</span>
            </h1>

            <p className="mt-6 text-lg text-pink-100 max-w-2xl mx-auto leading-relaxed">
              Jadwal lengkap lomba, lokasi acara, pendaftaran, hingga
              dokumentasi dan tutorial.
            </p>
          </div>
        </section>

        <section className="bg-white border border-gray-100 shadow-xl rounded-3xl px-8 py-12 md:px-12 md:py-16 space-y-12">
          {/* Judul */}
          <header className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-full shadow-sm">
              <CalendarDays className="w-6 h-6" />
              <span className="font-semibold">Informasi Acara</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
              Jadwal & Detail Kegiatan
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl">
              Semua informasi penting mengenai acara RW.09 dalam satu tempat.
            </p>
          </header>

          {/* Grid Konten */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-gray-700 text-[17px] leading-relaxed">
            {/* Kolom Kiri */}
            <div className="space-y-8">
              {/* Jadwal */}
              <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-blue-700 text-lg mb-3">
                  📅 Jadwal Acara
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Lomba Porga: 2, 3, 9, 10 Agustus 2025</li>
                  <li>Lomba Senam: 9, 10 Agustus 2025</li>
                  <li>Lomba Gaple: Mulai 1 Agustus 2025</li>
                  <li>Lomba Tenis Meja: 9, 10, 16 Agustus 2025</li>
                  <li>Lomba 17an: 17 Agustus 2025</li>
                  <li>Lomba Adzan, Kaligrafi & Pengajian: 16 Agustus 2025</li>
                  <li>Malam Puncak: 20 September 2025</li>
                </ul>
              </div>

              {/* Tema */}
              <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-blue-700 text-lg mb-2">
                  🎯 Tema Acara
                </h3>
                <p className="italic text-gray-800">"Flora dan Fauna"</p>
              </div>

              {/* Peserta */}
              <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-blue-700 text-lg mb-2">
                  👨‍👩‍👧‍👦 Peserta
                </h3>
                <p className="text-gray-800">
                  Seluruh Warga Cluster Palem RW.09
                </p>
              </div>

              {/* Rundown */}
              <div className="bg-blue-50 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-blue-700 flex items-center gap-2 mb-2">
                  <BadgeCheck className="w-5 h-5 text-blue-600" />
                  Rundown Acara
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Unduh jadwal resmi seluruh rangkaian kegiatan lomba:
                </p>
                <a
                  href="/rundown.xlsx"
                  download
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all"
                >
                  📥 Download Rundown Excel
                </a>
              </div>
            </div>

            {/* Kolom Kanan */}
            <div className="space-y-8">
              {/* Lokasi */}
              <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-blue-700 text-lg mb-2">
                  📍 Lokasi Acara
                </h3>
                <p className="text-gray-800">
                  Lapang Palem & Masjid Al-Ukhuwah
                </p>
              </div>

              {/* Peta */}
              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
                <iframe
                  className="w-full h-72"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.3751549660547!2d107.69794897628591!3d-6.964994168198292!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68c2f63bd349dd%3A0xa72c859dcd597db8!2sCluster%20Palem%20Bumi%20Adipura!5e0!3m2!1sen!2sid!4v1753936865431!5m2!1sen!2sid"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Poster Gallery */}
        <section className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl text-3xl shadow-sm">
              🖼️
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Galeri Poster</h2>
          </div>

          {/* Deskripsi */}
          <p className="text-gray-600 text-lg">
            Lihat koleksi poster menarik dari berbagai lomba yang telah kami
            selenggarakan. Klik untuk melihat lebih jelas!
          </p>

          {/* Swiper Gallery */}
          <Swiper
            spaceBetween={24}
            slidesPerView={1.2}
            breakpoints={{
              640: { slidesPerView: 1.5 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pt-2"
          >
            {posters.map((src, i) => (
              <SwiperSlide key={i}>
                <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md hover:shadow-xl transition">
                  <img
                    src={src}
                    alt={`Poster ${i + 1}`}
                    className="h-[350px] w-full object-contain transform group-hover:scale-[1.02] transition duration-300"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* Kategori & Hadiah */}
        <section className="bg-gradient-to-br from-yellow-50 to-white p-8 rounded-2xl shadow border border-yellow-100 space-y-6">
          <h2 className="text-3xl font-bold text-yellow-800 flex items-center gap-2">
            🏆 Kategori & Hadiah
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              "⚽ Futsal Anak",
              "🎯 Karengrung",
              "🥤 Sedotan Botol",
              "🥛 Tiup Gelas",
              "🎨 Mewarnai Kaligrafi",
              "🕌 Adzan",
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white border border-yellow-100 rounded-xl px-4 py-3 text-gray-700 flex items-center gap-3 shadow-sm hover:shadow-md transition"
              >
                <span className="text-xl">{item}</span>
              </div>
            ))}
          </div>

          <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 flex items-center gap-4 mt-4">
            <span className="text-3xl">🎁</span>
            <p className="text-yellow-800 font-medium">
              Hadiah menarik & sertifikat menanti para pemenang di setiap
              kategori!
            </p>
          </div>
        </section>

        {/* Video Tutorial */}
        <section className="bg-gradient-to-br from-white to-red-50 p-8 rounded-3xl shadow-xl border border-red-100 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="text-red-500 bg-white border border-red-200 p-3 rounded-2xl shadow-sm text-3xl">
              🎬
            </div>
            <h2 className="text-3xl font-bold text-red-600">Video Tutorial</h2>
          </div>

          {/* Description */}
          <p className="text-gray-700 text-lg">
            Yuk tonton video tutorial berikut sebagai panduan sebelum mengikuti
            lomba! Jangan lupa tonton sampai selesai ya! 🎥
          </p>

          {/* Video Box */}
          <div className="relative w-full aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden border-4 border-red-300 shadow-xl hover:shadow-2xl transition">
            <iframe
              src="https://drive.google.com/file/d/19qQVcLk1h76OXu1rvYvzPmRDflM1Q0wg/preview"
              allow="autoplay"
              allowFullScreen
              className="w-full h-full"
            />
            <div className="absolute inset-0 bg-black/10 hover:bg-black/5 transition pointer-events-none" />
          </div>

          {/* Optional CTA */}
          <div className="mt-4 bg-white border border-red-100 p-4 rounded-xl text-red-700 flex items-center gap-3 shadow-sm">
            <span className="text-xl">❗</span>
            <p>
              Pastikan kamu memahami alur lomba dengan baik setelah menonton
              videonya.
            </p>
          </div>
        </section>

        {/* Pendaftaran */}
        <section className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow border border-gray-100 space-y-6">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            🧾 Pendaftaran Lomba
          </h2>

          <p className="text-gray-700 text-lg">
            Untuk mendaftar lomba, silakan hubungi salah satu contact person
            berikut:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Azeel */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-4">
              <div className="text-3xl text-green-500">📱</div>
              <div>
                <p className="text-lg font-semibold text-gray-800">Azeel</p>
                <p className="text-gray-600">0821-1807-1057</p>
              </div>
            </div>

            {/* Rasya */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-4">
              <div className="text-3xl text-green-500">📱</div>
              <div>
                <p className="text-lg font-semibold text-gray-800">Rasya</p>
                <p className="text-gray-600">0877-2294-5599</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 flex items-start gap-3">
            <span className="text-xl">✅</span>
            <p>
              Segera daftarkan diri! Pendaftaran dibuka hingga{" "}
              <strong>16 Agustus 2025</strong>.
            </p>
          </div>
        </section>

        {/* Tabel Pendaftar */}
        <section className="bg-white p-8 rounded-2xl shadow border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            👥 Peserta Terdaftar
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
