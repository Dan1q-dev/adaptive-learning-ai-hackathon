from fastapi import APIRouter, HTTPException

from app.schemas import GenerateRequest, GenerateResponse


router = APIRouter()


@router.post("/generate", response_model=GenerateResponse)
async def generate_quiz(request: GenerateRequest) -> GenerateResponse:
    raise HTTPException(
        status_code=501,
        detail={"code": "NOT_IMPLEMENTED", "message": "Generation is not implemented yet"},
    )

