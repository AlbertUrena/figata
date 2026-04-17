# Comportamiento de decisión en el menú

URL: https://www.notion.so/33e2142e056180f5b1d5f01253a5c154

## Contenido

Sí, totalmente.
Esa métrica es buenísima.
De hecho, te acerca directamente a una pregunta muy poderosa:
> **¿cuánto explora una persona antes de decidir?**

---

## 🎯 Qué te permite entender esto
Con esta métrica puedes responder:
- si el menú ayuda a decidir rápido
- si la gente está indecisa
- si los destacados funcionan
- si el orden del catálogo ayuda o estorba
- qué canal trae usuarios curiosos vs decididos

---

## ⚙️ Qué trackear exactamente

---

### 📌 Evento base
Cada vez que un usuario abre un plato:
```plain text
item_detail_open
```

---

### 📦 Propiedades del evento
- item_id
- item_name
- category
- source
- session_id
- visitor_id
- position_in_menu
- opened_from
	- menu_grid
	- search
	- featured
	- upsell
	- pairings
	- story_link
- timestamp

---

## 📊 Métricas que salen de aquí

---

### 1. Total de aperturas
👉 Cuántas veces se abre el detalle
- mide interés bruto

---

### 2. Average detail opens per session
👉 Cuántos platos ve una persona antes de decidir

Ejemplo:
- promedio general: 3.4
- QR: 2.1
- Instagram: 5.8

💡 Insight inmediato:
- QR = más decidido
- Instagram = más explorador

---

### 3. Unique detail opens per session
👉 Platos únicos vistos por sesión
No es lo mismo:
- abrir 1 plato 3 veces
- abrir 3 platos distintos

👉 Debes medir ambos:
- detail_opens_per_session
- unique_detail_opens_per_session

---

## 🧠 Cómo interpretar esta métrica

---

### 🟢 Pocos detalles + compra
- alta intención
- decisión rápida
- menú claro

---

### 🔴 Muchos detalles + NO compra
- indecisión
- demasiadas opciones
- falta de claridad
- precio dudoso
- copy/foto débil

---

### 🟡 Muchos detalles + compra
- usuario explorador
- compara antes de decidir

---

👉 Importante:
Esta NO es una métrica aislada → es contexto de comportamiento.

---

## 📈 Métricas derivadas clave

---

### 📊 Promedios generales
- detalles abiertos por sesión
- detalles únicos por sesión

---

### 📡 Segmentación
- por canal (QR vs Instagram vs directo)
- por dispositivo
- por día/hora

---

### 🎯 Por resultado
Comparar:
- sesiones con compra
- sesiones con carrito
- sesiones sin acción

Ejemplo:
- con compra: 2.7 detalles
- sin compra: 5.9 detalles

👉 Insight: explorar demasiado = posible fricción

---

## 🔥 Métricas avanzadas (MUY poderosas)

---

### 1. Detail depth before decision
👉 Cuántos platos ve antes de:
- add to cart
- checkout
- purchase
- WhatsApp
- delivery

Ejemplo:
- antes de carrito: 2.3
- antes de compra: 3.1
- antes de abandono: 6.4

💥 Esto es oro → mide fricción real

---

### 2. Time to decision
👉 Tiempo desde primer detalle hasta acción
- primer detalle → carrito
- primer detalle → compra
- primer detalle → salida

👉 Te dice qué tan rápido decide la gente

---

## 🧠 Qué preguntas responde esto
- ¿la gente decide rápido o compara mucho?
- ¿qué canal trae intención real?
- ¿el menú ayuda o abruma?
- ¿los destacados reducen exploración innecesaria?
- ¿cuántos platos ve alguien antes de comprar?
- ¿explorar más ayuda o perjudica la conversión?

---

## 📊 Cómo mostrarlo en reportes

---

### 🧾 Sección: Comportamiento de decisión
- Promedio detalles por sesión: 3.8
- Detalles únicos por sesión: 3.1
- Con compra: 2.4
- Sin compra: 5.7

---

### 🧠 Insight ejemplo
> Usuarios desde QR deciden más rápido.
	Usuarios desde Instagram exploran más antes de decidir.

👉 Traducción:
- QR = intención
- Instagram = descubrimiento

---

## 👥 Segmentación avanzada

---

### Tipos de usuario
**Decididos**
- 1–2 detalles
- compra rápida

**Exploradores**
- 3–5 detalles
- comparan

**Indecisos**
- 6+ detalles sin compra

---

### Qué puedes analizar
- qué canal trae cada tipo
- qué platos generan comparación
- qué categorías generan fricción

---

## 🎯 Recomendación concreta
Sí o sí debes incluir esto.

---

### 📦 Taxonomía base
**Evento:**
- item_detail_open

---

### 📊 Métricas derivadas
- detail_opens_per_session
- unique_detail_opens_per_session
- detail_opens_before_add_to_cart
- detail_opens_before_purchase
- time_from_first_detail_to_decision

---

## 🔥 Por qué esto es tan valioso
Porque combinado con:
- canal
- add to cart
- purchase
- plato final

👉 te da una de las capas de inteligencia más potentes del sistema.

---

💡 En simple:
> Esto no mide clicks.
	Mide **cómo decide la gente**.

---

Si quieres, el siguiente paso brutal sería:
👉 diseñar el **modelo completo de decisión del usuario dentro del menú** (literalmente mapear el comportamiento completo).
