# Despliegue automático del frontend (A8)

Un proceso de PowerShell en el equipo de publicación espera un CI exitoso del commit actual de `develop`. Construye el Dockerfile de ese commit y reemplaza automáticamente el frontend. Antes de marcarlo activo, verifica la página, el SHA en `/version.json` y la API a través de Nginx. Si el cambio falla, vuelve a la imagen anterior. La API y sus datos se administran por separado.

El workflow `ci.yml` corre en GitHub y el proceso de publicación se conecta a GitHub desde el equipo local. No hace falta instalar un runner de GitHub en el equipo ni darle acceso a Docker. Usamos las imágenes locales, etiquetadas con el SHA completo, porque en esta defensa hay un solo equipo de publicación.

## Arranque

Con Docker Desktop iniciado, abrir PowerShell en la carpeta del frontend. Tener Git y GitHub CLI autenticado (`gh auth status`). Primero levantar la API en una red Docker donde tenga el nombre `api`, según la guía del backend. La red de publicación habitual es `convoca-publicacion`.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/desplegar-cd.ps1
```

Dejar la terminal abierta. El sitio queda en `http://127.0.0.1:8090`. Para operaciones desde el navegador, hacer coincidir el origen permitido de la API con la URL que se utilizará. Para la publicación HTTPS, el túnel acordado debe apuntar a este puerto y la API debe permitir el origen HTTPS específico. Docker solamente publica este frontend en loopback.

En el laboratorio A15, cuya API tiene un alias `api` en la red del piloto, usar en cambio:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/desplegar-cd.ps1 -Network convoca-lab-v2-a15_convoca-red
```

`-Once` permite ejecutar un ciclo y exigir que el commit actual tenga CI exitoso. `-Port` permite elegir otro puerto de Windows. El proyecto Compose usa ese puerto en su nombre y conserva su propio registro en `.cd-a8`, excluido de Git.

El archivo `.cd-a8/<puerto>/estado.json` identifica la versión activa, el CI que la aprobó y la versión anterior. Mantener la misma red al reiniciar el proceso o ejecutar un rollback.

## Prueba para la defensa

1. Con el publicador ya iniciado, abrir la aplicación y consultar `/version.json` para anotar el SHA activo.
2. En una rama de trabajo cambiar un texto que se vea en el navegador, por ejemplo `brand-text` en `src/app/layouts/public-layout/public-layout.component.ts`. Hacer commit y completar el PR a `develop` según el procedimiento del equipo.
3. Abrir Actions y esperar el CI del push a `develop`. El publicador detecta ese SHA exitoso y actualiza el contenedor. Recargar la página y comprobar el texto visible, `/version.json` y `/api/health`.
4. Para repetir el ensayo en una rama dedicada, levantar un segundo publicador con `-Demo -Port 8091`. Ese modo acepta únicamente la rama `demo/a8-despliegue` de este repositorio, después de verificar su CI. Mantener el mismo destino API y puerto durante toda la prueba. En esa rama, quien tenga permiso puede hacer y subir un cambio de texto. El efecto queda acotado al publicador iniciado con `-Demo`.

El primer despliegue y la compilación pueden tardar algunos minutos. El registro del publicador identifica el commit y enlaza su ejecución de CI. Un CI fallido o pendiente no sustituye la versión activa.

## Volver a la versión anterior

Detener el publicador con Ctrl+C y ejecutar el mismo comando agregando `-Rollback`, con el puerto y la red de ese despliegue. Comprobar el SHA anterior y la página. Si luego se vuelve a iniciar el publicador, este espera un commit nuevo antes de volver a desplegar. Conservar al menos las imágenes activa y anterior en Docker durante el ensayo.
