# Cómo distinguir tráfico “en restaurante” vs remoto

URL: https://www.notion.so/33f2142e05618047b906e1d320c695dc

## Contenido

Sí, te entiendo perfecto.
Y esta pregunta es clave.
> Si no la resuelves bien, puedes interpretar MAL toda la analítica.

---

## 🧠 Idea central
> **No toda visita al menú = visita física al restaurante**

Eso sería un error.

---

## 🎯 Lo que realmente tienes que distinguir
Tipos de tráfico:
- tráfico desde el local
- tráfico desde redes (Instagram, etc.)
- tráfico remoto (desde casa)
- tráfico híbrido (vino al local y luego volvió desde otro lugar)

👉 No existe una señal única.
👉 Se resuelve combinando señales.

---

## ⚡ Resumen rápido

### Cómo saber de dónde vino el tráfico
Con:
- UTMs
- parámetros en la URL
- referrer
- QR con identificador
- señales secundarias

### Cómo saber si estaba en el restaurante
No con certeza absoluta.
Pero sí puedes clasificar:
- in_restaurant_confirmed
- in_restaurant_probable
- remote_probable
- unknown

👉 Esto ya es MUY poderoso.

---

## ❌ Lo primero: NO usar IP como base
Aunque suene lógico, **no es fiable**.

Problemas:
- IPs compartidas
- datos móviles vs Wi-Fi
- geolocalización imprecisa
- CGNAT
- cambios constantes

👉 Conclusión:
> IP = señal secundaria
	❌ no fuente principal

---

## ✅ La señal MÁS importante: el link de entrada

---

### 📱 Instagram bio
Ejemplo:
```plain text
?utm_source=instagram&utm_medium=bio&utm_campaign=menu
```

👉 Sabes exactamente de dónde vino.

---

### 📍 QR del restaurante
Ejemplo:
```plain text
?entry=restaurant_qr
```
o:
```plain text
?utm_source=qr&utm_medium=in_store
```

👉 Esta es la señal más fuerte de “estaba en el local”.

---

### 🔗 Tráfico directo / compartido
- sin UTM
- desde WhatsApp
- desde historial

👉 Clasificación:
- direct
- shared
- unknown

---

## 🧠 Concepto CLAVE: separar Source vs Context

---

### 1. Source (de dónde vino)
- instagram
- qr
- direct
- google
- shared

### 2. Context (dónde estaba)
- in_restaurant
- remote
- unknown

👉 IMPORTANTÍSIMO:
**No son lo mismo.**

---

## ⚙️ Cómo modelarlo bien

---

### Campo: `entry_source`
Ejemplos:
- restaurant_qr
- instagram_bio
- direct
- shared_link
- google

### Campo: `visit_context`
Ejemplos:
- in_restaurant_probable
- in_restaurant_confirmed
- remote_probable
- unknown

---

## 🔍 Cómo inferir “in_restaurant”

---

### 🟢 Regla fuerte #1: entrada por QR
Si entra por QR:
👉 señal fuerte de que estaba en el local
→ marcar:
```plain text
visit_context = in_restaurant_probable
```

---

### 🟢 Regla fuerte #2: comportamiento inmediato
Si además:
- navega de inmediato
- abre menú rápido
- ve varios platos
- interactúa

👉 aumenta la probabilidad

---

### 🟢 Regla fuerte #3: Wi-Fi del local (opcional)
Si detectas red del restaurante:
```plain text
visit_context = in_restaurant_confirmed
```

👉 pero solo como señal adicional

---

## 🌐 Cómo inferir “remote”

---

### Casos claros:
- viene de Instagram
- viene de Google
- viene de link compartido
- vuelve días después

👉 entonces:
```plain text
visit_context = remote_probable
```

---

## 🧠 Regla de oro
> ❗ No clasifiques “persona”
	✔ Clasifica **sesiones**

---

### Ejemplo real
**Sesión 1**
- entra por QR
	→ in_restaurant_probable

**Sesión 2**
- vuelve desde casa
	→ remote_probable

**Sesión 3**
- entra por Instagram
	→ remote_probable

👉 misma persona, distinto contexto

---

## 📍 Cómo usar el QR correctamente
Debe ser único y claro:
```plain text
figatapizza.com/menu?entry=restaurant_qr
```

### 🔥 Importante
Ese parámetro debe:
- guardarse en la sesión
- heredarse a todos los eventos

---

## ⚠️ Tráfico directo = ambiguo
Puede ser:
- alguien en el local
- alguien en casa
- alguien que guardó el link

👉 entonces:
```plain text
visit_context = unknown
```

---

## 🧩 Señales secundarias (para mejorar precisión)

---

### ⏰ Hora
- 7–9 PM → más probable in-store
- 2 AM → probablemente remoto

### 🧠 Comportamiento
- rápido → mesa
- largo/exploración → casa

### 🔁 Recurrencia
- QR hoy → válido
- regreso mañana → NO in-store

### 📶 Wi-Fi
- útil pero no suficiente

### 🎯 CTAs
**In-store:**
- menú
- platos

**Remote:**
- ubicación
- eventos
- comparativa

---

## 📊 Cómo reportarlo

---

### Tráfico por source
- Instagram
- QR
- Directo
- Compartido
- Google

### Tráfico por contexto
- In restaurant probable
- Remote probable
- Unknown

### Ejemplo cruzado

| Tipo | Sesiones | Add to cart | Purchase |
|---|---:|---:|---:|
| In-store | 1,240 | 18.2% | 6.3% |
| Remote | 980 | 9.1% | 2.8% |
| Unknown | 410 | 7.4% | 2.2% |

👉 Esto es oro.

---

## 🚀 Beneficios reales

### 1. Evitas inflar visitas del restaurante
### 2. Entiendes uso real del QR
### 3. Separas comportamiento
- in-store = rápido
- remoto = exploración
### 4. Mides mejor conversión
### 5. Reportes mucho más inteligentes
Ejemplo:
- “QR convierte más rápido”
- “Instagram explora más”
- “in-store ve menos platos antes de decidir”

---

## ❌ Qué NO hacer
No decir:
> “esto fue una visita real al restaurante”

Sí decir:
> **“sesión clasificada como in_restaurant_probable”**

---

## 🎯 Modelo final recomendado

### Campo 1: `entry_source`
- restaurant_qr
- instagram_bio
- direct
- shared
- google

### Campo 2: `visit_context`
- in_restaurant_probable
- remote_probable
- unknown

### Campo 3: `context_confidence`
- high
- medium
- low

### Ejemplo
```plain text
entry_source = restaurant_qr
visit_context = in_restaurant_probable
confidence = high
```

---

## 🧠 Conclusión
Sí, puedes saber bastante bien:
- de dónde vino el tráfico
- si probablemente estaba en el restaurante

Pero:
- ❌ no con IP sola
- ❌ no con certeza absoluta

## 🔥 Forma correcta
- controlar URLs de entrada
- guardar source en sesión
- inferir contexto con reglas
- separar source vs context
- tratar “in-store” como inferencia

💥 Resultado:
> Analítica muchísimo más limpia, honesta y útil.

---

Si quieres, el siguiente paso lo llevamos a implementación real:
👉 UTMs exactos + reglas + lógica de clasificación lista para código
