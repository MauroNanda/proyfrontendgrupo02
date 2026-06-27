# Guía de Setup — Frontend (Convoca G02)

Pasos para levantar el frontend Angular 22 localmente.

> **Setup global (ambos repos + BD Neon):** ver [`docs/SETUP.md`](https://github.com/MauroNanda/proybackendgrupo02/blob/main/docs/SETUP.md) en el backend.

## Requisitos Previos
*   **Node.js** v20 LTS o superior (recomendado v22 LTS para Angular 22).
*   **Git** instalado.
*   **Angular CLI** global: `npm install -g @angular/cli@latest` *(opcional — también funciona con `npx ng`)*.
*   El **backend corriendo** en `http://localhost:3000` (ver setup en el otro repo).

## 1. Clonar el Repositorio
```bash
git clone https://github.com/MauroNanda/proyfrontendgrupo02.git
cd proyfrontendgrupo02
```

## 2. Instalar Dependencias
```bash
npm install
```

## 3. Configurar Variables de Entorno
Editar `src/environments/environment.ts` (desarrollo):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  googleClientId: '<COMPLETAR_CON_CLIENT_ID_DE_GOOGLE_OAUTH>',
  vapidPublicKey: '<COMPLETAR_CON_VAPID_PUBLIC_KEY>'
};
```
Y `src/environments/environment.prod.ts` para producción.

> **Por qué no `.env`:** Angular compila al build, las variables van en `environment.*.ts`. Los secretos reales (Google Client Secret, Resend API key, tokens de bots) NUNCA viven en el frontend — solo en el backend.

## 4. Levantar el Servidor de Desarrollo
```bash
npm start
```
La app está disponible en `http://localhost:4200`. Hot reload activo.

## 5. Build de Producción
```bash
npm run build
```
Genera `dist/proyfrontendgrupo02/` listo para deploy (Render, Vercel, Netlify).

## 6. Testing
```bash
npm test         # Karma + Jasmine
```

## 7. Solución de Problemas
*   **CORS bloqueado** → verificar que el backend tenga `cors` configurado y permita `http://localhost:4200`.
*   **`Cannot find module ...`** → `npm install`.
*   **`ng: command not found`** → instalar CLI global o usar `npx ng`.
*   **Versión de Node incompatible** → verificar con `node -v`. Angular 22 requiere Node 20+.
*   **Errores tras `git pull`** → `npm install` por si hay dependencias nuevas.

## 8. Comandos Útiles
```bash
ng generate component features/public/event-catalog
ng generate service core/services/auth
ng generate guard core/guards/auth
ng generate interceptor core/interceptors/jwt
```
