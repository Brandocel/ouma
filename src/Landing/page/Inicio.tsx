// src/Landing/page/Inicio.tsx
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

/** Carga de imágenes: usamos SIEMPRE la versión Grande si existe */
const imgs = import.meta.glob("../../assets/FotosInicio/*.{png,jpg,jpeg}", {
  eager: true,
  query: "?url",
}) as Record<string, { default: string }>;

const metaByFile: Record<string, { title: string; place: string }> = {
  "CASA MAY 2 3.png":              { title: "Casa May",            place: "MORELIA, MICHOACÁN" },
  "CASA ROBLE 2 1.png":            { title: "Casa Roble",          place: "CANCÚN, QUINTANA ROO" },
  "11 danubio lateral 1.png":      { title: "Danubio 11",          place: "CANCÚN, QUINTANA ROO" },
  "250429 - EXTERIOR FINAL 2.png": { title: "Casa Cascada de Luz", place: "CANCÚN, QUINTANA ROO" },
  "9 2.png":                       { title: "Casa del Mar",        place: "PUERTO VALLARTA, JALISCO" },
};

const ORDER = [
  "9 2.png",
  "CASA MAY 2 3.png",
  "250429 - EXTERIOR FINAL 2.png",
  "CASA ROBLE 2 1.png",
  "11 danubio lateral 1.png",
];

type Rect = { top: number; left: number; width: number; height: number };

