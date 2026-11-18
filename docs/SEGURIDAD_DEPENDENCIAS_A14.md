# Dependencias — A14

Desde la carpeta del frontend, con Node.js 22.22.3 o posterior:

```powershell
node scripts/verificar-origen-dependencias.cjs
npm ci --allow-remote=root
npm test -- --watch=false
npm run build -- --configuration production
npm audit --omit=dev --audit-level=high
```

Angular se actualiza dentro de la versión mayor 22. SheetJS pasa de la versión obsoleta del registro npm a **0.20.3**, distribuida por su fabricante. La excepción de instalación se limita a la dependencia raíz `xlsx`: el verificador rechaza otras URLs externas y comprueba versión, origen e integridad del lockfile antes de instalar. No cambia la configuración global de npm. Docker y CI usan la misma comprobación.

Fuente oficial: https://docs.sheetjs.com/docs/getting-started/installation/nodejs/

No usar `npm audit fix --force` ni ignorar conflictos de peers. El resultado de la auditoría distingue dependencias de ejecución de herramientas de desarrollo. Las evidencias completas y los riesgos pendientes se consolidan en A14 del backend y en el informe del grupo.
