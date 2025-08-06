/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo, memo, useRef, useCallback } from "react";
import GuestNavbar from "../components/NavGuest";
import api from "../api";

const BASE_URL = "https://31416a5128a1.ngrok-free.app";

function getImageUrl(originalUrl) {
  if (!originalUrl) return "";
  const isFileId =
    typeof originalUrl === "string" &&
    !originalUrl.includes("/") &&
    originalUrl.trim().length > 5;

  if (isFileId) return `${BASE_URL}/api/drive/file/${originalUrl}`;
  if (/^https?:\/\//i.test(originalUrl)) return originalUrl;
  return `${BASE_URL}${originalUrl.startsWith("/") ? "" : "/"}${originalUrl}`;
}

const placeholderDataUrl =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

const blurPlaceholder =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='20' viewBox='0 0 32 20'><rect width='32' height='20' fill='#f3f4f6'/></svg>`
  );

/* ---------------- helpers for responsive urls ---------------- */
function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
    navigator.userAgent
  );
}

/**
 * Build responsive URLs for several widths and for webp fallback.
 * This function appends query params to a resolved image URL (using getImageUrl).
 * If your backend/CDN supports resizing/format parameters (eg: ?w=800&fmt=webp),
 * browser will fetch accordingly. If not supported, the server should ignore params.
 */
function buildResponsiveUrl(originalUrl, width, fmt = "") {
  if (!originalUrl) return originalUrl;
  const base = getImageUrl(originalUrl);
  const sep = base.includes("?") ? "&" : "?";
  if (fmt) return `${base}${sep}w=${width}&fmt=${fmt}`;
  return `${base}${sep}w=${width}`;
}

/* ---------------- ImageItem (responsive, mobile-friendly, retry) ---------------- */
const ImageItem = memo(function ImageItem({
  originalUrl,
  index,
  caption,
  onOpen,
  width = 400,
  height = 300,
}) {
  const imgRef = useRef();
  const [isVisible, setIsVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failedOnce, setFailedOnce] = useState(false);

  const imageUrl = useMemo(() => originalUrl || "", [originalUrl]);

  useEffect(() => {
    // If mobile, load immediately (some mobiles fail to trigger observer reliably)
    if (isMobileDevice()) {
      setIsVisible(true);
      return;
    }

    const el = imgRef.current;
    if (!el) {
      setIsVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            obs.disconnect();
          }
        });
      },
      // larger rootMargin so images start loading earlier on slow networks
      { rootMargin: "800px", threshold: 0.01 }
    );
    obs.observe(el);
    return () => obs && obs.disconnect();
  }, []);

  // responsive srcsets (uses buildResponsiveUrl which resolves through getImageUrl)
  const src480 = buildResponsiveUrl(imageUrl, 480);
  const src768 = buildResponsiveUrl(imageUrl, 768);
  const src1200 = buildResponsiveUrl(imageUrl, 1200);
  const src2000 = buildResponsiveUrl(imageUrl, 2000);

  // webp variants
  const webp480 = buildResponsiveUrl(imageUrl, 480, "webp");
  const webp768 = buildResponsiveUrl(imageUrl, 768, "webp");
  const webp1200 = buildResponsiveUrl(imageUrl, 1200, "webp");

  function handleError(e) {
    // first failure: try switching to a low-res or webp (if not tried)
    if (!failedOnce) {
      setFailedOnce(true);
      // try to replace src with a lower-res (480) or webp
      e.currentTarget.src = src480 || webp480 || placeholderDataUrl;
      return;
    }

    // second failure: final fallback
    e.currentTarget.onerror = null;
    e.currentTarget.src = placeholderDataUrl;
    setLoaded(true);
  }

  return (
    <figure
      ref={imgRef}
      className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-white/60 to-slate-50 border border-slate-100 shadow-sm transform-gpu hover:scale-[1.03] transition-transform duration-300"
      style={{ aspectRatio: `${width} / ${height}`, minHeight: 120 }}
    >
      {/* Blur placeholder behind image */}
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-300 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden
      >
        <img
          src={blurPlaceholder}
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {isVisible ? (
        <picture>
          {/* prefer webp if backend supports generating webp */}
          <source
            type="image/webp"
            srcSet={`${webp480} 480w, ${webp768} 768w, ${webp1200} 1200w`}
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
          {/* fallback types / original format */}
          <source
            srcSet={`${src480} 480w, ${src768} 768w, ${src1200} 1200w, ${src2000} 2000w`}
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
          <img
            src={src768 || getImageUrl(imageUrl)}
            alt={caption || `Foto ${index + 1}`}
            className={`relative z-10 w-full h-full object-cover block transition-transform duration-500 ease-[cubic-bezier(.2,.9,.3,1)] ${
              loaded ? "scale-100 opacity-100" : "scale-105 opacity-0"
            }`}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={handleError}
            onClick={() => onOpen(index)}
            style={{ cursor: "zoom-in" }}
            draggable={false}
            role="button"
            aria-label={`Buka foto ${index + 1}`}
          />
        </picture>
      ) : (
        <img
          src={blurPlaceholder}
          alt={`placeholder ${index + 1}`}
          className="relative z-10 w-full h-full object-cover block"
          draggable={false}
        />
      )}

      {/* decorative frame */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/60 mix-blend-normal" />

      <figcaption className="absolute left-3 bottom-3 bg-white/85 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-slate-700 shadow">
        {caption}
      </figcaption>
    </figure>
  );
});

/* ---------------- Lightbox modal ---------------- */
function Lightbox({ photos, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex || 0);

  useEffect(() => setIndex(startIndex || 0), [startIndex, photos]);

  const prev = useCallback(
    (e) => {
      e?.stopPropagation();
      setIndex((i) => (i - 1 + photos.length) % photos.length);
    },
    [photos.length]
  );
  const next = useCallback(
    (e) => {
      e?.stopPropagation();
      setIndex((i) => (i + 1) % photos.length);
    },
    [photos.length]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  if (!photos || photos.length === 0) return null;

  const photo = photos[index];
  const url = getImageUrl(photo.fullLink || photo.thumbnailLink);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="max-w-[1200px] w-full max-h-[92vh] bg-transparent relative"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={url}
          alt={photo.caption || `Foto ${index + 1}`}
          className="w-full h-[70vh] sm:h-[80vh] object-contain rounded-xl shadow-2xl bg-white"
          draggable={false}
        />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white px-3 py-2 rounded-full shadow"
          aria-label="Tutup"
        >
          ✕
        </button>

        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <button
            onClick={prev}
            className="bg-white/90 hover:bg-white p-2 rounded-full shadow"
            aria-label="Sebelumnya"
          >
            ‹
          </button>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <button
            onClick={next}
            className="bg-white/90 hover:bg-white p-2 rounded-full shadow"
            aria-label="Selanjutnya"
          >
            ›
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between px-1">
          <div className="text-white text-sm">
            <div className="font-semibold">{photo.title || photo.caption}</div>
            <div className="text-slate-200 text-xs">
              {photo.year || ""} • {photo.category || ""}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              download
              className="inline-block bg-white text-sm px-3 py-2 rounded-lg shadow hover:scale-105 transition"
            >
              Download
            </a>
            <div className="text-sm text-white/80">
              {index + 1} / {photos.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Main page ---------------- */
export default function DokumentasiGuest() {
  const [years, setYears] = useState([]);
  const [categories, setCategories] = useState([]);
  const [photos, setPhotos] = useState([]);

  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [visibleCount, setVisibleCount] = useState(24);

  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);

  useEffect(() => {
    const fetchYears = async () => {
      setLoadingYears(true);
      try {
        const res = await api.get("/foto/years");
        const data = res.data;
        setYears(data);
        if (data.length > 0) setSelectedYear(data[0]);
      } catch (err) {
        console.error("Gagal mengambil tahun:", err);
      } finally {
        setLoadingYears(false);
      }
    };
    fetchYears();
  }, []);

  useEffect(() => {
    if (!selectedYear) return;
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await api.get(`/foto/categories`, {
          params: { year: selectedYear },
        });
        const data = res.data;
        setCategories(data);
        setSelectedCategory(data[0] || null);
      } catch (err) {
        console.error("Gagal mengambil kategori:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [selectedYear]);

  useEffect(() => {
    if (!selectedYear || !selectedCategory) return;
    const fetchPhotos = async () => {
      setLoadingPhotos(true);
      try {
        const res = await api.get(`/foto/photos`, {
          params: { year: selectedYear, category: selectedCategory },
        });
        const mapped = res.data.map((p) => ({
          id: p.id,
          thumbnailLink: p.thumbnailLink || p.fileId || p.url,
          fullLink: p.fullLink || p.originalUrl || p.thumbnailLink,
          title: p.title || p.name || "",
          caption:
            p.caption || p.description || `${selectedCategory} ${selectedYear}`,
          category: selectedCategory,
          year: selectedYear,
        }));
        setPhotos(mapped);
      } catch (err) {
        console.error("Gagal mengambil foto:", err);
      } finally {
        setLoadingPhotos(false);
      }
    };
    fetchPhotos();
  }, [selectedYear, selectedCategory]);

  useEffect(() => setVisibleCount(24), [selectedCategory]);

  const visiblePhotos = useMemo(
    () => photos.slice(0, visibleCount),
    [photos, visibleCount]
  );

  const openLightboxAt = (absoluteIndex) => {
    if (absoluteIndex < 0 || absoluteIndex >= photos.length) return;
    setLightboxStart(absoluteIndex);
    setLightboxOpen(true);
  };

  return (
    <>
      <GuestNavbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-start gap-6 py-10">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                  📚 Buku Tahunan RW.09
                </h1>
                <p className="mt-3 text-slate-600 max-w-2xl">
                  Koleksi momen warga — pilih tahun & kategori. Ketuk atau klik
                  foto untuk melihat lebih besar.
                </p>
              </div>

              {/* Desktop Sidebar */}
              <aside className="hidden md:flex md:flex-col gap-4 w-72">
                <div className="bg-white/90 rounded-2xl p-4 shadow">
                  <div className="text-xs text-slate-500 uppercase font-semibold mb-2">
                    Tahun
                  </div>
                  <div className="flex flex-col gap-2 max-h-64 overflow-auto pr-1">
                    {loadingYears ? (
                      <div className="animate-pulse text-slate-400">
                        Memuat...
                      </div>
                    ) : (
                      years.map((y) => (
                        <button
                          key={y}
                          onClick={() => {
                            setSelectedYear(y);
                            setSelectedCategory(null);
                            setPhotos([]);
                          }}
                          className={`text-left w-full px-3 py-2 rounded-lg transition ${
                            selectedYear === y
                              ? "bg-indigo-600 text-white shadow-lg"
                              : "hover:bg-slate-100 bg-white text-slate-700"
                          }`}
                          aria-pressed={selectedYear === y}
                        >
                          {y}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white/80 to-slate-50 rounded-2xl p-4 shadow flex flex-col gap-1 items-start">
                  <div className="text-xs text-slate-500 uppercase font-semibold">
                    Total Foto
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-slate-800">
                    {photos.length}
                  </div>
                  <div className="text-sm text-slate-500">
                    Tahun: {selectedYear || "-"}
                  </div>
                </div>
              </aside>

              {/* Mobile year chips + total summary */}
              <div className="md:hidden w-full">
                <div className="mt-6">
                  <div className="flex gap-3 overflow-x-auto py-1 px-1">
                    {loadingYears ? (
                      <div className="animate-pulse text-slate-400">
                        Memuat...
                      </div>
                    ) : (
                      years.map((y) => (
                        <button
                          key={y}
                          onClick={() => {
                            setSelectedYear(y);
                            setSelectedCategory(null);
                            setPhotos([]);
                          }}
                          className={`whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium border transition ${
                            selectedYear === y
                              ? "bg-indigo-600 text-white"
                              : "bg-white text-slate-700 hover:bg-slate-100"
                          }`}
                          aria-pressed={selectedYear === y}
                        >
                          {y}
                        </button>
                      ))
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between bg-white rounded-xl p-3 shadow">
                    <div>
                      <div className="text-xs text-slate-500">Total Foto</div>
                      <div className="text-lg font-bold">{photos.length}</div>
                    </div>
                    <div className="text-sm text-slate-500">
                      Tahun: {selectedYear || "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
          {/* Kategori + info */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="w-full md:w-auto">
              <h2 className="text-lg font-semibold">Kategori</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {loadingCategories ? (
                  <div className="text-slate-400 animate-pulse">
                    Memuat kategori...
                  </div>
                ) : (
                  categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                        selectedCategory === c
                          ? "bg-emerald-600 text-white shadow-lg transform scale-105"
                          : "bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {c}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-500">Menampilkan</div>
              <div className="text-sm font-semibold">
                {visiblePhotos.length} / {photos.length || 0}
              </div>
            </div>
          </div>

          {/* Galeri */}
          {loadingPhotos ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 rounded-2xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : photos.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {visiblePhotos.map((photoSlice, idxSlice) => {
                  // compute absolute index in photos array
                  const absoluteIndex = photos.findIndex(
                    (p) => p.id === photoSlice.id
                  );
                  return (
                    <div key={photoSlice.id || idxSlice}>
                      <ImageItem
                        originalUrl={photoSlice.thumbnailLink}
                        index={absoluteIndex}
                        caption={photoSlice.title || photoSlice.caption}
                        onOpen={(i) => openLightboxAt(absoluteIndex)}
                      />
                    </div>
                  );
                })}
              </div>

              {photos.length > visibleCount && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setVisibleCount((p) => p + 24)}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500 text-white shadow-lg hover:scale-105 transition"
                  >
                    Tampilkan Lebih Banyak
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-slate-500">
              Tidak ada dokumentasi ditemukan untuk{" "}
              <strong>{selectedCategory}</strong> di{" "}
              <strong>{selectedYear}</strong>.
            </div>
          )}
        </section>
      </main>

      {lightboxOpen && (
        <Lightbox
          photos={photos}
          startIndex={lightboxStart}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
