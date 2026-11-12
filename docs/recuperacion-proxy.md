# Recuperación del proxy de producción

Corrección de frontend #24, detectada durante la validación integrada A10 (backend #47).

Nginx debe consultar el DNS de Docker periódicamente: la dirección de `api` puede cambiar al recrear su contenedor. `infra/nginx.production.conf` usa `127.0.0.11` con caché de cinco segundos y conserva la ruta `/api/...` al reenviar la solicitud. El navegador sigue usando `environment.apiUrl = '/api'`.

Desde la raíz del frontend:

```powershell
docker compose -p convoca-publicacion-web -f infra/compose.production.yaml up -d --build
```

Con la API conectada a `convoca-publicacion`, comprobar `http://localhost:8080/api/health`. Detener temporalmente la API: es esperable 502 mientras no está disponible. Al iniciarla o recrearla, el mismo endpoint debe volver a HTTP 200 y `database: up` sin reiniciar frontend. La recuperación puede demorar algunos segundos por el DNS y el arranque de la API.

Validación local realizada con la API de producción y el piloto PostgreSQL: caída y recuperación de la API, más recreación mediante Compose. El dashboard de A10 registra el intervalo de indisponibilidad. Esta corrección aplica a `Dockerfile.production`; no cambia las rutas de Angular ni agrega una URL fija de API al navegador.
