// Tipos
export type Project = {
  slug: string;
  file: string;        // archivo principal (cover)
  folder: string;      // carpeta del proyecto dentro de /assets/FotosInicio/
  title: string;
  place: string;
  year?: string;
  brief?: string;
  categories?: string;
  description?: string;
};



// Base de proyectos
export const PROJECTS: Project[] = [
  {
    slug: "casa-del-mar",
    folder: "CASA DEL MAR",
    file: "9 2.png",
    title: "Casa del Mar Residences",
    place: "PUERTO VALLARTA, JALISCO",
    year: "2022",
    brief: "Desarrollo de habitacional frente al mar",
    categories: "DISEÑO ARQUITECTÓNICO / DISEÑO DE INTERIOR",
    description:
      "Entre el océano abierto y las montañas que custodian el sur de Puerto Vallarta, surge Casa del Mar como una pieza incrustada en la línea costera, un volumen que no se impone, sino que se funde con el paisaje.\n\nEl edificio fue pensado como una extensión del terreno: sus recubrimientos evocan la textura pétrea del entorno, como si hubiese recogido fragmentos de la montaña para levantar sus propios muros. La fachada –limpia, serena– enmarca el horizonte con barandales de cristal, permitiendo que el mar entre visualmente a cada espacio.\n\nEn su interior, la arquitectura privilegia el aire y la luz: los espacios fluyen sin pasillos, abiertos a la ventilación cruzada y bañados por luz natural. La distribución vertical permite que cada unidad tenga una relación íntima con el exterior, ya sea el mar al frente, o la montaña al fondo.",
  },

  {
    slug: "casa-may",
    folder: "CASA MAY",
    title: "Casa May",
    place: "PUERTO VALLARTA, JALISCO",
    file: "CASA MAY 2 3.png",
    year: "2024",
    brief: "Residencia unifamiliar en Puerto Vallarta",
    categories: "DISEÑO ARQUITECTÓNICO / DISEÑO DE INTERIOR",
    description:
      "En lo alto de Morelia, donde la bruma toca las copas de los pinos y el silencio parece tener forma, se levanta Casa May: un refugio vertical diseñado para una doctora que buscaba paz, resguardo y contemplación. El proyecto nace de una mirada sensible al clima y al terreno. Un estudio bioclimático guió cada trazo, orientando los espacios hacia la luz templada de la mañana y protegiéndolos del rigor del poniente. Desde el principio, la arquitectura fue también medicina: pensada para sanar, respirar y habitarse con calma. El alma de la casa se encuentra en su doble altura en sala, donde la luz cae como una cascada sobre los muros lisos y las sombras dibujan geometrías que cambian con las horas. Los jardines interiores, silenciosos y verdes, oxigenan la vida cotidiana y actúan como pulmones naturales del espacio. Diseñamos a detalle los marcos de carpintería como piezas estructurales de lenguaje y atmósfera. Nada se dejó al azar. Cada vano enmarca una vista, cada material dialoga con el entorno. Casa May no es solo una vivienda: es un gesto de respeto hacia el lugar y la persona que lo habita.",
  },

  {
    slug: "casa-roble",
    folder: "CASA ROBLE",
    file: "CASA ROBLE 2 1.png",
    title: "Casa Roble",
    place: "CANCÚN, QUINTANA ROO",
    year: "2021",
    brief: "Residencia unifamiliar en Cancún",
    categories: "DISEÑO ARQUITECTÓNICO / DISEÑO DE INTERIOR",
    description:
      "En la costa caribeña de México, Casa Roble se alza como un refugio contemporáneo que dialoga con su entorno tropical. Concebida como un volumen puro y geométrico, la residencia se integra al paisaje mediante el uso de materiales locales y una paleta neutra que refleja los tonos de la arena y el mar.\n\nEl diseño interior continúa esta narrativa de simplicidad y conexión con la naturaleza. Espacios abiertos y fluidos permiten una transición sin esfuerzo entre las áreas interiores y exteriores, mientras que grandes ventanales enmarcan vistas panorámicas del entorno.\n\nCada rincón de Casa Roble ha sido pensado para maximizar la experiencia sensorial: desde la brisa marina que atraviesa los espacios hasta la luz natural que inunda cada habitación, creando un ambiente sereno y acogedor.",
  },

  {
    slug: "danubio-11",
    folder: "RIO DANUBIO 11",
    file: "11 danubio lateral 1.png",
    title: "Danubio 11",
    place: "CANCÚN, QUINTANA ROO",
    year: "2020",
    brief: "Vivienda unifamiliar en Cancún",
    categories: "DISEÑO ARQUITECTÓNICO / DISEÑO DE INTERIOR",
    description:
      "Danubio 11 se erige como un testimonio de la arquitectura residencial moderna en el corazón de Cancún. La residencia, diseñada con una estética minimalista, se caracteriza por líneas limpias y una estructura que maximiza la funcionalidad sin sacrificar el estilo.\n\nEl diseño interior refleja una filosofía de vida contemporánea, con espacios abiertos que fomentan la interacción y la flexibilidad. La elección de materiales y acabados neutros crea un lienzo sereno que permite que la luz natural y las vistas al exterior sean los protagonistas.\n\nCada detalle en Danubio 11 ha sido cuidadosamente considerado para ofrecer una experiencia de vida cómoda y sofisticada, desde la distribución eficiente hasta los elementos de diseño que aportan calidez y carácter al hogar.",
  },

  {
    slug: "casa-cascada-de-luz",
    folder: "RIO DANUBIO 12",
    file: "250429 - EXTERIOR FINAL 2.png",
    title: "Casa Cascada de Luz",
    place: "CANCÚN, QUINTANA ROO",
    year: "2023",
    brief: "Residencia unifamiliar en Cancún",
    categories: "DISEÑO ARQUITECTÓNICO / DISEÑO DE INTERIOR",
    description:
      "Diseñada para una familia en el corazón del Caribe mexicano, Casa Cascada nace como una interpretación contemporánea del trópico: cálida, ventilada y abierta, pero también introspectiva, sobria y bien contenida. Desde su fachada, la casa plantea un lenguaje de planos verticales en secuencia, como si el volumen se tejiera a partir de líneas que se desplazan y dan ritmo a la composición. Esta estrategia no solo organiza la arquitectura, sino que crea profundidad visual y otorga carácter desde el primer contacto. Esta vivienda convierte los elementos del trópico en lenguaje arquitectónico.",
  },

  /* ✅ ARREGLADO: slug debe coincidir con /proyectos/cycling-club */
  {
    slug: "cycling-club",
    folder: "CYCLING CLUB",
    file: "Cycling Club.png", // ✅ pon la portada así dentro del folder (o cambia al nombre real)
    title: "Cycling Club",
    place: "CANCÚN, QUINTANA ROO",
    year: "2023",
    brief: "Un refugio para ciclistas",
    categories: "DISEÑO ARQUITECTÓNICO / DISEÑO DE INTERIOR",
    description:
      "Un refugio para ciclistas. Un espacio donde la ruta termina, pero la conversación continúa. Entre el aroma del café, el sonido de las herramientas y la luz del mediodía, nacen nuevas historias. Aquí se repara, se comparte y se celebra el viaje.",
  },

  /* ✅ NUEVO: Cocina Residencial — St. Regis Cancún */
  {
    slug: "cocina-residencial-st-regis-cancun",
    folder: "ST. REGIS COCINAS_",
    file: "Cocina Residencial — St. Regis Cancún.jpg", // ✅ cover.png (y opcional coverGrande.png)
    title: "Cocina Residencial — St. Regis Cancún",
    place: "CANCÚN, QUINTANA ROO",
    year: "2025",
    brief: "La precisión se vuelve materia",
    categories: "DISEÑO DE INTERIOR",
    description:
      "La precisión se vuelve materia.\nCada corte exacto. Cada veta, elegida con intención.\nLa chapa natural envuelve los volúmenes con una continuidad natural, donde la tecnología y la sensibilidad se encuentran.\nUna cocina que habla en silencio: exacta, cálida y atemporal.",
  },


];

export const findProjectBySlug = (slug: string) =>
  PROJECTS.find((p) => p.slug === slug);
