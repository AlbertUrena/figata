# Wi-Fi Assist + Analítica in-store

URL: https://www.notion.so/33f2142e0561806e8904e8c862c36368

## Contenido

Sí, te entendí — y la idea tiene muchísimo potencial.
Pero la pieza clave es esta:
> **la idea es excelente a nivel de UX y analítica**
	pero hay límites duros a nivel técnico (navegador / sistema operativo)

---

## 🧠 Separación clave
Hay que dividir esto en dos partes:

### 1. 💡 La idea estratégica (MUY buena)
Que alguien entre por el QR del menú y vea un modal tipo:
> “¿Quieres una experiencia más fluida? Conéctate al Wi-Fi de Figata.”

👉 Eso es excelente.

### 🎯 Qué te aporta
- mejor velocidad percibida
- experiencia más cuidada
- señal más fuerte de sesión in-store
- mejor clasificación analítica
- puente entre UX y data

👉 Conclusión:
> No es una idea loca — es una idea **muy inteligente**

## 🚫 2. Lo que NO se puede hacer
Desde una web normal (iPhone / Android):
No puedes:
- conectarte automáticamente al Wi-Fi
- cambiar de red
- ver el SSID actual
- encender Wi-Fi
- controlar ajustes del sistema

👉 Todo eso está bloqueado por seguridad.

### 🎯 Traducción correcta
No es:
> “el botón conecta al Wi-Fi”

Es:
> **“el sistema ayuda a conectarse al Wi-Fi de forma fácil”**

👉 Y eso SÍ es viable.

---

# 🧩 Diseño correcto de la experiencia

## 🟣 Wi-Fi Assist Overlay
No es un popup cualquiera.
Es un **overlay utilitario elegante**:
- modal centrado
- fondo bloqueado
- CTA principal
- CTA secundario
- opción de cerrar

## 🧾 Ejemplo de contenido
**Título**
Conéctate al Wi-Fi Figata

**Texto**
Para una experiencia más rápida con fotos y videos del menú

**Contenido**
- Red: Figata Guest
- Contraseña: ••••••••
- Botón: Copiar contraseña

**Botones**
- Ver instrucciones
- Continuar sin conectarme

👉 UX clara, útil y sin fricción innecesaria.

---

# ⚙️ Cómo facilitar la conexión (opciones reales)

## 🟡 Opción A — Credenciales manuales
- mostrar red
- mostrar contraseña
- botón copiar

👉 Funciona, pero básica

## 🟢 Opción B — QR de Wi-Fi
Formato estándar que permite conexión rápida.

👉 Problema:
- no sirve en el mismo teléfono
- sí sirve en:
	- pantallas físicas
	- tablets
	- displays

## 🔵 Opción C — Guest Wi-Fi / captive portal
La opción más pro.

Flujo:
1. usuario se conecta en ajustes
2. red lo redirige a portal

### Ventajas
- confirmación fuerte de presencia física
- mejor integración
- señal analítica más fiable

### Desventaja
- requiere infraestructura Wi-Fi

## 🟣 Opción D — Guía desde el modal (MEJOR V1)
👉 La recomendación práctica:
- mostrar red + contraseña
- botón copiar
- mini instrucciones

👉 No es automático, pero sí útil y elegante.

---

# 📊 Valor analítico real

## ✅ Lo que SÍ puedes confirmar
Si la sesión navega desde el Wi-Fi del local:
```plain text
visit_context = in_restaurant_confirmed_wifi
```

👉 Señal MUCHO más fuerte que QR

## ⚠️ Lo que NO debes hacer
No asumir:
- que todas las sesiones futuras son in-store
- que el visitante siempre está en el local

👉 Clasifica sesiones, no personas.

---

# 🧠 Modelo analítico mejorado

## Caso 1 — QR sin Wi-Fi
```plain text
entry_source = restaurant_qr
visit_context = in_restaurant_probable
```

## Caso 2 — QR + Wi-Fi local
```plain text
entry_source = restaurant_qr
visit_context = in_restaurant_confirmed_wifi
```

## Caso 3 — regreso desde casa
```plain text
entry_source = direct
visit_context = remote_probable / unknown
```

## Caso 4 — visitante con historial in-store
```plain text
has_prior_in_restaurant_visit = true
```

👉 pero sin asumir contexto actual

---

# 📈 Beneficio de negocio

## 👥 Usuarios en restaurante
- decisiones rápidas
- uso real del menú
- foco en claridad y velocidad

## 🌐 Usuarios remotos
- exploración
- branding
- eventos
- contenido

👉 Son comportamientos COMPLETAMENTE distintos.

## 💥 Con Wi-Fi puedes medir
- % de sesiones QR confirmadas
- comportamiento in-store real
- impacto de la conexión en consumo
- uso de contenido pesado (video, fotos)

---

# 🧠 Reglas UX inteligentes
No hacerlo invasivo.

## Mostrar solo si:
- viene de `/qr`
- no está en Wi-Fi del local
- no lo cerró ya
- no lo vio recientemente

👉 Resultado:
- elegante
- no molesto
- útil

---

# 🚫 Qué NO haría
- asumir que QR = presencia confirmada
- depender solo de IP
- prometer conexión automática
- hacer modal agresivo

---

# 🛠️ Plan realista por fases

## V1
- detectar `restaurant_qr`
- mostrar Wi-Fi modal
- trackear eventos:
	- wifi_prompt_shown
	- wifi_prompt_dismissed
	- wifi_prompt_cta_clicked
	- wifi_copy_password

## V2
- integrar con infraestructura Wi-Fi
- detectar IP del local
- clasificar:
```plain text
in_restaurant_confirmed_wifi
```

## V3
- usar en dashboards
- comparar:
	- QR vs Wi-Fi confirmado
	- remoto vs in-store
	- comportamiento por contexto

---

# 🧠 Conclusión
Sí:
> la idea está durísima

Pero bien entendida como:
> **onboarding in-store + mejora de conexión + señal analítica fuerte**

## 🔥 Corrección conceptual clave
No es:
> “la web conecta al Wi-Fi”

Es:
> **“la web facilita la conexión y usa el Wi-Fi como señal de presencia real”**

💥 Y eso te da dos beneficios enormes al mismo tiempo:
- mejor experiencia para el cliente
- mejor inteligencia analítica para Figata

---

Si quieres, el siguiente paso lo llevamos a implementación directa:
👉 diseño exacto del modal + lógica + eventos + condiciones de disparo listas para código
