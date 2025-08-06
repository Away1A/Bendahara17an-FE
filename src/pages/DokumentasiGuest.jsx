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
/**
 * ImageItem (safe)
 *
 * Props:
 * - originalUrl: string (thumbnail / small)
 * - fullLink: string (full image, optional)
 * - index: number (absolute index)
 * - caption: string
 * - onOpen: function(index)
 * - width, height: numbers (for aspect ratio)
 * - disableWebp: boolean (if true, do not offer webp sources)
 * - forceFmt: string|null (e.g. "jpeg" to force fmt param in URLs)
 */
const ImageItem = memo(function ImageItem({
  originalUrl,
  fullLink,
  index,
  caption,
  onOpen,
  width = 400,
  height = 300,
  disableWebp = false,
  forceFmt = "",
}) {
  const imgRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState("");
  const [fallbackStage, setFallbackStage] = useState(0);
  const [useBackground, setUseBackground] = useState(false);

  // ---------------- helper wrappers (assumes you have getImageUrl/buildResponsiveUrl)
  // If not present, implement minimal stubs here or import from your utils.
  // getImageUrl: resolve fileId or path to full absolute url
  // buildResponsiveUrl: append ?w=...&fmt=... to getImageUrl result
  if (typeof getImageUrl === "undefined") {
    // minimal fallback (you should replace with your existing function)
    // eslint-disable-next-line no-unused-vars
    var getImageUrl = (u) => u || "";
  }
  if (typeof buildResponsiveUrl === "undefined") {
    // eslint-disable-next-line no-unused-vars
    var buildResponsiveUrl = (u, w, f = "") => {
      if (!u) return "";
      const base = getImageUrl(u);
      const sep = base.includes("?") ? "&" : "?";
      if (f) return `${base}${sep}w=${w}&fmt=${f}`;
      return `${base}${sep}w=${w}`;
    };
  }

  // Ensure we have an image URL to try
  const imageUrl = useMemo(
    () => originalUrl || fullLink || "",
    [originalUrl, fullLink]
  );

  // IntersectionObserver for lazy-load
  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
        navigator.userAgent
      )
    ) {
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

  // Build URLs with optional forcing format and webp toggle
  const fmtForGrid = forceFmt || ""; // e.g. "jpeg" on mobile if provided
  const src480 = buildResponsiveUrl(imageUrl, 480, fmtForGrid);
  const src768 = buildResponsiveUrl(imageUrl, 768, fmtForGrid);
  const src1200 = buildResponsiveUrl(imageUrl, 1200, fmtForGrid);
  const src2000 = buildResponsiveUrl(imageUrl, 2000, fmtForGrid);

  const webp480 = !disableWebp
    ? buildResponsiveUrl(imageUrl, 480, "webp")
    : null;
  const webp768 = !disableWebp
    ? buildResponsiveUrl(imageUrl, 768, "webp")
    : null;
  const webp1200 = !disableWebp
    ? buildResponsiveUrl(imageUrl, 1200, "webp")
    : null;

  // Ordered fallback list (unique)
  const fallbackList = useMemo(() => {
    const list = [];
    if (src768) list.push(src768);
    if (src480) list.push(src480);
    const resolved = getImageUrl(imageUrl) || "";
    if (resolved) list.push(resolved);
    if (fullLink) list.push(getImageUrl(fullLink));
    // final fallback transparent placeholder (small)
    const placeholderDataUrl =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    list.push(placeholderDataUrl);
    // unique
    return Array.from(new Set(list)).filter(Boolean);
  }, [src768, src480, imageUrl, fullLink]);

  // Initialize currentSrc when visible
  useEffect(() => {
    if (!isVisible) return;
    if (!currentSrc && fallbackList.length > 0) {
      setCurrentSrc(fallbackList[0]);
      setFallbackStage(0);
    }
  }, [isVisible, fallbackList, currentSrc]);

  // Try next fallback on failure
  const tryNextFallback = useCallback(() => {
    setFallbackStage((s) => {
      const next = s + 1;
      if (next >= fallbackList.length) {
        setUseBackground(true);
        return s;
      }
      setCurrentSrc(fallbackList[next]);
      return next;
    });
  }, [fallbackList]);

  function handleImgError(e) {
    // log minimal for debugging (remove in prod if noisy)
    // console.warn("Image load error:", e?.currentTarget?.src);
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

  // Background candidate in case of total failure (prefer fullLink)
  const bgCandidate = getImageUrl(fullLink || imageUrl) || "";
  const backgroundStyle = useBackground
    ? {
        backgroundImage: `url('${bgCandidate}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  // Always make figure interactive so lightbox can open even if img failed
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
      className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-white/60 to-slate-50 border border-slate-100 shadow-sm transform-gpu hover:scale-[1.03] transition-transform duration-300 cursor-zoom-in"
      style={{
        aspectRatio: `${width} / ${height}`,
        minHeight: 120,
        ...(backgroundStyle || {}),
      }}
      role="button"
      aria-label={`Buka foto ${index + 1}`}
    >
      {/* blur placeholder behind image */}
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-300 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden
      >
        <img
          src={
            "data:image/svg+xml;charset=utf-8," +
            encodeURIComponent(
              `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='20' viewBox='0 0 32 20'><rect width='32' height='20' fill='#f3f4f6'/></svg>`
            )
          }
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {isVisible && !useBackground ? (
        <picture>
          {/* webp source only when allowed */}
          {!disableWebp && webp480 && (
            <source
              type="image/webp"
              srcSet={`${webp480} 480w, ${webp768} 768w, ${webp1200} 1200w`}
              sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
            />
          )}

          {/* fallback srcset (possibly forced to jpeg on mobile) */}
          <source
            srcSet={`${src480} 480w, ${src768} 768w, ${src1200} 1200w, ${src2000} 2000w`}
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
          />

          <img
            src={currentSrc || getImageUrl(imageUrl)}
            alt={caption || `Foto ${index + 1}`}
            className={`relative z-10 w-full h-full object-cover block transition-transform duration-500 ease-[cubic-bezier(.2,.9,.3,1)] ${
              loaded ? "scale-100 opacity-100" : "scale-105 opacity-0"
            }`}
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
          src={
            "data:image/svg+xml;charset=utf-8," +
            encodeURIComponent(
              `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='20' viewBox='0 0 32 20'><rect width='32' height='20' fill='#f3f4f6'/></svg>`
            )
          }
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
/* Lightbox (improved safe loader) */
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

    // Build a prioritized list of URLs to try (highest quality first)
    const resolvedMain = getImageUrl(
      photo.fullLink || photo.thumbnailLink || ""
    );
    const src1200 = buildResponsiveUrl(
      photo.fullLink || photo.thumbnailLink,
      1200
    );
    const src768 = buildResponsiveUrl(
      photo.fullLink || photo.thumbnailLink,
      768
    );
    const src480 = buildResponsiveUrl(
      photo.fullLink || photo.thumbnailLink,
      480
    );

    const candidates = Array.from(
      new Set([resolvedMain, src1200, src768, src480])
    ).filter(Boolean);

    // Safety thresholds
    const MAX_DIM = 8000; // max allowed width or height (tweakable)
    // try to load candidate sequentially
    (async () => {
      for (let i = 0; i < candidates.length; i++) {
        if (activeRef.current.cancelled) return;
        const url = candidates[i];
        try {
          // Preload using JS Image
          const img = new Image();
          // If your server requires CORS, uncomment next line and ensure server allows origin
          // img.crossOrigin = "anonymous";
          img.src = url;

          // wait for load or error
          await new Promise((resolve, reject) => {
            const to = setTimeout(() => {
              // timeout (avoid waiting forever)
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

          // If browser supports decode, await it (extra safety)
          if (img.decode) {
            try {
              await img.decode();
            } catch (decErr) {
              // decode failed -> try next candidate
              continue;
            }
          }

          // check natural size to avoid extremely large images
          const w = img.naturalWidth || 0;
          const h = img.naturalHeight || 0;
          if (w > MAX_DIM || h > MAX_DIM) {
            // image likely enormous — skip to next (fallback to smaller)
            continue;
          }

          // success: set as display source and exit loop
          setDisplaySrc(url);
          setLoading(false);
          setError(false);
          return;
        } catch (e) {
          // try next candidate
          // console.warn("lightbox preload fail", url, e);
          continue;
        }
      }

      // if all candidates exhausted
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="max-w-[1200px] w-full max-h-[92vh] bg-transparent relative flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {loading && (
          <div className="text-white flex flex-col items-center gap-3">
            <div className="loader" aria-hidden />{" "}
            {/* you can style .loader via CSS */}
            <div>Memuat gambar...</div>
          </div>
        )}

        {error && !loading && (
          <div className="text-white text-center">
            <div className="font-semibold mb-2">Gagal memuat gambar</div>
            <div className="text-sm text-white/80">
              Coba unduh atau buka lewat link.
            </div>
            <div className="mt-3">
              <a
                href={getImageUrl(photo.fullLink || photo.thumbnailLink)}
                target="_blank"
                rel="noreferrer"
                className="underline text-white/90"
              >
                Buka gambar di tab baru
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
              // fallback if something unexpected happens at render time
              // try small size or show error
              setDisplaySrc(
                buildResponsiveUrl(photo.fullLink || photo.thumbnailLink, 480)
              );
            }}
          />
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white px-3 py-2 rounded-full shadow"
          aria-label="Tutup"
        >
          ✕
        </button>

        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <button
            onClick={(e) => {
              e?.stopPropagation();
              setIndex((i) => (i - 1 + photos.length) % photos.length);
            }}
            className="bg-white/90 hover:bg-white p-2 rounded-full shadow"
            aria-label="Sebelumnya"
          >
            ‹
          </button>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <button
            onClick={(e) => {
              e?.stopPropagation();
              setIndex((i) => (i + 1) % photos.length);
            }}
            className="bg-white/90 hover:bg-white p-2 rounded-full shadow"
            aria-label="Selanjutnya"
          >
            ›
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between px-1 absolute bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)]">
          <div className="text-white text-sm">
            <div className="font-semibold">{photo.title || photo.caption}</div>
            <div className="text-slate-200 text-xs">
              {photo.year || ""} • {photo.category || ""}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={getImageUrl(photo.fullLink || photo.thumbnailLink)}
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

  // detect mobile
  const mobile =
    typeof navigator !== "undefined" &&
    /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
      navigator.userAgent
    );

  // smaller initial batch on mobile
  const [visibleCount, setVisibleCount] = useState(mobile ? 12 : 24);

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
        if (data && data.length > 0) setSelectedYear(data[0]);
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
        setSelectedCategory(data && data.length > 0 ? data[0] : null);
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
        const mapped = (res.data || []).map((p) => ({
          id: p.id,
          // thumbnail for grid; fullLink for lightbox/download
          thumbnailLink: p.thumbnailLink || p.fileId || p.url || "",
          fullLink:
            p.fullLink || p.originalUrl || p.url || p.thumbnailLink || "",
          title: p.title || p.name || "",
          caption:
            p.caption || p.description || `${selectedCategory} ${selectedYear}`,
          category: selectedCategory,
          year: selectedYear,
        }));
        setPhotos(mapped);
        // reset visibleCount when category changes (mobile-aware)
        setVisibleCount(mobile ? 12 : 24);
      } catch (err) {
        console.error("Gagal mengambil foto:", err);
      } finally {
        setLoadingPhotos(false);
      }
    };
    fetchPhotos();
  }, [selectedYear, selectedCategory, mobile]);

  // keep visibleCount reset on category change (already handled above via setVisibleCount when photos loaded)
  // compute visible slice
  const visiblePhotos = useMemo(
    () => photos.slice(0, visibleCount),
    [photos, visibleCount]
  );

  // safe compute absolute index (fallback to slice idx)
  function computeAbsoluteIndex(photoSlice, idxSlice) {
    const absoluteIndex = photos.findIndex((p) => p.id === photoSlice.id);
    return absoluteIndex >= 0 ? absoluteIndex : idxSlice;
  }

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
                  const absoluteIndex = computeAbsoluteIndex(
                    photoSlice,
                    idxSlice
                  );
                  return (
                    <div key={photoSlice.id || idxSlice}>
                      <ImageItem
                        originalUrl={photoSlice.thumbnailLink}
                        fullLink={photoSlice.fullLink}
                        index={absoluteIndex}
                        caption={photoSlice.title || photoSlice.caption}
                        onOpen={() => openLightboxAt(absoluteIndex)}
                        width={mobile ? 260 : 400}
                        height={mobile ? 180 : 300}
                        disableWebp={mobile}
                      />
                    </div>
                  );
                })}
              </div>

              {photos.length > visibleCount && (
                <div className="text-center mt-8">
                  <button
                    onClick={() =>
                      setVisibleCount((p) => p + (mobile ? 12 : 24))
                    }
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
