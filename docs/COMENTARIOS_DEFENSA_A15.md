# Código para la defensa de HIA

El recorrido completo está en `docs/ENTREGA_Y_DEFENSA.md` del backend. Este PR añade comentarios breves; no cambia la lógica de Angular, el comportamiento de Nginx ni las dependencias.

| Archivo o bloque | Qué conviene explicar |
|---|---|
| `app.routes.ts` | Carga diferida y guards antes de las pantallas privadas |
| `core/guards/auth.guard.ts` y `role.guard.ts` | Navegación del cliente; la autorización efectiva pertenece a la API |
| `core/interceptors/credentials.interceptor.ts` | Petición inmutable, clonación y envío de la cookie a la API |
| `core/interceptors/error.interceptor.ts` | Mostrar un error y propagarlo son acciones distintas |
| `core/services/auth.service.ts` | Signal de usuario, valores derivados y caché local; no se concede un rol modificando localStorage |
| `core/services/export.service.ts` | Datos autorizados por la API, conversión a celdas y descarga en el navegador |
| `Dockerfile.production` | Node compila; Nginx sirve el resultado. EXPOSE no publica un puerto |
| `infra/nginx.production.conf` | Resolución DNS al recrear la API y reemplazo de cabeceras de origen no confiables |
| `scripts/verificar-origen-dependencias.cjs` | Origen, versión e integridad de SheetJS; excepción limitada, no permiso global |

Para comprobar comentarios: se comparó la salida TypeScript sin comentarios y las instrucciones de configuración con el commit integrado `75eb62a`. Las pruebas y build se ejecutan sobre la rama nueva. El JSON consolidado de equivalencia se guarda en `docs/evidencias/actividad15` del backend.

Antes de compilar en un equipo nuevo, seguir `SEGURIDAD_DEPENDENCIAS_A14.md`. Actualizar `develop` después de integrar este PR; no hace falta reinstalar una base para incorporar comentarios.
