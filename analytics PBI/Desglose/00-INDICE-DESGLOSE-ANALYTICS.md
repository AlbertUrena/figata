# 00-INDICE-DESGLOSE-ANALYTICS

## Lista de PBIs creados (orden recomendado)
1. 01-FUNDACION-ARQUITECTURA-ANALYTICS
2. 02-TAXONOMIA-EVENTOS-Y-DICCIONARIO
3. 03-MODELO-DATOS-ANALYTICS-Y-CONTRATOS
4. 04-GOBERNANZA-PRIVACIDAD-Y-RETENCION
5. 05-SDK-TRACKING-CLIENTE
6. 06-IDENTIDAD-VISITANTE-Y-SESION
7. 07-ATRIBUCION-TRAFICO-Y-VANITY-PATHS
8. 08-EXCLUSION-TRAFICO-INTERNO
9. 09-INSTRUMENTACION-NAVEGACION-Y-CTA-BASE
10. 10-INSTRUMENTACION-MENU-Y-FUNNEL-COMERCIAL
11. 11-INSTRUMENTACION-CONTENIDO-EDITORIAL-Y-DECISION
12. 12-INSTRUMENTACION-PERFORMANCE-Y-CONECTIVIDAD
13. 13-WIFI-ASSIST-Y-CONTEXTO-IN-STORE
14. 14-PIPELINE-INGESTA-Y-MODELADO-ANALITICO
15. 15-CALIDAD-DATOS-Y-OBSERVABILIDAD
16. 16-CATALOGO-KPI-Y-METRICAS-DERIVADAS
17. 17-DASHBOARD-V1-OPERATIVO
18. 18-DASHBOARD-V2-COHORTES-RETENCION-Y-TIEMPO
19. 19-HEATMAPS-Y-SESSION-REPLAY
20. 20-REPORTES-AI-SEMANAL-Y-MENSUAL
21. 21-CHAT-AI-DATA-ANALYST-ADMIN
22. 22-EXPERIMENTACION-Y-RECOMENDACIONES-LIGERAS

## Fases / milestones sugeridos
- Fase 1 (Fundación): PBIs 01-04.
- Fase 2 (Captura confiable): PBIs 05-13.
- Fase 3 (Plataforma de datos): PBIs 14-16.
- Fase 4 (Explotación): PBIs 17-19.
- Fase 5 (Inteligencia IA y optimización): PBIs 20-22.

## Por qué este orden
- Primero se define arquitectura, semántica y gobernanza para evitar retrabajo.
- Luego se captura bien la data (runtime + identidad + source + exclusiones) antes de escalar features.
- Después se consolida pipeline y calidad para que dashboards/IA no se construyan sobre datos frágiles.
- Con base estable se publican dashboards operativos y avanzados.
- Finalmente se habilita capa de inteligencia (reportes IA, chat y experimentación).

## Dependencias clave entre PBIs
- 02 depende de 01.
- 03 depende de 02.
- 05 depende de 02/03/04.
- 06 y 07 dependen de 05.
- 08 depende de 05/06/07.
- 09 depende de 05/07/08.
- 10 depende de 09.
- 11 depende de 10.
- 12 depende de 09.
- 13 depende de 07 y 12.
- 14 depende de 03 y de la instrumentación 09-12.
- 15 depende de 14 y 08.
- 16 depende de 14 y 15.
- 17 depende de 16.
- 18 depende de 17, 11 y 12.
- 19 depende de 09/10/04.
- 20 depende de 15/16/17/18.
- 21 depende de 20/14/16.
- 22 depende de 18 y 11.

## Nota de ejecución
- Ejecutar cada PBI con definición de done y evidencia de validación.
- No saltar PBIs P0, porque son los que protegen calidad y confiabilidad del sistema completo.
