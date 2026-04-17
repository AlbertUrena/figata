# AI Data Analyst

URL: https://www.notion.so/33e2142e05618033806cc6c65546875c

## Subpáginas

- Precios

## Contenido

Sí — esa idea está buenísima, y de hecho para mí **completa** el sistema.
Porque una cosa es tener:
- reportes semanales y mensuales, y otra muy distinta es tener
- una capa conversacional encima de esos reportes y de la data viva del negocio.

Ahí es donde el admin panel deja de ser solo un lugar para **leer información** y se convierte en un lugar para **preguntarle cosas al negocio**.

## La idea, bien aterrizada
Lo que estás imaginando no es solo “un chat con IA”.
En realidad sería algo más valioso:
**un analista conversacional interno de Figata**, metido dentro del admin.

Eso significa que un dueño podría preguntar cosas como:
- “¿Por qué bajó add to cart esta semana?”
- “¿Qué platos tienen muchas vistas pero compran poco?”
- “Compárame Instagram vs QR en intención de compra”
- “¿Qué recomendarías cambiar esta semana en el menú?”
- “¿Qué está funcionando mejor en mobile?”
- “¿Qué señales ves en eventos?”

Y el sistema respondería usando:
- el contexto del negocio
- la data agregada del período
- quizá reportes anteriores
- quizá reglas de negocio
- y, si quieres, documentación interna del proyecto

