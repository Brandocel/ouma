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

/** Barra de categorías (solo desktop) */
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
    </div>
  );
}

export default function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeCat, setActiveCat] = useState<string>("/");
  const [openCatsMenu, setOpenCatsMenu] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  // ref al botón para posicionar el popover
  const triggerWrapRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; width: number; height: number }>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  // Focus en el input cuando se abre el search en móvil
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Actualizar categoría activa según ruta
  useEffect(() => {
    const active = CATS.find((cat) => cat.to === location.pathname);
    if (active) {
      setActiveCat(active.to);
    }
  }, [location.pathname]);

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
              {/* Desktop: search input siempre visible */}
              <div className="hidden md:flex w-full max-w-[240px] items-center gap-2">
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

              {/* Mobile: solo icono que abre/cierra el search */}
              <div className="md:hidden">
                <button
                  data-cursor="link"
                  aria-label={searchOpen ? "Cerrar búsqueda" : "Abrir búsqueda"}
                  aria-expanded={searchOpen}
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-1"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" className="text-neutral-600" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* CATEGORÍAS */}
          {showCategories && (
            <>
              {/* Desktop: mostrar todas las categorías */}
              <CatsBar path={location.pathname} />

              {/* Mobile: menú desplegable suave */}
              <div className="md:hidden mt-4 flex flex-col items-center relative">
                <button
                  onClick={() => setOpenCatsMenu(!openCatsMenu)}
                  className="text-[13px] uppercase font-medium text-neutral-700 pb-1 border-b-2 border-transparent hover:border-neutral-400 transition-colors duration-200"
                >
                  {CATS.find((c) => c.to === activeCat)?.label || "CATEGORÍAS"}
                </button>

                {/* Dropdown menu */}
                {openCatsMenu && (
                  <div
                    className="absolute top-full mt-3 z-[20000] min-w-max py-2 bg-white/100 opacity-100 backdrop-blur-0 rounded-md shadow-md ring-1 ring-neutral-200"
                    style={{ backgroundColor: "#ffffff" }}
                  >
                    {CATS.map((cat) => (
                      <NavLink
                        key={cat.to}
                        to={cat.to}
                        onClick={() => {
                          setActiveCat(cat.to);
                          setOpenCatsMenu(false);
                        }}
                        className={({ isActive }) =>
                          [
                            "block px-4 py-2 text-[12px] uppercase font-medium transition-colors duration-150",
                            isActive || activeCat === cat.to
                              ? "text-neutral-900 bg-neutral-50"
                              : "text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100",
                          ].join(" ")
                        }
                      >
                        {cat.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
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
                "fixed inset-0 z-[11990] transition-opacity duration-300",
                visible ? "opacity-30 bg-black" : "opacity-0 pointer-events-none",
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
                  "transition duration-300 ease-out will-change-transform",
                  visible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-4 scale-[0.95]",
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

      {/* === MOBILE SEARCH POPOVER === */}
      {searchOpen &&
        createPortal(
          <>
            <div
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 z-[11990] md:hidden bg-black/20"
            />
            <div className="fixed top-0 right-0 h-screen w-full max-w-xs z-[12000] md:hidden bg-white/95 backdrop-blur-md animate-in slide-in-from-right-96 duration-300 ease-out pt-6 px-4 shadow-lg">
              <div className="flex items-center gap-3 bg-neutral-100 rounded-lg px-4 py-3">
                <input
                  ref={searchInputRef}
                  data-cursor="link"
                  type="text"
                  placeholder="BUSCAR"
                  className="flex-1 bg-transparent outline-none placeholder:text-neutral-500 text-[14px] font-medium"
                  onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1 hover:bg-neutral-200 rounded transition-colors"
                  aria-label="Cerrar búsqueda"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" className="text-neutral-700" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
      {/* === /MOBILE SEARCH POPOVER === */}
    </header>
  );
}
