// src/common/scroll/GlobalScrollScale.tsx
import { useEffect } from "react";

/**
 * Delegado global:
 * - Reacciona a scroll/pointer sobre cualquier elemento con [data-global-scale]
 * - Solo cambia escala (grande/pequeño). No traduce, no toca scrollLeft, no hace snap.
 * - Ancla el escalado (por defecto al borde izquierdo) para evitar "ajustes" visuales.
 *   Puedes override con data-global-scale-anchor="left|center|right"
 */
export default function GlobalScrollScale({
  activeScale = 0.975,   // un poquito más notorio; ajústalo si quieres
  enterMs = 120,
  exitMs = 220,
  idleMs = 140,
}: {
  activeScale?: number;
  enterMs?: number;
  exitMs?: number;
  idleMs?: number;
}) {
  useEffect(() => {
    type T = number;
    const timers = new WeakMap<HTMLElement, T>();

    const targetOf = (ev: Event): HTMLElement | null => {
      const el = ev.target as Element | null;
      if (!el) return null;
      return el.closest?.("[data-global-scale]") as HTMLElement | null;
    };

    const getAnchor = (host: HTMLElement): string => {
      // left | center | right (default: left)
      const a = host.getAttribute("data-global-scale-anchor")?.toLowerCase();
      if (a === "center") return "50% 50%";
      if (a === "right") return "100% 50%";
      return "0% 50%"; // left center
    };

    const scaleOn = (host: HTMLElement) => {
      const target = (host.firstElementChild as HTMLElement) ?? host;
      // Evita rehacer la misma transición si ya está activa
      if (target.dataset._gs_state === "on") return;
      target.dataset._gs_state = "on";

      target.style.willChange = "transform";
      target.style.transformOrigin = getAnchor(host);
      target.style.transition = `transform ${enterMs}ms cubic-bezier(.2,.7,0,1)`;
      target.style.transform = `scale(${activeScale})`; // SIN translate
      // Sugerencia de rendimiento sin afectar layout
      target.style.backfaceVisibility = "hidden";
      target.style.contain = "paint"; // evita que pinte fuera sin relayout
    };

    const scaleOff = (host: HTMLElement) => {
      const target = (host.firstElementChild as HTMLElement) ?? host;
      // Evita parpadeo/flip-flop si ya está en OFF
      if (target.dataset._gs_state === "off") return;
      target.dataset._gs_state = "off";

      target.style.transformOrigin = getAnchor(host);
      target.style.transition = `transform ${exitMs}ms cubic-bezier(.2,.7,0,1)`;
      target.style.transform = "scale(1)";
    };

    const armIdle = (host: HTMLElement) => {
      const prev = timers.get(host);
      if (prev) clearTimeout(prev);
      timers.set(
        host,
        window.setTimeout(() => {
          scaleOff(host);
        }, idleMs)
      );
    };

    const onScrollCapture = (ev: Event) => {
      const host = targetOf(ev);
      if (!host) return;
      scaleOn(host);
      armIdle(host);
    };

    const onPointerDownCapture = (ev: Event) => {
      const host = targetOf(ev);
      if (!host) return;
      scaleOn(host);
      armIdle(host);
    };

    const onPointerUpOrCancel = (ev: Event) => {
      const host = targetOf(ev);
      if (!host) return;
      armIdle(host); // al soltar, solo programamos volver a 1
    };

    document.addEventListener("scroll", onScrollCapture, {
      capture: true,
      passive: true,
    });
    document.addEventListener("pointerdown", onPointerDownCapture, {
      capture: true,
      passive: true,
    });
    document.addEventListener("pointerup", onPointerUpOrCancel, {
      capture: true,
      passive: true,
    });
    document.addEventListener("pointercancel", onPointerUpOrCancel, {
      capture: true,
      passive: true,
    });

    return () => {
      document.removeEventListener("scroll", onScrollCapture, { capture: true } as any);
      document.removeEventListener("pointerdown", onPointerDownCapture, { capture: true } as any);
      document.removeEventListener("pointerup", onPointerUpOrCancel, { capture: true } as any);
      document.removeEventListener("pointercancel", onPointerUpOrCancel, { capture: true } as any);
    };
  }, [activeScale, enterMs, exitMs, idleMs]);

  return null;
}
