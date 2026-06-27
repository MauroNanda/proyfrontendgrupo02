// Configuración de entorno para PRODUCCIÓN.
// Se inyecta en el build con `ng build` reemplazando environment.ts.

export const environment = {
  production: true,
  apiUrl: 'https://api.convoca.app/api', // Reemplazar por la URL real al desplegar.
  googleClientId: '',
  vapidPublicKey: '',
};
