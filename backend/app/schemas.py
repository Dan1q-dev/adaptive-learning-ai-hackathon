from typing import Literal

from pydantic import BaseModel, Field, model_validator


Difficulty = Literal["auto", "easy", "medium", "hard"]
Level = Literal["beginner", "intermediate", "advanced"]


class GenerateRequest(BaseModel):
    material: str = Field(min_length=100)
    question_count: int = Field(default=5, ge=3, le=10)
    difficulty: Difficulty = "auto"
    language: str = Field(default="ru", min_length=2, max_length=8)


class Option(BaseModel):
    id: str = Field(min_length=1, max_length=16)
    text: str = Field(min_length=1)


class Question(BaseModel):
    id: str = Field(min_length=1, max_length=64)
    topic: str = Field(min_length=1)
    text: str = Field(min_length=1)
    options: list[Option] = Field(min_length=2, max_length=6)
    correct_option_id: str = Field(min_length=1, max_length=16)
    explanation: str = Field(min_length=1)

    @model_validator(mode="after")
    def correct_option_must_exist(self) -> "Question":
        option_ids = {option.id for option in self.options}
        if self.correct_option_id not in option_ids:
            raise ValueError("correct_option_id must match one of the option ids")
        if len(option_ids) != len(self.options):
            raise ValueError("option ids must be unique within a question")
        return self


class GenerateResponse(BaseModel):
    quiz_id: str = Field(min_length=1)
    title: str = Field(min_length=1)
    questions: list[Question] = Field(min_length=1)


class Answer(BaseModel):
    question_id: str = Field(min_length=1)
    option_id: str = Field(min_length=1)


class EvaluateRequest(BaseModel):
    quiz_id: str = Field(min_length=1)
    material: str = Field(min_length=1)
    questions: list[Question] = Field(min_length=1)
    answers: list[Answer]


class QuestionFeedback(BaseModel):
    question_id: str
    is_correct: bool
    selected_option_id: str | None = None
    correct_option_id: str
    explanation: str
    recommendation: str


class AdditionalTask(BaseModel):
    topic: str
    task: str


class EvaluateResponse(BaseModel):
    quiz_id: str
    score: float = Field(ge=0, le=100)
    correct_count: int = Field(ge=0)
    total: int = Field(ge=0)
    level: Level
    weak_topics: list[str]
    feedback: list[QuestionFeedback]
    additional_tasks: list[AdditionalTask]

