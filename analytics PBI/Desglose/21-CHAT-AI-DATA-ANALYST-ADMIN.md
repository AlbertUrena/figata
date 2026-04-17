# 21-CHAT-AI-DATA-ANALYST-ADMIN

## Título
Chat “AI Data Analyst” dentro del panel admin.

## Objetivo
Permitir consultas en lenguaje natural sobre desempeño del negocio usando contexto analytics estructurado.

## Problema que resuelve
Los usuarios de negocio no siempre saben navegar dashboards o formular consultas técnicas para encontrar insights.

## Scope
- Definir casos de uso del chat (QA corto y análisis guiado).
- Definir contexto fijo, contexto dinámico y memoria conversacional.
- Definir retrieval de reportes/tablas relevantes por pregunta.
- Definir políticas de respuesta (evidencia, límites, tono, no certeza falsa).
- Definir UX en admin para preguntas sugeridas y follow-ups.

## Fuera de scope
- Agente autónomo que ejecute cambios en producción.
- Sustituir dashboards como única fuente de verdad.

## Dependencias
- `20-REPORTES-AI-SEMANAL-Y-MENSUAL`.
- `14-PIPELINE-INGESTA-Y-MODELADO-ANALITICO`.
- `16-CATALOGO-KPI-Y-METRICAS-DERIVADAS`.

## Inputs / fuentes
- `/Users/al/website-figata/analytics PBI/AI Data Analyst/AI Data Analyst.md`
- `/Users/al/website-figata/analytics PBI/AI Data Analyst/Precios.md`
- `admin/app/app.js`
- `admin/app/modules/`

## Entregables
- Especificación funcional del chat en admin.
- API contract de consultas y contexto.
- MVP conversacional con respuestas basadas en datos agregados.

## Criterios de aceptación
- Responde preguntas frecuentes de negocio con métricas concretas.
- Declara límites cuando faltan datos.
- Mantiene costo por interacción dentro de umbral definido.

## Riesgos / notas
- Riesgo de sobreconfianza del usuario en respuestas no verificadas.
- Riesgo de latencia si no se limita contexto por consulta.

## Orden recomendado / fase
Fase 5 (Inteligencia IA). Paso 21 de 22.

## Prioridad sugerida
P2 (media-alta).
