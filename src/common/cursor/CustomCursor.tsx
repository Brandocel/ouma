import { useEffect, useRef, useState } from "react";

type CursorMode = "default" | "link" | "drag" | "view";

// Opcional: suavizado (apagado para cero lag)
const USE_SMOOTHING = false;
const SMOOTHING = 0.25;

const isCoarsePointer = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(pointer: coarse)")?.matches || "ontouchstart" in window);

// 🔒 Zonas donde suele ocultarse el cursor custom
// Importante: aquí también están data-cursor ignore/off
const HIDE_SELECTOR =
  'input, textarea, select, button, [contenteditable="true"], [data-cursor="ignore"], [data-cursor="off"]';

const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");
  const [isDragging, setIsDragging] = useState(false);

  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);
  const currentElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isCoarsePointer()) return;

    const updateTransforms = (x: number, y: number) => {
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (labelRef.current) labelRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const onMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      target.current = { x, y };

      const t = e.target as HTMLElement | null;

      // 1) Detecta región con data-cursor (override)
      const cursorRegion = t?.closest<HTMLElement>("[data-cursor]") ?? null;
      const regionMode = cursorRegion?.dataset.cursor;

      // ✅ Si la región dice "off" o "ignore", apaga cursor custom SIEMPRE
      if (regionMode === "off" || regionMode === "ignore") {
        setVisible(false);
        currentElement.current = null;
        setIsDragging(false);

        if (!USE_SMOOTHING) {
          pos.current = { x, y };
          updateTransforms(x, y);
        }
        return;
      }

      // Guardamos el elemento “activo” para drag etc.
      currentElement.current = cursorRegion ?? null;

      // 2) Si NO hay data-cursor cerca, entonces aplica zonas ocultas
      const hideZone = !cursorRegion && !!t?.closest(HIDE_SELECTOR);

      if (hideZone) {
        setVisible(false);
        currentElement.current = null;
        setIsDragging(false);

        if (!USE_SMOOTHING) {
          pos.current = { x, y };
          updateTransforms(x, y);
        }
        return;
      }

      // Mostrar cursor
      setVisible(true);

      // Modo/label
      if (!isDragging) {
        const m = (cursorRegion?.dataset.cursor as CursorMode) || "default";
        setMode(m);
        if (labelRef.current) labelRef.current.textContent = cursorRegion?.dataset.cursorLabel ?? "";
      }

      if (!USE_SMOOTHING) {
        pos.current = { x, y };
        updateTransforms(x, y);
      }
    };

    const onDown = () => {
      if (currentElement.current?.dataset.cursor === "drag") setIsDragging(true);
    };

    const onUp = () => {
      setIsDragging(false);
      const el = currentElement.current;
      const m = (el?.dataset.cursor as CursorMode) || "default";
      setMode(m);
      if (labelRef.current) labelRef.current.textContent = el?.dataset.cursorLabel ?? "";
    };

    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    window.addEventListener("mouseout", onLeave, { passive: true });

    if (USE_SMOOTHING) {
      const loop = () => {
        pos.current.x = lerp(pos.current.x, target.current.x, SMOOTHING);
        pos.current.y = lerp(pos.current.y, target.current.y, SMOOTHING);
        updateTransforms(pos.current.x, pos.current.y);
        raf.current = requestAnimationFrame(loop);
      };
      raf.current = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseout", onLeave);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [isDragging]);

  if (isCoarsePointer()) return null;

  const size =
    mode === "default" ? 24 :
    mode === "link"    ? 36 :
    mode === "view"    ? 48 : 64;

  return (
    <>
      <div
        ref={dotRef}
        className={[
          "pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-1/2",
          "left-0 top-0 rounded-full mix-blend-difference",
          "transition-[width,height,opacity] duration-150 ease-out will-change-transform",
          visible ? "opacity-100" : "opacity-0",
          "outline outline-1 outline-white/40",
        ].join(" ")}
        style={{
          width: size,
          height: size,
          background: "white",
          transform: "translate3d(-9999px,-9999px,0)",
        }}
      />
      <div
        ref={labelRef}
        className={[
          "pointer-events-none fixed z-[10000] -translate-x-1/2 -translate-y-1/2",
          "left-0 top-0 select-none text-[11px] font-semibold uppercase tracking-wide",
          "mix-blend-difference text-white transition-opacity duration-150 will-change-transform",
          visible && (mode === "drag" || mode === "view") ? "opacity-100" : "opacity-0",
        ].join(" ")}
        style={{ transform: "translate3d(-9999px,-9999px,0)" }}
      />
    </>
  );
}
