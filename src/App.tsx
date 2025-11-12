// src/App.tsx
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./common/header/Header";
import CustomCursor from "./common/cursor/CustomCursor";
import Footer from "./common/footer/Footer";
import Splash from "./common/splash/Splash";
import GlobalScrollScale from "./common/scroll/GlobalScrollScale";
import SharedImageTransition from "./Landing/components/SharedImageTransition";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Oculta el logo real del header mientras el splash está activo
  useEffect(() => {
    const slot = document.getElementById("header-logo-slot");
    if (!slot) return;
    slot.style.opacity = showSplash ? "0" : "1";
  }, [showSplash]);

  // ✅ Auto-aplicar [data-global-scale] a scrollers horizontales del sitio
  useEffect(() => {
    const apply = () => {
      // Ajusta o amplía los selectores si tienes variaciones
      const nodes = document.querySelectorAll<HTMLElement>(
        '.overflow-x-auto, [data-hscroll], [data-scrollable="x"]'
      );
      nodes.forEach((el) => {
        if (!el.hasAttribute("data-global-scale")) {
          el.setAttribute("data-global-scale", "");
        }
      });
    };

    // Marca los actuales
    apply();

    // Marca los que aparezcan después (rutas, renders perezosos, etc.)
    const mo = new MutationObserver(() => apply());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => mo.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-cabinet">
      {showSplash && (
        <Splash delayMs={0} onDone={() => setShowSplash(false)} />
      )}

      <Header />

      {/* Contenido de la página */}
      <Outlet />

      <Footer />

      {/* Escala global suave para contenedores horizontales */}
      <GlobalScrollScale activeScale={0.98} />

      {/* Cursor personalizado */}
      <CustomCursor />

      {/* Overlay global que maneja la animación shared-element */}
      <SharedImageTransition />
    </div>
  );
}
