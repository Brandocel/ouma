// src/data/blog.ts
export type BlogArticle = {
  slug: string;
  file: string;          // nombre de la imagen base (en /assets/blog)
  title: string;         // título principal
  description: string;   // bajada corta o subtítulo
  content?: string[];    // párrafos completos del texto
  images?: { left: string; right: string }; // imágenes extra para detalle
  year?: string;         // opcional
};

// 📰 Artículos del blog (puedes ampliar libremente)
export const blogArticles: BlogArticle[] = [
  {
    slug: "la-madera-sin-disfraz",
    // ⛳ Debe ser el MISMO nombre de archivo que usas a la izquierda
    // (sin rutas, solo el filename, porque el glob busca por filename)
    file: "Madera_sin_disfraz_1.jpg",        // <-- antes: "img5.png"
    title: "La madera sin disfraz",
    description: "Materialidad honesta como postura arquitectónica",
    year: "2024",
    content: [
      "La madera, en su estado más puro, no necesita intervención estética para ser valiosa. Vetado, nudos, variaciones de tono y huellas del tiempo no son imperfecciones. En arquitectura, decidir no ocultarlas es una postura crítica frente a una industria que tiende a \ .",
      "Trabajar con madera sin disfraz es aceptar que la materia tiene carácter propio y que el diseño no debe imponer, sino dialogar.",
      "En obra, la madera expuesta revela su comportamiento real: cómo responde a la humedad, al sol, al uso y al paso del tiempo. No hay capas que oculten errores ni acabados que falseen su naturaleza.",
      "Este enfoque exige mayor criterio técnico y sensibilidad arquitectónica. Obliga a cualquier arquitecto a entender el material desde su origen hasta su colocación final.",
      "## Los materiales cuentan su propia historia",
      "Cada pieza de madera tiene un pasado: crecimiento, corte, secado, transformación. Cuando se deja visible, esa historia se integra al espacio y lo vuelve irrepetible.",
      "En un mundo arquitectónico cada vez más estandarizado, la madera sin disfraz introduce identidad, memoria y autenticidad. No hay dos piezas iguales, ahí reside su valor.",
      "Elegir materialidad honesta es cuestionar prácticas comunes:",
      "• ¿Por qué ocultar lo natural?",
      "• ¿Por qué uniformar lo diverso?",
      "• ¿Qué perdemos cuando borramos el origen de los materiales?",
      "La madera sin tratamiento excesivo invita a una arquitectura más consciente, donde cada decisión tiene consecuencias técnicas, estéticas y éticas.",
      "El arquitecto contemporáneo busca coherencia entre lo que diseña y cómo vive. La preferencia por materiales honestos refleja un estilo de vida más consciente, menos artificioso y más conectado con lo esencial.",
      "La madera sin disfraz representa:",
      "• Autenticidad",
      "• Respeto por el proceso",
      "• Valor por lo imperfecto y lo real",
      "Cuando la madera se muestra tal como es, el espacio deja de ser un objeto y se convierte en una experiencia viva.",
    ],
    images: {
      left: "Madera_sin_disfraz_2.jpg", // la pequeña (480x302 en layout)
      right: "Madera_sin_disfraz_3.jpg" // la grande (700x478 en layout)
    },
  },
  {
    slug: "el-nivel-de-manguera",
    file: "Niverl_de_manguera_1.jpg",
    title: "El nivel de manguera: precisión ancestral",
    description: "Una herramienta que sigue superando a muchas tecnologías modernas",
    year: "2024",
    content: [
      "El nivel de manguera es una de las herramientas más simples y precisas dentro de la construcción. Basado en un principio físico inalterable —la gravedad y el comportamiento del agua—, se mantiene vigente durante los siglos, culturas y sistemas constructivos.",
      "Esta herramienta representa algo fundamental: la precisión no siempre depende de la complejidad tecnológica, sino del entendimiento profundo de los principios que rigen el espacio y la materia.",
      "## La experiencia real en obra: cimentación helicoidal",
      "En obra, especialmente en procesos como la cimentación helicoidal —donde la exactitud en niveles define el desempeño estructural—, el nivel de manguera se convierte en una extensión del criterio del arquitecto.",
      "No depende de baterías, calibraciones digitales ni condiciones externas. Funciona porque el principio físico es absoluto. En entornos complejos, terrenos irregulares o condiciones adversas, esta herramienta demuestra que la experiencia humana sigue siendo irremplazable.",
      "## La experiencia humana y los principios físicos no expiran",
      "Los principios no cambian a pesar de que la tecnología avance.",
      "El nivel de manguera es una metáfora clara del pensamiento arquitectónico sólido:",
      "• Lo esencial permanece",
      "• El conocimiento firme no se altera",
      "• La precisión nace del conocimiento, no desde un dispositivo",
      "En un contexto saturado de renders, inteligencia artificial y automatización, esta herramienta recuerda que la arquitectura comienza en el entendimiento del espacio, el suelo y la materia. El arquitecto contemporáneo ya no es solo diseñador:",
      "• Es estratega",
      "• Es crítico",
      "• Es consciente del impacto de cada decisión",
      "Elegir herramientas simples, eficientes y probadas no es nostalgia: es madurez profesional. El nivel de manguera representa un estilo de vida donde la claridad mental y técnica supera el exceso de estímulos digitales.",
      "La verdadera innovación no siempre se ve futurista. A veces fluye en silencio, dentro de una manguera llena de agua, marcando un nivel perfecto.",
      "OUMA cree en una arquitectura que no necesita gritar para ser precisa.",
    ],
    images: {
      left: "Niverl_de_manguera_1.jpg",
      right: "Niverl_de_manguera_2.jpg"
    },
  },
  // Aplica la misma regla a los demás artículos:
  // - file === nombreDelArchivoQueUsarásEnLaColumnaIzquierda
];

/** Helper para buscar artículo por slug */
export function getBlogArticleBySlug(slug: string) {
  return blogArticles.find((a) => a.slug === slug);
}
