# 01-FUNDACION-ARQUITECTURA-ANALYTICS

## Título
Fundación de arquitectura analytics para Figata.

## Objetivo
Definir la arquitectura técnica, principios y límites del sistema de analytics antes de instrumentar eventos.

## Problema que resuelve
Hoy el contexto está repartido en múltiples ideas (V1, V2, performance, IA). Sin arquitectura base, el tracking se vuelve inconsistente, difícil de mantener y caro de escalar.

## Scope
- Definir objetivos de negocio que analytics debe responder.
- Definir capas del sistema: captura, transporte, modelado, explotación.
- Definir ambientes (dev, preview, prod) y reglas de tracking por ambiente.
- Definir convenciones de ownership técnico (frontend, backend, data, producto).
- Definir plan de rollout por fases y criterios de go/no-go.

## Fuera de scope
- Implementación de eventos en código.
- Construcción de dashboards.
- Integraciones con OpenAI o herramientas de session replay.

## Dependencias
- Ninguna (punto de partida).

## Inputs / fuentes
- `/Users/al/website-figata/analytics PBI/V1.md`
- `/Users/al/website-figata/analytics PBI/V2.md`
- `/Users/al/website-figata/analytics PBI/INDEX.md`
- `AGENTS.md`
- `docs/developers/data/data-layer.md`

## Entregables
- Documento de arquitectura analytics v1.
- Mapa de componentes y flujo de datos end-to-end.
- Matriz de responsabilidades por módulo/sistema.
- Checklist de readiness para iniciar instrumentación.

## Criterios de aceptación
- Existe un único documento aprobado con arquitectura objetivo.
- Quedan definidas decisiones clave de entorno y ownership.
- El roadmap por fases está validado por negocio y técnico.
- No hay ambigüedad sobre qué entra en v1 vs v2.

## Riesgos / notas
- Riesgo de sobre-diseño sin validar capacidad del equipo.
- Riesgo de desalineación si no se acuerda un glosario común.

## Orden recomendado / fase
Fase 1 (Fundación). Paso 1 de 22.

## Prioridad sugerida
P0 (crítico).
