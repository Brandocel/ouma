import { useEffect, useLayoutEffect, useRef, useState } from "react";
import CareersSvg from "../../assets/Icons/Carrers/Recurso 12 1.svg";
import InteractiveSvg from "../../common/svg/InteractiveSvg";

/* ========= Floating Fields ========= */
function FloatingInput({
  id,
  label,
  type = "text",
  className = "",
}: {
  id: string;
  label: string;
  type?: string;
  className?: string;
}) {
  // clases extra para type=number (sin spinners)
  const numberFix =
    type === "number"
      ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      : "";

  return (
    <div className={`relative ${className}`} data-cursor="ignore">
      <input
        id={id}
        type={type}
        placeholder=" "
        className={`
          peer w-full bg-transparent outline-none
          border-b border-neutral-300 py-2 text-[15px]
          cursor-text ${numberFix}
        `}
        style={{ cursor: "text" }}
      />
      <label
        htmlFor={id}
        className="
          pointer-events-none absolute left-0 top-2
          text-[12px] tracking-[0.12em] text-neutral-500
          transition-all duration-200
          peer-placeholder-shown:top-2
          peer-placeholder-shown:text-[12px]
          peer-focus:-top-3 peer-focus:text-[11px]
          peer-not-placeholder-shown:-top-3
          peer-not-placeholder-shown:text-[11px]
        "
      >
        {label}
      </label>
    </div>
  );
}

