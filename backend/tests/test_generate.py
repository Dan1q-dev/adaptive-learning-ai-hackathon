from fastapi.testclient import TestClient

from app.main import app
from app.schemas import GenerateResponse, Option, Question
from app.services.quiz_generator import QuizGenerator, get_quiz_generator


MATERIAL = (
    "Фотосинтез — процесс преобразования энергии света в химическую энергию. "
    "Световая фаза проходит на мембранах тилакоидов хлоропласта, где образуются "
    "АТФ и НАДФН. Эти вещества затем используются в цикле Кальвина."
)


def sample_response() -> GenerateResponse:
    return GenerateResponse(
        quiz_id="quiz-test-001",
        title="Фотосинтез",
        questions=[
            Question(
                id=f"q{index}",
                topic="Световая фаза",
                text=f"Тестовый вопрос {index}?",
                options=[
                    Option(id="a", text="Вариант A"),
                    Option(id="b", text="Вариант B"),
                    Option(id="c", text="Вариант C"),
                    Option(id="d", text="Вариант D"),
                ],
                correct_option_id="b",
                explanation="Объяснение основано на материале.",
            )
            for index in range(1, 6)
        ],
    )


class FakeQuizGenerator(QuizGenerator):
    async def generate(self, request):
        assert request.question_count == 5
        return sample_response()


def test_generate_returns_contract_shape() -> None:
    app.dependency_overrides[get_quiz_generator] = lambda: FakeQuizGenerator()
    try:
        response = TestClient(app).post(
            "/api/v1/generate",
            json={"material": MATERIAL, "question_count": 5},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    payload = response.json()
    assert payload["quiz_id"] == "quiz-test-001"
    assert len(payload["questions"]) == 5
    assert set(payload["questions"][0]) == {
        "id",
        "topic",
        "text",
        "options",
        "correct_option_id",
        "explanation",
    }
    assert payload["questions"][0]["correct_option_id"] in {
        option["id"] for option in payload["questions"][0]["options"]
    }


def test_generate_rejects_short_material() -> None:
    response = TestClient(app).post(
        "/api/v1/generate",
        json={"material": "Слишком коротко"},
    )

    assert response.status_code == 422

