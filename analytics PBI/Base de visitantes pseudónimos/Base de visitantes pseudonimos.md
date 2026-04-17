# Base de visitantes pseudónimos

URL: https://www.notion.so/33f2142e0561806e8290e7d08e2d37f6

## Subpáginas

- Por qué los visitantes únicos y recurrentes son valiosos?
- Cómo distinguir tráfico “en restaurante” vs remoto
- Data de 1 año + atribución limpia (sin UTMs feos)
- Estrategia de links y atribución (Instagram, WhatsApp, QR)
- Wi-Fi Assist + Analítica in-store

## Contenido

Sí, se puede hacer algo muy útil, pero hay que llamarlo correctamente:
No sería una **“base de datos de clientes”** en el sentido de saber quién es cada persona, sino una **base de visitantes pseudónimos / returning visitors**.
Y eso, honestamente, ya tiene muchísimo valor.

---

## Lo que sí puedes hacer bien
Puedes asignar a cada navegador/dispositivo un **visitor ID pseudónimo** y guardarlo localmente para reconocer cuando vuelve. `localStorage` persiste entre sesiones en el mismo navegador, así que sirve como base simple para un identificador de visitante.

Con eso puedes medir cosas como:
- cuántos visitantes únicos entran por semana o mes
- cuántos regresan
- cada cuánto regresan
- cuántas sesiones hace cada visitante
- qué páginas mira en su primera visita vs en visitas posteriores
- cuánto tarda en volver
- si los recurrentes convierten más que los nuevos
- qué platos revisitan

Eso ya te da una capa brutal de inteligencia.

---

## Lo que NO puedes hacer de forma confiable
No puedes saber algo como:
- “este es el iPhone 15 Pro de Alberto”
- o el nombre real del dispositivo
- o una identidad personal estable

al menos no de forma limpia, confiable y universal desde la web pública.

Puedes obtener algunas pistas del navegador y del dispositivo usando User-Agent Client Hints, incluyendo, en algunos casos, el modelo del dispositivo con `Sec-CH-UA-Model`, pero eso depende de soporte del navegador, opt-in del servidor y tiene límites de privacidad. Además, el ecosistema web está reduciendo exposición de datos de user agent precisamente por fingerprinting.

O sea: sí puedes saber “parece un iPhone / Android / Safari / Chrome”, pero no deberías diseñar el sistema esperando una identidad única tipo “teléfono exacto de esta persona”.

---

## Lo correcto conceptualmente
Yo lo modelaría así:

### No “clientes”
Sino:
**visitantes pseudónimos**

Porque en esta etapa tú realmente quieres medir:
- recurrencia
- frecuencia
- comportamiento longitudinal
- lealtad digital
- interés por platos y secciones

No necesitas saber el nombre real para obtener eso.

---

## Cómo funcionaría

### 1. Generas un `visitor_id`
En la primera visita:
- si no existe en `localStorage`, creas un UUID
- lo guardas
- lo usas en todos los eventos

En visitas siguientes:
- lees ese mismo `visitor_id`
- ya sabes que es el mismo navegador/dispositivo-contexto

---

### 2. Cada visita crea una `session_id`
Entonces tienes dos capas:
- `visitor_id` = identidad pseudónima persistente
- `session_id` = cada sesión concreta

---

### 3. Guardas una tabla de visitantes
No con nombre real, sino con algo tipo:
- `visitor_id`
- `first_seen_at`
- `last_seen_at`
- `total_sessions`
- `total_pageviews`
- `total_detail_opens`
- `total_add_to_cart`
- `total_purchases`
- `first_source`
- `last_source`
- `device_family`
- `browser_family`
- `region/country` aproximado
- `is_returning`
- `days_since_last_seen`

Eso ya es una base de datos muy útil.

---

## Qué preguntas te respondería
Muchísimas:
- ¿Cuántos visitantes únicos reales tuvimos este mes?
- ¿Cuántos regresaron?
- ¿Qué porcentaje regresa en 7 días?
- ¿Qué porcentaje regresa en 30 días?
- ¿Los recurrentes exploran menos o compran más?
- ¿Los nuevos miran más platos antes de decidir?
- ¿Qué canales traen visitantes que sí vuelven?
- ¿Qué páginas generan más retorno?
- ¿Los que vuelven terminan comprando más?

Eso es oro.

---

## Lo más valioso: recurrencia
Aquí está el verdadero superpoder.
Puedes construir métricas como:

### Nuevos vs recurrentes
- nuevos visitantes esta semana
- recurrentes esta semana
- ratio de retorno

### Tiempo hasta regreso
- mediana de días hasta segunda visita
- distribución:
	- volvió en 1 día
	- volvió en 3 días
	- volvió en 7 días
	- volvió en 30 días

### Frecuencia
- visitantes con 1 sesión
- visitantes con 2–3 sesiones
- visitantes con 4+ sesiones

### Lealtad digital
- usuarios que regresan al menú frecuentemente
- usuarios que regresan a ciertos platos
- usuarios que regresan más desde QR que desde Instagram

