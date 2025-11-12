// src/common/svg/InteractiveSvg.tsx
import { useEffect, useRef, useState } from "react";

type Mode = "reveal";

type Props = {
  svg?: string;
  svgUrl?: string;
  className?: string;
  style?: React.CSSProperties;

  mode?: Mode;

  // Dibujo
  drawOnHover?: boolean;
  drawDurationMs?: number;
  drawStaggerMs?: number;
  resetOnLeave?: boolean;
  drawSelector?: string;
  autoPlayOnMount?: boolean;

  // Hover
  startPainted?: boolean;
  eraseThenDrawOnHover?: boolean;

  // Pincel (reveal)
  brushWidthMultiplier?: number;

  // Fondo (image que llena el SVG)
  bgImageUrl?: string;
  bgFit?: "cover" | "contain" | "stretch";
  bgOpacity?: number;
  bgInZoom?: boolean;

  // Zoom coreografiado
  zoomOutOnReveal?: boolean;
  zoomFrom?: number;
  zoomDurationMs?: number;
  zoomEasing?: string;

  // Enfoque de zoom
  zoomFocusSelector?: string;
  zoomFocusPercent?: { x: number; y: number };
  zoomFocusXY?: { x: number; y: number };

  // Parallax
  parallax?: boolean;
  strength?: number;

  // Debug opcional
  debug?: boolean;
};

