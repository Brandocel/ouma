// src/Landing/page/DesignSection.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import ImgMain from "/src/assets/Servicios_Detalles/img1.png";
import ImgTopRight from "/src/assets/Servicios_Detalles/img2.png";
import ImgMidRight from "/src/assets/Servicios_Detalles/img3.png";
import ImgWideRight from "/src/assets/Servicios_Detalles/img4.png";

export default function DesignSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Altura dinámica como ServicesSection (no rompe layout)
  useEffect(() => {
    const updateHeight = () => {
      if (!sectionRef.current) return;
      const vh = window.innerHeight;
      const availableHeight = vh - 218; // Header (149) + Footer (69)
      const reduced =
        window.innerWidth < 768
          ? availableHeight * 0.75
          : window.innerWidth < 1280
          ? availableHeight * 0.85
          : availableHeight;
      sectionRef.current.style.minHeight = `${reduced}px`;
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Scroll horizontal con rueda + drag con inercia
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!d) return;
      e.preventDefault();
      el.scrollLeft += d;
    };
    el.addEventListener("wheel", onWheel, { passive: false });

    let lastX = 0,
      lastT = 0,
      v = 0,
      raf = 0,
      isDown = false;

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const momentum = () => {
      v *= 0.95;
      if (Math.abs(v) < 0.2) return stop();
      el.scrollLeft -= v;
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft <= 0 || el.scrollLeft >= max) return stop();
      raf = requestAnimationFrame(momentum);
    };

    const down = (x: number) => {
      isDown = true;
      stop();
      lastX = x;
      lastT = performance.now();
      v = 0;
      el.classList.add("cursor-grabbing");
    };
    const move = (x: number) => {
      if (!isDown) return;
      const now = performance.now();
      const dx = x - lastX;
      const dt = now - lastT || 16.7;
      el.scrollLeft -= dx;
      v = dx * (16.7 / dt);
      lastX = x;
      lastT = now;
    };
    const up = () => {
      if (!isDown) return;
      isDown = false;
      el.classList.remove("cursor-grabbing");
      raf = requestAnimationFrame(momentum);
    };

    const md = (e: MouseEvent) => {
      e.preventDefault();
      down(e.clientX);
    };
    const mm = (e: MouseEvent) => move(e.clientX);
    const mu = () => up();

    const ts = (e: TouchEvent) => down(e.touches[0].clientX);
    const tm = (e: TouchEvent) => move(e.touches[0].clientX);
    const te = () => up();

    el.addEventListener("mousedown", md);
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", mu);
    el.addEventListener("touchstart", ts, { passive: false });
    el.addEventListener("touchmove", tm, { passive: false });
    el.addEventListener("touchend", te);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("mousedown", md);
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", mu);
      el.removeEventListener("touchstart", ts);
      el.removeEventListener("touchmove", tm);
      el.removeEventListener("touchend", te);
      stop();
    };
  }, []);

  return (
    <main ref={sectionRef} className="bg-neutral-50 text-neutral-900 flex flex-col">
      {/* Desktop: contenido con scroll horizontal (sin cambios) */}
      <div className="hidden md:block mx-auto w-full max-w-[1440px] px-4 md:px-6 pt-4 md:pt-6">
        <div
          ref={scrollerRef}
          className="no-scrollbar overflow-x-auto overflow-y-hidden select-none cursor-grab"
          style={{ touchAction: "pan-y" }}
        >
          <div
            className="grid items-start gap-x-6 lg:gap-x-10 gap-y-6 pr-1"
            style={{
              minWidth: "1720px",
              gridTemplateColumns: "320px 820px 560px",
              paddingTop: "clamp(8px, 2.2vw, 22px)",
              paddingBottom: "clamp(12px, 3vw, 28px)",
              margin: "0 auto",
            }}
          >
            {/* Texto (izquierda) */}
            <div className="justify-self-start text-right">
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => navigate("/servicios")}
                className="text-[12px] leading-none text-neutral-400 hover:text-neutral-700 no-underline outline-none focus:outline-none focus:ring-0 active:outline-none"
                style={{ textDecoration: "none" }}
              >
                ← Volver
              </button>
              <div className="text-[#A6A6A6] font-medium text-[clamp(18px,2.1vw,28px)] leading-none mb-1">01</div>
              <h2 className="font-medium text-[#0A0A0A] leading-[1.05]">
                <span className="block text-[clamp(22px,2.4vw,36px)]">Diseño</span>
                <span className="block text-[clamp(22px,2.4vw,36px)]">Arquitectónico</span>
              </h2>
              <p
                className="font-medium text-[#0A0A0A] mt-3"
                style={{
                  fontSize: "clamp(12px,1.05vw,16px)",
                  lineHeight: "clamp(16px,1.5vw,22px)",
                  maxWidth: "min(320px,24vw)",
                  marginLeft: "auto",
                }}
              >
                Desarrollamos proyectos arquitectónicos desde la conceptualización
                hasta el detalle ejecutivo. Cada diseño nace de la empatía y se
                plasma con claridad, buscando siempre la armonía entre forma, función y alma.
              </p>
            </div>

            {/* Imagen principal */}
            <div className="relative group overflow-hidden select-none" style={{ aspectRatio: "21 / 10" }} data-cursor="drag" data-cursor-size="92" data-cursor-label="Arrastra">
              <img src={ImgMain} alt="principal" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] will-change-transform" draggable={false} loading="lazy" decoding="async" />
            </div>

            {/* Columna derecha */}
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="overflow-hidden">
                  <img src={ImgTopRight} alt="arriba" className="w-full h-full object-cover" draggable={false} loading="lazy" decoding="async" style={{ aspectRatio: "16 / 10" }} />
                </div>
                <div className="overflow-hidden">
                  <img src={ImgMidRight} alt="medio" className="w-full h-full object-cover" draggable={false} loading="lazy" decoding="async" style={{ aspectRatio: "16 / 10" }} />
                </div>
              </div>
              <WideContain src={ImgWideRight} alt="ancha" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: scroll vertical con altura útil y momentum */}
      <div
        className="md:hidden w-full"
        style={{
          height: "calc(100svh - 149px - 69px)", // igual aproximación que arriba (Header + Footer)
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        }}
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 pt-4 flex flex-col gap-4">
          {/* Volver */}
          <div>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => navigate("/servicios")}
              className="text-[12px] leading-none text-neutral-500 hover:text-neutral-800"
            >
              ← Volver
            </button>
          </div>

          {/* Título y número */}
          <div>
            <div className="text-[#A6A6A6] font-medium text-[18px] leading-none mb-1">01</div>
            <h2 className="font-medium text-[#0A0A0A] leading-tight text-[24px]">Diseño Arquitectónico</h2>
            <p className="font-medium text-[#0A0A0A] mt-2 text-[14px] leading-[1.4]">
              Desarrollamos proyectos arquitectónicos desde la conceptualización hasta el detalle ejecutivo. Cada diseño nace de la empatía y se plasma con claridad, buscando siempre la armonía entre forma, función y alma.
            </p>
          </div>

          {/* Imagen principal */}
          <div>
            <img src={ImgMain} alt="principal" className="w-full h-auto object-cover select-none" draggable={false} loading="lazy" decoding="async" />
          </div>

          {/* Imágenes derecha, en una grilla vertical */}
          <div className="grid grid-cols-2 gap-3">
            <div className="overflow-hidden">
              <img src={ImgTopRight} alt="arriba" className="w-full h-auto object-cover" draggable={false} loading="lazy" decoding="async" />
            </div>
            <div className="overflow-hidden">
              <img src={ImgMidRight} alt="medio" className="w-full h-auto object-cover" draggable={false} loading="lazy" decoding="async" />
            </div>
          </div>

          {/* Imagen ancha completa */}
          <WideContain src={ImgWideRight} alt="ancha" />

          {/* Colchón inferior */}
          <div className="pb-2" />
        </div>
      </div>
    </main>
  );
}

/** Muestra la imagen completa (sin recorte) con object-contain
 *  y usa el aspect-ratio real para evitar deformaciones y pixelado.
 */
function WideContain({ src, alt }: { src: string; alt: string }) {
  const [ratio, setRatio] = useState<number | null>(null);

  const onLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setRatio(img.naturalWidth / img.naturalHeight);
    }
  };

  return (
    <div
      className="bg-[#F2F2F2] overflow-hidden"
      style={{
        // Fallback 32:10 si aún no cargó
        aspectRatio: ratio ? `${ratio} / 1` : "32 / 10",
      }}
    >
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        className="w-full h-full object-contain select-none"
        draggable={false}
        loading="lazy"
        decoding="async"
        style={{ imageRendering: "auto" }}
      />
    </div>
  );
}
