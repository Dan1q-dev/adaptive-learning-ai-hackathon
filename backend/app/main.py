from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import evaluate, generate


app = FastAPI(title="Adaptive Learning AI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate.router, prefix="/api/v1", tags=["generation"])
app.include_router(evaluate.router, prefix="/api/v1", tags=["evaluation"])


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}

