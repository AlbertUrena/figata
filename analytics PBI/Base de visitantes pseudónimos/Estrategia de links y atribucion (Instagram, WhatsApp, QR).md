# Estrategia de links y atribución (Instagram, WhatsApp, QR)

URL: https://www.notion.so/33f2142e0561803daf08e805b7c8878e

## Contenido

Sí, esto cambia bastante el panorama para Instagram — y es **muy buena noticia**.

---

## 🧠 Insight clave
Si Instagram **muestra solo el dominio limpio** aunque el link tenga UTMs:
> tienes lo mejor de ambos mundos
- ✅ atribución clara para analytics
- ✅ presentación visual limpia

---

# 🎯 Decisión por canal

## 📱 Instagram bio
👉 Aquí sí usaría UTMs completos

Ejemplo:
```plain text
https://figatapizza.com/?utm_source=instagram&utm_medium=bio&utm_campaign=main
```

### 💡 Por qué
- Instagram oculta los parámetros
- no afecta estética
- te da atribución perfecta

### ✅ Conclusión
> No necesitas vanity path aquí

## 💬 WhatsApp
👉 Aquí sí usaría **vanity path**

Ejemplo:
```plain text
figatapizza.com/wsp
```

### 💡 Por qué
- en WhatsApp el link sí se ve completo
- UTMs largos se ven feos
- peor experiencia

### ✅ Conclusión
> Mantener `/wsp`

## 📍 QR del restaurante
👉 También usaría **vanity path corto**

Ejemplo:
```plain text
figatapizza.com/qr
```

### 💡 Por qué
- QR más limpio
- menor densidad
- más elegante
- puedes cambiar lógica sin reimprimir

### ⚠️ Importante
Más caracteres → QR más denso

### ✅ Conclusión
> Mantener `/qr`

---

# 🧠 Arquitectura final (muy limpia)

## 🔍 Cómo se identifica cada canal

### Instagram
Por UTM:
- `utm_source=instagram`
- `utm_medium=bio`

### WhatsApp
Por ruta:
- `/wsp`

### QR restaurante
Por ruta:
- `/qr`

### Google
Por:
- referrer
- source orgánico

### Directo
- fallback
- unknown

---

# 🧱 Sistema de atribución resultante

## 📌 Campo: `entry_source`
- instagram_bio
- whatsapp_share
- restaurant_qr
- google_organic
- direct
- unknown

## 📌 Campo: `visit_context`
- in_restaurant_probable
- remote_probable
- unknown

## 🧠 Reglas simples

### Canal
- Instagram → UTM
- WhatsApp → `/wsp`
- QR → `/qr`
- Google → referrer
- Directo → fallback

### Contexto
- QR → `in_restaurant_probable`
- Instagram / WhatsApp / Google → `remote_probable`
- Directo → `unknown`

---

# ⚠️ Qué evitar

## ❌ No hacer
- UTMs largos en QR
- depender solo de referrer
- usar IP como señal principal

---

# ✨ Beneficio grande de esta arquitectura
Tienes:
- estética limpia en todos los canales
- atribución clara
- sistema consistente
- flexibilidad futura

👉 Traducción:
> resolviste una de las partes más incómodas del tracking

---

# 🧪 Buenas prácticas para UTMs
Aunque Instagram los oculte:
👉 mantenerlos:
- cortos
- consistentes
- legibles

### Ejemplo ideal
```plain text
?utm_source=instagram&utm_medium=bio&utm_campaign=main
```
o:
```plain text
?utm_source=instagram&utm_medium=bio&utm_campaign=home
```

## ❌ Evitar
- UTMs largos
- nombres raros
- inconsistencias

---

# 🧠 Conclusión

## ✅ Instagram
- usar UTMs
- no vanity path

## ✅ WhatsApp
- usar `/wsp`

## ✅ QR
- usar `/qr`

## 💥 Resultado
- links limpios
- QR limpio
- WhatsApp limpio
- analytics sólido

👉 Es literalmente la combinación óptima.

---

## 🔥 Veredicto final
Sí:
> excelente decisión

---

Si quieres, el siguiente paso lo llevamos a implementación real:
👉 naming exacto de UTMs + rutas + lógica de captura en frontend/backend
