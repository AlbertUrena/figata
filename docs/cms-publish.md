# Legacy CMS Publish Notes

This file is kept only as historical context.

The supported publish runtime is now:

- `POST /api/publish`
- implemented by `cloudflare/admin/worker.js`
- backed by `cloudflare/common/publish-service.js`
- authenticated through Cloudflare Access, not Netlify Identity

For the current implementation, read:
- `docs/developers/workflows/publish-pipeline.md`
- `docs/developers/admin/admin-panel.md`
- `docs/developers/tooling/build-and-scripts.md`
