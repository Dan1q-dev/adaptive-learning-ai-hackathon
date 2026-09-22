import os
from typing import Protocol
from uuid import uuid4

from openai import AsyncOpenAI, OpenAIError
from pydantic import BaseModel, Field, ValidationError, model_validator

from app.schemas import GenerateRequest, GenerateResponse, Question


SYSTEM_PROMPT = """You create grounded multiple-choice quizzes from learning material.
Use only facts present in the supplied material. Write in the requested language.
Each question must test understanding rather than trivial word matching.
Provide plausible distractors, exactly four options, one correct option, a concise topic,
and a short explanation grounded in the material. Do not add markdown or commentary."""


class QuizGenerationError(RuntimeError):
    """Raised when a valid quiz cannot be produced."""


class QuizGenerator(Protocol):
    async def generate(self, request: GenerateRequest) -> GenerateResponse: ...


class QuizDraft(BaseModel):
    title: str = Field(min_length=1)
    questions: list[Question] = Field(min_length=1)

    @model_validator(mode="after")
    def question_ids_must_be_unique(self) -> "QuizDraft":
        question_ids = [question.id for question in self.questions]
        if len(question_ids) != len(set(question_ids)):
            raise ValueError("question ids must be unique")
        return self


class OpenAIQuizGenerator:
    def __init__(
        self,
        *,
        api_key: str | None = None,
        model: str | None = None,
        client: AsyncOpenAI | None = None,
    ) -> None:
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model = model or os.getenv("OPENAI_MODEL", "gpt-5-mini")
        self._client = client

    def _get_client(self) -> AsyncOpenAI:
        if self._client is not None:
            return self._client
        if not self.api_key:
            raise QuizGenerationError("OPENAI_API_KEY is not configured")
        self._client = AsyncOpenAI(api_key=self.api_key, timeout=45.0, max_retries=1)
        return self._client

    async def generate(self, request: GenerateRequest) -> GenerateResponse:
        prompt = self._build_prompt(request)

        try:
            response = await self._get_client().responses.parse(
                model=self.model,
                input=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                text_format=QuizDraft,
            )
            draft = response.output_parsed
        except QuizGenerationError:
            raise
        except (OpenAIError, ValidationError, TimeoutError) as exc:
            raise QuizGenerationError("Model request failed") from exc

        if draft is None:
            raise QuizGenerationError("Model did not return a parsed quiz")
        if len(draft.questions) != request.question_count:
            raise QuizGenerationError("Model returned an unexpected question count")

        return GenerateResponse(
            quiz_id=f"quiz-{uuid4().hex[:12]}",
            title=draft.title,
            questions=draft.questions,
        )

    @staticmethod
    def _build_prompt(request: GenerateRequest) -> str:
        return (
            f"Create exactly {request.question_count} questions.\n"
            f"Difficulty: {request.difficulty}.\n"
            f"Language: {request.language}.\n"
            "Question ids must be q1, q2, and so on. "
            "Each question must have option ids a, b, c, d.\n\n"
            "LEARNING MATERIAL:\n"
            f"{request.material}"
        )


def get_quiz_generator() -> QuizGenerator:
    return OpenAIQuizGenerator()

