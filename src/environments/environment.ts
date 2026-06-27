// Configuración de entorno para DESARROLLO.
// Las claves sensibles (Google Client Secret, Resend API key, tokens de bots)
// NUNCA van acá — solo viven en el backend. Acá solo configuraciones públicas.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  googleClientId: '', // Completar cuando se configure Google OAuth (Fase 3).
  vapidPublicKey: '', // Completar cuando se configure Web Push (Fase 3).
};
