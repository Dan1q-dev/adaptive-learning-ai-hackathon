from fastapi import APIRouter, Depends, HTTPException

from app.schemas import GenerateRequest, GenerateResponse
from app.services.quiz_generator import (
    QuizGenerationError,
    QuizGenerator,
    get_quiz_generator,
)


router = APIRouter()


@router.post("/generate", response_model=GenerateResponse)
async def generate_quiz(
    request: GenerateRequest,
    generator: QuizGenerator = Depends(get_quiz_generator),
) -> GenerateResponse:
    try:
        return await generator.generate(request)
    except QuizGenerationError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "code": "MODEL_ERROR",
                "message": "Не удалось получить корректный ответ модели",
            },
        ) from exc

