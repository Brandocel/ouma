import { useEffect, useRef, useState } from "react";
import InteractiveSvg from "../../common/svg/InteractiveSvg";

export default function NosotrosModule() {
  const sectionRef = useRef<HTMLElement>(null);
  
  // Ajustar altura para ocupar viewport menos header (149px) y footer (69px)
  useEffect(() => {
    const updateHeight = () => {
      if (!sectionRef.current) return;
      const vh = window.innerHeight;
      // Header: 149px, Footer: 69px = Total: 218px
      // En 1920x1080: 1080 - 218 = 862px disponibles
      const availableHeight = vh - 218;
      sectionRef.current.style.minHeight = `${availableHeight}px`;
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // ---------- Scroller horizontal con DRAG para navegar entre paneles ----------
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [draggingScroll, setDraggingScroll] = useState(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);

  // Arrancar SIEMPRE en el panel 1 bien centrado
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: 0, behavior: "auto" });
  }, []);

  // Convertir rueda vertical a horizontal
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onWheel = (ev: WheelEvent) => {
      if (Math.abs(ev.deltaY) > Math.abs(ev.deltaX)) {
        ev.preventDefault();
        el.scrollLeft += ev.deltaY;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Drag horizontal sobre el scroller
  const onScrollPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const el = scrollerRef.current;
    if (!el) return;
    setDraggingScroll(true);
    dragStartX.current = e.clientX;
    dragStartScroll.current = el.scrollLeft;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    e.preventDefault();
  };

  const onScrollPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!draggingScroll) return;
    const el = scrollerRef.current;
    if (!el) return;
    e.preventDefault();
    const dx = e.clientX - dragStartX.current;
    el.scrollLeft = dragStartScroll.current - dx;
  };

  const onScrollPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    setDraggingScroll(false);
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  return (
    <main ref={sectionRef} className="bg-neutral-50">
      {/* DESKTOP: Scroller horizontal continuo (sin snap) */}
      <div
        ref={scrollerRef}
        className={`
          hidden md:block
          w-full overflow-x-auto overflow-y-hidden
          select-none
          overscroll-x-contain
          [&::-webkit-scrollbar]:hidden
          ${draggingScroll ? "cursor-grabbing" : "cursor-grab"}
        `}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onPointerDown={onScrollPointerDown}
        onPointerMove={onScrollPointerMove}
        onPointerUp={onScrollPointerUp}
        onPointerCancel={onScrollPointerUp}
      >
        {/* Contenido horizontal continuo */}
        <div className="inline-flex">
          {/* ---------- Panel 1: Imagen + Texto ---------- */}
          <section 
            className="inline-block w-screen"
            data-cursor="drag"
            data-cursor-label="Arrastra"
          >
            <div className="flex items-start" style={{ 
              paddingTop: "clamp(4rem, 2.6vw, 3rem)", 
              paddingBottom: "clamp(4rem, 2.6vw, 3rem)",
              paddingLeft: "clamp(2rem, 8.33vw, 10rem)", 
              paddingRight: "clamp(2rem, 8.33vw, 10rem)",
              gap: "clamp(2rem, 4.17vw, 4rem)"
            }}>
              <div className="flex items-start" style={{ gap: "clamp(2rem, 4.17vw, 4rem)" }}>
<div
  className="overflow-hidden shrink-0"
  style={{ width: "clamp(300px,39.32vw,755px)", height: "clamp(200px,29.32vw,563px)" }}
  data-cursor="pointer"
>
  <InteractiveSvg
  svgUrl="/Nosotros/logoouma.svg"
  className="w-full h-full bg-[url('/Nosotros/fondo.svg')] bg-cover bg-center"
  mode="reveal"

  /* ⬇️ Estado inicial */
  startPainted                       // ya dibujado desde el inicio
  autoPlayOnMount={false}            // no animes al montar

  /* ⬇️ Comportamiento en hover */
  drawOnHover                        // anima al pasar el mouse
  eraseThenDrawOnHover               // primero borra y luego dibuja
  drawDurationMs={1900}
  drawStaggerMs={45}
  brushWidthMultiplier={0.12}        // sube si quedan “huequitos” en el fill

  // /* ⬇️ Opcional: excluye guías grises del dibujo (sin tocar el SVG) */
  // drawSelector=":is(path,rect,circle,ellipse,polygon,polyline)
  //              :not([stroke='#BFBFBF']):not([fill='#BFBFBF'])
  //              :not([stroke='#CCCCCC']):not([fill='#CCCCCC'])"

  /* ⬇️ Zoom inicial y zoom-out durante el reveal */
  zoomOutOnReveal
  zoomFrom={3}                     // cuánto acercas de inicio
  zoomFocusPercent={{ x: 0.27, y: 0.001 }}  // foco (0..1) ≈ segunda “n”
  zoomDurationMs={1400}
  zoomEasing="cubic-bezier(.2,.7,0,1)"

/>


</div>


                {/* Texto Panel 1 */}
                <div className="shrink-0" style={{ width: "clamp(300px, 47.66vw, 915px)" }} data-cursor="text">
                  <h1 className="font-medium text-neutral-900" style={{ fontSize: "clamp(2rem, 3.33vw, 4rem)", lineHeight: "1.1", letterSpacing: "0" }}>
                    Sobre nosotros
                  </h1>

                  <div className="text-black font-medium" style={{ marginTop: "clamp(1.5rem, 2.5vw, 2rem)", fontSize: "clamp(0.875rem, 1.04vw, 1.25rem)", lineHeight: "1.40", letterSpacing: "0" }}>
                    <p className="mb-[clamp(0.75rem,1.04vw,1.25rem)]">
                      En OUMA creemos que la arquitectura no comienza con un plano, sino con una intención. 
                      Nuestro propósito es diseñar y construir espacios que respeten lo esencial: el ser humano.
                    </p>
                    <p className="mb-[clamp(0.75rem,1.04vw,1.25rem)]">
                      Fundados en <span className="font-bold">2021</span> en <span className="font-bold">Cancún, México</span>, hemos desarrollado proyectos en distintas ciudades 
                      del país como <span className="font-bold">Vallarta, Guadalajara y Michoacán</span>, expandiendo nuestra visión hacia un 
                      alcance nacional e internacional. Cada proyecto que emprendemos es la oportunidad de 
                      traducir emociones, necesidades y aspiraciones en espacios habitables, funcionales y 
                      profundamente personales.
                    </p>
                    <p className="mb-[clamp(0.75rem,1.04vw,1.25rem)]">
                      Nuestra filosofía combina tres pilares: <span className="font-bold">arquitectura, tecnología y sensibilidad</span>. 
                      Diseñamos con visión y empatía, construimos con precisión y claridad, y acompañamos 
                      a cada cliente en todo el proceso: desde la idea inicial hasta el último detalle de obra.
                    </p>
                    <p className="mb-[clamp(0.75rem,1.04vw,1.25rem)]">
                      Lo que nos distingue no es solo el resultado final, sino la experiencia del camino.
                    </p>
                    <p>
                      En <span className="font-bold">OUMA</span> escuchamos, interpretamos y transformamos las necesidades en arquitectura viva, 
                      honesta y significativa. Creemos en un balance entre lo humano y lo técnico: espacios 
                      que inspiran, acompañan y trascienden. En cada proyecto buscamos crear entornos que se 
                      sientan vivos, coherentes y con alma; lugares que nuestros clientes puedan habitar con 
                      orgullo, comodidad y propósito.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ---------- Panel 2: Imagen + Texto ---------- */}
          <section 
            className="inline-block w-screen"
            data-cursor="drag"
            data-cursor-label="Arrastra"
          >
            <div className="flex items-start" style={{ 
              paddingTop: "clamp(4rem, 2.6vw, 3rem)", 
              paddingBottom: "clamp(4rem, 2.6vw, 3rem)",
              paddingLeft: "clamp(2rem, 8.33vw, 10rem)", 
              paddingRight: "clamp(2rem, 8.33vw, 10rem)",
              gap: "clamp(2rem, 4.17vw, 4rem)"
            }}>
              <div className="flex items-start" style={{ gap: "clamp(2rem, 4.17vw, 4rem)" }}>
                {/* Ilustración - TODO: CAMBIAR ESTA IMAGEN */}
                <div
                  className="overflow-hidden shrink-0"
                  style={{ width: "clamp(300px, 39.32vw, 755px)", height: "clamp(200px, 29.32vw, 563px)" }}
                  data-cursor="pointer"
                >
                  <img
                    src="/Nosotros/columna2.png"
                    alt="Filosofía OUMA"
                    className="w-full h-full object-cover"
                    draggable={false}
                    loading="lazy"
                  />
                </div>

                {/* Texto Panel 2 */}
                <div className="shrink-0" style={{ width: "clamp(300px, 47.66vw, 915px)" }} data-cursor="text">
                  <div className="text-black font-medium" style={{ fontSize: "clamp(0.875rem, 1.04vw, 1.25rem)", lineHeight: "1.5", letterSpacing: "0" }}>
                    <p>
                      En <span className="text-neutral-900 font-bold">OUMA</span> escuchamos, interpretamos y transformamos las necesidades en arquitectura viva, 
                      honesta y significativa. Creemos en un balance entre lo humano y lo técnico: espacios 
                      que inspiran, acompañan y trascienden. En cada proyecto buscamos crear entornos que se 
                      sientan vivos, coherentes y con alma; lugares que nuestros clientes puedan habitar con 
                      orgullo, comodidad y propósito.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* MOBILE: Layout vertical (imagen arriba, texto abajo) */}
      <div className="md:hidden">
        {/* ---------- Sección 1 ---------- */}
        <section className="py-12">
          {/* Imagen */}
          <div className="w-full aspect-4/3 overflow-hidden mb-6 px-6">
            <img
              src="/Nosotros/columna1.svg"
              alt="Nosotros OUMA"
              className="w-full h-full object-cover"
              draggable={false}
              loading="lazy"
            />
          </div>

          {/* Texto */}
          <div className="px-6">
            <h1 className="font-medium text-neutral-900 text-3xl leading-tight mb-6">
              Sobre nosotros
            </h1>

            <div className="text-black font-medium text-base leading-relaxed space-y-4">
              <p>
                En OUMA creemos que la arquitectura no comienza con un plano, sino con una intención. 
                Nuestro propósito es diseñar y construir espacios que respeten lo esencial: el ser humano.
              </p>
              <p>
                Fundados en <span className="font-bold">2021</span> en <span className="font-bold">Cancún, México</span>, hemos desarrollado proyectos en distintas ciudades 
                del país como <span className="font-bold">Vallarta, Guadalajara y Michoacán</span>, expandiendo nuestra visión hacia un 
                alcance nacional e internacional. Cada proyecto que emprendemos es la oportunidad de 
                traducir emociones, necesidades y aspiraciones en espacios habitables, funcionales y 
                profundamente personales.
              </p>
              <p>
                Nuestra filosofía combina tres pilares: <span className="font-bold">arquitectura, tecnología y sensibilidad</span>. 
                Diseñamos con visión y empatía, construimos con precisión y claridad, y acompañamos 
                a cada cliente en todo el proceso: desde la idea inicial hasta el último detalle de obra.
              </p>
              <p>
                Lo que nos distingue no es solo el resultado final, sino la experiencia del camino.
              </p>
              <p>
                En <span className="font-bold">OUMA</span> escuchamos, interpretamos y transformamos las necesidades en arquitectura viva, 
                honesta y significativa. Creemos en un balance entre lo humano y lo técnico: espacios 
                que inspiran, acompañan y trascienden. En cada proyecto buscamos crear entornos que se 
                sientan vivos, coherentes y con alma; lugares que nuestros clientes puedan habitar con 
                orgullo, comodidad y propósito.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- Sección 2 ---------- */}
        <section className="py-12">
          {/* Imagen */}
          <div className="w-full aspect-4/3 overflow-hidden mb-6 px-6">
            <img
              src="/Nosotros/columna2.png"
              alt="Filosofía OUMA"
              className="w-full h-full object-cover"
              draggable={false}
              loading="lazy"
            />
          </div>

          {/* Texto */}
          <div className="px-6 text-black font-medium text-base leading-relaxed">
            <p>
              En <span className="text-neutral-900 font-bold">OUMA</span> escuchamos, interpretamos y transformamos las necesidades en arquitectura viva, 
              honesta y significativa. Creemos en un balance entre lo humano y lo técnico: espacios 
              que inspiran, acompañan y trascienden. En cada proyecto buscamos crear entornos que se 
              sientan vivos, coherentes y con alma; lugares que nuestros clientes puedan habitar con 
              orgullo, comodidad y propósito.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
