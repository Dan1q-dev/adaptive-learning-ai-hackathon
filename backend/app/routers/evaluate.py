from fastapi import APIRouter, HTTPException

from app.schemas import EvaluateRequest, EvaluateResponse


router = APIRouter()


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_answers(request: EvaluateRequest) -> EvaluateResponse:
    raise HTTPException(
        status_code=501,
        detail={"code": "NOT_IMPLEMENTED", "message": "Evaluation is not implemented yet"},
    )

