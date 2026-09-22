# Backend

## Run locally

```powershell
cd backend
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item ..\.env.example ..\.env
```

Set `OPENAI_API_KEY` in the repository-root `.env`, then run:

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000 --env-file ..\.env
```

Swagger UI: `http://localhost:8000/docs`.

## Test

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest -q
```