export default function InteractiveSvg({
  svg,
  svgUrl,
  className,
  style,

  mode = "reveal",

  drawOnHover = true,
  drawDurationMs = 900,
  drawStaggerMs = 45,
  resetOnLeave = true,
  drawSelector,
  autoPlayOnMount = false,

  startPainted = false,
  eraseThenDrawOnHover = false,

  brushWidthMultiplier = 0.08,

  bgImageUrl,
  bgFit = "cover",
  bgOpacity = 1,
  bgInZoom = false,

  zoomOutOnReveal = false,
  zoomFrom = 2.2,
  zoomDurationMs,
  zoomEasing = "cubic-bezier(.2,.7,0,1)",

  zoomFocusSelector,
  zoomFocusPercent,
  zoomFocusXY,

  parallax = true,
  strength = 10,

  debug = false,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomWrapRef = useRef<SVGGElement | null>(null);
  const [readyTick, setReadyTick] = useState(0);

  // ---------- Helpers de SVG ----------
  const ensureDefs = (root: SVGSVGElement) => {
    let defs = root.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      root.insertBefore(defs, root.firstChild);
    }
    return defs;
  };

  // Aproxima longitud si no hay getTotalLength:
  function getGeomLength(n: SVGGraphicsElement): number {
    const anyN = n as any;
    if (typeof anyN.getTotalLength === "function") {
      try {
        return anyN.getTotalLength();
      } catch {
        /* fall through */
      }
    }
    const tag = n.tagName.toLowerCase();
    if (tag === "rect") {
      const w = parseFloat(n.getAttribute("width") || "0");
      const h = parseFloat(n.getAttribute("height") || "0");
      return 2 * (w + h);
    }
    if (tag === "circle") {
      const r = parseFloat(n.getAttribute("r") || "0");
      return 2 * Math.PI * r;
    }
    if (tag === "ellipse") {
      const rx = parseFloat(n.getAttribute("rx") || "0");
      const ry = parseFloat(n.getAttribute("ry") || "0");
      const a = rx,
        b = ry;
      const h = ((a - b) ** 2) / ((a + b) ** 2);
      return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
    }
    return 0;
  }

  // <use> → elemento real:
  function resolveUse(node: SVGGraphicsElement): SVGGraphicsElement | null {
    if (node.tagName.toLowerCase() !== "use") return node;
    const href =
      (node as any).href?.baseVal ||
      node.getAttribute("href") ||
      node.getAttribute("xlink:href");
    if (!href || href[0] !== "#") return null;
    const id = href.slice(1);
    const root = node.ownerSVGElement || node.closest("svg");
    const ref =
      root?.querySelector<SVGGraphicsElement>(`#${CSS.escape(id)}`) || null;
    return ref;
  }

  // Lista final de elementos animables (expande <use>, admite drawSelector):
  function elementsToAnimate(root: SVGSVGElement, selector?: string) {
    const base = selector
      ? Array.from(root.querySelectorAll<SVGGraphicsElement>(selector))
      : Array.from(
          root.querySelectorAll<SVGGraphicsElement>(
            "path,line,polyline,polygon,rect,circle,ellipse,use"
          )
        );

    const out: SVGGraphicsElement[] = [];
    for (const n of base) {
      const resolved = resolveUse(n) || n;
      if (resolved.tagName.toLowerCase() === "g") {
        out.push(
          ...Array.from(
            resolved.querySelectorAll<SVGGraphicsElement>(
              "path,line,polyline,polygon,rect,circle,ellipse"
            )
          )
        );
      } else {
        out.push(resolved);
      }
    }
    return out;
  }

  function cloneGeom(node: SVGGraphicsElement) {
    const ns = "http://www.w3.org/2000/svg";
    const tag = node.tagName.toLowerCase();
    const c = document.createElementNS(ns, tag);
    const cp = (attrs: string[]) =>
      attrs.forEach((a) => {
        const v = node.getAttribute(a);
        if (v != null) c.setAttribute(a, v);
      });
    switch (tag) {
      case "path":
        c.setAttribute("d", (node as SVGPathElement).getAttribute("d") || "");
        cp(["transform"]);
        break;
      case "rect":
        cp(["x", "y", "width", "height", "rx", "ry", "transform"]);
        break;
      case "circle":
        cp(["cx", "cy", "r", "transform"]);
        break;
      case "ellipse":
        cp(["cx", "cy", "rx", "ry", "transform"]);
        break;
      case "line":
        cp(["x1", "y1", "x2", "y2", "transform"]);
        break;
      case "polyline":
      case "polygon":
        cp(["points", "transform"]);
        break;
      default:
        return null;
    }
    return c as SVGGraphicsElement;
  }

  // ---------- Montaje: inyecta SVG, crea zoomWrap y fondo ----------
  useEffect(() => {
    let cancelled = false;
    const mount = async () => {
      if (!wrapRef.current) return;

      let markup = svg ?? "";
      if (!markup && svgUrl) {
        const res = await fetch(svgUrl);
        markup = await res.text();
      }
      if (cancelled) return;

      wrapRef.current.innerHTML = markup || "";
      const el = (svgRef.current = wrapRef.current.querySelector("svg"));
      if (!el) return;

      // Normalización responsive
      el.style.display = "block";
      el.style.pointerEvents = "auto";
      el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      el.removeAttribute("width");
      el.removeAttribute("height");
      el.setAttribute("width", "100%");
      el.setAttribute("height", "100%");
      if (!el.getAttribute("preserveAspectRatio")) {
        el.setAttribute("preserveAspectRatio", "xMidYMid meet");
      }

      // zoomWrap: mueve todo (excepto <defs>) adentro
      const ns = "http://www.w3.org/2000/svg";
      const zoomWrap = document.createElementNS(ns, "g");
      zoomWrap.setAttribute("data-zoom-wrap", "true");
      const toMove: ChildNode[] = [];
      Array.from(el.childNodes).forEach((n) => {
        if (n.nodeType === 1 && (n as Element).tagName.toLowerCase() === "defs")
          return;
        toMove.push(n);
      });
      toMove.forEach((n) => zoomWrap.appendChild(n));
      const defs = el.querySelector("defs");
      if (defs?.nextSibling) el.insertBefore(zoomWrap, defs.nextSibling);
      else el.insertBefore(zoomWrap, el.firstChild);
      zoomWrapRef.current = zoomWrap;

      // Fondo <image> que llena el SVG
      if (bgImageUrl) {
        const img = document.createElementNS(ns, "image");
        // Usa href estándar (xlink está deprecado, pero mantenemos compat)
        (img as any).setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "href",
          bgImageUrl
        );
        img.setAttribute("href", bgImageUrl);
        img.setAttribute("x", "0");
        img.setAttribute("y", "0");
        img.setAttribute("width", "100%");
        img.setAttribute("height", "100%");
        const par =
          bgFit === "stretch" ? "none" : bgFit === "contain" ? "xMidYMid meet" : "xMidYMid slice";
        img.setAttribute("preserveAspectRatio", par);
        img.setAttribute("opacity", String(bgOpacity));

        if (bgInZoom) {
          zoomWrap.insertBefore(img, zoomWrap.firstChild);
        } else {
          el.insertBefore(img, zoomWrap);
        }
      }

      setReadyTick((t) => t + 1);
    };
    mount();
    return () => {
      cancelled = true;
    };
  }, [svg, svgUrl, bgImageUrl, bgFit, bgOpacity, bgInZoom]);

  // ---------- Zoom helpers ----------
  const getZoomFocusPoint = () => {
    const svgEl = svgRef.current;
    const zw = zoomWrapRef.current;
    if (!svgEl || !zw) return null;

    if (zoomFocusSelector) {
      const el = svgEl.querySelector(zoomFocusSelector) as SVGGraphicsElement | null;
      if (el) {
        try {
          const b = el.getBBox();
          return { cx: b.x + b.width / 2, cy: b.y + b.height / 2 };
        } catch {}
      }
    }
    if (zoomFocusPercent) {
      try {
        const g = zw.getBBox();
        const cx = g.x + g.width * Math.min(Math.max(zoomFocusPercent.x, 0), 1);
        const cy = g.y + g.height * Math.min(Math.max(zoomFocusPercent.y, 0), 1);
        return { cx, cy };
      } catch {}
    }
    if (zoomFocusXY) return { cx: zoomFocusXY.x, cy: zoomFocusXY.y };
    try {
      const g = zw.getBBox();
      return { cx: g.x + g.width / 2, cy: g.y + g.height / 2 };
    } catch {
      return null;
    }
  };

  const setupZoomStart = () => {
    if (!zoomOutOnReveal) return;
    const zw = zoomWrapRef.current;
    if (!zw) return;
    const focus = getZoomFocusPoint();
    if (!focus) return;
    const { cx, cy } = focus;
    const s = Math.max(1, zoomFrom || 1);
    zw.setAttribute(
      "transform",
      `translate(${cx},${cy}) scale(${s}) translate(${-cx},${-cy})`
    );
    (zw.style as any).transformOrigin = "center";
  };

  const playZoomOut = async () => {
    if (!zoomOutOnReveal) return;
    const zw = zoomWrapRef.current;
    if (!zw) return;
    const focus = getZoomFocusPoint();
    if (!focus) return;
    const { cx, cy } = focus;

    const root = svgRef.current!;
    const all = elementsToAnimate(root, drawSelector);
    const animables = all.filter((n) => getGeomLength(n) > 0);
    const totalDrawTime =
      (drawDurationMs || 0) + Math.max(0, animables.length - 1) * (drawStaggerMs || 0);
    const duration = zoomDurationMs ?? Math.max(450, totalDrawTime + 150);

    const anim = (zw as any).animate(
      [
        {
          transform: `translate(${cx}px,${cy}px) scale(${Math.max(
            1,
            zoomFrom || 1
          )}) translate(${-cx}px,${-cy}px)`,
        },
        {
          transform: `translate(${cx}px,${cy}px) scale(1) translate(${-cx}px,${-cy}px)`,
        },
      ],
      { duration, easing: zoomEasing, fill: "forwards" }
    );
    await anim.finished.catch(() => {});
  };

  // ---------- REVEAL ----------
  useEffect(() => {
    if (mode !== "reveal") {
      setupZoomStart();
      return;
    }
    const root = svgRef.current;
    if (!root) return;

    const geomRaw = elementsToAnimate(root, drawSelector);
    const geom = geomRaw.filter((n) => getGeomLength(n) > 0);
    if (debug) console.log("[InteractiveSvg] total:", geomRaw.length, "animables:", geom.length);

    if (!geom.length) {
      setupZoomStart();
      return;
    }

    const defs = ensureDefs(root);
    const masks: SVGMaskElement[] = [];

    // Zoom inicial antes de animar
    setupZoomStart();

    // Máscaras por elemento
    geom.forEach((n, i) => {
      const len = getGeomLength(n);
      const b = n.getBBox();
      const diag = Math.hypot(b.width, b.height);
      const brush = Math.max(0.01, diag * brushWidthMultiplier);

      const ns = "http://www.w3.org/2000/svg";
      const mask = document.createElementNS(ns, "mask");
      const id = `msk_${Math.random().toString(36).slice(2)}_${i}`;
      mask.setAttribute("id", id);
      // Muy importante para coords absolutas:
      mask.setAttribute("maskContentUnits", "userSpaceOnUse");
      mask.setAttribute("maskUnits", "userSpaceOnUse");

      const bg = document.createElementNS(ns, "rect");
      bg.setAttribute("x", String(b.x - brush));
      bg.setAttribute("y", String(b.y - brush));
      bg.setAttribute("width", String(b.width + brush * 2));
      bg.setAttribute("height", String(b.height + brush * 2));
      bg.setAttribute("fill", "black");
      mask.appendChild(bg);

      const strokePath = cloneGeom(n);
      if (!strokePath) return;
      strokePath.setAttribute("fill", "none");
      strokePath.setAttribute("stroke", "white");
      strokePath.setAttribute("stroke-width", String(brush));
      strokePath.setAttribute(
        "stroke-linecap",
        n.getAttribute("stroke-linecap") || "round"
      );
      strokePath.setAttribute(
        "stroke-linejoin",
        n.getAttribute("stroke-linejoin") || "round"
      );
      (strokePath as any).dataset.len = String(len);
      (strokePath.style as any).pointerEvents = "none";
      strokePath.style.strokeDasharray = String(len);
      strokePath.style.strokeDashoffset = startPainted ? "0" : String(len);
      strokePath.style.transition = startPainted
        ? "none"
        : `stroke-dashoffset ${drawDurationMs}ms ease ${i * drawStaggerMs}ms`;

      mask.appendChild(strokePath);
      defs.appendChild(mask);
      masks.push(mask);

      n.setAttribute("mask", `url(#${id})`);
      (n as any).__revealStroke = strokePath;
    });

    const play = () => {
      requestAnimationFrame(() =>
        geom.forEach((n, i) => {
          const sp = (n as any).__revealStroke as SVGGraphicsElement | undefined;
          if (!sp) return;
          sp.style.transition = `stroke-dashoffset ${drawDurationMs}ms ease ${i * drawStaggerMs}ms`;
          sp.style.strokeDashoffset = "0";
        })
      );
      void playZoomOut();
    };

    const eraseThenDraw = () => {
      geom.forEach((n) => {
        const sp = (n as any).__revealStroke as SVGGraphicsElement | undefined;
        if (!sp) return;
        const len = (sp as any).dataset.len || "0";
        sp.style.transition = "none";
        sp.style.strokeDashoffset = String(len);
      });
      setupZoomStart();
      void root.getBoundingClientRect();
      play();
    };

    const resetToInitial = () => {
      geom.forEach((n, i) => {
        const sp = (n as any).__revealStroke as SVGGraphicsElement | undefined;
        if (!sp) return;
        const len = (sp as any).dataset.len || "0";
        sp.style.transition = `stroke-dashoffset ${drawDurationMs}ms ease ${i * drawStaggerMs}ms`;
        sp.style.strokeDashoffset = String(len);
      });
      setupZoomStart();
    };

    const onEnter = () => (eraseThenDrawOnHover ? eraseThenDraw() : play());
    const onLeave = () => {
      if (eraseThenDrawOnHover) {
        geom.forEach((n) => {
          const sp = (n as any).__revealStroke as SVGGraphicsElement | undefined;
          if (sp) sp.style.strokeDashoffset = "0";
        });
      } else if (resetOnLeave) {
        resetToInitial();
      }
    };

    if (drawOnHover) {
      root.addEventListener("mouseenter", onEnter);
      root.addEventListener("mouseleave", onLeave);
      root.addEventListener("touchstart", onEnter, { passive: true });
      root.addEventListener("touchend", onLeave);
    }

    if (autoPlayOnMount && !startPainted) play();
    if (autoPlayOnMount && startPainted && eraseThenDrawOnHover) eraseThenDraw();

    return () => {
      if (drawOnHover) {
        root.removeEventListener("mouseenter", onEnter);
        root.removeEventListener("mouseleave", onLeave);
        root.removeEventListener("touchstart", onEnter as any);
        root.removeEventListener("touchend", onLeave as any);
      }
      masks.forEach((m) => m.remove());
      geom.forEach((n) => n.removeAttribute("mask"));
    };
  }, [
    readyTick,
    mode,
    drawOnHover,
    drawDurationMs,
    drawStaggerMs,
    resetOnLeave,
    drawSelector,
    autoPlayOnMount,
    startPainted,
    eraseThenDrawOnHover,
    brushWidthMultiplier,
    zoomOutOnReveal,
    zoomFrom,
    zoomDurationMs,
    zoomEasing,
    zoomFocusSelector,
    zoomFocusPercent?.x,
    zoomFocusPercent?.y,
    zoomFocusXY?.x,
    zoomFocusXY?.y,
    debug,
  ]);

  // ---------- Parallax opcional ----------
  useEffect(() => {
    const wrap = wrapRef.current;
    const el = svgRef.current;
    if (!wrap || !el || !parallax) return;

    const groups = Array.from(el.querySelectorAll<SVGGElement>("g[data-depth]"));
    if (!groups.length) return;

    let rect = wrap.getBoundingClientRect();
    let raf = 0,
      mx = 0,
      my = 0,
      dirty = false;

    const tick = () => {
      raf = 0;
      if (!dirty) return;
      dirty = false;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (mx - cx) / rect.width;
      const dy = (my - cy) / rect.height;
      groups.forEach((g) => {
        const d = parseFloat(g.getAttribute("data-depth") || "1");
        g.style.transform = `translate(${-dx * strength * d}px, ${-dy * strength * d}px)`;
        g.style.transformOrigin = "center";
        g.style.willChange = "transform";
      });
    };
    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dirty = true;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onResize = () => (rect = wrap.getBoundingClientRect());

    wrap.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);
    return () => {
      wrap.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [readyTick, parallax, strength]);

  return <div ref={wrapRef} className={className} style={style} />;
}
