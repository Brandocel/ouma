import { useEffect, useRef, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { sendContactEmail } from "../../services/emailService";

/* Hook: anima max-height con la altura real del contenido */
function useAutoMaxHeight(open: boolean) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxH, setMaxH] = useState<string>(open ? "9999px" : "0px");
  const [opacity, setOpacity] = useState<number>(open ? 1 : 0);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    // Medimos la altura real del contenido
    const update = () => {
      const h = el.scrollHeight;
      if (open) {
        // Primero fijamos a su altura para animar desde 0 -> h
        setMaxH(`${h}px`);
        setOpacity(1);
      } else {
        // Cerrar:  h -> 0
        setMaxH("0px");
        setOpacity(0);
      }
    };

    update();

    // Recalcular si cambia el tamaño de pantalla
    const onResize = () => {
      if (!contentRef.current) return;
      if (open) setMaxH(`${contentRef.current.scrollHeight}px`);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  return { contentRef, maxH, opacity };
}

/* Componente reutilizable de acordeón */
function Accordion({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const { contentRef, maxH, opacity } = useAutoMaxHeight(open);

  return (
    <div className="mb-[clamp(0.5rem,0.89vw,17px)]">
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className="w-full text-left text-neutral-400 uppercase hover:text-neutral-900 transition-colors whitespace-nowrap flex items-center gap-2"
        style={{ fontSize: "clamp(0.875rem, 1.04vw, 20px)", letterSpacing: "0.05em" }}
      >
        <span className={open ? "text-neutral-900" : ""}>{title}</span>

        {/* Contenedor del icono con rotación suave */}
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center"
          style={{
            width: 20,
            height: 20,
            flexShrink: 0,
            transition: "transform 350ms ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          {/* Puedes dejar solo Plus y rotarlo; aquí alterno Plus/Minus para que se vea exacto */}
          {open ? <Minus strokeWidth={1.5} /> : <Plus strokeWidth={1.5} />}
        </span>
      </button>

      {/* Panel con animación de height auto (via max-height) + opacity */}
      <div
        id={id}
        role="region"
        aria-labelledby={`${id}-button`}
        ref={contentRef}
        className="overflow-hidden transition-[max-height,opacity] ease-out"
        style={{
          maxHeight: maxH,
          opacity: opacity,
          transitionDuration: "350ms",
        }}
      >
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export default function ContactoModule() {
  const sectionRef = useRef<HTMLElement>(null);
  const [showOficies, setShowOficies] = useState(false);
  const [showSocial, setShowSocial] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({ nombre: "", email: "", mensaje: "" });
  const [errors, setErrors] = useState({ nombre: "", email: "", mensaje: "" });
  const [touched, setTouched] = useState({ nombre: false, email: false, mensaje: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error" | ""; text: string; }>({ type: "", text: "" });

  // Validar campo individual
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "nombre":
        if (!value.trim()) return "El nombre es requerido";
        if (value.trim().length < 2) return "El nombre debe tener al menos 2 caracteres";
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return "El nombre solo puede contener letras";
        return "";
      case "email":
        if (!value.trim()) return "El email es requerido";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Ingresa un email válido";
        return "";
      case "mensaje":
        if (!value.trim()) return "El mensaje es requerido";
        if (value.trim().length < 10) return "El mensaje debe tener al menos 10 caracteres";
        if (value.trim().length > 500) return "El mensaje no puede exceder 500 caracteres";
        return "";
      default:
        return "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name as keyof typeof touched]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ nombre: true, email: true, mensaje: true });

    const nombreError = validateField("nombre", formData.nombre);
    const emailError = validateField("email", formData.email);
    const mensajeError = validateField("mensaje", formData.mensaje);

    setErrors({ nombre: nombreError, email: emailError, mensaje: mensajeError });

    if (nombreError || emailError || mensajeError) {
      setSubmitMessage({ type: "error", text: "Por favor corrige los errores antes de enviar" });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage({ type: "", text: "" });
    const result = await sendContactEmail(formData);
    setIsSubmitting(false);

    if (result.success) {
      setSubmitMessage({ type: "success", text: result.message });
      setFormData({ nombre: "", email: "", mensaje: "" });
      setErrors({ nombre: "", email: "", mensaje: "" });
      setTouched({ nombre: false, email: false, mensaje: false });
    } else {
      setSubmitMessage({ type: "error", text: result.message });
    }
  };

  // Altura mínima según viewport menos header+footer
  useEffect(() => {
    const updateHeight = () => {
      if (!sectionRef.current) return;
      const vh = window.innerHeight;
      const availableHeight = vh - 218; // 149 + 69
      sectionRef.current.style.minHeight = `${availableHeight}px`;
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <section ref={sectionRef} className="bg-neutral-50">
      <div
        className="w-full"
        style={{
          maxWidth: "clamp(300px, 83.33vw, 1600px)",
          paddingLeft: "clamp(1rem, 8.33vw, 160px)",
          paddingRight: "clamp(1rem, 8.33vw, 160px)",
          paddingTop: "clamp(2rem, 4.17vw, 80px)",
        }}
      >
        {/* Título */}
        <h1
          className="font-medium text-neutral-900"
          style={{
            fontSize: "clamp(2rem, 3.33vw, 64px)",
            lineHeight: "100%",
            letterSpacing: "0%",
            marginBottom: "clamp(2rem, 4.17vw, 80px)",
          }}
        >
          Contacto
        </h1>

        {/* Grid de 2 columnas: Formulario | Acordeones */}
        <div
          className="flex gap-x-[clamp(2rem,13.85vw,266px)]"
          style={{ width: "clamp(300px, 66.30vw, 1273px)" }}
        >
          {/* Columna 1: Formulario */}
          <form
            onSubmit={handleSubmit}
            style={{
              width: "clamp(300px, 47.71vw, 916px)",
              height: "clamp(200px, 23.54vw, 452px)",
              flexShrink: 0,
            }}
          >
            {/* NOMBRE y EMAIL */}
            <div className="flex gap-x-[clamp(1rem,2.97vw,57px)] mb-[clamp(2rem,4.17vw,80px)]">
              {/* NOMBRE */}
              <div style={{ flex: "0 0 clamp(150px,22.40vw,430px)" }}>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="NOMBRE"
                  disabled={isSubmitting}
                  className={`w-full bg-transparent border-b py-2 text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 placeholder:uppercase disabled:opacity-50 ${
                    errors.nombre && touched.nombre
                      ? "border-red-500 focus:border-red-500"
                      : "border-neutral-300 focus:border-neutral-900"
                  }`}
                  style={{ fontSize: "clamp(0.875rem, 1.04vw, 20px)", letterSpacing: "0.05em" }}
                />
                {errors.nombre && touched.nombre && (
                  <p className="text-red-500 mt-1" style={{ fontSize: "clamp(0.625rem, 0.73vw, 14px)" }}>
                    {errors.nombre}
                  </p>
                )}
              </div>

              {/* EMAIL */}
              <div style={{ flex: "0 0 clamp(150px,22.40vw,430px)" }}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="EMAIL"
                  disabled={isSubmitting}
                  className={`w-full bg-transparent border-b py-2 text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 placeholder:uppercase disabled:opacity-50 ${
                    errors.email && touched.email
                      ? "border-red-500 focus:border-red-500"
                      : "border-neutral-300 focus:border-neutral-900"
                  }`}
                  style={{ fontSize: "clamp(0.875rem, 1.04vw, 20px)", letterSpacing: "0.05em" }}
                />
                {errors.email && touched.email && (
                  <p className="text-red-500 mt-1" style={{ fontSize: "clamp(0.625rem, 0.73vw, 14px)" }}>
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* MENSAJE */}
            <div className="mb-[clamp(2rem,4.17vw,80px)]">
              <textarea
                name="mensaje"
                value={formData.mensaje}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="MENSAJE"
                disabled={isSubmitting}
                className={`w-full bg-transparent border-b py-2 text-neutral-900 outline-none transition-colors resize-none placeholder:text-neutral-400 placeholder:uppercase align-top disabled:opacity-50 ${
                  errors.mensaje && touched.mensaje
                    ? "border-red-500 focus:border-red-500"
                    : "border-neutral-300 focus:border-neutral-900"
                }`}
                style={{
                  fontSize: "clamp(0.875rem, 1.04vw, 20px)",
                  letterSpacing: "0.05em",
                  height: "clamp(60px, 6.77vw, 130px)",
                  verticalAlign: "top",
                }}
              />
              {errors.mensaje && touched.mensaje && (
                <p className="text-red-500 mt-1" style={{ fontSize: "clamp(0.625rem, 0.73vw, 14px)" }}>
                  {errors.mensaje}
                </p>
              )}
            </div>

            {/* SEND */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="text-neutral-900 font-medium uppercase underline hover:text-neutral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: "clamp(0.875rem, 1.04vw, 20px)" }}
                data-cursor="link"
              >
                {isSubmitting ? "ENVIANDO..." : "SEND"}
              </button>

              {submitMessage.type && (
                <p
                  className={`mt-4 text-sm ${
                    submitMessage.type === "success" ? "text-green-600" : "text-red-600"
                  }`}
                  style={{ fontSize: "clamp(0.75rem, 0.83vw, 16px)" }}
                >
                  {submitMessage.text}
                </p>
              )}
            </div>
          </form>

          {/* Columna 2: OFICIES + SOCIAL (acordeones) */}
          <div
            style={{
              width: "clamp(80px, 4.74vw, 91px)",
              height: "clamp(200px, 23.54vw, 452px)",
              flexShrink: 0,
            }}
          >
            {/* OFICIES */}
            {/* <Accordion
              id="oficies-accordion"
              title="OFICIES"
              open={showOficies}
              onToggle={() => setShowOficies((v) => !v)}
            >
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-neutral-900 underline hover:text-neutral-600 transition-colors"
                  style={{ fontSize: "clamp(0.875rem, 1.04vw, 20px)" }}
                >
                  Oficina 1
                </a>
                <a
                  href="#"
                  className="block text-neutral-900 underline hover:text-neutral-600 transition-colors"
                  style={{ fontSize: "clamp(0.875rem, 1.04vw, 20px)" }}
                >
                  Oficina 2
                </a>
                <a
                  href="#"
                  className="block text-neutral-900 underline hover:text-neutral-600 transition-colors"
                  style={{ fontSize: "clamp(0.875rem, 1.04vw, 20px)" }}
                >
                  Oficina 3
                </a>
              </div>
            </Accordion> */}

            {/* SOCIAL */}
            <Accordion
              id="social-accordion"
              title="SOCIAL"
              open={showSocial}
              onToggle={() => setShowSocial((v) => !v)}
            >
              <div className="">
                <a
                  href="#"
                  className="block text-neutral-900 underline hover:text-neutral-600 transition-colors"
                  style={{ fontSize: "clamp(0.875rem, 1.04vw, 20px)" }}
                >
                  Facebook
                </a>
                <a
                  href="#"
                  className="block text-neutral-900 underline hover:text-neutral-600 transition-colors"
                  style={{ fontSize: "clamp(0.875rem, 1.04vw, 20px)" }}
                >
                  Instagram
                </a>
                <a
                  href="#"
                  className="block text-neutral-900 underline hover:text-neutral-600 transition-colors"
                  style={{ fontSize: "clamp(0.875rem, 1.04vw, 20px)" }}
                >
                  Linkedin
                </a>
              </div>
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
