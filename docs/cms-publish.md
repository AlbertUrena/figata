# CMS Publish Modes (Preview vs Production)

El endpoint sigue siendo:

`POST /.netlify/functions/publish`

Y mantiene el payload base:

```json
{
  "menu": {},
  "availability": {}
}
```

Opcionalmente acepta:

```json
{
  "target": "preview"
}
```

## Modos

- `preview` (default): publica cambios en branch de preview para validar sin tocar produccion.
- `production`: publica cambios en branch de produccion para disparar deploy productivo.

Si `target` no se envía, la function usa `preview` por defecto para evitar gastar creditos de deploy de produccion en cambios pequeños.

## Branches y env vars

- `CMS_PREVIEW_BRANCH` (opcional): branch de preview. Default: `cms-preview`.
- `GH_BRANCH` o `GITHUB_BRANCH` (opcional): branch de produccion. Default: `master`.
- `GITHUB_TOKEN` o `GH_TOKEN` (requerido): token GitHub con permisos de escritura.
- `GITHUB_OWNER` o `GH_OWNER` (requerido): owner del repo.
- `GITHUB_REPO` o `GH_REPO` (requerido): nombre del repo.

## Protecciones incluidas

- Auth requerida por Netlify Identity (`context.clientContext.user`).
- No se permite branch arbitraria desde cliente (solo `preview` o `production`).
- Guard de no-op: si no hay cambios reales en `menu`/`availability`, responde `skipped` y no crea commit.
- Rate limit simple por usuario: max 1 publish cada ~30s.
