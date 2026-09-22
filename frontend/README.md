# Frontend

React + Vite + TypeScript prototype for the adaptive learning service.

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`. By default it uses contract-compatible mock data from `src/mockApi.ts` (a five-question demo about photosynthesis).

To connect the backend, create a local `.env` file with `VITE_API_MODE=api` and start the backend on `http://localhost:8000`. Vite proxies `/api` requests to that address. Restart the frontend after changing `.env`. For a backend on another origin, also set `VITE_API_BASE_URL` and allow the frontend origin in the backend CORS configuration.
