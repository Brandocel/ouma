import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBlogArticleBySlug } from "../api/blog";

/** ✅ Vite safe: carga imágenes desde /src/assets/blog */
const FOTOS = import.meta.glob("/src/assets/blog/*.{png,jpg,jpeg}", {
  eager: true,
  query: "?url",
}) as Record<string, { default: string }>;

type Rect = { top: number; left: number; width: number; height: number };

function fileName(pathOrUrl: string) {
  const last = pathOrUrl.split("/").pop() ?? "";
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

/** normaliza para comparar */
function toSharedKey(anyName: string): string {
  const fn = fileName(anyName).toLowerCase().trim();
  return fn.replace(/(?:[_\-\s]?grande)(?=\.[^.]+$)/i, "");
}

/** crea nombre Grande */
function toGrandeName(filename: string) {
  const clean = fileName(filename);
  const m = clean.match(/^(.*)\.([^.]+)$/);
  const base = m ? m[1] : clean.replace(/\.[^.]+$/, "");
  const ext = m ? m[2] : clean.split(".").pop() ?? "jpg";
  return `${base}Grande.${ext}`;
}

/** ✅ indexa fotos para encontrar rápido */
const FOTO_INDEX: Record<string, string> = (() => {
  const acc: Record<string, string> = {};
  for (const [p, mod] of Object.entries(FOTOS)) {
    const name = fileName(p);
    const key = toSharedKey(name);
    acc[key] = mod.default;
  }
  return acc;
})();

/** ✅ resolve robusto: Grande -> normal -> "" */
function resolveImg(filename?: string): string {
  if (!filename) return "";
  const grande = toGrandeName(filename);
  const grandeKey = toSharedKey(grande);
  const normalKey = toSharedKey(filename);

  const hit = FOTO_INDEX[grandeKey] || FOTO_INDEX[normalKey] || "";

  if (!hit) {
    console.warn(
      "[BlogDetailSection] No se encontró imagen:",
      filename,
      "| grande:",
      grande
    );
  }

  return hit;
}

export default function BlogDetailSection() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const article = slug ? getBlogArticleBySlug(slug) : undefined;

  const targetImgRef = useRef<HTMLImageElement | null>(null);
  const [hideUntilDone, setHideUntilDone] = useState(true);

  useEffect(() => {
    const onDone = () => setHideUntilDone(false);
    window.addEventListener("shared-image-done", onDone);
    const fallback = window.setTimeout(() => setHideUntilDone(false), 600);
    return () => {
      clearTimeout(fallback);
      window.removeEventListener("shared-image-done", onDone);
    };
  }, []);

  useEffect(() => {
    const img = targetImgRef.current;
    if (!img) return;

    const sendRect = () => {
      const r = img.getBoundingClientRect();
      const to: Rect = {
        top: r.top + window.scrollY,
        left: r.left + window.scrollX,
        width: r.width,
        height: r.height,
      };
      window.dispatchEvent(
        new CustomEvent("shared-image-animate", { detail: { to } })
      );
    };

    if (img.complete && img.naturalWidth) {
      sendRect();
      return;
    }
    const onLoad = () => sendRect();
    img.addEventListener("load", onLoad);
    return () => img.removeEventListener("load", onLoad);
  }, [slug]);

  if (!article) {
    return (
      <main className="container mx-auto max-w-[1440px] px-4 md:px-6 py-16">
        <p className="text-neutral-500">Artículo no encontrado.</p>
        <button
          onClick={() => navigate("/blog")}
          className="text-neutral-800 underline"
        >
          Volver
        </button>
      </main>
    );
  }

  const sharedKey = toSharedKey(article.file);

  const handleBack = (ev?: React.MouseEvent) => {
    ev?.preventDefault();
    const img = targetImgRef.current;
    if (!img) {
      navigate("/blog");
      return;
    }

    setHideUntilDone(true);

    const rect = img.getBoundingClientRect();
    const from: Rect = {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    };
    const objectFit = getComputedStyle(img).objectFit || "cover";

    (window as any).__sharedImagePending = {
      src: img.src,
      from,
      objectFit,
      direction: "back" as const,
      sharedKey,
    };
    navigate("/blog");
  };

  return (
    <main className="container mx-auto max-w-[1440px] px-[clamp(1rem,2vw,3rem)]">
      {/* Desktop: horizontal scroller */}
      <div className="hidden md:block">
        {/* Volver */}
        <div className="text-[clamp(0.9rem,0.8vw,1.2rem)] text-neutral-400 mb-[clamp(1.5rem,2vw,3rem)]">
          <button onClick={handleBack} className="hover:text-neutral-700">
            ← Volver
          </button>
        </div>

        <HScrollRow>
          {/* Columna 1: Imagen izquierda + título y descripción */}
          <div
            className="shrink-0 align-top"
            style={{
              width: "clamp(28rem, 30vw, 48rem)",
              maxHeight:
                "calc(100vh - var(--header-h, 0px) - var(--footer-h, 0px) - 6rem)",
            }}
          >
            <div
              className="overflow-hidden bg-[#D9D9D9] mb-[clamp(1.5rem,2vw,2.5rem)]"
              style={{
                width: "100%",
                height: "clamp(17rem, 20vw, 30.2rem)",
              }}
            >
              {resolveImg(article.images?.left) ? (
                <img
                  ref={targetImgRef}
                  src={resolveImg(article.images?.left)}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  draggable={false}
                  data-shared-key={sharedKey}
                  style={{
                    opacity: hideUntilDone ? 0 : 1,
                    visibility: hideUntilDone ? "hidden" : "visible",
                    transition: "opacity 160ms ease, visibility 0s linear 160ms",
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400 font-medium">
                  Imagen no encontrada
                </div>
              )}
            </div>

            <h1
              className="font-medium text-neutral-900 mb-3"
              style={{
                fontSize: "clamp(2.2rem,2.5vw,3rem)",
                lineHeight: "1.2",
              }}
            >
              {article.title}
            </h1>
            <p
              className="text-[#A6A6A6] font-medium"
              style={{
                fontSize: "clamp(1.1rem,1.2vw,1.5rem)",
                lineHeight: "1.4",
              }}
            >
              {article.description}
            </p>
          </div>

          {/* Dividir contenido en columnas de ~6 párrafos cada una */}
          {(() => {
            const itemsPerColumn = 6;
            const totalContent = article.content || [];
            const numTextColumns = Math.ceil(totalContent.length / itemsPerColumn);
            const textColumns: React.ReactNode[] = [];
            const midPoint = Math.floor(numTextColumns / 2);

            for (let i = 0; i < numTextColumns; i++) {
              const start = i * itemsPerColumn;
              const end = start + itemsPerColumn;
              const columnContent = totalContent.slice(start, end);

              textColumns.push(
                <article
                  key={`col-${i}`}
                  className="shrink-0 align-top space-y-4"
                  style={{
                    width: "clamp(32rem, 35vw, 50rem)",
                    maxHeight:
                      "calc(100vh - var(--header-h, 0px) - var(--footer-h, 0px) - 6rem)",
                  }}
                >
                  {columnContent.map((paragraph, idx) => {
                    const globalIdx = start + idx;

                    if (paragraph.startsWith("##")) {
                      return (
                        <h2
                          key={globalIdx}
                          className="font-semibold text-neutral-900 mt-8 mb-4"
                          style={{
                            fontFamily: '"Cabinet Grotesk", sans-serif',
                            fontSize: "1.375rem",
                            lineHeight: "1.3",
                          }}
                        >
                          {paragraph.replace(/^##\s*/, "")}
                        </h2>
                      );
                    }

                    if (paragraph.startsWith("•")) {
                      return (
                        <div
                          key={globalIdx}
                          className="flex gap-3 pl-4"
                          style={{
                            fontFamily: '"Cabinet Grotesk", sans-serif',
                            fontSize: "1.0625rem",
                            lineHeight: "1.5",
                            fontWeight: 500,
                          }}
                        >
                          <span className="text-neutral-900 shrink-0">•</span>
                          <span className="text-neutral-900">
                            {paragraph.substring(1).trim()}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <p
                        key={globalIdx}
                        className="font-medium text-neutral-900"
                        style={{
                          fontFamily: '"Cabinet Grotesk", sans-serif',
                          fontSize: "1.0625rem",
                          lineHeight: "1.5",
                          fontWeight: 500,
                        }}
                      >
                        {paragraph}
                      </p>
                    );
                  })}
                </article>
              );

              // Insertar imagen derecha en el punto medio
              if (i === midPoint && article.images?.right) {
                const rightSrc = resolveImg(article.images.right);

                textColumns.push(
                  <div
                    key="img-right"
                    className="shrink-0 align-top"
                    style={{
                      maxHeight:
                        "calc(100vh - var(--header-h, 0px) - var(--footer-h, 0px) - 6rem)",
                    }}
                  >
                    <div
                      className="overflow-hidden bg-[#D9D9D9]"
                      style={{
                        width: "clamp(35rem, 40vw, 65rem)",
                        height: "clamp(23rem, 28vw, 44rem)",
                        maxHeight:
                          "calc(100vh - var(--header-h, 0px) - var(--footer-h, 0px) - 6rem)",
                      }}
                    >
                      {rightSrc ? (
                        <img
                          src={rightSrc}
                          alt="Detalle"
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 font-medium">
                          Imagen no encontrada
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            }

            return textColumns;
          })()}
        </HScrollRow>
      </div>

      {/* Mobile: vertical scroll container */}
      <div
        className="md:hidden"
        style={{
          height: "calc(100svh - var(--header-h,0px) - var(--footer-h,0px))",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        }}
      >
        <div className="px-3 pt-4 flex flex-col gap-4">
          {/* Volver */}
          <div>
            <button
              onClick={handleBack}
              className="text-[13px] text-neutral-500 hover:text-neutral-800"
            >
              ← Volver
            </button>
          </div>

          {/* Imagen izquierda + título y descripción */}
          <div>
            <div className="overflow-hidden bg-[#D9D9D9] mb-3">
              {resolveImg(article.images?.left) ? (
                <img
                  ref={targetImgRef}
                  src={resolveImg(article.images?.left)}
                  alt={article.title}
                  className="w-full h-auto object-cover"
                  draggable={false}
                  data-shared-key={sharedKey}
                  style={{
                    opacity: hideUntilDone ? 0 : 1,
                    visibility: hideUntilDone ? "hidden" : "visible",
                    transition: "opacity 160ms ease, visibility 0s linear 160ms",
                  }}
                />
              ) : (
                <div className="w-full aspect-[4/3] bg-neutral-100 flex items-center justify-center text-neutral-400 font-medium">
                  Imagen no encontrada
                </div>
              )}
            </div>
            <h1 className="font-medium text-neutral-900 text-[22px] leading-tight">
              {article.title}
            </h1>
            <p className="text-[#A6A6A6] font-medium text-[14px] leading-[1.4]">
              {article.description}
            </p>
          </div>

          {/* Texto principal */}
          <article className="space-y-3">
            {article.content?.map((paragraph, idx) => {
              if (paragraph.startsWith("##")) {
                return (
                  <h2
                    key={idx}
                    className="font-semibold text-neutral-900 mt-6 mb-3 text-[18px] leading-tight"
                    style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}
                  >
                    {paragraph.replace(/^##\s*/, "")}
                  </h2>
                );
              }
              if (paragraph.startsWith("•")) {
                return (
                  <div
                    key={idx}
                    className="flex gap-2 pl-3 text-[15px] leading-[1.4]"
                    style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}
                  >
                    <span className="text-neutral-900 shrink-0">•</span>
                    <span className="text-neutral-900 font-medium">
                      {paragraph.substring(1).trim()}
                    </span>
                  </div>
                );
              }
              return (
                <p
                  key={idx}
                  className="font-medium text-neutral-900 text-[15px] leading-[1.4]"
                  style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}
                >
                  {paragraph}
                </p>
              );
            })}
          </article>

          {/* Imagen derecha */}
          <div className="overflow-hidden bg-[#D9D9D9]">
            {resolveImg(article.images?.right) ? (
              <img
                src={resolveImg(article.images?.right)}
                alt="Imagen derecha"
                className="w-full h-auto object-cover"
                draggable={false}
              />
            ) : (
              <div className="w-full aspect-[4/3] bg-neutral-100 flex items-center justify-center text-neutral-400 font-medium">
                Imagen no encontrada
              </div>
            )}
          </div>

          <div className="pb-2" />
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* ✅ Scroll horizontal actualizado (idéntico al BlogSection, sin romper) */
/* -------------------------------------------------------------------------- */
function HScrollRow({ children }: PropsWithChildren<{ className?: string }>) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const pending = (window as any).__sharedImagePending;
    if (!pending || pending.direction !== "back") return;
    const match = document.querySelector(
      `img[data-shared-key="${pending.sharedKey}"]`
    ) as HTMLImageElement | null;
    if (!match) return;

    match.style.visibility = "hidden";
    const r = match.getBoundingClientRect();
    const to = {
      top: r.top + window.scrollY,
      left: r.left + window.scrollX,
      width: r.width,
      height: r.height,
    };

    window.dispatchEvent(
      new CustomEvent("shared-image-start", { detail: pending })
    );
    requestAnimationFrame(() => {
      window.dispatchEvent(
        new CustomEvent("shared-image-animate", { detail: { to } })
      );
    });
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    let lastX = 0,
      lastT = 0,
      v = 0,
      rafMom = 0;

    const stopMomentum = () => {
      if (rafMom) cancelAnimationFrame(rafMom);
      rafMom = 0;
    };

    const momentum = () => {
      v *= 0.95;
      if (Math.abs(v) < 0.25) {
        stopMomentum();
        return;
      }
      el.scrollLeft -= v;
      if (
        el.scrollLeft <= 0 ||
        el.scrollLeft >= el.scrollWidth - el.clientWidth
      ) {
        stopMomentum();
        return;
      }
      rafMom = requestAnimationFrame(momentum);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      stopMomentum();
      el.setPointerCapture(e.pointerId);
      lastX = e.clientX;
      lastT = performance.now();
      v = 0;
      el.classList.add("cursor-grabbing");
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!el.hasPointerCapture(e.pointerId)) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dt = now - lastT || 16.7;
      el.scrollLeft -= dx;
      v = dx * (16.7 / dt);
      lastX = e.clientX;
      lastT = now;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!el.hasPointerCapture(e.pointerId)) return;
      el.releasePointerCapture(e.pointerId);
      el.classList.remove("cursor-grabbing");
      rafMom = requestAnimationFrame(momentum);
    };

    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (d === 0) return;
      el.scrollLeft += d * 0.85;
      e.preventDefault();
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("wheel", onWheel);
      stopMomentum();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="no-scrollbar overflow-x-auto overflow-y-hidden cursor-grab select-none flex w-full"
      // snap igual que el otro componente
      style={{ touchAction: "pan-y", scrollSnapType: "x proximity" }}
    >
      <div className="flex w-max gap-[clamp(2.5rem,4vw,8rem)] items-start pr-1">
        {children}
      </div>
    </div>
  );
}
