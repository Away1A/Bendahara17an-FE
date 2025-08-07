/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo, memo, useRef, useCallback } from "react";
import GuestNavbar from "../components/NavGuest";
import api from "../api";

const BASE_URL = "https://tarka.ngrok.app";

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
  fullLink,
}) {
  const imgRef = useRef();
  const [isVisible, setIsVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState("");
  const [fallbackStage, setFallbackStage] = useState(0);
  const [useBackground, setUseBackground] = useState(false);

  const imageUrl = useMemo(() => originalUrl || "", [originalUrl]);

  useEffect(() => {
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
      { rootMargin: "800px", threshold: 0.01 }
    );
    obs.observe(el);
    return () => obs && obs.disconnect();
  }, []);

  const src768 = buildResponsiveUrl(imageUrl, 768);
  const src480 = buildResponsiveUrl(imageUrl, 480);
  const src1200 = buildResponsiveUrl(imageUrl, 1200);
  const src2000 = buildResponsiveUrl(imageUrl, 2000);

  const webp480 = buildResponsiveUrl(imageUrl, 480, "webp");
  const webp768 = buildResponsiveUrl(imageUrl, 768, "webp");
  const webp1200 = buildResponsiveUrl(imageUrl, 1200, "webp");

  const fallbackList = useMemo(() => {
    const list = [];
    if (src768) list.push(src768);
    if (src480) list.push(src480);
    const resolved = getImageUrl(imageUrl) || "";
    if (resolved) list.push(resolved);
    if (fullLink) list.push(getImageUrl(fullLink));
    list.push(placeholderDataUrl);
    return Array.from(new Set(list)).filter(Boolean);
  }, [src768, src480, imageUrl, fullLink]);

  useEffect(() => {
    if (!isVisible) return;
    if (!currentSrc && fallbackList.length > 0) {
      setCurrentSrc(fallbackList[0]);
      setFallbackStage(0);
    }
  }, [isVisible, fallbackList, currentSrc]);

  function tryNextFallback() {
    setFallbackStage((s) => {
      const next = s + 1;
      if (next >= fallbackList.length) {
        setUseBackground(true);
        return s;
      }
      setCurrentSrc(fallbackList[next]);
      return next;
    });
  }

  function handleImgError(e) {
    tryNextFallback();
  }

  function handleImgLoad(e) {
    const w = e.currentTarget.naturalWidth || 0;
    if (w === 0) {
      tryNextFallback();
      return;
    }
    setLoaded(true);
    if (useBackground) setUseBackground(false);
  }

  const bgCandidate = getImageUrl(fullLink || imageUrl) || blurPlaceholder;
  const backgroundStyle = useBackground
    ? {
        backgroundImage: `url('${bgCandidate}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  const handleOpen = (e) => {
    e?.stopPropagation();
    if (typeof onOpen === "function") onOpen(index);
  };

  return (
    <figure
      ref={imgRef}
      onClick={handleOpen}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleOpen(e);
      }}
      className="relative rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:shadow-lg group"
      style={{
        aspectRatio: `${width} / ${height}`,
        minHeight: 120,
        ...(backgroundStyle || {}),
      }}
      role="button"
      aria-label={`Buka foto ${index + 1}`}
    >
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

      {isVisible && !useBackground ? (
        <picture>
          <source
            type="image/webp"
            srcSet={`${webp480} 480w, ${webp768} 768w, ${webp1200} 1200w`}
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
          <source
            srcSet={`${src480} 480w, ${src768} 768w, ${src1200} 1200w, ${src2000} 2000w`}
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
          <img
            src={currentSrc || placeholderDataUrl}
            alt={caption || `Foto ${index + 1}`}
            className={`relative z-10 w-full h-full object-cover block transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              loaded ? "scale-100 opacity-100" : "scale-105 opacity-0"
            } group-hover:scale-105`}
            loading="lazy"
            decoding="async"
            onLoad={handleImgLoad}
            onError={handleImgError}
            draggable={false}
            role="presentation"
          />
        </picture>
      ) : useBackground ? (
        <div
          className="relative z-10 w-full h-full block"
          aria-hidden={false}
        />
      ) : (
        <img
          src={blurPlaceholder}
          alt={`placeholder ${index + 1}`}
          className="relative z-10 w-full h-full object-cover block"
          draggable={false}
        />
      )}

      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/60 mix-blend-normal" />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-end p-4">
        <figcaption className="text-white text-sm font-medium truncate w-full">
          {caption}
        </figcaption>
      </div>
    </figure>
  );
});

/* ---------------- Lightbox modal ---------------- */
function Lightbox({ photos, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex || 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [displaySrc, setDisplaySrc] = useState(null);
  const activeRef = useRef({ cancelled: false });

  useEffect(() => {
    setIndex(startIndex || 0);
  }, [startIndex, photos]);

  useEffect(() => {
    activeRef.current.cancelled = false;
    setError(false);
    setLoading(true);
    setDisplaySrc(null);

    if (!photos || photos.length === 0) {
      setLoading(false);
      return;
    }

    const photo = photos[index];

    const resolvedMain = getImageUrl(photo.full || photo.thumbnailLink || "");
    const src1200 = buildResponsiveUrl(photo.full || photo.thumbnailLink, 1200);
    const src768 = buildResponsiveUrl(photo.full || photo.thumbnailLink, 768);
    const src480 = buildResponsiveUrl(photo.full || photo.thumbnailLink, 480);

    const candidates = Array.from(
      new Set([resolvedMain, src1200, src768, src480])
    ).filter(Boolean);

    const MAX_DIM = 8000;
    (async () => {
      for (let i = 0; i < candidates.length; i++) {
        if (activeRef.current.cancelled) return;
        const url = candidates[i];
        try {
          const img = new Image();
          img.src = url;

          await new Promise((resolve, reject) => {
            const to = setTimeout(() => {
              reject(new Error("timeout"));
            }, 8000);

            img.onload = () => {
              clearTimeout(to);
              resolve();
            };
            img.onerror = (ev) => {
              clearTimeout(to);
              reject(new Error("error loading"));
            };
          });

          if (img.decode) {
            try {
              await img.decode();
            } catch (decErr) {
              continue;
            }
          }

          const w = img.naturalWidth || 0;
          const h = img.naturalHeight || 0;
          if (w > MAX_DIM || h > MAX_DIM) {
            continue;
          }

          setDisplaySrc(url);
          setLoading(false);
          setError(false);
          return;
        } catch (e) {
          continue;
        }
      }

      setLoading(false);
      setError(true);
    })();

    return () => {
      activeRef.current.cancelled = true;
    };
  }, [index, photos]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + photos.length) % photos.length);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, photos.length]);

  if (!photos || photos.length === 0) return null;

  const photo = photos[index];
  const safeAlt = photo.caption || photo.title || `Foto ${index + 1}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="max-w-[1200px] w-full max-h-[92vh] bg-transparent relative flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {loading && (
          <div className="text-white flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            <div className="text-white/80">Memuat gambar...</div>
          </div>
        )}

        {error && !loading && (
          <div className="text-white text-center max-w-md">
            <div className="font-semibold mb-2 text-lg">
              Gagal memuat gambar
            </div>
            <div className="text-sm text-white/80 mb-4">
              Coba unduh atau buka lewat link.
            </div>
            <div className="mt-3">
              <a
                href={getImageUrl(photo.full || photo.thumbnailLink)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <span>Buka gambar di tab baru</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        )}

        {!loading && !error && displaySrc && (
          <img
            src={displaySrc}
            alt={safeAlt}
            className="rounded-xl shadow-2xl bg-white object-contain"
            style={{
              maxHeight: "80vh",
              maxWidth: "100%",
              width: "auto",
              height: "auto",
            }}
            draggable={false}
            onError={(e) => {
              setDisplaySrc(
                buildResponsiveUrl(photo.full || photo.thumbnailLink, 480)
              );
            }}
          />
        )}

        <button
          onClick={onClose}
          className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 p-2.5 rounded-full shadow backdrop-blur-lg transition-colors"
          aria-label="Tutup"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="absolute left-6 top-1/2 -translate-y-1/2">
          <button
            onClick={(e) => {
              e?.stopPropagation();
              setIndex((i) => (i - 1 + photos.length) % photos.length);
            }}
            className="bg-white/10 hover:bg-white/20 p-3 rounded-full shadow backdrop-blur-lg transition-colors"
            aria-label="Sebelumnya"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
          <button
            onClick={(e) => {
              e?.stopPropagation();
              setIndex((i) => (i + 1) % photos.length);
            }}
            className="bg-white/10 hover:bg-white/20 p-3 rounded-full shadow backdrop-blur-lg transition-colors"
            aria-label="Selanjutnya"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between px-1 absolute bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-2xl bg-black/50 backdrop-blur-sm rounded-xl py-3 px-4">
          <div className="text-white">
            <div className="font-semibold text-lg">
              {photo.title || photo.caption}
            </div>
            <div className="text-slate-200 text-sm">
              {photo.year || ""} • {photo.category || ""}
            </div>
          </div>
          <div className="flex items-center gap-2">
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
          full: p.full || p.fullLink || p.originalUrl || p.thumbnailLink,
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

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 text-white">
          {/* Decorative Floating Orbs */}
          <div className="absolute top-[-100px] left-[-80px] w-[300px] h-[300px] bg-blue-500 rounded-full opacity-30 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-120px] right-[-100px] w-[300px] h-[300px] bg-indigo-400 rounded-full opacity-30 blur-3xl animate-pulse"></div>

          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-5 pointer-events-none z-0"></div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
            <svg
              className="w-6 h-6 text-white opacity-70"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 grid md:grid-cols-2 gap-12 items-center animate-fade-in">
            {/* Left Content */}
            <div>
              <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm mb-4 shadow">
                <span className="text-blue-300">📸 Galeri Digital RW.09</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight drop-shadow">
                Mengabadikan Momen{" "}
                <span className="text-blue-300">Bersama</span> Warga
              </h1>
              <p className="mt-6 text-lg text-blue-100 max-w-xl leading-relaxed">
                Jelajahi koleksi dokumentasi perjalanan RW.09 dari tahun ke
                tahun. Setiap foto adalah cerita, setiap momen adalah kenangan
                yang tak terlupakan.
              </p>
              <p className="mt-2 text-sm italic text-blue-200">
                "Karena setiap tawa dan kebersamaan layak dikenang."
              </p>

              {/* Stats */}
              <div className="mt-10 flex flex-wrap gap-4">
                {[
                  { label: "Total Tahun", value: years.length },
                  { label: "Total Foto", value: photos.length },
                  { label: "Tahun Aktif", value: selectedYear || "-" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white/10 backdrop-blur-lg px-6 py-4 rounded-xl shadow-md hover:shadow-blue-500/20 transition-all"
                  >
                    <div className="text-blue-200 text-sm">{item.label}</div>
                    <div className="text-2xl font-bold text-white">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Card Filter */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-xl hover:shadow-indigo-500/20 transition-all">
              <div>
                <div className="text-xl font-semibold mb-4">🎯 Pilih Tahun</div>
                <div className="flex flex-wrap gap-3 mb-6">
                  {loadingYears
                    ? [...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="h-10 w-20 bg-white/20 rounded-lg animate-pulse"
                        ></div>
                      ))
                    : years.slice(0, 6).map((y) => (
                        <button
                          key={y}
                          onClick={() => {
                            setSelectedYear(y);
                            setSelectedCategory(null);
                            setPhotos([]);
                          }}
                          className={`relative group overflow-hidden px-4 py-2 rounded-lg text-sm font-medium transition-all 
                    ${
                      selectedYear === y
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-105"
                        : "bg-white/10 hover:bg-white/20 text-white hover:scale-105"
                    }`}
                        >
                          <span className="absolute inset-0 rounded-lg border border-blue-400 opacity-0 group-hover:opacity-100 blur-md transition duration-300"></span>
                          <span className="relative z-10 flex items-center gap-1">
                            📅 {y}
                          </span>
                        </button>
                      ))}
                </div>
              </div>

              <div>
                <div className="text-xl font-semibold mb-4">📂 Kategori</div>
                <div className="flex flex-wrap gap-3">
                  {loadingCategories
                    ? [...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="h-10 w-24 bg-white/20 rounded-full animate-pulse"
                        ></div>
                      ))
                    : categories.slice(0, 5).map((c) => (
                        <button
                          key={c}
                          onClick={() => setSelectedCategory(c)}
                          className={`relative group px-4 py-2 rounded-full text-sm font-medium transition-all 
                    ${
                      selectedCategory === c
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-105"
                        : "bg-white/10 hover:bg-white/20 text-white hover:scale-105"
                    }`}
                        >
                          <span className="absolute inset-0 rounded-full border border-emerald-300 opacity-0 group-hover:opacity-100 blur-md transition duration-300"></span>
                          <span className="relative z-10 flex items-center gap-1">
                            🏷️ {c}
                          </span>
                        </button>
                      ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 mt-20 relative z-10">
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
              <div className="w-full">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-2xl font-bold text-slate-800">
                    Galeri Foto
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full">
                    <span className="font-medium text-blue-700">Tahun: </span>
                    <span className="font-bold">{selectedYear || "-"}</span>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 rounded-full">
                    <span className="font-medium text-emerald-700">
                      Kategori:{" "}
                    </span>
                    <span className="font-bold">{selectedCategory || "-"}</span>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-4 py-2 rounded-full">
                    <span className="font-medium text-purple-700">Total: </span>
                    <span className="font-bold">{photos.length} Foto</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 px-6 py-2.5 rounded-full min-w-[240px]">
                <div className="text-sm text-slate-600">Menampilkan</div>
                <div className="text-sm font-semibold text-slate-800">
                  {visiblePhotos.length}{" "}
                  <span className="text-slate-500">/</span> {photos.length || 0}
                </div>
              </div>
            </div>

            {/* Galeri */}
            {loadingPhotos ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[4/3] rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 animate-pulse"
                  />
                ))}
              </div>
            ) : photos.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                  {visiblePhotos.map((photoSlice, idxSlice) => {
                    const absoluteIndex = photos.findIndex(
                      (p) => p.id === photoSlice.id
                    );
                    return (
                      <div
                        key={photoSlice.id || idxSlice}
                        className="transform transition-transform hover:-translate-y-1"
                      >
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
                  <div className="text-center mt-10">
                    <button
                      onClick={() => setVisibleCount((p) => p + 24)}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] font-medium"
                    >
                      <span>Tampilkan Lebih Banyak</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center">
                <div className="mx-auto max-w-md">
                  <svg
                    className="mx-auto h-24 w-24 text-slate-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  <h3 className="mt-5 text-2xl font-bold text-slate-800">
                    Belum Ada Dokumentasi
                  </h3>
                  <p className="mt-3 text-slate-600 max-w-md mx-auto">
                    Untuk tahun{" "}
                    <span className="font-medium text-blue-600">
                      {selectedYear}
                    </span>{" "}
                    dan kategori{" "}
                    <span className="font-medium text-emerald-600">
                      {selectedCategory}
                    </span>
                    , belum ada dokumentasi yang tersedia. Dokumentasi akan
                    segera diupdate.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Info Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>

            <div className="relative z-10">
              <div className="max-w-3xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Kenapa Penting Mendokumentasikan Momen?
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-blue-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        Merekam Perjalanan
                      </h3>
                      <p className="text-blue-100">
                        Setiap foto adalah saksi bisu perkembangan dan
                        pertumbuhan RW.09 dari waktu ke waktu.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-emerald-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        Mempererat Kebersamaan
                      </h3>
                      <p className="text-blue-100">
                        Foto bersama menjadi pengingat akan kebersamaan dan
                        kehangatan antar warga.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-amber-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        Arsip Historis
                      </h3>
                      <p className="text-blue-100">
                        Dokumentasi ini menjadi warisan berharga untuk generasi
                        mendatang di RW.09.
                      </p>
                    </div>
                  </div>
                </div>

                <button className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-900 rounded-full font-medium hover:bg-blue-50 transition-colors">
                  <span>Bagikan Momen Anda</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ikuti Dokumentasi Kami</h3>
          <p className="text-slate-400 mb-6">
            Lihat momen-momen kegiatan warga RW.09 secara langsung melalui
            Instagram.
          </p>

          {/* Instagram Button */}
          <a
            href="https://www.instagram.com/forumremaja_09"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 transition-colors text-white font-semibold rounded-full"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            @forumremaja_09
          </a>

          {/* Bottom copyright */}
          <div className="mt-10 text-sm text-slate-500">
            © {new Date().getFullYear()} Dokumentasi RW.09 — Semua hak
            dilindungi.
          </div>
        </div>
      </footer>

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
