import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBlogArticleBySlug } from "../api/blog";

const FOTOS = import.meta.glob("../../assets/blog/*", {
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

function resolveGrande(filename: string): string {
  const m = filename.match(/^(.*)\.([^.]+)$/);
  const base = m ? m[1] : filename.replace(/\.[^.]+$/, "");
  const ext = m ? m[2] : filename.split(".").pop() ?? "png";
  const grandeName = `${base}Grande.${ext}`;
  const hitGrande = Object.entries(FOTOS).find(([p]) =>
    p.endsWith("/" + grandeName)
  );
  if (hitGrande) return hitGrande[1].default;
  const hit = Object.entries(FOTOS).find(([p]) => p.endsWith("/" + filename));
  return hit?.[1]?.default ?? "";
}

function toSharedKey(anyName: string): string {
  const fn = fileName(anyName).toLowerCase();
  return fn.replace(/(?:[_\-\s]?grande)(?=\.[^.]+$)/i, "");
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

  const imgUrl = resolveGrande(article.file);
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
      {/* Volver */}
      <div className="text-[clamp(0.9rem,0.8vw,1.2rem)] text-neutral-400 mb-[clamp(1.5rem,2vw,3rem)]">
        <button onClick={handleBack} className="hover:text-neutral-700">
          ← Volver
        </button>
      </div>

      <HScrollRow>
        {/* Columna izquierda */}
        <div className="shrink-0 pr-[clamp(2rem,3vw,4rem)] align-top">
          <div
            className="overflow-hidden bg-[#D9D9D9] mb-[clamp(1.5rem,2vw,2.5rem)]"
            style={{
              width: "clamp(28rem, 25vw, 48rem)",
              height: "clamp(17rem, 16vw, 30.2rem)",
            }}
          >
            <img
              ref={targetImgRef}
              src={article.images?.left ?? imgUrl}
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
          </div>

          <h1
            className="font-medium text-neutral-900"
            style={{
              fontSize: "clamp(2.8rem,3vw,4.8rem)",
              lineHeight: "clamp(3.4rem,3.5vw,6rem)",
            }}
          >
            {article.title}
          </h1>
          <p
            className="text-[#A6A6A6] font-medium"
            style={{
              fontSize: "clamp(1.3rem,1.4vw,2rem)",
              lineHeight: "clamp(1.7rem,1.8vw,2.5rem)",
            }}
          >
            {article.description}
          </p>
        </div>

{/* Columna central (Texto principal) */}
<article
  className="shrink-0 align-top"
  style={{
    width: "667px",
    maxWidth: "667px",
  }}
>
  <p
    className="font-medium text-neutral-900"
    style={{
      fontFamily: '"Cabinet Grotesk", sans-serif',
      fontSize: "1.0625rem", // 17px
      lineHeight: "100%",
      letterSpacing: "0em",
      fontWeight: 500,
    }}
    dangerouslySetInnerHTML={{
      __html: `
        En <span style="font-weight:700;">OUMA</span> tenemos una relación directa con los materiales.
        Nos gusta escucharlos antes de intervenirlos.
        Entender lo que quieren decir sin cubrirlos de más.<br />
        La madera, por ejemplo, ha sido durante años víctima del barniz total:<br />
        ese impulso de dejarla brillante, sellada, protegida.
        Pero ese brillo muchas veces la despoja de lo que la hace viva.<br /><br />
        En su estado crudo, la madera habla.<br /><br /> <br /><br /><br /><br /><br />
        Se contrae, se abre, se oxida, cambia de color.<br />
        Su superficie registra el paso del tiempo, el clima, el contacto humano.<br />
        Cada grieta es una conversación con el entorno.
      `,
    }}
  />
</article>


        {/* Columna derecha */}
        <div className="flex flex-col items-start shrink-0 align-top">
          <div
            className="overflow-hidden bg-[#D9D9D9]"
            style={{
              width: "clamp(40rem,36vw,70rem)",
              height: "clamp(27rem,25vw,47.8rem)",
            }}
          >
            <img
              src={article.images?.right ?? "/src/assets/blog/img9.png"}
              alt="Imagen derecha"
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        </div>
      </HScrollRow>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* ✅ Scroll horizontal actualizado (idéntico al BlogSection) */
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

    let startX = 0,
      lastX = 0,
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
      if (el.scrollLeft <= 0 || el.scrollLeft >= el.scrollWidth - el.clientWidth) {
        stopMomentum();
        return;
      }
      rafMom = requestAnimationFrame(momentum);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      stopMomentum();
      el.setPointerCapture(e.pointerId);
      startX = e.clientX;
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

    // Wheel scroll
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
      style={{ touchAction: "pan-y", scrollSnapType: "x proximity" }}
    >
      <div className="flex w-max gap-[clamp(2.5rem,4vw,8rem)] items-start pr-1">
        {children}
      </div>
    </div>
  );
}
