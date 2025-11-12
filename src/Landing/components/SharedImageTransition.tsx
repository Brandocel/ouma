import { useEffect, useRef, useState, type JSX } from "react";
import { createPortal } from "react-dom";

type Rect = { top: number; left: number; width: number; height: number };
type StartDetail = {
  src: string;
  from: Rect;                       // coordenadas de PÁGINA
  objectFit?: string;
  direction?: "forward" | "back";
  sharedKey?: string;               // clave estable para el “back”
};
type AnimateDetail = { to: Rect };   // coordenadas de PÁGINA

export default function SharedImageTransition(): JSX.Element | null {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cloneRef = useRef<HTMLImageElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const safetyTimeoutRef = useRef<number | null>(null);
  const fallbackTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let container = document.getElementById("shared-image-overlay") as HTMLDivElement | null;
    if (!container) {
      container = document.createElement("div");
      container.id = "shared-image-overlay";
      Object.assign(container.style, {
        position: "fixed",
        left: "0", top: "0",
        width: "100%", height: "100%",
        pointerEvents: "none",
        zIndex: "9999",
      });
      document.body.appendChild(container);
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

  /** Convierte coords de página -> viewport (overlay es fixed) */
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
    Object.assign(img.style, {
      position: "fixed",
      left: `${fromV.left}px`,
      top: `${fromV.top}px`,
      width: `${fromV.width}px`,
      height: `${fromV.height}px`,
      objectFit: d.objectFit || "cover",
      transformOrigin: "top left",
      transform: "translateZ(0) scale(1.02)",
      willChange: "transform, border-radius, box-shadow",
      backfaceVisibility: "hidden",
      borderRadius: "10px",
      boxShadow: "0 18px 56px rgba(0,0,0,0.30)",
      pointerEvents: "none",
    } as CSSStyleDeclaration);

    container.appendChild(img);
    cloneRef.current = img;

    safetyTimeoutRef.current = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("shared-image-done"));
      cleanup();
    }, 1600);
  }

  function animateTo(toPage: Rect) {
    const clone = cloneRef.current;
    if (!clone) { window.dispatchEvent(new CustomEvent("shared-image-done")); return; }

    const toV = pageToViewport(toPage); // <- destino en viewport
    const cur = clone.getBoundingClientRect();

    // fijamos a su rect actual
    clone.style.left = `${cur.left}px`;
    clone.style.top = `${cur.top}px`;
    clone.style.width = `${cur.width}px`;
    clone.style.height = `${cur.height}px`;

    const dx = toV.left - cur.left;
    const dy = toV.top - cur.top;
    const sx = toV.width / cur.width;
    const sy = toV.height / cur.height;

    clone.style.transition = [
      "transform 520ms cubic-bezier(.16,.84,.26,1)",
      "box-shadow 420ms cubic-bezier(.2,.9,.3,1)",
      "border-radius 420ms cubic-bezier(.2,.9,.3,1)",
    ].join(", ");

    requestAnimationFrame(() => {
      clone.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy}) translateZ(0)`;
      clone.style.borderRadius = "6px";
      clone.style.boxShadow = "0 8px 28px rgba(0,0,0,0.18)";
    });

    const onEnd = (ev: Event) => {
      const te = ev as TransitionEvent;
      if (te.propertyName && te.propertyName !== "transform") return;
      window.dispatchEvent(new CustomEvent("shared-image-done"));
      cleanup();
    };
    clone.addEventListener("transitionend", onEnd, { once: true });

    fallbackTimeoutRef.current = window.setTimeout(() => {
      try { clone.removeEventListener("transitionend", onEnd as any); } catch {}
      window.dispatchEvent(new CustomEvent("shared-image-done"));
      cleanup();
    }, 900);

    if (safetyTimeoutRef.current) { window.clearTimeout(safetyTimeoutRef.current); safetyTimeoutRef.current = null; }
  }

  if (!mounted || !containerRef.current) return null;
  return createPortal(<div aria-hidden="true" />, containerRef.current);
}
