# 05-SDK-TRACKING-CLIENTE

## Título
SDK/cliente de tracking para sitio público y rutas principales.

## Objetivo
Construir una capa única de envío de eventos para evitar tracking disperso por scripts sueltos.

## Problema que resuelve
Si cada script emite eventos por su cuenta, crecen errores de formato, duplicación y pérdida de eventos.

## Scope
- Definir módulo cliente de tracking reutilizable.
- Implementar API mínima (`track`, `identify`, `setContext`, `flush`).
- Implementar cola con retry y fallback.
- Inyectar contexto base común a todos los eventos.
- Definir mecanismo de feature flag para activar/desactivar emisión.

## Fuera de scope
- Instrumentación detallada por evento de negocio.
- Modelado backend/warehouse.

## Dependencias
- `02-TAXONOMIA-EVENTOS-Y-DICCIONARIO`.
- `03-MODELO-DATOS-ANALYTICS-Y-CONTRATOS`.
- `04-GOBERNANZA-PRIVACIDAD-Y-RETENCION`.

## Inputs / fuentes
- `js/*.js` (rutas públicas)
- `shared/public-paths.js`
- `shared/public-navbar.js`
- `scripts/dev-server.js`

## Entregables
- Módulo de tracking central en frontend.
- Guía de uso para scripts de rutas.
- Eventos de prueba con payload válido en entorno dev.

## Criterios de aceptación
- Existe un único punto de emisión para eventos nuevos.
- La capa añade contexto base automáticamente.
- Hay manejo de fallos de red sin romper UX.

## Riesgos / notas
- Riesgo de sobreacoplar tracking con lógica de UI.
- Riesgo de pérdida de eventos sin estrategia de flush controlada.

## Orden recomendado / fase
Fase 2 (Captura confiable). Paso 5 de 22.

## Prioridad sugerida
P0 (crítico).
