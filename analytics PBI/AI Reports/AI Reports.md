# AI Reports

URL: https://www.notion.so/33e2142e056180b7838ed6158d4116e2

## Subpáginas

- Reporte semanal

## Contenido

Sí, esa idea es muy buena. De hecho, bien hecha, puede convertirse en una de las piezas más valiosas de todo el sistema.
No la veo como “un parche porque no hay marketer”, sino como una **capa de inteligencia ejecutiva** encima de tu analítica. La diferencia es enorme: una cosa es tener dashboards llenos de números; otra es recibir un reporte que diga, en lenguaje humano, qué cambió, por qué importa y qué deberías hacer la próxima semana.

Y sí, se puede hacer perfectamente con la API. OpenAI tiene la Responses API, salidas estructuradas y manejo de contexto/prompting para este tipo de flujos; además, como estos reportes no son tiempo real, también puedes aprovechar procesamiento batch para ahorrar costo.

## **Mi opinión general**
Tu idea tiene tres fortalezas muy grandes.
La primera: **democratiza la data**.
No solo la entiende quien sabe leer GA4, PostHog o SQL. La entiende cualquier socio, dueño o persona operativa.
La segunda: **obliga al sistema a traducir datos en decisiones**.
No solo “subieron las visitas 14%”, sino “subieron las visitas desde Instagram pero bajó la tasa de add-to-cart en eventos; esto sugiere tráfico más curioso que comprador”.
La tercera: **crea memoria histórica del negocio**.
Cada semana y cada mes tienes un registro consistente de qué pasó, cómo cambió y qué hipótesis surgieron. Eso, con el tiempo, vale muchísimo.

## **Cómo lo haría de verdad**
No mandaría “todo crudo” sin estructura y esperar que el modelo haga magia. Funciona mucho mejor si montas un pipeline en capas.

### **Capa 1: recolección**
Tu sistema de analítica captura eventos y métricas base:
- visitas
- sesiones
- fuentes
- page views
- item impressions
- detail opens
- add to cart
- purchases
- scroll depth
- clicks por CTA
- browsers
- devices
- geografía aproximada
- sesiones recurrentes
- funnels
- etc.

### **Capa 2: agregación**
Antes de llamar al modelo, un job servidor prepara un paquete limpio. No le pasas millones de eventos sueltos si no hace falta. Le pasas:
- KPIs resumidos
- tablas por canal
- tablas por página
- tablas por plato
- top movers
- anomalías
- funnels
- comparativas vs semana anterior
- comparativas vs promedio de 4 semanas si quieres
- highlights cualitativos
- y, si hace falta, muestras de eventos o paths de usuario

Aquí está una decisión importante:
**el modelo no debería ser tu motor principal de cálculo**, sino tu motor principal de **interpretación**.

O sea:
- SQL / PostHog / backend calcula
- OpenAI interpreta, sintetiza, compara, redacta y recomienda

Eso te da más consistencia.

### **Capa 3: generación del reporte**
Aquí sí llamas al modelo con:
- contexto del negocio
- definiciones de métricas
- data agregada del período actual
- data agregada del período anterior
- quizá el reporte anterior también
- reglas de estilo del reporte
- restricciones de no alucinar
- formato de salida

### **Capa 4: distribución**
Ese reporte luego se guarda y se entrega.
Mi recomendación:
- guardarlo en base de datos
- también renderizarlo en HTML/Markdown
- y además enviarlo por email a los socios

WhatsApp no sería mi primera opción para el reporte completo.
Sirve más para un resumen ejecutivo corto, pero el reporte largo lo pondría en:
- panel admin
- email
- y quizá PDF descargable

## **Tu idea de comparar con semana pasada y mes pasado**
Sí, eso está muy bien. Yo incluso lo haría así:

### **Reporte semanal**
Comparar:
- semana actual vs semana anterior
- opcional: semana actual vs promedio de últimas 4 semanas

