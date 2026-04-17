# 06-IDENTIDAD-VISITANTE-Y-SESION

## Título
Implementación de `visitor_id` y `session_id` pseudónimos.

## Objetivo
Reconocer recurrencia y comportamiento longitudinal sin usar identidad personal.

## Problema que resuelve
Sin identificación técnica estable, no se puede medir nuevos vs recurrentes ni frecuencia de retorno.

## Scope
- Generar y persistir `visitor_id` en almacenamiento local.
- Generar `session_id` por sesión activa.
- Definir reglas de expiración/inactividad de sesión.
- Adjuntar IDs a todos los eventos emitidos.
- Manejar reset/control de IDs para testing interno.

## Fuera de scope
- Fingerprinting agresivo o identificación personal.
- Integración con CRM nominal.

## Dependencias
- `05-SDK-TRACKING-CLIENTE`.
- `04-GOBERNANZA-PRIVACIDAD-Y-RETENCION`.

## Inputs / fuentes
- `/Users/al/website-figata/analytics PBI/Base de visitantes pseudónimos/Base de visitantes pseudonimos.md`
- `/Users/al/website-figata/analytics PBI/Base de visitantes pseudónimos/Por que los visitantes unicos y recurrentes son valiosos.md`

## Entregables
- Especificación de generación y ciclo de vida de IDs.
- Implementación en runtime público.
- Pruebas manuales de persistencia y rotación de sesión.

## Criterios de aceptación
- `visitor_id` permanece estable entre sesiones del mismo navegador.
- `session_id` rota según regla definida.
- Todos los eventos incluyen ambos IDs.

## Riesgos / notas
- Limitaciones naturales por incógnito, borrado de storage y cambio de dispositivo.
- Riesgo de confundir visitantes pseudónimos con clientes identificados.

## Orden recomendado / fase
Fase 2 (Captura confiable). Paso 6 de 22.

## Prioridad sugerida
P0 (crítico).
