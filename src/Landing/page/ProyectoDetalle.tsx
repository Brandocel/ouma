// src/Landing/page/ProyectoDetalle.tsx
import React, { useEffect, useRef, useState, useLayoutEffect, type PropsWithChildren } from "react";
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
function toSharedKey(anyName: string): string {
  const fn = fileName(anyName).toLowerCase();
  return fn.replace(/(?:[_\-\s]?grande)(?=\.[^.]+$)/i, "");
}

export default function ProyectoDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const project = slug ? findProjectBySlug(slug) : undefined;

  const targetImgRef = useRef<HTMLImageElement | null>(null);
  const [waitingForOverlay, setWaitingForOverlay] = useState(true);

  // ======= Altura útil (entre header y footer) =======
  const pageRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const root = document.documentElement;
    const header = document.querySelector("header") as HTMLElement | null;
    const footer = document.querySelector("footer") as HTMLElement | null;

    const apply = () => {
      const hH = header?.getBoundingClientRect().height ?? 0;
      const fH = footer?.getBoundingClientRect().height ?? 0;
      const vh = Math.max(window.innerHeight, document.documentElement.clientHeight);
      root.style.setProperty("--header-h", `${Math.round(hH)}px`);
      root.style.setProperty("--footer-h", `${Math.round(fH)}px`);
      root.style.setProperty("--useful-h", `${Math.max(0, Math.round(vh - hH - fH))}px`);
    };

    apply();
    const ro = new ResizeObserver(apply);
    header && ro.observe(header);
    footer && ro.observe(footer);
    pageRef.current && ro.observe(pageRef.current);
    window.addEventListener("resize", apply);
    return () => { ro.disconnect(); window.removeEventListener("resize", apply); };
  }, []);

  // Escala por altura (solo scale en wrapper)
  useLayoutEffect(() => {
    const resize = () => {
      const usefulPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--useful-h")) || 0;
      if (!usefulPx) return;
      const blocks = document.querySelectorAll<HTMLElement>("[data-fit-by-height]");
      blocks.forEach((host) => {
        const inner = host.querySelector<HTMLElement>("[data-fit-inner]");
        if (!inner) return;
        inner.style.transform = "none";
        inner.style.willChange = "transform";

        const naturalH = inner.offsetHeight;
        const safe = 6;
        const maxH = Math.max(0, usefulPx - safe);
        const scale = naturalH > 0 ? Math.min(1, maxH / naturalH) : 1;

        inner.style.transformOrigin = "top left";
        inner.style.transform = scale < 1 ? `translateZ(0) scale(${scale})` : "none";
        (host.style as any).minHeight = `${Math.min(naturalH * scale, maxH)}px`;
        (host.style as any).maxHeight = `${Math.min(naturalH * scale, maxH)}px`;
      });
    };
    resize();
    const ro = new ResizeObserver(resize);
    pageRef.current && ro.observe(pageRef.current);
    window.addEventListener("resize", resize);
    return () => { ro.disconnect(); window.removeEventListener("resize", resize); };
  }, []);

  useEffect(() => {
    const onDone = () => setWaitingForOverlay(false);
    window.addEventListener("shared-image-done", onDone);
    const fallback = window.setTimeout(() => setWaitingForOverlay(false), 900);
    return () => { window.removeEventListener("shared-image-done", onDone); clearTimeout(fallback); };
  }, [slug]);

  useEffect(() => {
    const img = targetImgRef.current;
    if (!img) return;
    const sendRect = () => {
      const r = img.getBoundingClientRect();
      const to: Rect = { top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height };
      window.dispatchEvent(new CustomEvent("shared-image-animate", { detail: { to } }));
    };
    const sendRectSynced = () => requestAnimationFrame(() => requestAnimationFrame(sendRect));
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

  const imgUrl = resolveGrande(project.file);
  const sharedKey = toSharedKey(project.file);
  const description = (project.description || "").replace(/\n+/g, " ").trim();

  const handleBack = (ev?: React.MouseEvent) => {
    ev?.preventDefault();
    const img = targetImgRef.current;
    if (!img) { navigate("/"); return; }
    const rect = img.getBoundingClientRect();
    const from: Rect = { top: rect.top + window.scrollY, left: rect.left + window.scrollX, width: rect.width, height: rect.height };
    const objectFit = getComputedStyle(img).objectFit || "cover";
    const detail = { src: img.src, from, objectFit, direction: "back" as const, sharedKey };
    (window as any).__sharedImagePending = detail;
    navigate("/");
  };

  return (
    <main
      ref={pageRef}
      className="container mx-auto max-w-[1440px] px-3 md:px-6 relative"
      style={{
        height: "calc(100svh - var(--header-h,0px) - var(--footer-h,0px))",
        overflow: "hidden",
      }}
    >
      {/* Capa centradora */}
      <div className="h-full w-full grid place-items-center">
        <HScrollRow>
          {/* Columna izquierda */}
          <aside className="shrink-0 w-[240px] md:w-[260px] pr-4 text-right" data-fit-by-height>
            <div data-fit-inner className="inline-block align-top space-y-[6px]">
              {/* ← Volver ARRIBA DEL TÍTULO */}
              <div className="text-[12px]">
                <button
                  onClick={handleBack}
                  className="text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  ← Volver
                </button>
              </div>

              {/* Título y metadatos */}
              <h1 className="font-medium text-[18px] md:text-[20px] leading-[1.15] text-neutral-900">
                {project.title}
              </h1>
              <div className="text-[12px] leading-[1.2] text-neutral-500">{project.place}</div>
              {project.year && <div className="text-[12px] leading-[1.2] text-neutral-500">{project.year}</div>}
            </div>
          </aside>

          {/* Imagen */}
          <figure
            className="inline-block shrink-0 align-top"
            data-cursor="drag"
            data-cursor-size="92"
            data-cursor-label="Arrastra"
            data-fit-by-height
          >
            <div data-fit-inner>
              <img
                ref={targetImgRef}
                src={imgUrl}
                alt={project.title}
                className="block h-auto w-auto select-none"
                draggable={false}
                decoding="async"
                loading="eager"
                fetchPriority="high"
                style={{
                  maxHeight: "min(78vh, calc(var(--useful-h, 100vh) * 0.78))",
                  imageRendering: "auto",
                  visibility: waitingForOverlay ? "hidden" : "visible",
                }}
              />
            </div>
          </figure>

          {/* Texto derecha */}
          <article className="w-[560px] lg:w-[667px] shrink-0 flex flex-col pr-4" data-fit-by-height>
            <div data-fit-inner className="flex flex-col h-auto">
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
            </div>
          </article>
        </HScrollRow>
      </div>
    </main>
  );
}

/* ---- HScrollRow: centrado horizontal sin romper scroll ---- */
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
    <div
      ref={wrapRef}
      className={"no-scrollbar overflow-x-auto overflow-y-hidden cursor-grab select-none w-full " + className}
      style={{ touchAction: "pan-y" }}
    >
      {/* ✅ ÚNICO CAMBIO: antes era justify-center y eso “perdía” el inicio cuando el mosaico es muy ancho */}
      <div className="min-w-full flex justify-start">
        <div className="inline-flex w-max gap-10 items-stretch pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}
