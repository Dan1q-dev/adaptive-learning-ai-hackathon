# Frontend

React + Vite + TypeScript prototype for the adaptive learning service.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

The app runs at `http://localhost:5173` and calls the backend through the Vite proxy at `http://localhost:8000`. Start the backend first, as described in `../backend/README.md`.

For a standalone demo without the backend, set `VITE_API_MODE=mock` before running Vite. On PowerShell: `$env:VITE_API_MODE='mock'; pnpm dev`.

Set `VITE_API_BASE_URL` if the API is hosted elsewhere (default: `/api/v1`). A deployed frontend needs `/api` routed to the backend.
