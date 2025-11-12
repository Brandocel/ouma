// src/common/scroll/GlobalScrollScale.tsx
import { useEffect } from "react";

/**
 * Opt-in:
 * - SOLO se activa en elementos que tengan el atributo [data-global-scale]
 * - Escala mientras hay interacción y vuelve a 1 al quedar idle.
 * - NO traduce, NO hace snap, NO toca scrollLeft, NO escanea todo el DOM.
 */
export default function GlobalScrollScale({
  activeScale = 0.985,
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

    const scaleOn = (el: HTMLElement) => {
      const target = (el.firstElementChild as HTMLElement) ?? el;
      target.style.willChange = "transform";
      target.style.transformOrigin = "50% 50%";
      target.style.transition = `transform ${enterMs}ms cubic-bezier(.2,.7,0,1)`;
      target.style.transform = `translateZ(0) scale(${activeScale})`;
    };

    const scaleOff = (el: HTMLElement) => {
      const target = (el.firstElementChild as HTMLElement) ?? el;
      target.style.transition = `transform ${exitMs}ms cubic-bezier(.2,.7,0,1)`;
      target.style.transform = "translateZ(0) scale(1)";
    };

    const armIdle = (el: HTMLElement) => {
      const prev = timers.get(el);
      if (prev) clearTimeout(prev);
      timers.set(el, window.setTimeout(() => scaleOff(el), idleMs));
    };

    const onScroll = (e: Event) => {
      const scroller = e.currentTarget as HTMLElement;
      scaleOn(scroller);
      armIdle(scroller);
    };
    const onPointerDown = (e: Event) => {
      const scroller = e.currentTarget as HTMLElement;
      scaleOn(scroller);
      armIdle(scroller);
    };

    // Atacha SOLO a los que pidan el efecto
    const list = Array.from(
      document.querySelectorAll<HTMLElement>("[data-global-scale]")
    );
    for (const el of list) {
      el.addEventListener("scroll", onScroll, { passive: true });
      el.addEventListener("pointerdown", onPointerDown, { passive: true });
    }

    return () => {
      for (const el of list) {
        el.removeEventListener("scroll", onScroll);
        el.removeEventListener("pointerdown", onPointerDown);
      }
    };
  }, [activeScale, enterMs, exitMs, idleMs]);

  return null;
}
