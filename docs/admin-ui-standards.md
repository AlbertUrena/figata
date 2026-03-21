# Admin UI Standards

## Toggle switches (required)

- `admin/app/` tiene una regla obligatoria: no se permite usar `<input type="checkbox">` directo en el panel.
- Para cualquier booleano (estado on/off), siempre se debe usar `renderToggle(...)` desde `admin/app/app.js`.
- El binding debe pasar por `bindToggles(rootEl, options)` para mantener accesibilidad y comportamiento uniforme.
- El estilo del toggle vive centralizado en `admin/app/styles.css` bajo clases `.fig-toggle*`.

## Accesibilidad minima del toggle

- `role="switch"` y `aria-checked`.
- Label clickable.
- Navegacion con teclado: `Tab`, `Space`, `Enter`.

## Guardrail de regresion

- Ejecutar `npm run check:admin-ui`.
- El comando falla si detecta `type="checkbox"` dentro de `admin/app/`.
