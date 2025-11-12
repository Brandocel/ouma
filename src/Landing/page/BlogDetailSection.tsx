import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BlogDetailSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
    // ---------- Scroller horizontal con DRAG para navegar entre paneles ----------
      const scrollerRef = useRef<HTMLDivElement>(null);
      const [draggingScroll, setDraggingScroll] = useState(false);
      const dragStartX = useRef(0);
      const dragStartScroll = useRef(0);

  // Imágenes del artículo
  const images = {
    left: "/src/assets/blog/img8.png",
    right: "/src/assets/blog/img9.png",
  };

  // ✅ Altura dinámica
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

  // ✅ Scroll horizontal suave
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
          <main
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
        <div>

      {/* 🔙 Botón volver */}
      <button
        onClick={() => navigate("/blog")}
        data-cursor="link"
        className="absolute left-[clamp(6rem,7vw,10rem)] top-[clamp(1rem,8vw,10rem)]
                  text-neutral-400 hover:text-neutral-700 transition-colors
                  text-[clamp(1.4rem,1.2vw,1.8rem)] z-20 tracking-wide"
      >
        ← Volver
      </button>

      {/* 🖥️ DESKTOP */}
      <div
      >
        <div
          className="flex justify-start mx-auto"
          style={{
            gap: "clamp(4rem, 4vw, 8rem)",
            paddingLeft: "clamp(8rem, 10vw, 13.8rem)",
            paddingRight: "clamp(4rem, 5vw, 7rem)",
            minWidth: "fit-content",
            maxWidth: "clamp(160rem, 95vw, 197.9rem)",
            height: "100%",
          }}
        >
          {/* 🔹 COLUMNA IZQUIERDA (Imagen + título) */}
          <div className="flex flex-col items-start justify-center flex-shrink-0">
            <div
              className="overflow-hidden bg-[#D9D9D9] rounded-sm mb-4"
              style={{
                width: "clamp(32rem, 24vw, 48rem)",
                height: "clamp(20rem, 18vw, 30.2rem)", // 480×302px
              }}
            >
              <img
                src={images.left}
                alt="La Madera sin Disfráz"
                className="object-cover w-full h-full"
                draggable={false}
              />
            </div>

            <h2
              className="font-medium"
              style={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontSize: "clamp(2.4rem, 2.5vw, 4.8rem)",
                lineHeight: "clamp(3rem, 2.5vw, 6rem)",
                color: "#0A0A0A",
              }}
            >
              La Madera sin Disfráz
            </h2>
            <p
              style={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontSize: "clamp(1.4rem, 1.3vw, 2rem)",
                color: "#A6A6A6",
                marginTop: "clamp(0.4rem, 0.6vw, 1rem)",
              }}
            >
              Una reflexión de OUMA
            </p>
          </div>

          {/* 🔹 COLUMNA CENTRAL (Texto) */}
          <div
            className="flex justify-items-start !import flex-shrink-0"
            style={{
              width: "clamp(46rem, 36vw, 66.7rem)",
              gap: "clamp(1.2rem, 1.5vw, 2.4rem)",
              color: "#0A0A0A",
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontSize: "clamp(.5rem, 1.2vw, 1.065rem)",
              lineHeight: 1.4,
              fontWeight: 500,
            }}
          >
            <p>
              En <span className="font-bold">OUMA</span> tenemos una relación directa con los materiales. Nos gusta
              escucharlos antes de intervenirlos. Entender lo que quieren decir
              sin cubrirlos de más.
              <br />
              La madera, por ejemplo, ha sido durante años víctima del barniz
              total: <br /> ese impulso de dejarla brillante, sellada, protegida. Pero
              ese brillo muchas veces la despoja <br /> de lo que la hace viva.
              <br />
              <br />
              En su estado crudo, la madera habla.
              Se contrae, se abre, se oxida, cambia de color. <br /> Su superficie
              registra el paso del tiempo, el clima, el contacto humano. <br /> Cada
              grieta es una conversación con el entorno.
            </p>
          </div>

          {/* 🔹 COLUMNA DERECHA (Imagen grande) */}
          <div
            className="overflow-hidden bg-[#D9D9D9] rounded-sm flex-shrink-0"
            style={{
              width: "clamp(42rem, 35vw, 70rem)", // 700px
              height: "clamp(28rem, 25vw, 47.8rem)", // 478px
            }}
          >
            <img
              src={images.right}
              alt="Troncos madera"
              className="object-cover w-full h-full"
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* 📱 MOBILE */}
      <div className="md:hidden w-full px-6 py-10 space-y-8">
        <div className="space-y-3">
          <img
            src={images.left}
            alt="La Madera sin Disfráz"
            className="w-full h-auto object-cover rounded-sm"
          />
          <h2 className="font-medium text-[#0A0A0A] text-[clamp(2rem,6vw,3.2rem)]">
            La Madera sin Disfráz
          </h2>
          <p className="text-[#A6A6A6] text-[clamp(1.4rem,4vw,1.8rem)]">
            Una reflexión de OUMA
          </p>
        </div>

        <div className="space-y-5 text-[#0A0A0A] font-medium text-[clamp(1.4rem,4vw,1.8rem)] leading-relaxed">
          <p>
            En OUMA tenemos una relación directa con los materiales. Nos gusta
            escucharlos antes de intervenirlos. Entender lo que quieren decir
            sin cubrirlos de más. La madera, por ejemplo, ha sido durante años
            víctima del barniz total: ese impulso de dejarla brillante, sellada,
            protegida. Pero ese brillo muchas veces la despoja de lo que la hace
            viva. En su estado crudo, la madera habla.
          </p>
          <p>
            Se contrae, se abre, se oxida, cambia de color. Su superficie
            registra el paso del tiempo, el clima, el contacto humano. Cada
            grieta es una conversación con el entorno.
          </p>
        </div>

        <img
          src={images.right}
          alt="Troncos madera"
          className="w-full h-auto object-cover rounded-sm"
        />
      </div>
      </div>
    </main>
  );
}
