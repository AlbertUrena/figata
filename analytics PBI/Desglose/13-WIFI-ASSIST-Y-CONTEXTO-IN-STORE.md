# 13-WIFI-ASSIST-Y-CONTEXTO-IN-STORE

## Título
Wi-Fi Assist y clasificación reforzada de sesiones in-store.

## Objetivo
Mejorar experiencia in-store y aumentar confianza en clasificación de contexto presencial.

## Problema que resuelve
`QR` da alta señal de in-store, pero no certeza absoluta; además usuarios pueden sufrir mala conectividad local.

## Scope
- Definir UX de modal Wi-Fi Assist para sesiones QR.
- Definir eventos de interacción del modal (`shown`, `dismissed`, `copy_password`, `cta_clicked`).
- Definir reglas para no ser invasivo (frecuencia, contexto, cierre persistente).
- Definir clasificación `in_restaurant_confirmed_wifi` cuando aplique señal de red local.

## Fuera de scope
- Conexión automática al Wi-Fi desde navegador.
- Implementación de infraestructura de red del restaurante.

## Dependencias
- `07-ATRIBUCION-TRAFICO-Y-VANITY-PATHS`.
- `12-INSTRUMENTACION-PERFORMANCE-Y-CONECTIVIDAD`.

## Inputs / fuentes
- `/Users/al/website-figata/analytics PBI/Base de visitantes pseudónimos/Wi-Fi Assist + Analitica in-store.md`
- `js/menu-page.js`
- `eventos/index.html`

## Entregables
- Diseño funcional de flujo Wi-Fi Assist.
- Eventos instrumentados de adopción/uso.
- Reglas analíticas para contexto in-store confirmado.

## Criterios de aceptación
- El modal solo aparece bajo reglas definidas.
- Eventos del flujo Wi-Fi se registran correctamente.
- Se puede segmentar QR probable vs Wi-Fi confirmado en reporting.

## Riesgos / notas
- Riesgo de fricción UX si aparece demasiado.
- Riesgo de sobreinterpretar IP/red como identidad de usuario.

## Orden recomendado / fase
Fase 2 (Captura confiable). Paso 13 de 22.

## Prioridad sugerida
P2 (media, habilitador avanzado).
