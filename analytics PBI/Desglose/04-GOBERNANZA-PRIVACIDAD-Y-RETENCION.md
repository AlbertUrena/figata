# 04-GOBERNANZA-PRIVACIDAD-Y-RETENCION

## Título
Gobernanza de datos analytics: privacidad, retención, clasificación interna y políticas de uso.

## Objetivo
Definir reglas de privacidad y gobernanza para operar analytics pseudónimo con bajo riesgo legal y operacional.

## Problema que resuelve
La captura de visitor/session puede caer en prácticas de identificación excesiva o retención innecesaria sin marco claro.

## Scope
- Definir política de datos pseudónimos y campos prohibidos.
- Definir periodos de retención por entidad (`events`, `sessions`, `visitors`).
- Definir control de acceso a datasets y reportes.
- Definir estrategia de anonimización para reportes ejecutivos.
- Definir tratamiento de tráfico interno en reporting.

## Fuera de scope
- Implementación legal completa con asesoría externa.
- UI de consentimiento/cookies (si aplica por región, se trata aparte).

## Dependencias
- `01-FUNDACION-ARQUITECTURA-ANALYTICS`.
- `03-MODELO-DATOS-ANALYTICS-Y-CONTRATOS`.

## Inputs / fuentes
- `/Users/al/website-figata/analytics PBI/Base de visitantes pseudónimos/Base de visitantes pseudonimos.md`
- `/Users/al/website-figata/analytics PBI/Sistema de exclusion de trafico interno.md`

## Entregables
- Documento de gobernanza analytics v1.
- Matriz de clasificación de datos (sensible/no sensible).
- Política de retención y borrado.

## Criterios de aceptación
- Está prohibido explícitamente almacenar PII no necesaria.
- Se definen tiempos de retención por tabla/evento.
- Se define quién puede ver qué nivel de detalle.

## Riesgos / notas
- Riesgo de bloquear ejecución por sobrerregulación temprana.
- Riesgo reputacional si no se controla acceso a datasets crudos.

## Orden recomendado / fase
Fase 1 (Fundación). Paso 4 de 22.

## Prioridad sugerida
P0 (crítico).
