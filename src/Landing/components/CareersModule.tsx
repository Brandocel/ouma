import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import InteractiveSvg from "../../common/svg/InteractiveSvg";

/* ========= Helpers: evitar drag sobre inputs/select/etc ========= */
const INTERACTIVE_SELECTOR =
  'input, select, textarea, button, [role="button"], a, label, [contenteditable="true"], [data-drag-ignore="true"]';

function isInteractiveTarget(e: Event) {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  return !!t.closest(INTERACTIVE_SELECTOR);
}

/* ========= Floating Fields ========= */
function FloatingInput({
  id,
  name,
  label,
  type = "text",
  className = "",
  required = false,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  className?: string;
  required?: boolean;
}) {
  const numberFix =
    type === "number"
      ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      : "";

  return (
    <div className={`relative ${className}`} data-cursor="ignore">
      <input
        id={id}
        name={name}
        type={type}
        placeholder=" "
        required={required}
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
  name,
  label,
  options,
  className = "",
  required = false,
}: {
  id: string;
  name: string;
  label: string;
  options: { value: string; label: string }[];
  className?: string;
  required?: boolean;
}) {
  const [filled, setFilled] = useState(false);
  const selRef = useRef<HTMLSelectElement>(null);

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
        name={name}
        defaultValue=""
        required={required}
        onChange={(e) => setFilled(e.currentTarget.value !== "")}
        data-filled={filled ? "true" : "false"}
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

      <span className="pointer-events-none absolute right-0 bottom-2 text-neutral-400">▾</span>

      <label
        htmlFor={id}
        className="
          pointer-events-none absolute left-0 top-2
          text-[12px] tracking-[0.12em] text-neutral-500
          transition-all duration-200
          peer-focus:-top-3 peer-focus:text-[11px]
          peer-data-[filled=true]:-top-3 peer-data-[filled=true]:text-[11px]
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
          name="telefono_prefijo"
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
        <span className="pointer-events-none absolute right-0 bottom-2 text-neutral-400">▾</span>
        <label className="pointer-events-none absolute left-0 top-2 text-[12px] opacity-0">&nbsp;</label>
      </div>

      {/* Número */}
      <div className="relative" data-filled={filledNumber ? "true" : "false"}>
        <input
          name="telefono_numero"
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

/* ========= File Dropzone (real con input file) ========= */
function bytesToMb(bytes: number) {
  return Math.round((bytes / (1024 * 1024)) * 100) / 100;
}

function FileDropzone({
  label,
  name,
  accept,
  multiple = true,
  maxTotalBytes,
}: {
  label: string;
  name: string;
  accept: string;
  multiple?: boolean;
  maxTotalBytes: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");

  const totalBytes = useMemo(() => files.reduce((sum, f) => sum + f.size, 0), [files]);

  const validate = (next: File[]) => {
    const bytes = next.reduce((s, f) => s + f.size, 0);
    if (bytes > maxTotalBytes) {
      setError(`Peso excedido. Máximo ${bytesToMb(maxTotalBytes)} MB (actual ${bytesToMb(bytes)} MB).`);
      return false;
    }
    setError("");
    return true;
  };

  const applyFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const next = Array.from(fileList);

    if (!multiple) {
      const one = next.slice(0, 1);
      if (!validate(one)) return;
      setFiles(one);
      return;
    }

    const merged = [...files, ...next];
    if (!validate(merged)) return;
    setFiles(merged);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    applyFiles(e.dataTransfer.files);
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const openPicker = () => inputRef.current?.click();

  const removeFile = (idx: number) => {
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
    validate(next);
    // IMPORTANTE: para que el input refleje cambios
    if (inputRef.current) inputRef.current.value = "";
  };

  // Si el usuario borra manualmente desde picker (o selecciona de nuevo)
  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setFiles([]); // reemplazamos para que sea predecible
    applyFiles(e.target.files);
  };

  return (
    <div className="w-full" data-drag-ignore="true" data-cursor="ignore">1
      <label className="block text-[12px] tracking-[0.12em] text-neutral-500 mb-2 select-none">
        {label}
      </label>

      {/* Input real (oculto) */}
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={onInputChange}
      />

      {/* Zona Drop */}
      <div
        onClick={openPicker}
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="
          w-full border border-neutral-300 bg-neutral-200/50
          py-10 text-center text-neutral-600 select-none
          hover:opacity-90 transition cursor-pointer
        "
      >
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
        <div className="text-[13px] tracking-wide uppercase">HAZ CLICK O ARRASTRA LOS ARCHIVOS AQUÍ</div>
        <div className="text-[11px] mt-1 opacity-60">
          Peso máximo {bytesToMb(maxTotalBytes)} MB · {accept.replaceAll(".", "").toUpperCase()}
        </div>
      </div>

      {/* Lista de archivos */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-[12px] text-neutral-600">
            Adjuntos: {files.length} · Total: {bytesToMb(totalBytes)} MB
          </div>

          <div className="space-y-2">
            {files.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                className="flex items-center justify-between gap-3 border border-neutral-200 bg-white/70 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-[13px] text-neutral-900 truncate">{f.name}</div>
                  <div className="text-[11px] text-neutral-500">{bytesToMb(f.size)} MB</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  className="text-[12px] underline underline-offset-4 text-neutral-700 hover:opacity-70"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className="mt-2 text-[12px] text-red-600">{error}</div>}
    </div>
  );
}

export default function CareersModule() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const vwRef = useRef<number>(window.innerWidth);
  const [availableH, setAvailableH] = useState<number | null>(null);

  // Arranca en panel 1
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    vwRef.current = window.innerWidth;
    el.scrollLeft = 0;
    requestAnimationFrame(() => (el.scrollLeft = 0));
  }, []);

  // Altura disponible en desktop: viewport menos header y footer, para evitar scroll vertical al footer
  useEffect(() => {
    const compute = () => {
      if (window.innerWidth < 1024) {
        setAvailableH(null);
        return;
      }

      const header = document.querySelector("header") as HTMLElement | null;
      const footer = document.querySelector("footer") as HTMLElement | null;
      const hH = header?.getBoundingClientRect().height ?? 0;
      const fH = footer?.getBoundingClientRect().height ?? 0;
      const vh = Math.max(window.innerHeight, document.documentElement.clientHeight);
      const usable = Math.max(0, Math.round(vh - hH - fH));

      setAvailableH((prev) => (prev === usable ? prev : usable || null));
    };

    compute();

    const ro = new ResizeObserver(compute);
    const header = document.querySelector("header") as HTMLElement | null;
    const footer = document.querySelector("footer") as HTMLElement | null;
    header && ro.observe(header);
    footer && ro.observe(footer);

    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, []);

  // Drag + snap suave (y ahora IGNORA inputs y dropzone)
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
      if (isInteractiveTarget(e)) return; // ✅ clave
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

  const [draggingScroll, setDraggingScroll] = useState(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);

  const onScrollPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (isInteractiveTarget(e.nativeEvent)) return; // ✅ clave
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

  // ✅ Redirección al terminar submit (opcional: mostrar mensaje al volver)
  const sent = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("sent") : null;

  return (
    <main className="overflow-x-hidden">
      {/* MOBILE STACKED LAYOUT */}
      <div className="md:hidden">
        {/* Panel 1: Arte + copy */}
        <section className="px-4 pt-24 pb-8">
          <div className="mx-auto max-w-[1440px] grid gap-8 items-start">
            <div className="relative">
              <div className="overflow-hidden w-full max-w-[720px] mx-auto" data-cursor="pointer">
                <InteractiveSvg
                  svgUrl="/Nosotros/logoouma.svg"
                  className="w-full h-[320px] bg-[url('/Nosotros/fondo.svg')] bg-cover bg-center"
                  mode="reveal"
                  startPainted
                  autoPlayOnMount={false}
                  drawOnHover
                  eraseThenDrawOnHover
                  drawDurationMs={1900}
                  drawStaggerMs={45}
                  brushWidthMultiplier={0.12}
                  zoomOutOnReveal
                  zoomFrom={3}
                  zoomFocusPercent={{ x: 0.27, y: 0.001 }}
                  zoomDurationMs={1400}
                  zoomEasing="cubic-bezier(.2,.7,0,1)"
                />
              </div>
            </div>
            <div className="max-w-[640px] mx-auto">
              <h1 className="leading-tight text-center">
                <span className="text-[40px] font-medium text-neutral-400">Careers – </span>
                <span className="text-[40px] font-semibold text-neutral-900">Únete a OUMA</span>
              </h1>
              <div className="mt-6 space-y-6 text-[18px] leading-[26px] text-black">
                <p>
                  En <strong className="font-semibold">OUMA</strong> creemos que cada proyecto es tan humano como
                  quienes lo construyen. Nuestra filosofía se centra en la sensibilidad, la precisión y el
                  compromiso, y buscamos colaboradores que compartan esa visión.
                </p>
                <p>
                  Queremos rodearnos de personas que amen el diseño, que valoren el detalle y que comprendan que la
                  arquitectura es más que espacio: es experiencia y acompañamiento. Profesionales que sepan escuchar,
                  proponer y ejecutar con claridad; que encuentren equilibrio entre lo técnico y lo humano.
                </p>
                <p>
                  En <strong className="font-semibold">OUMA</strong> no buscamos volumen, buscamos esencia. Si
                  compartes nuestra convicción de que la arquitectura debe tener espacio &amp; alma, entonces aquí
                  hay un lugar para ti.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Panel 2: Formulario */}
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-[1440px] mt-10">
            <h2 className="text-[40px] leading-[0.95] font-semibold tracking-tight text-black mb-6">Tus datos</h2>

            <form
              action="https://formsubmit.co/Yahir@ouma.com.mx"
              method="POST"
              encType="multipart/form-data"
              className="grid gap-8"
              data-drag-ignore="true"
            >
              <input type="hidden" name="_subject" value="OUMA | Careers | Nueva postulación" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_next" value={`${window.location.origin}/careers?sent=1`} />

              <FloatingInput id="nombre_m" name="nombre" label="NOMBRE COMPLETO" required />
              <FloatingInput id="edad_m" name="edad" label="EDAD" type="number" />
              <FloatingInput id="correo_m" name="correo" label="CORREO ELECTRÓNICO" type="email" required />
              <PhoneField />

              <FloatingSelect
                id="area_m"
                name="area"
                label="ÁREA DE INTERÉS"
                required
                options={[
                  { value: "arquitectura", label: "Arquitectura" },
                  { value: "construccion", label: "Construcción" },
                  { value: "interiorismo", label: "Interiorismo" },
                  { value: "bim", label: "BIM System" },
                  { value: "productos", label: "Productos" },
                ]}
              />

              <FileDropzone
                label="ADJUNTA TU CV Y PORTAFOLIO AQUÍ"
                name="attachment"
                maxTotalBytes={3 * 1024 * 1024}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                multiple
              />

              <button type="submit" className="text-[15px] underline underline-offset-4 hover:opacity-80" data-cursor="ignore" style={{ cursor: "pointer" }}>
                SEND
              </button>

              <div className="text-[11px] text-neutral-500">
                Al enviar, aceptas que OUMA reciba tus datos y archivos para fines de reclutamiento.
              </div>
            </form>
          </div>
        </section>
      </div>

      {/* DESKTOP SCROLLER */}
      <div
        ref={scrollerRef}
        className={`hidden md:block w-full overflow-x-auto overflow-y-hidden select-none overscroll-x-contain [&::-webkit-scrollbar]:hidden ${
          draggingScroll ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          height: availableH ? `${availableH}px` : undefined,
        }}
        onPointerDown={onScrollPointerDown}
        onPointerMove={onScrollPointerMove}
        onPointerUp={onScrollPointerUp}
        onPointerCancel={onScrollPointerUp}
      >
        <div className="flex w-[200svw]">
          {/* ===== Panel 1 ===== */}
          <section
            className="w-[100svw] flex-none snap-start overflow-visible"
            style={availableH ? { minHeight: `${availableH}px` } : undefined}
          >
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
                      startPainted
                      autoPlayOnMount={false}
                      drawOnHover
                      eraseThenDrawOnHover
                      drawDurationMs={1900}
                      drawStaggerMs={45}
                      brushWidthMultiplier={0.12}
                      zoomOutOnReveal
                      zoomFrom={3}
                      zoomFocusPercent={{ x: 0.27, y: 0.001 }}
                      zoomDurationMs={1400}
                      zoomEasing="cubic-bezier(.2,.7,0,1)"
                    />
                  </div>
                </div>

                {/* Copy */}
                <div className="max-w-[640px] mx-auto md:mx-0">
                  <h1 className="leading-tight">
                    <span className="text-[40px] md:text-[56px] font-medium text-neutral-400">Careers – </span>
                    <span className="text-[40px] md:text-[56px] font-semibold text-neutral-900">Únete a OUMA</span>
                  </h1>

                  <div className="mt-6 space-y-6 text-[20px] leading-[28px] text-black">
                    <p>
                      En <strong className="font-semibold">OUMA</strong> creemos que cada proyecto es tan humano como
                      quienes lo construyen. Nuestra filosofía se centra en la sensibilidad, la precisión y el
                      compromiso, y buscamos colaboradores que compartan esa visión.
                    </p>
                    <p>
                      Queremos rodearnos de personas que amen el diseño, que valoren el detalle y que comprendan que la
                      arquitectura es más que espacio: es experiencia y acompañamiento. Profesionales que sepan escuchar,
                      proponer y ejecutar con claridad; que encuentren equilibrio entre lo técnico y lo humano.
                    </p>
                    <p>
                      En <strong className="font-semibold">OUMA</strong> no buscamos volumen, buscamos esencia. Si
                      compartes nuestra convicción de que la arquitectura debe tener espacio &amp; alma, entonces aquí
                      hay un lugar para ti.
                    </p>
                  </div>

                  <div className="mt-6">
                    <span className="inline-flex items-center gap-2 text-[20px] text-black select-none">Desliza →</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===== Panel 2 (Formulario con adjuntos) ===== */}
          <section
            id="careers-form-panel"
            className="
              w-[100svw] flex-none snap-start
              scroll-mt-[calc(var(--nav-offset-mobile)+24px)]
              md:scroll-mt-[calc(var(--nav-offset-desktop)+24px)]
            "
            data-drag-ignore="true"
            data-cursor="off"
            style={availableH ? { cursor: "auto", minHeight: `${availableH}px` } : { cursor: "auto" }}
          >
            <div className="mx-auto max-w-[1440px] px-4 pt-[clamp(112px,10vw,120px)] pb-12 md:pb-16">
              <h2 className="text-[48px] md:text-[72px] leading-[0.95] font-semibold tracking-tight text-black">
                Tus datos
              </h2>

              {sent === "1" && (
                <div className="mt-4 text-[14px] text-green-700">
                  ¡Listo! Se envió tu postulación. Si adjuntaste archivos, van incluidos.
                </div>
              )}

              {/* ✅ SUBMIT REAL (no AJAX) para que los adjuntos sean fiables */}
              <form
                action="https://formsubmit.co/Yahir@ouma.com.mx"
                method="POST"
                encType="multipart/form-data"
                className="mt-8 grid md:grid-cols-2 gap-10 md:gap-12"
                data-drag-ignore="true"
              >
                {/* Opciones FormSubmit */}
                <input type="hidden" name="_subject" value="OUMA | Careers | Nueva postulación" />
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_next" value={`${window.location.origin}/careers?sent=1`} />

                <FloatingInput id="nombre" name="nombre" label="NOMBRE COMPLETO" required />
                <FloatingInput id="edad" name="edad" label="EDAD" type="number" />

                <FloatingInput id="correo" name="correo" label="CORREO ELECTRÓNICO" type="email" required />
                <PhoneField />

                <FloatingSelect
                  id="area"
                  name="area"
                  label="ÁREA DE INTERÉS"
                  required
                  options={[
                    { value: "arquitectura", label: "Arquitectura" },
                    { value: "construccion", label: "Construcción" },
                    { value: "interiorismo", label: "Interiorismo" },
                    { value: "bim", label: "BIM System" },
                    { value: "productos", label: "Productos" },
                  ]}
                />

                <div className="hidden md:block" />

                <div className="md:col-span-2">
                  <FileDropzone
                    label="ADJUNTA TU CV Y PORTAFOLIO AQUÍ"
                    name="attachment"
                    maxTotalBytes={3 * 1024 * 1024} // 3MB
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    multiple
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="text-[15px] underline underline-offset-4 hover:opacity-80"
                    data-cursor="ignore"
                    style={{ cursor: "pointer" }}
                  >
                    SEND
                  </button>
                </div>

                <div className="md:col-span-2 text-[11px] text-neutral-500">
                  Al enviar, aceptas que OUMA reciba tus datos y archivos para fines de reclutamiento.
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
