import React, { useEffect, useRef, useState, type PropsWithChildren } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { findProjectBySlug } from "../api/projects";

/* Cargamos todas las fotos */
const FOTOS = import.meta.glob("../../assets/FotosInicio/*", {
  eager: true,
  query: "?url",
}) as Record<string, { default: string }>;

type Rect = { top: number; left: number; width: number; height: number };

function fileName(pathOrUrl: string): string {
  const last = pathOrUrl.split("/").pop() ?? "";
  try { return decodeURIComponent(last); } catch { return last; }
}

/** Dada "9 2.png" intenta usar "9 2Grande.png" si existe; si no, usa la que haya */
function resolveGrande(filename: string): string {
  const m = filename.match(/^(.*)\.([^.]+)$/);
  const base = m ? m[1] : filename.replace(/\.[^.]+$/, "");
  const ext  = m ? m[2] : (filename.split(".").pop() ?? "png");
  const grandeName = `${base}Grande.${ext}`;

  const hitGrande = Object.entries(FOTOS).find(([p]) => p.endsWith("/" + grandeName));
  if (hitGrande) return hitGrande[1].default;

  const hit = Object.entries(FOTOS).find(([p]) => p.endsWith("/" + filename));
  return hit?.[1]?.default ?? "";
}

/** sharedKey: nombre de archivo sin sufijo "Grande" y en minúsculas */
function toSharedKey(anyName: string): string {
  const fn = fileName(anyName).toLowerCase();
  return fn.replace(/(?:[_\-\s]?grande)(?=\.[^.]+$)/i, "");
}

export default function ProyectoDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const project = slug ? findProjectBySlug(slug) : undefined;

  const targetImgRef = useRef<HTMLImageElement | null>(null);

  // 🔒 Mantén oculta la imagen real hasta que el overlay termine (sin transiciones)
  const [waitingForOverlay, setWaitingForOverlay] = useState(true);

  useEffect(() => {
    // se mostrará cuando SharedImageTransition termine
    const onDone = () => setWaitingForOverlay(false);
    window.addEventListener("shared-image-done", onDone);

    // Fallback por si no hay overlay en curso (o se interrumpe)
    const fallback = window.setTimeout(() => setWaitingForOverlay(false), 900);

    return () => {
      window.removeEventListener("shared-image-done", onDone);
      clearTimeout(fallback);
    };
  }, [slug]);

  // Enviamos el rect destino (de la imagen grande) cuando cargue
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
      window.dispatchEvent(new CustomEvent("shared-image-animate", { detail: { to } }));
    };

    // Doble RAF para asegurar layout estable
    const sendRectSynced = () => {
      requestAnimationFrame(() => requestAnimationFrame(sendRect));
    };

    if (img.complete && img.naturalWidth) { sendRectSynced(); return; }
    const onLoad = () => sendRectSynced();
    img.addEventListener("load", onLoad);
    return () => img.removeEventListener("load", onLoad);
  }, [slug]);

  if (!project) {
    return (
      <main className="container mx-auto max-w-[1440px] px-4 md:px-6 py-16">
        <p className="text-neutral-500">Proyecto no encontrado.</p>
        <button onClick={() => navigate("/")} className="text-neutral-800 underline">Volver</button>
      </main>
    );
  }

  const imgUrl = resolveGrande(project.file);     // grande
  const sharedKey = toSharedKey(project.file);
  const description = (project.description || "").replace(/\n+/g, " ").trim();

  const handleBack = (ev?: React.MouseEvent) => {
    ev?.preventDefault();
    const img = targetImgRef.current;
    if (!img) { navigate("/"); return; }

    // NO ocultamos la imagen real al volver; el clon pasa por encima
    const rect = img.getBoundingClientRect();
    const from: Rect = {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    };
    const objectFit = getComputedStyle(img).objectFit || "cover";

    const detail = {
      src: img.src,
      from,
      objectFit,
      direction: "back" as const,
      sharedKey,
    };

    (window as any).__sharedImagePending = detail;
    navigate("/");
  };

  return (
    <main className="container mx-auto max-w-[1440px] px-3 md:px-6 pt-8 md:pt-24">
      <div className="text-[12px] text-neutral-400">
        <button onClick={handleBack} className="hover:text-neutral-700">← Volver</button>
      </div>

      <HScrollRow>
        <aside className="shrink-0 w-[240px] md:w-[260px] pr-4 text-right">
          <div className="inline-block align-top space-y-[2px]">
            <h1 className="font-medium text-[18px] md:text-[20px] leading-[1.15] text-neutral-900">
              {project.title}
            </h1>
            <div className="text-[12px] leading-[1.2] text-neutral-500">{project.place}</div>
            {project.year && (
              <div className="text-[12px] leading-[1.2] text-neutral-500">{project.year}</div>
            )}
          </div>
        </aside>

        <figure
          className="inline-block shrink-0 align-top"
          data-cursor="drag"
          data-cursor-size="92"
          data-cursor-label="Arrastra"
        >
          <img
            ref={targetImgRef}
            src={imgUrl}
            alt={project.title}
            className="block h-auto max-h-[78vh] w-auto select-none"
            draggable={false}
            decoding="async"
            loading="eager"
            fetchPriority="high"
            // 👇 sin transiciones; solo oculto/visible para evitar duplicado
            style={{
              imageRendering: "auto",
              visibility: waitingForOverlay ? "hidden" : "visible",
            }}
          />
        </figure>

        <article className="w-[560px] lg:w-[667px] shrink-0 flex flex-col pr-4">
          <p className="font-medium text-neutral-900 text-[15px] md:text-[17px] leading-[1.3] tracking-normal antialiased">
            {description}
          </p>

          <div className="mt-auto pt-12 md:pt-16 lg:pt-24 select-none">
            <div className="font-medium text-neutral-900 text-[15px] md:text-[17px] leading-[1.25]">
              {project.brief ?? "Desarrollo de habitacional frente al mar"}
            </div>
            <div className="text-[#A6A6A6] text-[15px] md:text-[17px] leading-[1.25] uppercase tracking-[0.02em]">
              {project.categories ?? "DISEÑO ARQUITECTÓNICO / DISEÑO DE INTERIOR"}
            </div>
          </div>
        </article>
      </HScrollRow>
    </main>
  );
}