Eso ya empieza a parecer CRM light, aunque sin identidad personal real.

---

## Qué tan preciso es
Es útil, pero no perfecto.
Depende de:
- que no borren almacenamiento
- que usen el mismo navegador
- que no entren en incógnito
- que no cambien de dispositivo
- que no bloqueen storage/cookies

Así que no es “persona única universal”.
Es más bien:
**navegador / instalación / visitante pseudónimo persistente mientras el storage exista**

Y eso está bien. Para producto y marketing, suele ser suficiente.

---

## Qué NO haría
No intentaría “mejorarlo” con fingerprinting agresivo.
Porque:
- técnicamente es frágil
- navegadores están endureciendo defensas contra fingerprinting
- te metes en un terreno de privacidad mucho más delicado

---

## Privacidad: punto muy importante
Si haces esto bien, debe ser **pseudónimo**, no personal.
La ICO explica que la pseudonimización reemplaza identificadores directos por pseudónimos, pero esos datos siguen siendo personales desde el punto de vista legal.

### Traducción práctica
- no guardes nombres reales
- no guardes emails si no hacen falta
- no guardes nada que identifique directamente a la persona
- usa IDs técnicos
- documenta propósito y retención
- en reportes ejecutivos usa agregados

Eso te mantiene en un terreno mucho más sano.

---

## Cómo lo diseñaría de verdad

### Tabla `visitors`
- `visitor_id`
- `first_seen_at`
- `last_seen_at`
- `session_count`
- `pageview_count`
- `detail_open_count`
- `add_to_cart_count`
- `purchase_count`
- `first_source`
- `last_source`
- `device_type`
- `browser`
- `os`
- `country`
- `city_region`
- `is_internal`

### Tabla `sessions`
- `session_id`
- `visitor_id`
- `started_at`
- `ended_at`
- `entry_page`
- `source`
- `medium`
- `campaign`
- `device_type`
- `browser`
- `os`
- `connection_effective_type`
- `page_count`
- `detail_opens`
- `add_to_cart_count`
- `purchase_count`

### Tabla `events`
Todos los eventos ya atados a:
- `visitor_id`
- `session_id`

Con eso luego puedes reconstruir de todo.

---

## Métricas V2 potentísimas que salen de ahí

### 1. Visitantes únicos semanales/mensuales
Justo lo que tú quieres.

### 2. Returning visitor rate
Qué porcentaje vuelve.

### 3. Repeat visit frequency
Cada cuánto vuelve la gente.

### 4. Visitors by recency bucket
- vino hoy
- vino esta semana
- vino en los últimos 30 días
- dormido / inactivo

### 5. Lifetime engagement
- total sesiones por visitante
- total platos abiertos por visitante
- total compras por visitante

### 6. Visitor journey evolution
- primera visita: homepage → menú
- segunda visita: directo al menú
- tercera visita: menú → detalle → compra

Eso está durísimo.

---

## Qué puedes descubrir con eso
Por ejemplo:
- los que llegan por QR y vuelven dentro de 3 días convierten muchísimo mejor
- los que llegan por Instagram vuelven más tarde, pero exploran más eventos
- los recurrentes casi no leen historia del plato; van directo a comprar
- los nuevos abren muchos detalles antes de decidir
- los que vuelven varias veces terminan centrando su compra en 4 o 5 platos favoritos

Eso ya empieza a ser inteligencia comercial muy seria.

---

## Cómo debería verse en dashboards

### Dashboard: Visitors & Retention
- visitantes únicos por semana
- visitantes recurrentes por semana
- cohortes de retorno
- días hasta segunda visita
- sesiones por visitante
- top canales que generan retorno
- conversion rate nuevos vs recurrentes

### Dashboard: Customer-like behavior
- visitantes con 1 sesión
- con 2–3 sesiones
- con 4–10 sesiones
- con 10+ sesiones
- top platos entre recurrentes
- top páginas entre recurrentes

### Dashboard: Loyalty signals
- porcentaje de compras de visitantes recurrentes
- tiempo medio entre visitas
- categorías más revisadas por recurrentes
- probabilidad de add-to-cart en visita 1 vs visita 2 vs visita 3

---

## Cómo lo explicaría al equipo no técnico
No sería:
> “tenemos una base de datos de personas”

Sino:
> **“tenemos una base de datos de visitantes recurrentes del sitio”**

Eso es más correcto y más defendible.
Y aún así el valor de negocio es enorme.

---

## Mi recomendación final
Sí, esto vale muchísimo la pena.
Pero hazlo como:
- visitor identity pseudónima
- no fingerprinting agresivo
- no nombre real del dispositivo
- no identidad personal
- sí `visitor_id` persistente
- sí sesiones
- sí recurrencia
- sí historial de comportamiento por visitante

Eso te daría exactamente lo que te emociona:
- saber cuántos “clientes digitales” únicos tienes
- cuántos vuelven
- cuándo vuelven
- qué tanto exploran
- qué tan leales son al menú
- cómo cambia su comportamiento con el tiempo

Y sí: eso sería chulísimo y súper útil de verdad.
