import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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

/** Barra de categorías con animación de aparición (se monta solo cuando show=true) */
function CatsBar({ path }: { path: string }) {
  const [inView, setInView] = useState(false);
  // re-dispara animación cuando cambia la ruta (al volver a una pantalla con CATS)
  useEffect(() => {
    // arranca oculto y anima en el siguiente frame
    setInView(false);
    const id = requestAnimationFrame(() => setInView(true));
    return () => cancelAnimationFrame(id);
  }, [path]);

  const baseContainer =
    "mt-4 flex justify-center will-change-transform transition-[opacity,transform] duration-400 ease-out";
  return (
    <div className={`${baseContainer} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
      {/* Desktop */}
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

      {/* Mobile (dos filas) */}
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
  const popRef = useRef<HTMLUListElement>(null);

  useEffect(() => { setOpenMenu(false); }, [location.pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenMenu(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // CATS solo en sus rutas
  const showCategories = CATS.some((cat) => location.pathname === cat.to);

  return (
    <header className="bg-neutral-50/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-50/70">
      <div className="mx-auto max-w-[1440px] px-3 md:px-6">
        {/* altura fija */}
        <div className="py-6 min-h-[130px]">
          {/* columnas SIMÉTRICAS: 240 | 1fr | 240 */}
          <div className="grid grid-cols-[140px_1fr_140px] md:grid-cols-[240px_1fr_240px] items-center">
            {/* IZQUIERDA */}
            <div className="h-9 flex items-center">
              <div className="relative">
                <button
                  data-cursor="link"
                  aria-label={openMenu ? "Cerrar menú" : "Abrir menú"}
                  aria-expanded={openMenu}
                  onClick={() => setOpenMenu((v) => !v)}
                  className="relative w-[38px] h-[24px] p-0 group"
                >
                  <span
                    className={[
                      "absolute left-0 right-0 top-0 h-[2px] rounded bg-neutral-900",
                      "transition-transform duration-300 ease-out",
                      openMenu ? "translate-y-[11px] rotate-45" : "translate-y-0 rotate-0",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 rounded bg-neutral-900",
                      "transition-opacity duration-200 ease-out",
                      openMenu ? "opacity-0" : "opacity-100",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "absolute left-0 right-0 bottom-0 h-[2px] rounded bg-neutral-900",
                      "transition-transform duration-300 ease-out",
                      openMenu ? "-translate-y-[11px] -rotate-45" : "translate-y-0 rotate-0",
                    ].join(" ")}
                  />
                </button>

                {/* Popover */}
                <ul
                  ref={popRef}
                  className={[
                    "absolute left-0 top-[calc(100%+12px)]",
                    "flex flex-col uppercase",
                    "transition-[opacity,transform] duration-300 ease-out",
                    "origin-top-left",
                    openMenu
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 -translate-y-1 pointer-events-none",
                  ].join(" ")}
                >
                  {MENU.map((item, i) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          [
                            "block text-[17px] font-medium",
                            openMenu ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
                            "transition-[opacity,transform] duration-300 ease-out",
                            isActive
                              ? "text-neutral-900"
                              : "text-neutral-400 hover:text-neutral-700",
                          ].join(" ")
                        }
                        style={{ transitionDelay: openMenu ? `${i * 40}ms` : "0ms" }}
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CENTRO (logo) */}
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
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  className="text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>
          </div>

          {/* CATEGORÍAS solo en rutas de CATS, con animación al (re)aparecer */}
          {showCategories && <CatsBar path={location.pathname} />}
        </div>
      </div>
    </header>
  );
}
