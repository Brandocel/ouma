// src/services/emailService.ts
export type ContactFormData = {
  nombre: string;
  email: string;
  mensaje: string;
};

export type SendContactEmailResult = {
  success: boolean;
  message: string;
};

//const TO_EMAIL = "Yahir@ouma.com.mx"; // destino
const TO_EMAIL = "brandocel8@gmail.com";

export async function sendContactEmail(
  data: ContactFormData
): Promise<SendContactEmailResult> {
  try {
    // FormSubmit (modo AJAX)
    const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(TO_EMAIL)}`;

    const form = new FormData();
    form.append("name", data.nombre);
    form.append("email", data.email);
    form.append("message", data.mensaje);

    // Extras útiles
    form.append("_subject", `Nuevo mensaje de contacto - OUMA`);
    form.append("_template", "table"); // llega bonito en formato tabla
    form.append("_captcha", "false"); // si te llega mucho spam, cámbialo a "true"
    // form.append("_cc", "otrocorreo@dominio.com"); // opcional

    // Anti-bots (honeypot) -> lo mandamos vacío
    form.append("_honey", "");

    const res = await fetch(endpoint, {
      method: "POST",
      body: form,
      headers: {
        Accept: "application/json",
      },
    });

    // FormSubmit normalmente responde JSON
    if (!res.ok) {
      return {
        success: false,
        message: "No se pudo enviar el mensaje. Intenta nuevamente.",
      };
    }

    return {
      success: true,
      message: "¡Listo! Tu mensaje fue enviado correctamente.",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error de red al enviar el mensaje. Revisa tu conexión.",
    };
  }
}
