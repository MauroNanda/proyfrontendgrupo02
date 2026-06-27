# Convenciones de Código — Frontend (Angular 22)

> **Nota:** Este archivo cubre solo las reglas específicas del frontend. Las convenciones globales del proyecto (nomenclatura, comentarios para la defensa, reglas del backend) están en el repo del backend: [`docs/CONVENCIONES.md`](https://github.com/MauroNanda/proybackendgrupo02/blob/main/docs/CONVENCIONES.md).

## 1. Arquitectura
*   **Standalone Components.** No usar `app.module.ts`. Cada componente se importa directamente.
*   **Lazy Loading por feature.** Cada `feature/*` se carga bajo demanda en `app.routes.ts`.
*   **Estructura de carpetas:** ver `ARQUITECTURA.md` del backend (sección 3 — Frontend).

## 2. Reactividad
*   **Signals** (`signal`, `computed`, `effect`) como mecanismo principal.
*   **`linkedSignal`** y **`resource`** cuando aplique (Angular 22 features).
*   **RxJS solo para HTTP** (`HttpClient`) y Observables complejos. No mezclar Signals + Observables sin razón.
*   **`toSignal()` / `toObservable()`** para puentes entre ambos mundos.

## 3. UI / UX
*   **Bootstrap 5** como sistema de estilos principal (exigido por la consigna).
*   Usar Grid System, Navbar, Cards, Modales, Dropdowns y clases utilitarias de Bootstrap. Deben ser visibles en el HTML para que la cátedra evalúe su uso.
*   **Mobile-first.** Validar en móvil, tablet y desktop. Usar breakpoints de Bootstrap (`sm`, `md`, `lg`, `xl`).
*   **Accesibilidad:** atributos ARIA en componentes interactivos (botones, modales, formularios).
*   **Tailwind:** NO usar. Solo Bootstrap (exigencia de cátedra).

## 4. Formularios
*   **`ReactiveFormsModule` exclusivo.** No usar template-driven forms.
*   **Validaciones personalizadas** (ej: fecha fin no anterior a inicio, email del dominio universitario).
*   **Feedback visual en tiempo real** de los errores (clases `.is-invalid` de Bootstrap + mensajes de error).
*   **Tipado:** usar `FormGroup<TipoEstricto>` con interfaces TypeScript.

## 5. Componentes
*   **Pequeños y con responsabilidad única.**
*   **Dumb components:** solo UI, reciben datos por `input()` (signal-based) y emiten con `output()`.
*   **Smart components:** contienen lógica, inyectan servicios, no reciben datos por input.
*   **Naming:** sufijos claros (`.component.ts`, `.service.ts`, `.guard.ts`, `.interceptor.ts`, `.pipe.ts`).

## 6. Routing y Guards
*   **`/admin/*`** protegido por `roleGuard` (rol = `ORGANIZADOR`).
*   **`authGuard`** para rutas que requieren login.
*   Redirigir al login si no autenticado, al home si no autorizado.

## 7. HTTP
*   **`HttpClient`** con `inject()`. Nunca `new HttpClient()`.
*   **`jwtInterceptor`** agrega el token a cada request automáticamente.
*   **`errorInterceptor`** maneja 401 (logout), 403 (redirect), 5xx (toast).
*   **Base URL** en `environment.ts` / `environment.prod.ts`.

## 8. Estado
*   **Signals** para estado local de componentes.
*   **Servicios singleton** (`providedIn: 'root'`) con Signals internos para estado compartido.
*   **No usar NgRx** salvo necesidad real (este proyecto no la tiene).

## 9. Dashboard (Visualización)
*   **Gráficos:** `ng2-charts` (wrapper de Chart.js). Tipos: barras, torta, línea.
*   **DataTables:** filtros, búsqueda por texto, paginación.
*   **Exportación:** PDF con `jsPDF` o equivalente, Excel con `xlsx` o `exceljs`.

## 10. Comentarios para la Defensa
> Aplican las mismas reglas del backend (`docs/CONVENCIONES.md` §3). Resumen:
*   Comentar **el "por qué", no el "qué"**.
*   Explicar **integraciones** (OAuth Google, Web Push, Google Calendar) con bloque de comentarios del flujo completo.
*   Explicar **guards e interceptors**: qué protegen y cómo.

## 11. Nomenclatura
*   **Archivos:** `kebab-case` (ej. `event-card.component.ts`, `auth.service.ts`).
*   **Clases:** `PascalCase` (ej. `EventCardComponent`, `AuthService`).
*   **Variables y funciones:** `camelCase`.
*   **Selectores de componentes:** prefijo `app-` (ej. `<app-event-card>`).
