# 07-ATRIBUCION-TRAFICO-Y-VANITY-PATHS

## Título
Sistema de atribución de tráfico (UTMs, vanity paths, source/context).

## Objetivo
Medir correctamente origen de tráfico y clasificar contexto de visita (in-store/remoto/unknown).

## Problema que resuelve
Sin atribución consistente, no se puede comparar Instagram, QR, WhatsApp, directo o Google ni su calidad de intención.

## Scope
- Definir esquema de UTMs mínimos por canal.
- Definir estrategia de rutas limpias (`/ig`, `/qr`, `/wsp`) y mapeo a source.
- Definir reglas de clasificación `entry_source` y `visit_context`.
- Persistir source de entrada en sesión.
- Definir lógica de confidence para inferencias de contexto.

## Fuera de scope
- Optimización SEO/campañas pagas.
- Automatización de creación de enlaces de marketing.

## Dependencias
- `03-MODELO-DATOS-ANALYTICS-Y-CONTRATOS`.
- `05-SDK-TRACKING-CLIENTE`.

## Inputs / fuentes
- `/Users/al/website-figata/analytics PBI/Base de visitantes pseudónimos/Como distinguir trafico en restaurante vs remoto.md`
- `/Users/al/website-figata/analytics PBI/Base de visitantes pseudónimos/Estrategia de links y atribucion (Instagram, WhatsApp, QR).md`
- `/Users/al/website-figata/analytics PBI/Base de visitantes pseudónimos/Data de 1 ano + atribucion limpia (sin UTMs feos).md`

## Entregables
- Matriz canal → link de entrada → source/context.
- Especificación de parámetros aceptados y fallback por referrer.
- Implementación de captura y persistencia en sesión.

## Criterios de aceptación
- Toda sesión queda clasificada con `entry_source`.
- Toda sesión tiene `visit_context` con nivel de confidence.
- QR e Instagram se distinguen de forma confiable en reporting.

## Riesgos / notas
- Riesgo de depender demasiado de referrer (inestable).
- Riesgo de clasificar contexto como certeza cuando es inferencia.

## Orden recomendado / fase
Fase 2 (Captura confiable). Paso 7 de 22.

## Prioridad sugerida
P0 (crítico).