Porque a veces una sola semana anterior puede ser rara. El promedio reciente te da mejor contexto.

### **Reporte mensual**
Comparar:
- mes actual vs mes anterior
- opcional: mes actual vs promedio de últimos 3 meses
- y usar como apoyo los reportes semanales del mes

Tu intuición aquí fue buena:
para el mensual, sí conviene que vea:
- los agregados del mes
- y los reportes semanales del mes
- y el reporte mensual anterior

Porque los semanales le dan “narrativa interna” del mes, no solo números agregados.

## **Qué le pasaría como input**
Yo no le pasaría una exportación masiva cruda a lo loco. Le pasaría un objeto muy organizado, algo como:

```plain text
{
  "business_context": {
    "name": "Figata",
    "type": "restaurante italiano / pizza napolitana",
    "goals": [
      "aumentar pedidos",
      "mejorar conversión del menú",
      "entender interés por platos y eventos",
      "detectar comportamiento por canal"
    ]
  },
  "period": {
    "type": "weekly",
    "current": "2026-04-01 to 2026-04-07",
    "previous": "2026-03-25 to 2026-03-31"
  },
  "traffic": {
    "sessions": 3120,
    "unique_visitors": 2480,
    "by_source": [
      {"source": "instagram_bio", "sessions": 1240, "conversion_rate": 0.032},
      {"source": "qr_restaurante", "sessions": 1510, "conversion_rate": 0.081},
      {"source": "direct_shared", "sessions": 370, "conversion_rate": 0.054}
    ]
  },
  "pages": {
    "homepage": {"views": 2200, "avg_time_sec": 58},
    "menu": {"views": 1890, "avg_time_sec": 210},
    "eventos": {"views": 430, "avg_time_sec": 96}
  },
  "menu_intelligence": {
    "top_viewed_items": [...],
    "top_added_items": [...],
    "top_purchased_items": [...],
    "high_view_low_purchase_items": [...],
    "pairings_view_rate": 0.18,
    "story_view_rate": 0.09,
    "video_play_rate": 0.21
  },
  "conversion_funnel": {
    "item_view_to_detail": 0.28,
    "detail_to_cart": 0.17,
    "cart_to_checkout": 0.63,
    "checkout_to_purchase": 0.71
  },
  "behavior": {
    "rush_hours": [...],
    "dead_hours": [...],
    "returning_visitors_rate": 0.22,
    "device_split": [...],
    "browser_split": [...]
  },
  "previous_period_summary": {...}
}
```

Eso ya le da al modelo una base mucho más poderosa.

## **Cómo debería estar escrito el prompt**
No lo haría “bien largo” solo por ser largo. Lo haría muy preciso.
Tendría 5 bloques:

### **1. Rol**
Eres un analista senior de crecimiento, UX y e-commerce para un restaurante premium digital-first.

### **2. Objetivo**
Genera un reporte ejecutivo, táctico y accionable sobre el desempeño del período.

### **3. Reglas**
- no inventes datos
- no asumas causalidad sin evidencia
- diferencia claramente observación, inferencia e hipótesis
- destaca cambios materialmente relevantes
- escribe para lectores no técnicos
- usa lenguaje claro
- incluye recomendaciones priorizadas

### **4. Formato**
- resumen ejecutivo
- qué cambió
- canales
- comportamiento del menú
- platos
- UX y contenido
- recomendaciones
- alertas
- oportunidades

### **5. Datos**
Le pasas el JSON agregado.

## **Algo muy importante: el modelo no debería “leer un reporte anterior” solamente**
Tu intuición aquí también fue buena: mejor que vea ambos.
Yo haría esto:
- datos del período actual
- datos del período anterior
- reporte anterior, opcionalmente

¿Por qué?
Porque:
- los datos son la fuente de verdad
- el reporte anterior le da continuidad narrativa

