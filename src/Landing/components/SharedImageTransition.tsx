// src/Landing/components/SharedImageTransition.tsx
import { useEffect, useRef, useState, type JSX } from "react";
import { createPortal } from "react-dom";

type Rect = { top: number; left: number; width: number; height: number };
type StartDetail = {
  src: string;
  from: Rect;                       // coords de PÁGINA
  objectFit?: string;
  direction?: "forward" | "back";
  sharedKey?: string;
};
type AnimateDetail = { to: Rect };  // coords de PÁGINA

export default function SharedImageTransition(): JSX.Element | null {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const cloneRef = useRef<HTMLImageElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const safetyTimeoutRef = useRef<number | null>(null);
  const fallbackTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let container = document.getElementById("shared-image-overlay") as HTMLDivElement | null;
    if (!container) {
      container = document.createElement("div");
      container.id = "shared-image-overlay";

      // ✅ Aplica estilos con tipo seguro
      applyStyles(container, {
        position: "fixed",
        left: "0",
        top: "0",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: "9999",
        background: "transparent",
        backdropFilter: "none",
        boxShadow: "none",
        filter: "none",
        isolation: "isolate", // evita artefactos de mezcla
      });
      // Propiedad vendor con setProperty para evitar que TS se queje
      container.style.setProperty("-webkit-backdrop-filter", "none");

      document.body.appendChild(container);
    }

    // 🔒 Mata cualquier sombra/filtro en el overlay y sus hijos
    if (!styleRef.current) {
      const st = document.createElement("style");
      st.setAttribute("data-shared-image-style", "true");
      st.textContent = `
        #shared-image-overlay, #shared-image-overlay * {
          box-shadow: none !important;
          filter: none !important;
          text-shadow: none !important;
          outline: none !important;
          -webkit-filter: none !important;
          -webkit-backdrop-filter: none !important;
          backdrop-filter: none !important;
          mix-blend-mode: normal !important;
        }
      `;
      container.appendChild(st);
      styleRef.current = st;
    }

    containerRef.current = container;
    setMounted(true);
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onStart = (e: Event) => createClone((e as CustomEvent<StartDetail>).detail);
    const onAnimate = (e: Event) => animateTo((e as CustomEvent<AnimateDetail>).detail.to);
    const end = () => cleanup();

    window.addEventListener("shared-image-start", onStart as EventListener);
    window.addEventListener("shared-image-animate", onAnimate as EventListener);
    window.addEventListener("shared-image-done", end as EventListener);
    window.addEventListener("shared-image-cancel", end as EventListener);
    return () => {
      window.removeEventListener("shared-image-start", onStart as EventListener);
      window.removeEventListener("shared-image-animate", onAnimate as EventListener);
      window.removeEventListener("shared-image-done", end as EventListener);
      window.removeEventListener("shared-image-cancel", end as EventListener);
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanup() {
    if (safetyTimeoutRef.current) { window.clearTimeout(safetyTimeoutRef.current); safetyTimeoutRef.current = null; }
    if (fallbackTimeoutRef.current) { window.clearTimeout(fallbackTimeoutRef.current); fallbackTimeoutRef.current = null; }
    const clone = cloneRef.current;
    if (clone?.parentElement) { try { clone.parentElement.removeChild(clone); } catch {} }
    cloneRef.current = null;
  }

  /** Página -> viewport (overlay es fixed) */
  const pageToViewport = (r: Rect): Rect => ({
    top: r.top - window.scrollY,
    left: r.left - window.scrollX,
    width: r.width,
    height: r.height,
  });

  function createClone(d: StartDetail) {
    cleanup();
    const container = containerRef.current;
    if (!container) { window.dispatchEvent(new CustomEvent("shared-image-done")); return; }

    const fromV = pageToViewport(d.from);

    const img = document.createElement("img");
    img.src = d.src;
    img.draggable = false;
    img.alt = "";

    applyStyles(img, {
      position: "fixed",
      left: `${fromV.left}px`,
      top: `${fromV.top}px`,
      width: `${fromV.width}px`,
      height: `${fromV.height}px`,
      objectFit: (d.objectFit as any) || "cover",
      transformOrigin: "top left",
      transform: "translate3d(0,0,0)",       // capa propia
      willChange: "transform, border-radius",
      backfaceVisibility: "hidden",
      borderRadius: "0px",
      boxShadow: "none",
      filter: "none",
      outline: "none",
      pointerEvents: "none",
      mixBlendMode: "normal",
      imageRendering: "auto",
      contain: "paint",
    });

    container.appendChild(img);
    cloneRef.current = img;

    // Safety (si algo falla)
    safetyTimeoutRef.current = window.setTimeout(() => {
      dispatchDoneWithDeferCleanup();
    }, 1600);
  }

  function dispatchDoneWithDeferCleanup() {
    // 1) avisa al detalle
    window.dispatchEvent(new CustomEvent("shared-image-done"));
    // 2) espera dos frames antes de limpiar (anti parpadeo)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => cleanup());
    });
  }

  function animateTo(toPage: Rect) {
    const clone = cloneRef.current;
    if (!clone) { dispatchDoneWithDeferCleanup(); return; }

    // reafirma sin sombras/filtros
    applyStyles(clone, {
      boxShadow: "none",
      filter: "none",
      outline: "none",
      mixBlendMode: "normal",
    });

    const toV = pageToViewport(toPage);
    const cur = clone.getBoundingClientRect();

    // fija rect actual
    clone.style.left = `${cur.left}px`;
    clone.style.top = `${cur.top}px`;
    clone.style.width = `${cur.width}px`;
    clone.style.height = `${cur.height}px`;

    const dx = toV.left - cur.left;
    const dy = toV.top - cur.top;
    const sx = toV.width / cur.width;
    const sy = toV.height / cur.height;

    // sólo transform
    clone.style.transition = "transform 520ms cubic-bezier(.16,.84,.26,1)";

    // primer frame pintado antes de animar
    requestAnimationFrame(() => {
      clone.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy}) translateZ(0)`;
    });

    const onEnd = (ev: Event) => {
      const te = ev as TransitionEvent;
      if (te.propertyName && te.propertyName !== "transform") return;
      clone.removeEventListener("transitionend", onEnd as any);
      dispatchDoneWithDeferCleanup();
    };
    clone.addEventListener("transitionend", onEnd, { once: true });

    // Fallback si no dispara transitionend
    fallbackTimeoutRef.current = window.setTimeout(() => {
      try { clone.removeEventListener("transitionend", onEnd as any); } catch {}
      dispatchDoneWithDeferCleanup();
    }, 900);

    if (safetyTimeoutRef.current) { window.clearTimeout(safetyTimeoutRef.current); safetyTimeoutRef.current = null; }
  }

  if (!mounted || !containerRef.current) return null;
  return createPortal(<div aria-hidden="true" />, containerRef.current);
}

/* -------------------------------- utils ------------------------------- */

/** Aplica estilos tipados de forma segura */
function applyStyles(
  el: HTMLElement,
  styles: Partial<CSSStyleDeclaration>
) {
  Object.assign(el.style, styles);
}
