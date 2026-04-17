# Sistema de exclusión de tráfico interno

URL: https://www.notion.so/33e2142e056180928d36f7804619ea18

## Contenido

Sí, es posible.
Pero hay que hacerlo bien.
Y aquí hay una verdad clave:
> **No existe una whitelist perfecta de dispositivos solo desde el frontend.**

---

## 🎯 La idea correcta
No pienses en:
> “whitelist de dispositivos”

Piensa en:
> **sistema de exclusión de tráfico interno**

---

## 🧠 El problema real
Quieres evitar que:
- dueños
- socios
- devs
- staff
- testers
- tú mismo

contaminen:
- views
- clicks
- add to cart
- funnels
- conversiones
- reportes

👉 Y eso es 100% correcto.

---

## ❌ Qué NO hacer
No confiar en:
- tipo de dispositivo
- modelo de teléfono
- navegador
- user agent

👉 Eso es frágil e inestable.

---

## ✅ Cómo hacerlo BIEN (por capas)

---

### 🟢 1. Modo interno manual (la más importante)
Ejemplo:
- `?internal=1`
- cookie: `figata_internal_user=true`
- localStorage flag
- toggle oculto

---

### 🔥 Comportamiento
Cuando está activo:
- opción A: no enviar eventos
- opción B: enviar con flag

👉 Recomendación:
**SIEMPRE enviarlos, pero marcados**

---

### 🟡 2. Identidad interna (mejor que device)
En vez de detectar dispositivo:
- usar cookie/token interno

Ejemplo:
- `is_internal: true`
- `internal_user_role: owner/dev/staff`
- `internal_label: alberto_iphone`

👉 Mucho más robusto.

---

### 🔵 3. Exclusión por entorno
NO trackear en:
- localhost
- staging
- preview
- admin panel

👉 Esto es obligatorio.

---

### 🟣 4. Exclusión por autenticación
Si hay login:
- usuarios admin → tráfico interno
- staff → tráfico interno

---

### 🟠 5. Reglas heurísticas (secundarias)
Ejemplos:
- query params de debug
- flags de testing
- navegación desde preview
- sesiones raras

👉 No usar como base, solo como apoyo.

---

## ⚖️ Dos enfoques posibles

---

### A. No enviar eventos internos
**Ventajas:**
- data limpia desde origen

**Desventajas:**
- pierdes debugging
- errores irreversibles

---

### B. Enviar eventos marcados (RECOMENDADO)
**Ventajas:**
- puedes filtrar
- mantienes trazabilidad
- más flexible

---

### 🎯 Recomendación clara
👉 Usa este:
> **Enviar TODO, pero marcar tráfico interno**

Y luego:
- dashboards → filtran
- reportes → excluyen

---

## ⚙️ Cómo se ve técnicamente

---

### Evento interno
```json
{
  "event": "item_detail_open",
  "item_id": "margherita",
  "is_internal": true,
  "traffic_class": "internal",
  "internal_user_label": "alberto_iphone",
  "environment": "production"
}
```

---

### Evento real
```json
{
  "event": "item_detail_open",
  "item_id": "margherita",
  "is_internal": false,
  "traffic_class": "customer",
  "environment": "production"
}
```

---

## 🔐 Cómo activar el modo interno

---

### Opción 1 — Query param
```plain text
?internal=1
```
👉 guarda cookie automáticamente

---

### Opción 2 — Página secreta
- `/internal-mode`
- toggle oculto
- botón admin

---

### Opción 3 — Token avanzado
- link único
- token firmado
- cookie persistente

👉 más robusto (opcional)

---

## ⚠️ Lo que NO puedes hacer perfecto
No puedes garantizar:
- “este device siempre es admin”

Porque:
- cookies se borran
- incógnito
- cambio de navegador
- múltiples usuarios

👉 Solución real:
**identidad por sesión, no por dispositivo**

---

## 🧱 Implementación recomendada (Figata)

---

### Capa 1
No trackear en:
- dev
- staging
- admin

---

### Capa 2
Flag persistente:
```plain text
figata_internal_traffic=true
```

---

### Capa 3
Todos los eventos incluyen:
- is_internal
- environment

---

### Capa 4
Dashboards:
```plain text
is_internal = false
```

---

### Capa 5 (opcional)
- internal_label=owner/dev/staff

---

## 🤖 Impacto en reportes con IA
Esto es CRÍTICO.
Tu pipeline debe:
- excluir tráfico interno
- o separarlo claramente

---

### 💡 Ejemplo de sección automática
```plain text
Control de calidad del dataset

- eventos internos excluidos: 183
- sesiones internas excluidas: 11
- fuentes excluidas: admin/dev/test
```

👉 Esto da confianza total.

---

## 🚨 Riesgos si NO lo haces
Contaminas:
- top platos
- tiempos
- conversiones
- funnels
- tests
- QA
- demos
- comparativas

👉 Y en tu caso (mucho testing), es grave.

---

## 🧠 Conclusión
Sí, hazlo.
Pero no como “whitelist de dispositivos”.

---

### 🎯 Enfoque correcto:
> **Sistema de exclusión de tráfico interno**

---

## 🔥 Implementación final (simple y poderosa)
1. `is_internal` en todos los eventos
2. activación por query param / cookie
3. exclusión por entorno
4. dashboards filtrados
5. reportes IA con solo tráfico real

---

💡 Resultado:
Datos **mucho más limpios**, sin perder visibilidad interna.

---

Si quieres, el siguiente paso lo puedo llevar a nivel ingeniería:
👉 lógica exacta (frontend + backend)
👉 cuándo enviar vs no enviar
👉 cómo estructurar middleware de tracking
