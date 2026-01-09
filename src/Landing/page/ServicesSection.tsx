import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/** 🔽 Mapear todas las imágenes de /src/assets/servicios para que Vite las incluya en build */
const serviciosImgs = import.meta.glob("/src/assets/servicios/*.{png,jpg,jpeg,webp,svg}", {
  eager: true,
  query: "?url",
}) as Record<string, { default: string }>;

/** Devuelve la URL final empaquetada para un nombre o ruta.
 *  Puedes pasar "CASA-MAY-2.png" o "src/assets/servicios/CASA-MAY-2.png"
 */
function resolveServicioImg(nameOrPath: string): string {
  // si viene http/https ya no tocamos
  if (/^https?:\/\//i.test(nameOrPath)) return nameOrPath;

  const parts = nameOrPath.split("/");
  const file = parts[parts.length - 1]; // basename
  // Busca por coincidencia al final del path (…/servicios/<file>)
  const hit = Object.entries(serviciosImgs).find(([p]) => p.endsWith("/" + file));
  return hit?.[1]?.default ?? nameOrPath; // fallback (dev)
}

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const movedRef = useRef(0);

  // ✅ Altura dinámica (viewport - header - footer)
  useEffect(() => {
    const updateHeight = () => {
      if (!sectionRef.current) return;
      const vh = window.innerHeight;
      const availableHeight = vh - 218;
      const reducedHeight =
        window.innerWidth < 768
          ? availableHeight * 0.75
          : window.innerWidth < 1280
          ? availableHeight * 0.85
          : availableHeight;
      sectionRef.current.style.minHeight = `${reducedHeight}px`;
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // ✅ Scroll horizontal con drag + inercia tipo Blog
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let raf = 0;
    let target = 0;
    const stopRAF = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const step = () => {
      const cur = el.scrollLeft;
      const next = cur + (target - cur) * 0.18;
      el.scrollLeft = Math.abs(next - cur) < 0.5 ? target : next;
      if (Math.abs(target - el.scrollLeft) > 0.5) raf = requestAnimationFrame(step);
      else stopRAF();
    };

    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (d === 0) return;
      if (!raf) target = el.scrollLeft;
      target += d;
      const max = el.scrollWidth - el.clientWidth;
      target = Math.max(0, Math.min(target, max));
      if (!raf) raf = requestAnimationFrame(step);
      e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });

    // Drag + inercia
    let lastX = 0,
      lastT = 0,
      v = 0,
      rafMom = 0,
      isDragging = false;

    const stopMomentum = () => {
      if (rafMom) cancelAnimationFrame(rafMom);
      rafMom = 0;
    };
    const momentum = () => {
      v *= 0.95;
      if (Math.abs(v) < 0.25) return stopMomentum();
      el.scrollLeft -= v;
      if (el.scrollLeft <= 0 || el.scrollLeft >= el.scrollWidth - el.clientWidth)
        return stopMomentum();
      rafMom = requestAnimationFrame(momentum);
    };

    const down = (x: number) => {
      isDragging = true;
      movedRef.current = 0;
      lastX = x;
      lastT = performance.now();
      v = 0;
      stopMomentum();
    };

    const move = (x: number) => {
      if (!isDragging) return;
      const now = performance.now();
      const dx = x - lastX;
      const dt = now - lastT || 16.7;
      el.scrollLeft -= dx;
      v = dx * (16.7 / dt);
      lastX = x;
      lastT = now;
      movedRef.current += Math.abs(dx);
    };

    const up = () => {
      if (!isDragging) return;
      isDragging = false;
      rafMom = requestAnimationFrame(momentum);
    };

    // Mouse
    const md = (e: MouseEvent) => {
      e.preventDefault();
      down(e.clientX);
    };
    const mm = (e: MouseEvent) => move(e.clientX);
    const mu = () => up();

    // Touch
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
      stopMomentum();
      stopRAF();
    };
  }, []);

  const handleCardClick = (slug: string) => {
    if (movedRef.current < 10) navigate(`/servicios/${slug}`);
  };

  /** Puedes dejar solo el nombre del archivo para cada imagen */
  const services = [
    {
      id: 1,
      slug: "diseno-arquitectonico",
      number: "01",
      title: "Diseño Arquitectónico",
      description:
        "Desarrollamos proyectos arquitectónicos desde la conceptualización hasta el detalle ejecutivo. Cada diseño nace de la empatía y se plasma con claridad, buscando siempre la armonía entre forma, función y alma.",
      image: "CASA-MAY-2.png",
    },
    {
      id: 2,
      slug: "construccion-residencial-comercial",
      number: "02",
      title: "Construcción Residencial y Comercial",
      description:
        "Ejecutamos obras con precisión, orden y compromiso, cuidando tanto la calidad de los materiales como la experiencia del cliente durante el proceso constructivo.",
      image: "8.png",
    },
    {
      id: 3,
      slug: "proyectos-integrales",
      number: "03",
      title: "Proyectos Integrales",
      description:
        "Ofrecemos un acompañamiento completo: desde el anteproyecto hasta la entrega final. Una solución llave en mano para quienes buscan claridad, confianza y resultados a la altura de sus expectativas.",
      image: "a5.png",
    },
  ];

  // ✅ Diseño original, textos más pequeños + imágenes rectas
  return (
    <main
      ref={sectionRef}
      className="bg-neutral-50 text-neutral-900 flex justify-center items-center"
    >
      {/* DESKTOP */}
      <div
        ref={scrollerRef}
        className="hidden md:flex overflow-x-auto overflow-y-hidden w-full h-full select-none cursor-grab no-scrollbar"
      >
        <div
          className="flex justify-start items-start mx-auto"
          style={{
            gap: "clamp(2.5rem, 3.5vw, 4rem)",
            paddingLeft: "clamp(0.5rem, 1vw, 1rem)",
            paddingRight: "clamp(0.5rem, 1vw, 1rem)",
            minWidth: "fit-content",
            alignItems: "flex-start",
          }}
        >
          {services.map((s) => (
            <div
              key={s.id}
              onClick={() => handleCardClick(s.slug)}
              className="flex flex-col cursor-pointer transition-transform duration-300 hover:scale-[1.01] snap-start shrink-0 w-[85vw] sm:w-[48vw] lg:w-[340px] xl:w-[320px] max-w-[360px]"
            >
              <h2
                className="font-medium"
                style={{
                  fontSize: "clamp(0.95rem, 1vw, 1.4rem)",
                  lineHeight: "1.2",
                  color: "#A6A6A6",
                }}
              >
                <span>{s.number}</span>{" "}
                <span className="text-[#0A0A0A]">{s.title}</span>
              </h2>

              <p
                className="font-medium text-[#0A0A0A]"
                style={{
                  fontSize: "clamp(0.65rem, 0.7vw, 0.85rem)",
                  lineHeight: "1.4",
                  marginTop: "clamp(0.6rem, 0.8vw, 1rem)",
                  marginBottom: "clamp(1rem, 1.2vw, 1.4rem)",
                  minHeight: "clamp(4.5rem, 5vw, 6rem)",
                }}
              >
                {s.description}
              </p>

              <div
                className="aspect-[4/3] overflow-hidden"
              >
                <img
                  src={resolveServicioImg(s.image)}
                  alt={s.title}
                  className="h-full w-full object-cover object-center transition-transform duration-300 ease-in-out hover:scale-[1.03]"
                  draggable={false}
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE */}
      <div className="md:hidden w-full px-6 py-8 sm:py-12 space-y-12">
        {services.map((s) => (
          <div
            key={s.id}
            onClick={() => navigate(`/servicios/${s.slug}`)}
            className="flex flex-col gap-4 cursor-pointer"
          >
            <h2 className="font-medium text-[1.8rem] text-[#0A0A0A] leading-tight">
              <span className="text-[#A6A6A6]">{s.number}</span>{" "}
              <span>{s.title}</span>
            </h2>
            <p className="text-[#0A0A0A] font-medium text-[1.4rem] leading-relaxed">
              {s.description}
            </p>
            <div className="overflow-hidden">
              <img
                src={resolveServicioImg(s.image)}
                alt={s.title}
                className="object-cover w-full h-auto transition-transform duration-300 hover:scale-105"
                draggable={false}
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
