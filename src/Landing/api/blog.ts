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
    file: "img5.png",        // <-- antes: "img5.png"
    title: "La Madera sin Disfráz",
    description: "Una reflexión de OUMA",
    year: "2024",
    content: [
      "En OUMA tenemos una relación directa con los materiales. Nos gusta escucharlos antes de intervenirlos. Entender lo que quieren decir sin cubrirlos de más.",
      "La madera, por ejemplo, ha sido durante años víctima del barniz total: ese impulso de dejarla brillante, sellada, protegida. Pero ese brillo muchas veces la despoja de lo que la hace viva.",
      "En su estado crudo, la madera habla. Se contrae, se abre, se oxida, cambia de color. Su superficie registra el paso del tiempo, el clima, el contacto humano. Cada grieta es una conversación con el entorno.",
    ],
    images: {
      left: "/src/assets/blog/img5.png", // la pequeña (480x302 en layout)
      right: "/src/assets/blog/img9.png" // la grande (700x478 en layout)
    },
  },
  // Aplica la misma regla a los demás artículos:
  // - file === nombreDelArchivoQueUsarásEnLaColumnaIzquierda
];

/** Helper para buscar artículo por slug */
export function getBlogArticleBySlug(slug: string) {
  return blogArticles.find((a) => a.slug === slug);
}