Ese patrón encaja muy bien con la **Responses API**, que está pensada para interacciones stateful, chaining de respuestas y uso de herramientas. OpenAI además documenta estado conversacional persistente con la **Conversations API**, que funciona junto a Responses para mantener una conversación duradera con su propio identificador. ([OpenAI Developers](https://developers.openai.com/api/reference/responses/overview/?utm_source=chatgpt.com))

## Por qué esta idea es tan buena
Porque resuelve un problema real que los dashboards nunca resuelven del todo:
**la fricción de tener que saber qué mirar**.

Un dashboard sirve cuando ya sabes:
- qué métrica abrir
- qué filtro poner
- qué comparación hacer
- qué interpretación sacar

Pero un socio o dueño muchas veces no piensa así.
Piensa más bien en lenguaje natural:
- “¿qué me debería preocupar?”
- “¿qué plato está flojo?”
- “¿qué canal está trayendo gente de verdad?”
- “¿qué harías tú si fueras yo?”

Ese tipo de interacción es exactamente donde un chat brilla más que un dashboard fijo. Y como la API actual soporta estado de conversación persistente y encadenamiento de respuestas, esa experiencia se puede montar de una forma mucho más limpia que antes. ([OpenAI Developers](https://developers.openai.com/api/docs/guides/conversation-state?utm_source=chatgpt.com))

## Lo más importante: esto ya no se diseña como un reporte
Aquí cambia la lógica.
En los reportes programados, tú controlas mucho más:
- período fijo
- formato fijo
- estructura fija
- salida relativamente larga

En el chat, en cambio, el usuario entra con preguntas impredecibles.
Entonces el sistema ideal no debería mandar siempre el mismo paquete gigante de contexto.
Debería hacer algo más inteligente:

### Capa 1: contexto estable
Cosas que casi siempre aplican:
- qué es Figata
- cómo está definido cada KPI
- taxonomía de eventos
- reglas del negocio
- tono del asistente
- restricciones de no alucinar

### Capa 2: contexto dinámico del request
Lo que cambia según la pregunta:
- período consultado
- tablas relevantes
- platos relevantes
- canales relevantes
- funnels relevantes
- reportes previos relacionados

### Capa 3: memoria conversacional
Lo que ya se habló en ese chat:
- “cuando digo conversión, me refiero a purchase”
- “compárame con la semana pasada”
- “enfócate en QR”
- “dame respuestas más ejecutivas”

Esto se puede manejar con Responses y Conversations, en vez de tener que reconstruir todo manualmente en cada turno. ([OpenAI Developers](https://developers.openai.com/api/reference/responses/overview/?utm_source=chatgpt.com))

## Aquí viene una decisión clave: no meter toda la data en cada pregunta
Esto es probablemente lo más importante de toda la arquitectura.
Tu intuición es correcta en una parte:
el mensaje del usuario suele ser cortico.
Pero **el verdadero costo y tamaño no lo define el mensaje del usuario**, sino el contexto que tú adjuntas para que el modelo responda bien.

Y ahí tienes dos caminos.

### Camino malo
En cada pregunta le mandas:
- prompt del sistema
- data del negocio
- JSONs grandes
- reportes completos
- historial completo del chat

Eso funciona al inicio, pero después:
- sube costo
- sube latencia
- metes ruido
- la respuesta puede empeorar

### Camino bueno
El chat pregunta algo, y tu backend arma un contexto **mínimo pero suficiente**.
Ejemplo:

Usuario:
> “¿Qué platos tienen mucha curiosidad pero poca compra esta semana?”

Entonces el backend no manda todo el universo.
Manda solo algo como:
- definición de “curiosidad” y “compra”
- top items por detail opens
- top items por add to cart / purchase
- ratios relevantes
- quizá el resumen semanal

Eso hace que el sistema sea mucho más rápido, barato y preciso.

## Para este caso, no usaría el modelo más caro
Y aquí estoy de acuerdo contigo.
Para reportes ejecutivos programados, sí tiene sentido considerar el modelo más avanzado.
Pero para el chat del admin, muchas veces conviene más un modelo más económico y rápido.

Según la página oficial de precios, hoy **GPT-5.4 mini** cuesta **$0.75 por 1M tokens de entrada**, **$0.075 por 1M tokens de entrada en caché** y **$4.50 por 1M tokens de salida**. **GPT-5.4 nano** cuesta **$0.20 por 1M tokens de entrada**, **$0.02 por 1M tokens en caché** y **$1.25 por 1M tokens de salida**. ([openai.com](https://openai.com/api/pricing/?utm_source=chatgpt.com))

Entonces, para un chat interno como este, yo pensaría así:
- **GPT-5.4 mini** para respuestas principales del analista conversacional
- **GPT-5.4 nano** para tareas más simples o auxiliares
- **GPT-5.4** solo cuando quieras una respuesta especialmente estratégica o profunda

Eso te da una arquitectura mucho más lógica económicamente. ([openai.com](https://openai.com/api/pricing/?utm_source=chatgpt.com))

## Y sí: el output probablemente será barato
Tu hipótesis de que el output no debería pasar mucho de 500 tokens tiene bastante sentido para una UX bien diseñada.
Porque este chat no debería contestar con ensayos eternos.
Debería contestar cosas como:
- una explicación clara
- una comparación concreta
- 2 o 3 hallazgos
- una recomendación accionable

Si una respuesta saliera de 300 a 700 tokens normalmente, el costo de salida seguiría siendo bastante manejable con mini o nano. Con los precios actuales, el output es más caro que el input, así que ahí sí conviene diseñar respuestas breves y enfocadas. ([openai.com](https://openai.com/api/pricing/?utm_source=chatgpt.com))

## Donde realmente vas a ganar mucho: prompt caching
Aquí está uno de los puntos más potentes para tu caso.
OpenAI documenta **Prompt Caching** como una forma de reducir costo y latencia cuando partes del prompt se repiten. También explica que estructurar bien los prompts ayuda a lograr más cache hits. ([OpenAI Developers](https://developers.openai.com/api/docs/guides/prompt-caching?utm_source=chatgpt.com))

Y tu caso es perfecto para eso, porque hay muchísimas piezas que se repiten entre preguntas:
- instrucciones del sistema
- contexto fijo de Figata
- definiciones de KPIs
- taxonomía de eventos
- reglas del analista
- formato de respuesta

Si esas partes entran por caché, tu chat puede salir bastante más barato de lo que parece en bruto. La documentación y la página de precios muestran precisamente que el **cached input** cuesta mucho menos que el input normal. ([OpenAI Developers](https://developers.openai.com/api/docs/guides/prompt-caching?utm_source=chatgpt.com))

## Entonces, ¿cómo diseñaría el chat?
Yo lo haría en dos modos.

### Modo 1: QA analítico corto
Preguntas concretas, respuesta concreta.
Ejemplos:
- “¿Cuál canal convierte mejor?”
- “¿Qué plato está perdiendo interés?”
- “¿Qué día fue más fuerte?”

Aquí mandas poco contexto y respondes rápido.

### Modo 2: análisis guiado
Preguntas un poco más complejas, donde el modelo ya razona sobre varias piezas.
Ejemplos:
- “Dame 3 recomendaciones para subir add to cart”
- “Explícame por qué Instagram convierte peor que QR”
- “¿Qué cambiarías en el menú basándote en esta semana?”

Aquí mandas más tablas y más resumen contextual.
Ese split ayuda mucho porque no toda pregunta merece el mismo costo.

## Incluso puedes añadir retrieval en vez de meter todo inline
Esto también te puede servir muchísimo.
OpenAI documenta herramientas de **file search / retrieval** y vector stores para recuperar solo los fragmentos relevantes, en vez de meter todos los documentos completos en el prompt. También señalan que limitar los resultados ayuda a reducir tanto tokens como latencia. ([OpenAI Developers](https://developers.openai.com/api/docs/guides/tools-file-search?utm_source=chatgpt.com))

Traducido a Figata:
en vez de mandar siempre:
- todos los reportes
- todos los JSON
- toda la documentación

podrías tener indexado:
- reportes semanales
- reportes mensuales
- definiciones de negocio
- notas operativas
- documentación del sistema

y traer solo lo relevante para esa pregunta.

Eso es especialmente útil si luego el admin panel crece y ya no solo quieres responder sobre “esta semana”, sino también sobre historia, patrones y decisiones pasadas.

## Ojo con un riesgo: que el chat sea bonito, pero poco confiable
Aquí hay una trampa importante.
Este tipo de chat puede verse súper convincente aunque esté respondiendo con contexto insuficiente.
Entonces yo le pondría reglas fuertes:
- no inventar datos
- decir cuándo no hay suficiente evidencia
- distinguir observación vs inferencia
- citar internamente las tablas o fuentes usadas
- priorizar respuestas con números concretos
- no hablar con falsa seguridad

Eso es especialmente importante porque en el admin panel la gente puede empezar a confiar muchísimo en ese chat.

## Cómo lo estructuraría como producto
Yo le pondría tres superficies dentro del admin:

### 1. Pregunta libre
Caja de chat normal.
Para preguntas abiertas como:
- “¿qué está pasando con postres?”
- “¿qué me preocupa esta semana?”

### 2. Preguntas rápidas sugeridas
Botones listos, por ejemplo:
- “¿Qué cambió esta semana?”
- “¿Qué platos tienen alta curiosidad y baja compra?”
- “Compara QR vs Instagram”
- “¿Qué harías para mejorar conversión?”
- “Resume los riesgos de esta semana”

Esto reduce fricción y ayuda a usuarios menos técnicos.

### 3. Follow-ups guiados
Después de responder, el sistema ofrece una sola continuación útil, por ejemplo:
- “¿Quieres que lo compare con la semana pasada?”
- “¿Quieres ver solo mobile?”
- “¿Quieres recomendaciones accionables?”

Eso hace que el chat se sienta inteligente sin abrumar.

## Mi recomendación de arquitectura
Para esta idea, yo haría algo así:

### Base
- Responses API
- Conversations API para mantener el hilo del chat
- prompt caching
- backend que seleccione contexto dinámico por pregunta

### Datos
- tablas agregadas
- reportes previos resumidos
- definiciones de negocio
- retrieval/vector store para documentos grandes o históricos

### Modelo
- GPT-5.4 mini como opción principal
- nano para tareas simples
- fallback a GPT-5.4 solo para análisis premium o preguntas complejas

Eso encaja muy bien con lo que OpenAI documenta sobre Responses, Conversations, prompt caching y retrieval. ([OpenAI Developers](https://developers.openai.com/api/reference/responses/overview/?utm_source=chatgpt.com))

## Mi veredicto
Sí, esta idea vale muchísimo la pena.
De hecho, te diría que el sistema completo ideal de Figata sería:
- **reportes automáticos** para lectura ejecutiva programada
- **chat analítico** para exploración libre y preguntas concretas

Los reportes te dan narrativa y memoria.
El chat te da intuición, velocidad y acceso.
Juntos son muchísimo mejores que cualquiera de los dos por separado.

Y económicamente, bien diseñado, esto puede ser bastante razonable porque:
- no necesitas el modelo más caro para cada turno
- muchas piezas del contexto se repiten
- puedes usar caché
- puedes recuperar solo la data relevante
- y tus respuestas deberían ser relativamente cortas

La versión corta sería esta:
**sí, el chat dentro del admin panel es una idea excelente, probablemente más usada día a día que los reportes, y bien armado puede ser rápido, barato y mucho más intuitivo para dueños y socios que abrir dashboards.**

Si quieres, el siguiente paso te lo bajo a algo ya casi construible: **qué preguntas debería soportar, qué contexto mandar en cada tipo de pregunta, y qué modelo pondría para cada nivel de complejidad**.