Entonces el modelo puede decir:
“Esto confirma la señal observada la semana pasada”
o
“La hipótesis de la semana pasada no se sostiene con la data nueva”

Eso está buenísimo.

## **Cómo se automatiza**
La arquitectura ideal sería así:

### **Scheduler**
Un cron o job programado:
- semanal: lunes 7 AM
- mensual: día 1 del mes, 8 AM

### **Backend job**
1. consulta la base o el sistema analítico
2. agrega los datos del período
3. trae el período anterior
4. trae reportes previos si hace falta
5. construye payload
6. llama a OpenAI
7. recibe respuesta estructurada
8. la guarda
9. la envía

### **Persistencia**
Guardar:
- JSON fuente del reporte
- markdown generado
- HTML renderizado
- metadata del job
- versión del prompt
- modelo usado
- fecha de generación

Eso es importante para auditoría y para comparar calidad con el tiempo.

## **Dónde mostrarlo**
Yo haría 3 superficies:

### **1. Admin panel**
Una sección tipo:
- Reportes semanales
- Reportes mensuales
- histórico
- filtros por fecha
- exportar PDF / markdown

### **2. Email**
A socios y dueños, porque es lo más práctico.

### **3. Resumen corto opcional**
Un mini-resumen por WhatsApp o Slack, si luego quieres:
- “esta semana: QR +18%, add-to-cart -6%, Diavola fue el plato con más crecimiento, eventos subió tráfico pero no leads”

Pero el reporte largo yo lo dejaría en admin/email.

## **Cómo debería verse el reporte**
Yo lo haría en una mezcla de:
- resumen ejecutivo muy legible
- bloques con subtítulos
- bullets breves solo donde ayudan
- tablas cortas
- highlights y alertas

### **Ejemplo de tono y estructura**
# **Reporte semanal Figata**
**Período:** 1–7 abril 2026
**Comparado con:** 25–31 marzo 2026

## **Resumen ejecutivo**
Esta semana Figata creció en tráfico total, impulsado principalmente por el QR del restaurante, que aportó el 48% de las sesiones. Sin embargo, la conversión desde Instagram cayó levemente, lo que sugiere mayor curiosidad que intención inmediata de compra. El menú mantuvo buen engagement, especialmente en pizzas clásicas, pero hubo una caída en la visualización de maridajes, lo que podría estar afectando oportunidades de upsell.

## **Qué cambió más**
- Las sesiones totales subieron 14%.
- Los visitantes únicos subieron 9%.
- La tasa de add-to-cart bajó 5%.
- El QR del local fue el canal con mejor conversión.
- Instagram siguió trayendo volumen, pero con menor profundidad de sesión.
- El detalle de “Quattro Formaggi” recibió muchas visitas, pero no tradujo ese interés en pedidos.

## **Canales**
El QR del restaurante sigue siendo el canal más valioso en intención de compra. Aunque Instagram aportó más tráfico bruto, los usuarios desde QR navegaron más platos por sesión, abrieron más detalles y añadieron más veces al carrito.

## **Inteligencia del menú**
Los platos más vistos fueron Margherita, Diavola y Quattro Formaggi.
Los más añadidos al carrito fueron Diavola, Burrata Speciale y Tiramisú.
El plato con mayor curiosidad y menor conversión fue Quattro Formaggi: alto view rate, bajo add-to-cart rate.

## **Contenido y upsell**
La sección de maridajes fue vista por menos usuarios que la semana pasada. Esto coincide con una reducción en el valor medio del carrito. Los microvideos tuvieron mejor desempeño en pizzas que en bebidas.

## **Oportunidades**
1. Subir visibilidad de Diavola y Tiramisú como combo.
2. Revisar el detalle de Quattro Formaggi: foto, copy o pricing.
3. Reforzar la posición de maridajes en mobile.
4. Crear una variante del CTA para visitantes desde Instagram.

