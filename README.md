# Convoca — Frontend (Grupo G02)

Frontend del Trabajo Final Integrador de **Programación y Servicios Web** (Facultad de Ingeniería, UNJu). Aplicación Angular 22 con dos vistas: pública (Asistente) y panel administrativo (Organizador).

> **Importante:** Este es uno de los **dos repositorios** del proyecto. La documentación completa (propuesta, arquitectura, modelo de datos, consigna oficial, bitácora, convenciones globales y flujo de trabajo) vive en el repo del **Backend**.

## Repositorios del Proyecto
*   **Backend (documentación + API):** https://github.com/MauroNanda/proybackendgrupo02
*   **Frontend (este repo):** https://github.com/MauroNanda/proyfrontendgrupo02

## Stack
*   Angular 22 (Standalone Components, Signals)
*   Bootstrap 5 (mobile-first)
*   Formularios Reactivos con validaciones personalizadas
*   Chart.js / ng2-charts (Dashboard)
*   DataTables (Listados con filtros y paginación)
*   Exportación PDF y Excel
*   PWA (opcional)

## Documentación

### En este repo (frontend)
| Archivo | Propósito |
|---|---|
| `docs/SETUP-FRONTEND.md` | Cómo levantar el frontend localmente. |
| `docs/CONVENCIONES-FRONTEND.md` | Reglas de código Angular/Bootstrap específicas del frontend. |
| `CLAUDE.md` | Guía para agentes IA (versión reducida, apunta al backend). |

### En el repo del backend (fuente de verdad)
| Archivo | Cuándo leerlo |
|---|---|
| [`docs/CONSIGNA-TP-FINAL.md`](https://github.com/MauroNanda/proybackendgrupo02/blob/main/docs/CONSIGNA-TP-FINAL.md) | Consigna oficial de la cátedra. |
| [`docs/PROPUESTA.md`](https://github.com/MauroNanda/proybackendgrupo02/blob/main/docs/PROPUESTA.md) | Qué se construye: features, flujos, integraciones. |
| [`docs/ARQUITECTURA.md`](https://github.com/MauroNanda/proybackendgrupo02/blob/main/docs/ARQUITECTURA.md) | Esquema de BD y estructura de carpetas (incluye sección frontend). |
| [`docs/FLUJO_DE_TRABAJO.md`](https://github.com/MauroNanda/proybackendgrupo02/blob/main/docs/FLUJO_DE_TRABAJO.md) | Ramas, commits atómicos, PRs, reglas del equipo (aplica a ambos repos). |
| [`docs/PLAN-DE-TAREAS.md`](https://github.com/MauroNanda/proybackendgrupo02/blob/main/docs/PLAN-DE-TAREAS.md) | Tareas asignables por fase y dominio, con archivos a tocar. |
| [`docs/BITACORA.md`](https://github.com/MauroNanda/proybackendgrupo02/blob/main/docs/BITACORA.md) | Estado actual y changelog (único, centralizado). |

## Setup Rápido
```bash
git clone https://github.com/MauroNanda/proyfrontendgrupo02.git
cd proyfrontendgrupo02
npm install
npm start
```
La app corre en `http://localhost:4200`. Para detalles completos ver `docs/SETUP-FRONTEND.md`.

> El backend debe estar corriendo en `http://localhost:3000` para que las llamadas HTTP funcionen.

## Equipo
Grupo G02 — 5 integrantes. Materia: Programación y Servicios Web — Facultad de Ingeniería, UNJu.
