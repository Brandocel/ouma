import { useEffect, useRef, useState } from "react";
import main from '../../assets/productos/img10.png';
import rational from '../../assets/productos/img11.png';
import bravat from '../../assets/productos/img12.png';

export default function ProductsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [draggingScroll, setDraggingScroll] = useState(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);

  const images = {
    main,
    rational,
    bravat,
  };

  // ✅ Altura igual que BIM y Casa del Mar
  useEffect(() => {
    const updateHeight = () => {
      if (!sectionRef.current) return;
      const vh = window.innerHeight;
      let availableHeight = vh - 218; // header (149) + footer (69)

      // 🔽 Escala adaptativa (ajustes más suaves)
      if (window.innerWidth < 1440) availableHeight *= 0.92;
      if (window.innerWidth < 1024) availableHeight *= 0.88;
      if (window.innerWidth < 768) availableHeight *= 0.8;

      sectionRef.current.style.minHeight = `${availableHeight}px`;
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // ✅ Scroll horizontal con rueda del mouse
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ✅ Drag horizontal
  const onScrollPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const el = scrollerRef.current;
    if (!el) return;
    setDraggingScroll(true);
    dragStartX.current = e.clientX;
    dragStartScroll.current = el.scrollLeft;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  };

  const onScrollPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!draggingScroll) return;
    const el = scrollerRef.current;
    if (!el) return;
    const dx = e.clientX - dragStartX.current;
    el.scrollLeft = dragStartScroll.current - dx;
    e.preventDefault();
  };

  const onScrollPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    setDraggingScroll(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  return (
    <section
      ref={sectionRef}
      className="text-[#0A0A0A] flex justify-center items-center overflow-hidden"
    >
      {/* DESKTOP SCROLLER */}
      <div
        ref={scrollerRef}
        className={`hidden md:block w-full overflow-x-auto overflow-y-hidden select-none overscroll-x-contain [&::-webkit-scrollbar]:hidden ${
          draggingScroll ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onPointerDown={onScrollPointerDown}
        onPointerMove={onScrollPointerMove}
        onPointerUp={onScrollPointerUp}
        onPointerCancel={onScrollPointerUp}
      >
        {/* CONTENEDOR INTERNO */}
        <div
          className="flex justify-start items-start mx-auto"
          style={{
            gap: "clamp(0rem, 2vw, 6rem)",
            paddingLeft: "clamp(5rem, 6vw, 14rem)",
            paddingRight: "clamp(4rem, 5vw, 10rem)",
            paddingTop: "clamp(1rem, 1vw, 6rem)",
            paddingBottom: "clamp(1rem, 1vw, 6rem)",
            minWidth: "fit-content",
            maxWidth: "clamp(160rem, 70vw, 209.5rem)",
          }}
        >
          {/* 🟩 Columna 1 */}
          <div
            className="flex flex-col justify-between flex-shrink-0"
            style={{
              width: "654px",
              
            }}
          >
            <div>
            <h2
              className="font-medium text-[#0A0A0A]"
              style={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontSize: "clamp(2rem, 4vw, 4rem)",       // máx 64 px
                lineHeight: "clamp(2.4rem, 5vw, 4.9375rem)", // máx 79 px
                
              }}
            >
              Productos
            </h2>


            <p
              style={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontWeight: 500,
                fontSize: "clamp(1rem, 1.2vw, 1.25rem)",    // máx 20 px
                lineHeight: "clamp(1.3rem, 1.6vw, 1.5625rem)", // máx 25 px
                color: "#0A0A0A",
                maxWidth: "clamp(38rem, 35vw, 65rem)",
              }}
            >
              En <b>OUMA</b> colaboramos con marcas internacionales que comparten nuestra
              visión: precisión, diseño y calidad constructiva. Cada una aporta un lenguaje
              técnico y estético que se integra a nuestros proyectos, permitiéndonos ofrecer
              soluciones arquitectónicas completas y duraderas.
            </p>

            </div>

            <div
              className="overflow-hidden bg-[#D9D9D9] mt-[clamp(2rem,2vw,3rem)] "
              style={{
                width: "603px",    // ✅ ancho fijo exacto
                height: "257px", 
              }}
            >
              <img
                src={images.main}
                alt="Productos"
                className="object-cover w-full h-full transition-transform duration-300 hover:scale-[1.03]"
                draggable={false}
              />
            </div>
          </div>

          {/* 🟦 Columna 2 */}
          <div
            className="flex flex-col justify-start gap-[clamp(3rem,3vw,4rem)] flex-shrink-0"
            style={{
              width: "clamp(38rem, 33vw, 65rem)",
            }}
          >
            {/* Rational */}
            <div>
              <div className="flex justify-between items-start">
<h3
  className="font-medium"
  style={{
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontSize: "clamp(1.8rem, 2vw, 2.5rem)",       // máx 40 px
    lineHeight: "clamp(2.2rem, 2.8vw, 3.125rem)", // máx 50 px
  }}
>
  Rational Küchen
</h3>

                <img
                  src={images.rational}
                  alt="Rational Logo"
                  style={{
                    width: "clamp(4.8rem, 4.8vw, 7.9rem)",
                    height: "clamp(1.6rem, 1.6vw, 2.5rem)",
                    marginTop: "0.6rem",
                  }}
                />
              </div>
<p
  className="text-[#A6A6A6]"
  style={{
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontWeight: 500,
    fontSize: "1.25rem",
  }}
>
  Alemania
</p>

<p
  style={{
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontWeight: 500,
    fontSize: "clamp(1rem, 1.1vw, 1.25rem)",        // máx 20 px
    lineHeight: "clamp(1.3rem, 1.5vw, 1.5625rem)",  // máx 25 px
  }}
>
                La marca Rational refleja la excelencia del diseño alemán
                aplicado a la cocina. <br /> Su filosofía une funcionalidad, ergonomía
                y elegancia minimalista, alineada con el espíritu de OUMA: espacios con alma y precisión constructiva. 
Trabajamos con Rational en el diseño e instalación de cocinas modulares premium para hoteles y viviendas exclusivas. 
              </p>
            </div>

            {/* Bravat */}
            <div>
              <div className="flex justify-between items-start">
                <h3
                  className="font-medium"
                  style={{
                    fontFamily: "'Cabinet Grotesk', sans-serif",
                    fontSize: "clamp(1.6rem, 1.6vw, 4rem)",
                    lineHeight: "clamp(2rem, 2vw, 5rem)",
                  }}
                >
                  Bravat by Dietsche
                </h3>
                <img
                  src={images.bravat}
                  alt="Bravat Logo"
                  style={{
                    width: "clamp(5.5rem, 6vw, 8.7rem)",
                    height: "clamp(1.6rem, 1.8vw, 2.4rem)",
                    marginTop: "0.6rem",
                  }}
                />
              </div>
              <p
                className="text-[#A6A6A6]"
                style={{
                  fontFamily: "'Cabinet Grotesk', sans-serif",
                  fontWeight: 500,
                  fontSize: "1.25rem", // 20px
                  lineHeight: "1.25rem", // 25px exactos
                }}
              >
                Alemania, China, Vietnam
              </p>
              <p
                className="mt-[clamp(0.5rem,1vw,0rem)]"
                style={{
                  fontFamily: "'Cabinet Grotesk', sans-serif",
                  fontWeight: 500,
                  fontSize: "clamp(1.1rem, 1vw, 1.8rem)",
                  lineHeight: "clamp(1.7rem, 1.5vw, 2.5rem)",
                }}
              >
              Desde 1873, Bravat representa la tradición alemana en diseño sanitario de alta gama.  <br />
              Su producción combina ingeniería europea con tecnología asiática, <br /> garantizando eficiencia, sustentabilidad y estética contemporánea.  <br />
              Integramos su línea de grifería, lavabos y accesorios en proyectos <br /> residenciales y hoteleros de alto nivel. 
              </p>
            </div>
          </div>

{/* 🟥 Columna 3 - Stanley */}
<div
  className="flex flex-col justify-start flex-shrink-0"
  style={{
    width: "clamp(38rem, 33vw, 65rem)", // igual que Rational Küchen
  }}
>
  <h3
    className="font-medium"
    style={{
      fontFamily: "'Cabinet Grotesk', sans-serif",
      fontWeight: 500,
      fontSize: "clamp(1.8rem, 2vw, 2.5rem)",       // igual que Rational
      lineHeight: "clamp(2.2rem, 2.8vw, 3.125rem)", // igual que Rational
      color: "#0A0A0A",
    }}
  >
    Stanley
  </h3>

  <p
    className="text-[#A6A6A6]"
    style={{
      fontFamily: "'Cabinet Grotesk', sans-serif",
      fontWeight: 500,
      fontSize: "1.25rem",  // 20px
      lineHeight: "1.5625rem", // 25px
      
    }}
  >
    Estados Unidos, China
  </p>

  <p
    className=""
    style={{
      fontFamily: "'Cabinet Grotesk', sans-serif",
      fontWeight: 500,
      fontSize: "clamp(1rem, 1.1vw, 1.25rem)",       // igual que Rational
      lineHeight: "clamp(1.3rem, 1.5vw, 1.5625rem)", // igual que Rational
      color: "#0A0A0A",
      maxWidth: "65rem",
      marginTop: "clamp(0.3rem, 0vw, 0rem)"
    }}
  >
    Con licencia en 17 países asiáticos, Stanley combina innovación y <br /> resistencia
    en herrajes, cerraduras y sistemas de carpintería metálica. <br /> Su enfoque técnico
    permite integrar soluciones seguras y estéticas en <br /> proyectos arquitectónicos
    de cualquier escala.
  </p>
</div>


        </div>
      </div>

      {/* MOBILE (vertical layout) */}
      <div className="md:hidden w-full px-6 py-10 space-y-10">
        {/* Header */}
        <div className="space-y-4">
          <h2
            className="font-medium text-[#0A0A0A]"
            style={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontSize: "1.8rem",
              lineHeight: "2.2rem",
            }}
          >
            Productos
          </h2>
          <p
            className="text-[#0A0A0A]"
            style={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontWeight: 500,
              fontSize: "1.2rem",
              lineHeight: "1.7rem",
            }}
          >
            En <b>OUMA</b> colaboramos con marcas internacionales que comparten nuestra visión: precisión,
            diseño y calidad constructiva. Cada una aporta un lenguaje técnico y estético que se integra a
            nuestros proyectos, permitiéndonos ofrecer soluciones arquitectónicas completas y duraderas.
          </p>
        </div>

        {/* Main image */}
        <div className="overflow-hidden bg-[#D9D9D9] rounded">
          <img
            src={images.main}
            alt="Productos"
            className="object-cover w-full h-auto transition-transform duration-300 hover:scale-[1.03]"
            draggable={false}
            loading="lazy"
          />
        </div>

        {/* Rational */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3
              className="font-medium text-[#0A0A0A]"
              style={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontSize: "1.6rem",
                lineHeight: "2rem",
              }}
            >
              Rational Küchen
            </h3>
            <img
              src={images.rational}
              alt="Rational Logo"
              className="object-contain"
              style={{ width: "6.5rem", height: "2rem" }}
            />
          </div>
          <p className="text-[#A6A6A6]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 500, fontSize: "1rem" }}>
            Alemania
          </p>
          <p
            style={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontWeight: 500,
              fontSize: "1.1rem",
              lineHeight: "1.6rem",
            }}
          >
            La marca Rational refleja la excelencia del diseño alemán aplicado a la cocina. Su filosofía une
            funcionalidad, ergonomía y elegancia minimalista, alineada con el espíritu de OUMA: espacios con
            alma y precisión constructiva. Trabajamos con Rational en el diseño e instalación de cocinas modulares
            premium para hoteles y viviendas exclusivas.
          </p>
        </div>

        {/* Bravat */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3
              className="font-medium text-[#0A0A0A]"
              style={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontSize: "1.6rem",
                lineHeight: "2rem",
              }}
            >
              Bravat by Dietsche
            </h3>
            <img
              src={images.bravat}
              alt="Bravat Logo"
              className="object-contain"
              style={{ width: "7rem", height: "2.4rem" }}
            />
          </div>
          <p className="text-[#A6A6A6]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 500, fontSize: "1rem" }}>
            Alemania, China, Vietnam
          </p>
          <p
            style={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontWeight: 500,
              fontSize: "1.1rem",
              lineHeight: "1.7rem",
            }}
          >
            Desde 1873, Bravat representa la tradición alemana en diseño sanitario de alta gama. Su producción combina
            ingeniería europea con tecnología asiática, garantizando eficiencia, sustentabilidad y estética contemporánea.
            Integramos su línea de grifería, lavabos y accesorios en proyectos residenciales y hoteleros de alto nivel.
          </p>
        </div>

        {/* Stanley */}
        <div className="space-y-3">
          <h3
            className="font-medium text-[#0A0A0A]"
            style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: "1.6rem", lineHeight: "2rem" }}
          >
            Stanley
          </h3>
          <p className="text-[#A6A6A6]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 500, fontSize: "1rem" }}>
            Estados Unidos, China
          </p>
          <p
            style={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontWeight: 500,
              fontSize: "1.1rem",
              lineHeight: "1.6rem",
            }}
          >
            Con licencia en 17 países asiáticos, Stanley combina innovación y resistencia en herrajes, cerraduras y
            sistemas de carpintería metálica. Su enfoque técnico permite integrar soluciones seguras y estéticas en
            proyectos arquitectónicos de cualquier escala.
          </p>
        </div>
      </div>
    </section>
  );
}
