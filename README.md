# figata
Official website for Figata – pizza &amp; wine.

## Datos del Home (Populares + Detalles)
- Fuente principal de menú: `data/menu.json`
- Ingredientes + iconos: `data/ingredients.json`
- Mapeo auxiliar de alias: `data/ingredients-usage.json`
- `data/menu-index.json` es solo referencia/tooling (no runtime en UI).

## Cómo agregar un item nuevo al menú
1. Agrega el item dentro de su sección en `data/menu.json` (`sections[].items[]`).
2. Define al menos:
   - `id` (único)
   - `name`
   - `price` (número)
   - `ingredients` (array de ingredient IDs)
3. Para que aparezca en Populares, agrega su `id` en `featuredIds` dentro de `data/menu.json`.
4. Para buen rendering en UI:
   - `descriptionShort`
   - `descriptionLong`
   - `image` (opcional; si falta, la card usa placeholder)

## Cómo asignar ingredientes
1. En el item del menú, usa `ingredients` con IDs existentes en `data/ingredients.json`.
2. Ejemplo:
   - `"ingredients": ["mozzarella", "pomodoro", "albahaca"]`
3. Si un ID no existe, la UI no crashea y muestra warning en consola.

## Cómo agregar un icono nuevo de ingrediente
1. Agrega el asset en `assets/Ingredients/` (o ruta equivalente usada en JSON).
2. Registra el icono en `data/ingredients.json` bajo `icons`.
3. Asocia el ingrediente en `data/ingredients.json` bajo `ingredients`:
   - `icon` (key del icono)
   - `label`/`name`
   - `aliases` (recomendado)
4. Si necesitas mejorar matching por alias legacy, agrega mapeo en `data/ingredients-usage.json` bajo `ingredientAliasesToIcon`.