function FloatingSelect({
  id,
  label,
  options,
  className = "",
}: {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const [filled, setFilled] = useState(false);
  const selRef = useRef<HTMLSelectElement>(null);

  // al montar, si tiene valor, mantener label arriba
  useEffect(() => {
    const el = selRef.current;
    if (!el) return;
    setFilled(el.value !== "");
  }, []);

  return (
    <div className={`relative ${className}`} data-cursor="ignore">
      <select
        ref={selRef}
        id={id}
        defaultValue=""
        onChange={(e) => setFilled(e.currentTarget.value !== "")}
        data-filled={filled ? "true" : "false"}  // ⬅️ el estado vive en el select
        className="
          peer w-full bg-transparent outline-none appearance-none
          border-b border-neutral-300 py-2 text-[15px] pr-6
          cursor-text
        "
        style={{ cursor: "text" }}
      >
        <option value="" disabled hidden></option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <span className="pointer-events-none absolute right-0 bottom-2 text-neutral-400">
        ▾
      </span>

      <label
        htmlFor={id}
        className="
          pointer-events-none absolute left-0 top-2
          text-[12px] tracking-[0.12em] text-neutral-500
          transition-all duration-200
          peer-focus:-top-3 peer-focus:text-[11px]
          peer-data-[filled=true]:-top-3 peer-data-[filled=true]:text-[11px]   /* ⬅️ clave */
        "
      >
        {label}
      </label>
    </div>
  );
}

function PhoneField() {
  const [filledNumber, setFilledNumber] = useState(false);

  return (
    <div className="grid grid-cols-[88px_1fr] gap-6 items-end" data-cursor="ignore">
      {/* Prefijo */}
      <div className="relative">
        <select
          defaultValue="+52"
          className="
            peer w-full bg-transparent outline-none appearance-none
            border-b border-neutral-300 py-2 text-[15px] pr-6
            cursor-text
          "
          style={{ cursor: "text" }}
        >
          <option value="+52">+52</option>
          <option value="+1">+1</option>
          <option value="+34">+34</option>
        </select>
        <span className="pointer-events-none absolute right-0 bottom-2 text-neutral-400">
          ▾
        </span>
        <label className="pointer-events-none absolute left-0 top-2 text-[12px] opacity-0">
          &nbsp;
        </label>
      </div>

      {/* Número */}
      <div className="relative" data-filled={filledNumber ? "true" : "false"}>
        <input
          type="tel"
          placeholder=" "
          onChange={(e) => setFilledNumber(e.currentTarget.value.trim() !== "")}
          className="
            peer w-full bg-transparent outline-none
            border-b border-neutral-300 py-2 text-[15px]
            cursor-text
          "
          style={{ cursor: "text" }}
        />
        <label
          className="
            pointer-events-none absolute left-0 top-2
            text-[12px] tracking-[0.12em] text-neutral-500
            transition-all duration-200
            peer-placeholder-shown:top-2 peer-placeholder-shown:text-[12px]
            peer-focus:-top-3 peer-focus:text-[11px]
            peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-[11px]
          "
        >
          000 000 - 0000
        </label>
      </div>
    </div>
  );
}

/* ========= Drag + Snap (ignorando inputs/selects/etc) ========= */
const INTERACTIVE_SELECTOR =
  'input, select, textarea, button, [role="button"], a, label, [contenteditable="true"]';
const isInteractiveTarget = (e: Event) => {
  const t = e.target as HTMLElement | null;
  return !!t && (!!t.closest(INTERACTIVE_SELECTOR) || !!t.closest("[data-drag-ignore]"));
};

export default function CareersModule() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const vwRef = useRef<number>(window.innerWidth);

  // Arranca en panel 1
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    vwRef.current = window.innerWidth;
    el.scrollLeft = 0;
    requestAnimationFrame(() => (el.scrollLeft = 0));
  }, []);

  // Drag + snap suave
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    let lastX = 0;
    let lastT = 0;
    let v = 0;
    let animId = 0;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const stopAnim = () => {
      if (animId) cancelAnimationFrame(animId);
      animId = 0;
    };
    const animateScrollTo = (to: number, dur = 450) => {
      const prevSnap = el.style.scrollSnapType;
      el.style.scrollSnapType = "none";
      const from = el.scrollLeft;
      const delta = to - from;
      if (Math.abs(delta) < 1) {
        el.scrollLeft = to;
        el.style.scrollSnapType = prevSnap || "";
        return;
      }
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        el.scrollLeft = from + delta * easeOutCubic(t);
        if (t < 1) animId = requestAnimationFrame(step);
        else el.style.scrollSnapType = prevSnap || "";
      };
      stopAnim();
      animId = requestAnimationFrame(step);
    };

    const onDown = (e: PointerEvent) => {
      if (isInteractiveTarget(e)) return; // no drag sobre inputs
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      dragging = true;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      lastX = e.clientX;
      lastT = performance.now();
      v = 0;
      stopAnim();
      el.classList.add("cursor-grabbing");
      e.preventDefault();
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dt = now - lastT || 16.7;
      el.scrollLeft = startScroll - (e.clientX - startX);
      v = dx * (16.7 / dt);
      lastX = e.clientX;
      lastT = now;
      e.preventDefault();
    };

    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      el.classList.remove("cursor-grabbing");

      const vw = vwRef.current;
      const halfway = vw / 2;
      const goingRight = v < -0.5;
      const goingLeft = v > 0.5;
      let target = 0;
      if (goingRight) target = vw;
      else if (goingLeft) target = 0;
      else target = el.scrollLeft > halfway ? vw : 0;

      target = Math.max(0, Math.min(vw, target));
      animateScrollTo(target, 450);
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      stopAnim();
    };
  }, []);

  return (
    <main className="overflow-x-hidden">
      {/* Scroller horizontal */}
      <div
        ref={scrollerRef}
        className="
          w-[100svw] overflow-x-auto overflow-y-hidden
          snap-x snap-mandatory snap-always
          select-none
          [overscroll-behavior-x:contain]
          [&::-webkit-scrollbar]:hidden
          cursor-grab active:cursor-grabbing
          [touch-action:pan-y]
        "
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex w-[200svw]">
          {/* ===== Panel 1 ===== */}
          <section className="w-[100svw] flex-none snap-start overflow-visible">
            <div
              className="mx-auto max-w-[1440px] px-4
                          pt-[calc(var(--nav-offset-mobile)+56px)]
                          md:pt-[calc(var(--nav-offset-desktop)+24px)]"
            >
              <div className="grid md:grid-cols-[1fr_1fr] gap-8 md:gap-12 items-start py-12 md:py-16">
                {/* Arte fijo */}
                <div className="relative">
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
                </div>

                {/* Copy */}
                <div className="max-w-[640px] mx-auto md:mx-0">
                  <h1 className="leading-tight">
                    <span className="text-[40px] md:text-[56px] font-medium text-neutral-400">
                      Careers –{" "}
                    </span>
                    <span className="text-[40px] md:text-[56px] font-semibold text-neutral-900">
                      Únete a OUMA
                    </span>
                  </h1>

                  <div className="mt-6 space-y-6 text-[20px] leading-[28px] text-black">
                    <p>
                      En <strong className="font-semibold">OUMA</strong> creemos que cada proyecto es tan humano
                      como quienes lo construyen. Nuestra filosofía se centra en la sensibilidad, la precisión y
                      el compromiso, y buscamos colaboradores que compartan esa visión.
                    </p>
                    <p>
                      Queremos rodearnos de personas que amen el diseño, que valoren el detalle y que comprendan
                      que la arquitectura es más que espacio: es experiencia y acompañamiento. Profesionales que
                      sepan escuchar, proponer y ejecutar con claridad; que encuentren equilibrio entre lo técnico
                      y lo humano.
                    </p>
                    <p>
                      En <strong className="font-semibold">OUMA</strong> no buscamos volumen, buscamos esencia.
                      Si compartes nuestra convicción de que la arquitectura debe tener espacio &amp; alma, entonces
                      aquí hay un lugar para ti.
                    </p>
                  </div>

                  <div className="mt-6">
                    <span className="inline-flex items-center gap-2 text-[20px] text-black select-none">
                      Desliza →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===== Panel 2 (Contacto con labels flotantes) ===== */}
          <section
            id="careers-form-panel"
            className="
              w-[100svw] flex-none snap-start
              scroll-mt-[calc(var(--nav-offset-mobile)+24px)]
              md:scroll-mt-[calc(var(--nav-offset-desktop)+24px)]
            "
            data-drag-ignore
            data-cursor="ignore"
            style={{ cursor: "auto" }}
          >
            <div className="mx-auto max-w-[1440px] px-4 pt-[clamp(112px,10vw,160px)] pb-12 md:pb-16">
              <h2 className="text-[48px] md:text-[72px] leading-[0.95] font-semibold tracking-tight text-black">
                Tus datos
              </h2>

              <form className="mt-8 grid md:grid-cols-2 gap-10 md:gap-12">
                <FloatingInput id="nombre" label="NOMBRE COMPLETO" />
                <FloatingInput id="edad" label="EDAD" type="number" />

                <FloatingInput id="correo" label="CORREO ELECTRÓNICO" type="email" />
                <PhoneField />

                <FloatingSelect
                  id="area"
                  label="ÁREA DE INTERÉS"
                  options={[
                    { value: "arquitectura", label: "Arquitectura" },
                    { value: "construccion", label: "Construcción" },
                    { value: "interiorismo", label: "Interiorismo" },
                    { value: "bim", label: "BIM System" },
                    { value: "productos", label: "Productos" },
                  ]}
                />

                <div className="hidden md:block" />

                {/* Dropzone (maqueta) */}
                <div className="md:col-span-2" data-cursor="ignore">
                  <label className="block text-[12px] tracking-[0.12em] text-neutral-500 mb-2 select-none">
                    ADJUNTA TU CV Y PORTAFOLIO AQUÍ
                  </label>
                  <div className="w-full border border-neutral-300 bg-neutral-200/50 py-10 text-center text-neutral-600 select-none">
                    <div className="flex justify-center mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="28"
                        height="28"
                        fill="currentColor"
                        className="opacity-60"
                      >
                        <path
                          d="M19 18H6a4 4 0 0 1-.5-7.98A6 6 0 0 1 17.74 7.1 5 5 0 0 1 19 17.9V18Zm-7-7v4m0-4-2 2m2-2 2 2"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </div>
                    <div className="text-[13px] tracking-wide uppercase">
                      HAZ CLICK O ARRASTRA LOS ARCHIVOS AQUÍ
                    </div>
                    <div className="text-[11px] mt-1 opacity-60">Peso máximo 3 MB</div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <button
                    type="button"
                    className="text-[15px] underline underline-offset-4 hover:opacity-80"
                    data-cursor="ignore"
                    style={{ cursor: "pointer" }}
                  >
                    SEND
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
