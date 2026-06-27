# Convoca — Frontend (Proyecto Final PysWeb, UNJu)

> **Regla para agentes IA:** Este repo es **solo el frontend Angular**. La documentación principal del proyecto (propuesta, arquitectura, modelo de datos, consigna, bitácora, convenciones globales, flujo de trabajo) vive en el repo del **Backend**. Antes de escribir código, leé esos documentos.

## Información General
*   **Materia:** Programación y Servicios Web (Facultad de Ingeniería, UNJu).
*   **Equipo:** Grupo G02 — 5 integrantes.
*   **Este repo:** Frontend Angular 22.
*   **Repo Backend (docs + API):** https://github.com/MauroNanda/proybackendgrupo02

## Stack (Frontend)
*   Angular 22 (Standalone Components, Signals, `linkedSignal`, `resource`)
*   Bootstrap 5 (mobile-first — exigido por la consigna)
*   `ReactiveFormsModule` con validaciones personalizadas
*   `HttpClient` + Interceptors (JWT, errores)
*   Chart.js / ng2-charts (Dashboard del Organizador)
*   DataTables, jsPDF, exceljs (listados y exportación)
*   PWA (opcional)

## Documentación

### En este repo
| Archivo | Cuándo leerlo |
|---|---|
| `docs/SETUP-FRONTEND.md` | Al clonar el repo por primera vez. |
| `docs/CONVENCIONES-FRONTEND.md` | Antes de escribir cualquier componente, servicio, guard o pipe. |
| `README.md` | Vista general del repo y links a docs del backend. |

### En el repo del backend (fuente de verdad — leer SIEMPRE primero)
| Archivo | Propósito |
|---|---|
| [`docs/BITACORA.md`](https://github.com/MauroNanda/proybackendgrupo02/blob/main/docs/BITACORA.md) | **Estado actual y changelog del proyecto. Leer SIEMPRE primero.** |
| [`docs/PLAN-DE-TAREAS.md`](https://github.com/MauroNanda/proybackendgrupo02/blob/main/docs/PLAN-DE-TAREAS.md) | **Tareas por fase y dominio, con archivos a tocar y criterios.** Mirar al elegir tarea. |
| [`docs/CONSIGNA-TP-FINAL.md`](https://github.com/MauroNanda/proybackendgrupo02/blob/main/docs/CONSIGNA-TP-FINAL.md) | Requisitos formales de la cátedra. |
| [`docs/PROPUESTA.md`](https://github.com/MauroNanda/proybackendgrupo02/blob/main/docs/PROPUESTA.md) | Qué se construye (features, flujos, integraciones). |
| [`docs/ARQUITECTURA.md`](https://github.com/MauroNanda/proybackendgrupo02/blob/main/docs/ARQUITECTURA.md) | Esquema de BD + estructura de carpetas (sección 3 = Frontend). |
| [`docs/CONVENCIONES.md`](https://github.com/MauroNanda/proybackendgrupo02/blob/main/docs/CONVENCIONES.md) | Convenciones globales del proyecto (nomenclatura, comentarios). |
| [`docs/FLUJO_DE_TRABAJO.md`](https://github.com/MauroNanda/proybackendgrupo02/blob/main/docs/FLUJO_DE_TRABAJO.md) | Ramas, commits atómicos, PRs, reglas del equipo. |

## Estrategia de Documentación
*   **Fuente única de verdad:** repo del backend. Evita drift entre docs duplicadas.
*   **En este repo solo viven:** README, CLAUDE.md, convenciones específicas de Angular y guía de setup del frontend.
*   **Bitácora única:** los cambios de este repo se loguean en `docs/BITACORA.md` del backend.
*   Si una doc del backend menciona algo del frontend, este repo NO la duplica — la enlaza.

## Vistas del Sistema
*   **Vista Asistente** (`/eventos`, `/perfil`, etc.): catálogo, detalle con countdown, recomendaciones, valoraciones.
*   **Vista Organizador** (`/admin/*`): dashboard con gráficos, CRUD eventos, lista de inscriptos con export PDF/Excel, scanner QR.
*   Rutas `/admin/*` protegidas por `roleGuard`.