const fn = (p: string) => {
  const last = p.split("/").pop() || "";
  try { return decodeURIComponent(last); } catch { return last; }
};
const toGrandeIfExists = (filename: string) => {
  const m = filename.match(/^(.*)\.([^.]+)$/);
  const base = m ? m[1] : filename.replace(/\.[^.]+$/, "");
  const ext  = m ? m[2] : (filename.split(".").pop() ?? "png");
  const grandeName = `${base}Grande.${ext}`;
  const hitGrande = Object.entries(imgs).find(([p]) => p.endsWith("/" + grandeName));
  if (hitGrande) return hitGrande[1].default;
  const hit = Object.entries(imgs).find(([p]) => p.endsWith("/" + filename));
  return hit?.[1]?.default ?? "";
};
const sharedKeyOf = (anyFilename: string) =>
  fn(anyFilename).toLowerCase().replace(/(?:[_\-\s]?grande)(?=\.[^.]+$)/i, "");

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
   .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function Inicio() {
  const navigate = useNavigate();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  // gesto
  const draggingRef = useRef(false);
  const movedRef = useRef(0);
  const startXRef = useRef(0);
  const startTimeRef = useRef(0);

  // Alturas base: solo guardamos header/footer y altura útil (no tocamos estilos de tarjeta)
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
    sectionRef.current && ro.observe(sectionRef.current);
    window.addEventListener("resize", apply);
    return () => { ro.disconnect(); window.removeEventListener("resize", apply); };
  }, []);

  const items = useMemo(() => {
    const raw = Object.entries(imgs).map(([path]) => {
      const original = fn(path);
      const baseKey = sharedKeyOf(original);
      const grandeSrc = toGrandeIfExists(original);
      const meta = metaByFile[original] ?? { title: original.replace(/\.(png|jpg|jpeg)$/i, ""), place: "—" };
      const slug = slugify(meta.title);
      return { file: original, src: grandeSrc, slug, key: baseKey, ...meta };
    });
    const pos = (f: string) => {
      const i = ORDER.indexOf(f);
      return i === -1 ? 9999 : i;
    };
    return raw.sort((a, b) => (pos(a.file) - pos(b.file)) || a.file.localeCompare(b.file));
  }, []);

  // --- util placeholder (transición back) (sin cambios)
  function makePlaceholder(r: Rect) {
    const ph = document.createElement("div");
    ph.setAttribute("data-shared-placeholder", "1");
    Object.assign(ph.style, {
      position: "absolute",
      top: `${r.top}px`,
      left: `${r.left}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
      background: "#fff",
      borderRadius: "6px",
      zIndex: "9998",
      pointerEvents: "none",
    } as CSSStyleDeclaration);
    document.body.appendChild(ph);
    return ph;
  }

  // Boot back (igual)
  useLayoutEffect(() => {
    const pending = (window as any).__sharedImagePending as
      | { src: string; from: Rect; objectFit?: string; direction?: "back"; sharedKey?: string }
      | undefined;

    if (!pending || pending.direction !== "back") return;

    const tryBoot = () => {
      if (!pending.sharedKey) return false;
      const match = document.querySelector(
        `img[data-shared-key="${pending.sharedKey}"]`
      ) as HTMLImageElement | null;
      if (!match) return false;

      match.style.visibility = "hidden";

      const r = match.getBoundingClientRect();
      const to: Rect = {
        top: r.top + window.scrollY,
        left: r.left + window.scrollX,
        width: r.width,
        height: r.height,
      };

      const ph = makePlaceholder(to);

      const onDone = () => {
        window.removeEventListener("shared-image-done", onDone as any);
        try { ph.remove(); } catch {}
        match.style.visibility = "visible";
        (window as any).__sharedImagePending = undefined;
      };
      window.addEventListener("shared-image-done", onDone as any, { once: true });

      window.dispatchEvent(new CustomEvent("shared-image-start", { detail: pending }));
      requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent("shared-image-animate", { detail: { to } }));
      });

      return true;
    };

    if (tryBoot()) return;
    let attempts = 0;
    const id = window.setInterval(() => { attempts++; if (tryBoot() || attempts > 10) window.clearInterval(id); }, 16);
    return () => window.clearInterval(id);
  }, []);

  // ===== Scroll horizontal + inercia (igual) =====
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const originalSnap = getComputedStyle(el).scrollSnapType || "x proximity";
    let snapIdle: number | null = null;
    const setSnap = (v: string) => ((el.style as any).scrollSnapType = v);
    const armIdle = (ms = 220) => { if (snapIdle) window.clearTimeout(snapIdle); snapIdle = window.setTimeout(() => setSnap(originalSnap), ms); };

    let raf = 0;
    let target = 0;
    const stopRAF = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
    const step = () => {
      const cur = el.scrollLeft;
      const next = cur + (target - cur) * 0.18;
      el.scrollLeft = Math.abs(next - cur) < 0.5 ? target : next;
      if (Math.abs(target - el.scrollLeft) > 0.5) raf = requestAnimationFrame(step);
      else { stopRAF(); armIdle(180); }
    };

    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (d === 0) return;
      const before = el.scrollLeft;

      setSnap("none");
      if (!raf) target = el.scrollLeft;
      target += d;
      const max = el.scrollWidth - el.clientWidth;
      if (target < 0) target = 0;
      if (target > max) target = max;
      if (!raf) raf = requestAnimationFrame(step);

      if (el.scrollLeft !== before) e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });

    let startX = 0, lastX = 0, lastT = 0, v = 0, rafMom = 0;
    const stopMomentum = () => { if (rafMom) cancelAnimationFrame(rafMom); rafMom = 0; };
    const momentum = () => {
      v *= 0.95;
      if (Math.abs(v) < 0.25) { stopMomentum(); armIdle(120); return; }
      el.scrollLeft -= v;
      if (el.scrollLeft <= 0 || el.scrollLeft >= el.scrollWidth - el.clientWidth) { stopMomentum(); armIdle(120); return; }
      rafMom = requestAnimationFrame(momentum);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      draggingRef.current = true;
      movedRef.current = 0;
      startXRef.current = e.clientX;
      startTimeRef.current = performance.now();
      setSnap("none");
      stopMomentum(); stopRAF();
      el.setPointerCapture(e.pointerId);
      startX = e.clientX;
      lastX = startX;
      lastT = performance.now();
      v = 0;
      (document.activeElement as HTMLElement)?.blur?.();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dt = now - lastT || 16.7;
      el.scrollLeft -= dx;
      v = dx * (16.7 / dt);
      lastX = e.clientX; lastT = now;
      movedRef.current += Math.abs(dx);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      try { el.releasePointerCapture(e.pointerId); } catch {}
      const totalMoved = Math.abs(e.clientX - startXRef.current);
      const elapsed = performance.now() - startTimeRef.current;

      if (totalMoved <= 10 && elapsed <= 250) {
        const hit = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
        const card = hit?.closest?.("article[role='button']") as HTMLElement | null;
        if (card) {
          const imgEl = card.querySelector("img") as HTMLImageElement | null;
          if (imgEl) {
            const r = imgEl.getBoundingClientRect();
            const from = { top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height };
            const objectFit = getComputedStyle(imgEl).objectFit || "cover";
            window.dispatchEvent(new CustomEvent("shared-image-start", {
              detail: { src: imgEl.src, from, objectFit, direction: "forward" }
            }));
          }
          const slug = card.getAttribute("data-slug");
          if (slug) navigate(`/proyectos/${slug}`);
          return;
        }
      }
      rafMom = requestAnimationFrame(momentum);
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("lostpointercapture", onPointerUp);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("lostpointercapture", onPointerUp);
      stopMomentum(); stopRAF(); setSnap(originalSnap);
    };
  }, [navigate]);

  // Ajuste POR ALTURA: escala cada tarjeta si su alto natural > útil (sin modificar diseño)
  useLayoutEffect(() => {
    const resize = () => {
      const usefulPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--useful-h")) || 0;
      if (!usefulPx) return;

      const cards = innerRef.current?.querySelectorAll<HTMLElement>("article[data-slug]") ?? [];
      cards.forEach((card) => {
        // el contenido real de la tarjeta (lo que escalamos)
        const inner = card.querySelector<HTMLElement>("[data-card-inner]");
        if (!inner) return;

        // reset para medir su altura natural
        inner.style.transform = "none";
        inner.style.willChange = "transform";

        const naturalH = inner.offsetHeight; // imagen (aspect) + textos + paddings
        const safe = 6; // respirito mínimo
        const maxH = Math.max(0, usefulPx - safe);

        const scale = naturalH > 0 ? Math.min(1, maxH / naturalH) : 1;

        inner.style.transformOrigin = "top left";
        inner.style.transform = scale < 1 ? `translateZ(0) scale(${scale})` : "none";

        // para que el contenedor no “brinque”, fija altura visual del article
        (card.style as any).minHeight = `${Math.min(naturalH * scale, maxH)}px`;
        (card.style as any).maxHeight = `${Math.min(naturalH * scale, maxH)}px`;
      });
    };

    resize();

    const ro = new ResizeObserver(resize);
    sectionRef.current && ro.observe(sectionRef.current);
    innerRef.current && ro.observe(innerRef.current);
    window.addEventListener("resize", resize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Navegación fallback teclado
  const goDetail = useCallback((slug: string, imgEl?: HTMLImageElement | null) => {
    if (!imgEl) { navigate(`/proyectos/${slug}`); return; }
    const r = imgEl.getBoundingClientRect();
    const from = { top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height };
    const objectFit = getComputedStyle(imgEl).objectFit || "cover";
    window.dispatchEvent(new CustomEvent("shared-image-start", {
      detail: { src: imgEl.src, from, objectFit, direction: "forward" }
    }));
    navigate(`/proyectos/${slug}`);
  }, [navigate]);

  const handleCardClick = useCallback(
    (slug: string, ev?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
      if (draggingRef.current || movedRef.current > 18) return;
      const articleEl = ev?.currentTarget as HTMLElement | null;
      const imgEl = articleEl?.querySelector("img") as HTMLImageElement | null;
      goDetail(slug, imgEl);
    },
    [goDetail]
  );

  return (
    <section
      ref={sectionRef}
      className="mx-auto w-full max-w-[1440px] px-2 md:px-3 pt-0 md:pt-40 min-h-0 flex flex-col justify-center"
      style={{
        minHeight: "calc(100svh - var(--header-h,0px) - var(--footer-h,0px))",
        maxHeight: "calc(100svh - var(--header-h,0px) - var(--footer-h,0px))",
      }}
    >
      <div
        ref={scrollerRef}
        className="no-scrollbar overflow-x-auto overflow-y-hidden snap-x snap-proximity cursor-grab select-none overscroll-x-contain min-h-0 flex items-center md:block md:flex-1"
        style={{ touchAction: "pan-y" }}
        data-cursor="drag"
        data-cursor-label="Arrastra"
      >
        <div ref={innerRef} className="flex w-max gap-6 pr-0">
          {items.map((it) => (
            <article
              key={it.file}
              data-slug={it.slug}
              className="
                snap-start shrink-0
                w-[85vw] sm:w-[48vw] lg:w-[340px] xl:w-[320px] max-w-[360px]
              "
              role="button"
              tabIndex={0}
              onClick={(e) => handleCardClick(it.slug, e)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleCardClick(it.slug, e);
              }}
            >
              {/* 🔒 Todo el contenido original, solo envuelto para poder escalar */}
              <div data-card-inner>
                <div
                  className="aspect-[4/3] overflow-hidden"
                  data-cursor="drag"
                  data-cursor-label="Arrastra"
                >
                  <img
                    src={it.src}
                    alt={it.title}
                    className="h-full w-full object-contain-sm object-center transition-transform duration-300 ease-in-out hover:scale-[1.03]"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    data-shared-key={it.key}
                  />
                </div>

                {/* Título y descripción “pegados” a la imagen, como pediste */}
                <div className="pt-3">
                  <h3 className="font-medium text-neutral-900 text-[17px] leading-[1.25]">{it.title}</h3>
                  <p className="font-medium text-neutral-500 text-[11px] tracking-wide">{it.place}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
