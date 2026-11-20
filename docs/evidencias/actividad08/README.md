# Prueba de despliegue automático y rollback

Ensayo realizado el 19/11/2026, hora de Argentina. El publicador local observaba la rama `demo/a8-despliegue`, puerto 8090 y la API Docker del piloto A15.

| Paso | Resultado comprobado en navegador |
|---|---|
| Antes | Se veía `convoca` y `/version.json` identificaba `a4ced0d` |
| Durante el CI del segundo push | Seguía activa la primera versión |
| Después | Con el CI aprobado, el proceso publicó `1384df0` y apareció `convoca · Defensa A8`. El operador recargó la página |
| Rollback | Volvieron el texto y SHA iniciales. La API respondió HTTP 200 |
| Acceso HTTPS | Se comprobó la misma segunda versión en el túnel del piloto, con el cambio visible, SHA correcto y API HTTP 200. La dirección del túnel era temporal |

Las imágenes `antes.png`, `despues.png` y `rollback.png` son capturas del navegador real. `resultado.json` identifica SHA, CI y respuestas de la API. La URL temporal de la comprobación HTTPS se omite en el JSON versionado.

- [CI del estado inicial](https://github.com/MauroNanda/proyfrontendgrupo02/actions/runs/44661242641)
- [CI del cambio visible](https://github.com/MauroNanda/proyfrontendgrupo02/actions/runs/44661502880)
- [Instructivo para repetir](../../DESPLIEGUE_AUTOMATICO_A8.md)
