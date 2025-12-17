import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import Logo from "../../assets/logo.svg";

const CATS = [
  { label: "ARQUITECTURA", to: "/" },
  { label: "CONSTRUCCIÓN", to: "/construccion" },
  { label: "INTERIORISMO", to: "/interiorismo" },
  { label: "BIM SYSTEM", to: "/bim" },
  { label: "PRODUCTOS", to: "/productos" },
];

const MENU = [
  { label: "PROYECTOS", to: "/" },
  { label: "NOSOTROS", to: "/nosotros" },
  { label: "SERVICIOS", to: "/servicios" },
  { label: "BLOG", to: "/blog" },
  { label: "CAREERS", to: "/careers" },
  { label: "CONTACTO", to: "/contacto" },
];

/** Barra de categorías (igual) */
function CatsBar({ path }: { path: string }) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    setInView(false);
    const id = requestAnimationFrame(() => setInView(true));
    return () => cancelAnimationFrame(id);
  }, [path]);

  const baseContainer =
    "mt-4 flex justify-center will-change-transform transition-[opacity,transform] duration-400 ease-out";

  return (
    <div className={`${baseContainer} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
      <nav className="hidden md:flex items-center gap-8 text-[12px] uppercase">
        {CATS.map((cat, idx) => (
          <NavLink
            key={cat.label + "-desk"}
            to={cat.to}
            data-cursor="link"
            className={({ isActive }) =>
              [
                "transition-colors",
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
                "will-change-transform transition-[opacity,transform] duration-300 ease-out",
                isActive ? "font-semibold text-neutral-900" : "text-neutral-400 hover:text-neutral-700",
              ].join(" ")
            }
            style={{ transitionDelay: inView ? `${idx * 35}ms` : "0ms" }}
          >
            {cat.label}
          </NavLink>
        ))}
      </nav>

      <nav className="md:hidden flex flex-col items-center gap-1 text-[10px] uppercase">
        <div className="flex gap-3">
          {CATS.slice(0, 3).map((cat, idx) => (
            <NavLink
              key={cat.label + "-m1"}
              to={cat.to}
              data-cursor="link"
              className={({ isActive }) =>
                [
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
                  "transition-[opacity,transform,color] duration-300 ease-out",
                  isActive ? "font-semibold text-neutral-900" : "text-neutral-400 hover:text-neutral-700",
                ].join(" ")
              }
              style={{ transitionDelay: inView ? `${idx * 35}ms` : "0ms" }}
            >
              {cat.label}
            </NavLink>
          ))}
        </div>
        <div className="flex gap-3">
          {CATS.slice(3).map((cat, idx) => (
            <NavLink
              key={cat.label + "-m2"}
              to={cat.to}
              data-cursor="link"
              className={({ isActive }) =>
                [
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
                  "transition-[opacity,transform,color] duration-300 ease-out",
                  isActive ? "font-semibold text-neutral-900" : "text-neutral-400 hover:text-neutral-700",
                ].join(" ")
              }
              style={{ transitionDelay: inView ? `${(idx + 3) * 35}ms` : "0ms" }}
            >
              {cat.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const location = useLocation();

  // ref al botón para posicionar el popover
  const triggerWrapRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; width: number; height: number }>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  // cerrar al navegar y con ESC
  useEffect(() => { setOpenMenu(false); }, [location.pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenMenu(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // calcular posición del popover (debajo del botón) y actualizar en resize/scroll
  useLayoutEffect(() => {
    const compute = () => {
      const el = triggerWrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setPos({ left: r.left, top: r.top + r.height + 12, width: r.width, height: r.height });
    };
    compute();
    if (!openMenu) return;
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [openMenu]);

  const showCategories = CATS.some((cat) => location.pathname === cat.to);

  // -------- Animación In/Out sin cortar ----------
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (openMenu) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true)); // anima IN
    } else if (mounted) {
      setVisible(false);                              // anima OUT
      const t = setTimeout(() => setMounted(false), 180); // igual a duration
      return () => clearTimeout(t);
    }
  }, [openMenu]);

  return (
    <header className="bg-neutral-50/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-50/70 relative z-[100]">
      <div className="mx-auto max-w-[1440px] px-3 md:px-6">
        <div className="py-6 min-h-[130px]">
          <div className="grid grid-cols-[140px_1fr_140px] md:grid-cols-[240px_1fr_240px] items-center">
            {/* IZQUIERDA */}
            <div className="h-9 flex items-center">
              <div ref={triggerWrapRef} className="relative">
                <button
                  data-cursor="link"
                  aria-label={openMenu ? "Cerrar menú" : "Abrir menú"}
                  aria-expanded={openMenu}
                  onClick={() => setOpenMenu((v) => !v)}
                  className="relative w-[38px] h-[24px] p-0 group"
                >
                  <span className={[
                    "absolute left-0 right-0 top-0 h-[2px] rounded bg-neutral-900",
                    "transition-transform duration-300 ease-out",
                    openMenu ? "translate-y-[11px] rotate-45" : "translate-y-0 rotate-0",
                  ].join(" ")} />
                  <span className={[
                    "absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 rounded bg-neutral-900",
                    "transition-opacity duration-200 ease-out",
                    openMenu ? "opacity-0" : "opacity-100",
                  ].join(" ")} />
                  <span className={[
                    "absolute left-0 right-0 bottom-0 h-[2px] rounded bg-neutral-900",
                    "transition-transform duration-300 ease-out",
                    openMenu ? "-translate-y-[11px] -rotate-45" : "translate-y-0 rotate-0",
                  ].join(" ")} />
                </button>
              </div>
            </div>

            {/* CENTRO */}
            <div className="h-9 flex items-center justify-center" id="header-logo-slot">
              <img
                src={Logo}
                alt="Ouma"
                className="w-[114px] h-[27px] object-contain select-none"
                draggable={false}
              />
            </div>

            {/* DERECHA */}
            <div className="h-9 flex items-center justify-end">
              <div className="flex w-full max-w-[240px] items-center gap-2">
                <input
                  data-cursor="link"
                  type="text"
                  placeholder="SEARCH"
                  className="w-full bg-transparent outline-none border-b border-neutral-300 placeholder:text-neutral-400 text-[12px] py-1"
                />
                <svg width="14" height="14" viewBox="0 0 24 24" className="text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>
          </div>

          {/* CATEGORÍAS */}
          {showCategories && <CatsBar path={location.pathname} />}
        </div>
      </div>

      {/* === POPOVER EN PORTAL con animación IN/OUT y scrim opcional === */}
      {mounted &&
        createPortal(
          <>
            {/* Scrim (opcional). Si no lo quieres, comenta este bloque */}
            <div
              onClick={() => setOpenMenu(false)}
              className={[
                "fixed inset-0 z-[11990] transition-opacity duration-180",
                visible ? "opacity-30 bg-black" : "opacity-0",
              ].join(" ")}
            />

            {/* Popover */}
            <div
              role="menu"
              aria-hidden={!visible}
              className="fixed z-[12000] pointer-events-auto"
              style={{ left: pos.left, top: pos.top }}
            >
              <div
                className={[
                  "w-[min(280px,80vw)]  bg-neutral-100 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)]",
                  "transition duration-180 ease-out will-change-transform",
                  visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-1 scale-[0.98]",
                ].join(" ")}
                style={{ background: "rgba(243,243,243,0.96)" }}
              >
                <ul className="flex flex-col uppercase">
                  {MENU.map((item, i) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={() => setOpenMenu(false)}
                        className={({ isActive }) =>
                          [
                            "block text-[17px] font-medium px-1 py-1.5 rounded",
                            // stagger: usamos delay vía style + transición
                            "transition-[opacity,transform,color] duration-200 ease-out",
                            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
                            isActive ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-700",
                          ].join(" ")
                        }
                        style={{ transitionDelay: `${visible ? i * 40 : 0}ms` }}
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>,
          document.body
        )}
      {/* === /POPOVER === */}
    </header>
  );
}
