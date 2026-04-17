# Data de 1 año + atribución limpia (sin UTMs feos)

URL: https://www.notion.so/33f2142e056180899407d0955c5bde4f

## Contenido

Aquí hay dos temas conectados:
1. qué tan valiosa es una base de datos de 1 año sin POS
2. cómo atribuir tráfico sin ensuciar links

---

## 🧠 Idea clave
> Aunque no tengas POS, **un año de data bien capturada es brutalmente valioso**

No te dice ventas confirmadas, pero sí:
- demanda
- interés
- intención
- recurrencia
- comportamiento real
- uso del producto

---

# 1. 📅 Qué tan rica es una base de 1 año

## ❌ Lo que NO te da
- ventas confirmadas
- ticket real
- cierre en caja
- ingreso por plato

## ✅ Lo que SÍ te da (y es muchísimo)
- uso real del sitio
- cuándo la gente consulta el menú
- qué platos concentran atención
- cuánto exploran antes de decidir
- qué contenido consumen
- patrones por hora / día / temporada
- qué partes generan deseo
- si el sitio es herramienta o solo vitrina

## 🔍 Con 12 meses desbloqueas cosas grandes

### A. Ritmos reales del negocio
- meses fuertes vs débiles
- días más activos
- horas pico reales
- horas de “browse” vs decisión

### B. Interés acumulado por plato
- platos más abiertos
- platos que se revisitan
- platos “ancla” del menú
- platos que generan curiosidad constante

👉 Aunque no sepas si se vendieron, sabes si **interesan**

### C. Uso del contenido premium
Puedes validar si realmente funcionan:
- historia del plato
- maridajes
- microvideos
- fotos

👉 Saber:
- si llegan ahí
- cuándo
- quién
- si cambia comportamiento

### D. Recurrencia
Puedes medir:
- visitantes recurrentes
- uso repetido del menú
- hábito digital

👉 Esto mide **relación con la marca**

### E. Descubrimiento vs intención
Puedes separar:
- curiosos
- exploradores
- decididos
- recurrentes

👉 Esto mejora TODO el diseño del sitio

---

# 2. 🧠 Qué decisiones puedes tomar (sin POS)

## 🧱 A. Arquitectura del menú
- qué categorías subir
- qué platos destacar
- qué mover
- qué sobra

## 🎥 B. Media
- dónde invertir en fotos/video
- qué platos lo justifican
- dónde bajar peso

## ⚡ C. Performance
- subir/bajar calidad
- usar más o menos video
- adaptar según conexión

## 🧾 D. Contenido
- qué secciones sirven
- qué nadie ve
- qué mejorar
- qué eliminar

## 📡 E. Canales
- cuál trae tráfico profundo
- cuál trae tráfico superficial
- cuál genera relación

## 🏪 F. Operación
- horarios clave
- momentos de decisión
- cuándo empujar contenido

## 🧭 G. Roadmap
Después de 1 año puedes decidir:
- si integrar POS
- si mejorar checkout
- si invertir en CRM
- si simplificar UX
- si añadir recomendaciones

---

# 3. ⚠️ Qué NO debes afirmar
Sin POS, NO digas:
- “plato más vendido”
- “venta confirmada”
- “cliente real”

## ✔️ Lo correcto
- más visto
- más abierto
- más explorado
- más añadido
- mayor intención

👉 Igual de útil, pero honesto

---

# 4. 🎯 Problema de UTMs feos
Tienes razón:
- UTMs largos ensucian
- QR se vuelve denso
- estética se daña

👉 Además:
Más caracteres → QR más complejo y denso

## ✅ Solución correcta: rutas limpias (vanity paths)

### Ejemplos
- Instagram → `figatapizza.com/ig`
- QR → `figatapizza.com/qr`
- WhatsApp → `figatapizza.com/wsp`

### Qué pasa detrás
Internamente guardas:
- entry_source = instagram_bio
- entry_source = restaurant_qr

👉 Usuario ve limpio
👉 Tú tienes atribución perfecta

---

# 5. 📡 Cómo saber de dónde vino sin UTMs visibles

## 🟡 Opción A: referrer
A veces puedes usar:
- `document.referrer`

Pero tiene problemas:
- no siempre viene
- puede estar bloqueado
- apps lo eliminan

👉 Útil, pero no suficiente

## 🟢 Opción B (la buena): rutas controladas
- `/ig`
- `/qr`
- `/wsp`

👉 Esto es robusto y limpio

---

# 6. 🔍 ¿Y Google?
Aquí es distinto:
- sí suele venir con referrer
- analytics puede detectarlo

👉 No necesitas vanity path para SEO

## Estrategia ideal
- Instagram → `/ig`
- QR → `/qr`
- Google → referrer
- Direct → normal

---

# 7. 📍 In-store vs remoto (bien modelado)

## ❗ Error común
> “visita al sitio = visita al restaurante”

❌ Incorrecto

## ✅ Modelo correcto

### Campo 1: `entry_source`
- instagram_bio
- restaurant_qr
- google
- direct
- shared

### Campo 2: `visit_context`
- in_restaurant_probable
- remote_probable
- unknown

## 🧠 Regla clave
> Clasifica sesiones, no personas

### Ejemplo
**Sesión 1**
- QR → in_store

**Sesión 2**
- vuelve desde casa → remote

👉 misma persona, distinto contexto

---

# 8. ⚙️ Sistema recomendado para Figata

## 🔗 Links
- IG → `/ig`
- QR → `/qr`

## 🧠 Captura
Guardar en sesión:
- entry_source
- entry_path
- referrer
- source_confidence

## 📍 Clasificación
- `/qr` → in_restaurant_probable
- `/ig` → remote_probable
- Google → remote
- Direct → unknown

---

# 9. 🚀 Qué te da un año con esto
Puedes saber:
- uso real del menú en el local
- tráfico remoto vs presencial
- recurrencia
- hábitos
- patrones de decisión
- impacto de UX
- valor de contenido
- comportamiento por canal

## 💥 Traducción real
> No tienes ventas confirmadas
	Pero tienes **inteligencia de producto y comportamiento de altísimo nivel**

---

# 🎯 Recomendación final

## ❌ No usar
- UTMs largos visibles
- IP como base
- links feos

## ✅ Sí usar
- rutas limpias (`/ig`, `/qr`)
- referrer como apoyo
- analytics estructurado
- separación:
	- entry_source
	- visit_context

## 🧠 Conclusión
Un año de esta data te da:
- patrones reales
- señales de intención
- comportamiento profundo
- decisiones estratégicas claras

💥 No es data de ventas…
pero sí es **data de cómo piensa y decide tu cliente**

---

Si quieres, el siguiente paso lo bajamos a código:
👉 sistema exacto de atribución + reglas + naming listo para implementar