/* ---- HScrollRow (igual) ---- */
function HScrollRow({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    let isDown = false, startX = 0, startLeft = 0, lastX = 0, lastT = 0, v = 0, raf = 0;
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
    const momentum = () => {
      v *= 0.95; if (Math.abs(v) < 0.15) { stop(); el.classList.remove("cursor-grabbing"); return; }
      el.scrollLeft -= v; const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft <= 0 || el.scrollLeft >= max) { stop(); el.classList.remove("cursor-grabbing"); return; }
      raf = requestAnimationFrame(momentum);
    };
    const getX = (cx: number) => cx - el.getBoundingClientRect().left;
    const onDown = (cx: number) => { isDown = true; stop(); startX = getX(cx); startLeft = el.scrollLeft; lastX = startX; lastT = performance.now(); el.classList.add("cursor-grabbing"); (document.activeElement as HTMLElement)?.blur?.(); };
    const onMove = (cx: number) => {
      if (!isDown) return; const x = getX(cx); const now = performance.now(); const dx = x - lastX; const dt = now - lastT || 16.7;
      el.scrollLeft = startLeft - (x - startX); v = dx * (16.7 / dt); lastX = x; lastT = now;
    };
    const onUp = () => { if (!isDown) return; isDown = false; raf = requestAnimationFrame(momentum); };
    const onWheel = (e: WheelEvent) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); el.scrollLeft += e.deltaX; } };
    const md = (e: MouseEvent) => { e.preventDefault(); onDown(e.clientX); };
    const mm = (e: MouseEvent) => { e.preventDefault(); onMove(e.clientX); };
    const mu = () => onUp();
    const ts = (e: TouchEvent) => { if (e.touches[0]) onDown(e.touches[0].clientX); };
    const tm = (e: TouchEvent) => { if (e.touches[0]) { e.preventDefault(); onMove(e.touches[0].clientX); } };
    const te = () => onUp();
    el.addEventListener("mousedown", md);
    window.addEventListener("mousemove", mm, { passive: false });
    window.addEventListener("mouseup", mu);
    el.addEventListener("touchstart", ts, { passive: false });
    el.addEventListener("touchmove", tm, { passive: false });
    el.addEventListener("touchend", te);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("mousedown", md);
      window.removeEventListener("mousemove", mm as any);
      window.removeEventListener("mouseup", mu);
      el.removeEventListener("touchstart", ts);
      el.removeEventListener("touchmove", tm);
      el.removeEventListener("touchend", te);
      el.removeEventListener("wheel", onWheel);
      stop();
    };
  }, []);
  return (
    <div ref={wrapRef} className={"no-scrollbar overflow-x-auto overflow-y-hidden cursor-grab select-none " + className} style={{ touchAction: "pan-y" }}>
      <div className="flex w-max gap-10 items-stretch pr-1">{children}</div>
    </div>
  );
}