## **Alertas**
La navegación en eventos recibió más tráfico, pero el click hacia WhatsApp no creció al mismo ritmo. Esto puede indicar curiosidad alta pero propuesta todavía poco clara.

Ese tipo de reporte ya sería valiosísimo.

## **Cómo evitar que el modelo haga reportes “bonitos pero vacíos”**
Aquí está una de las trampas grandes. Si no lo controlas, te va a escribir cosas elegantes pero genéricas.
Yo impondría estas reglas:
- toda afirmación importante debe anclarse a métricas concretas
- separar claramente:
	- **observaciones**
	- **inferencias**
	- **hipótesis**
	- **recomendaciones**
- pedir top 3 hallazgos y top 3 acciones
- pedir cambios significativos, no ruido
- pedir contradicciones o anomalías
- pedir “qué no cambió” si eso también es relevante

Y si quieres llevarlo más lejos, usaría **structured output** para que primero devuelva JSON bien ordenado y luego renderizarlo a markdown. OpenAI documenta structured output y Responses API justo para este tipo de flujos más controlados.

## **Qué haría con el costo**
Como dijiste, el costo aquí no me preocupa demasiado tampoco, pero hay una decisión inteligente:
Como estos reportes son jobs programados y no son urgentes, puedes usar **Batch API** para ahorrar. OpenAI lo documenta como una opción para requests no time-sensitive.

Entonces:
- job semanal
- job mensual
- generación offline/batch
- guardado del resultado

Eso es perfecto para este caso.

## **Límites reales que sí debes tener presentes**

### **1. No todo debe ir crudo al modelo**
Aunque el contexto de entrada sea amplio, igual conviene preagregar.
Más input no siempre significa mejor insight.

### **2. Si el tracking está mal, el reporte estará mal**
Esto depende totalmente de que la taxonomía de eventos esté bien diseñada.

### **3. No debe ser solo narrativo**
También debe entregar:
- prioridades
- oportunidades
- riesgos
- y recomendaciones accionables

### **4. No lo usaría como única fuente de verdad**
El reporte es una capa interpretativa, no sustituye dashboards.

## **Cómo lo aterrizaría en fases**

### **Fase 1**
Generación automática semanal y mensual en markdown:
- se guarda en DB
- se ve en admin
- se manda por email

### **Fase 2**
Agregar:
- resumen ejecutivo corto
- highlights automáticos
- alertas si hay anomalías
- comparativas más sofisticadas

### **Fase 3**
Agregar una especie de “copilot interno”:
- “¿por qué bajó add-to-cart esta semana?”
- “muéstrame platos muy vistos pero no comprados”
- “compara QR vs Instagram en los últimos 90 días”

Ahí ya no solo lees reportes; conversas con la data.

## **Mi veredicto**
Tu idea no solo es viable; me parece **excelente**.
Bien hecha, te daría:
- interpretación automática
- memoria histórica
- alineación entre socios
- decisiones más rápidas
- y muchísimo menos tiempo perdido leyendo dashboards crudos

La forma correcta de hacerlo es:
1. buena analítica base
2. agregación limpia por período
3. prompt fuerte y bien diseñado
4. generación automática
5. distribución por admin + email
6. comparación semanal y mensual
7. reportes pensados para humanos, no para analistas

## **Mi recomendación concreta final**
Yo sí lo haría, pero así:
- **PostHog/analytics** como fuente de datos
- **job backend semanal y mensual**
- **OpenAI Responses API**
- **structured output primero**
- **markdown/html después**
- **email + admin panel**
- **Batch API** para ahorrar donde convenga

Y honestamente, esto puede convertirse en una de las ventajas más fuertes de Figata.

Si quieres, en el próximo mensaje te puedo hacer algo mucho más aterrizado y usable:
**un diseño completo del sistema**, con:
- arquitectura
- tablas/inputs
- prompt maestro semanal
- prompt maestro mensual
- formato del reporte
- y ejemplo de salida realista.
