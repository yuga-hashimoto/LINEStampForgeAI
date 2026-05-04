# StampForge AI Worker

This worker processes image generation jobs created by the Next.js app.

Initial MVP backend:

- Provider: `CodexAppServerImageProvider`
- Transport: JSON-RPC over stdio
- Job store: local JSON file at `.data/generation-jobs.json`

Run once:

```bash
npm run worker:once
```

Run polling loop:

```bash
npm run worker
```

The default app-server command is:

```bash
codex app-server
```

Override it with:

```bash
CODEX_APP_SERVER_COMMAND=/path/to/codex CODEX_APP_SERVER_ARGS="app-server" npm run worker
```
