from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)

QUESTIONS = [
    {"id": "q1", "topic": "Дроби", "text": "Сколько будет 1/2 + 1/2?", "options": [{"id": "a", "text": "1"}, {"id": "b", "text": "2"}], "correct_option_id": "a", "explanation": "Две половины составляют целое."},
    {"id": "q2", "topic": "Дроби", "text": "Что равно 1/4?", "options": [{"id": "a", "text": "25%"}, {"id": "b", "text": "50%"}], "correct_option_id": "a", "explanation": "Одна четверть равна 25 процентам."},
    {"id": "q3", "topic": "Уравнения", "text": "x + 2 = 5. Чему равен x?", "options": [{"id": "a", "text": "3"}, {"id": "b", "text": "7"}], "correct_option_id": "a", "explanation": "Вычтите 2 из обеих частей уравнения."},
]


def evaluate(answers):
    return client.post("/api/v1/evaluate", json={"quiz_id": "quiz-test", "material": "Учебный материал для проверки оценки.", "questions": QUESTIONS, "answers": answers})


def test_all_correct_is_advanced():
    response = evaluate([{"question_id": "q1", "option_id": "a"}, {"question_id": "q2", "option_id": "a"}, {"question_id": "q3", "option_id": "a"}])
    assert response.status_code == 200
    assert response.json()["score"] == 100
    assert response.json()["level"] == "advanced"


def test_two_of_three_is_intermediate():
    data = evaluate([{"question_id": "q1", "option_id": "a"}, {"question_id": "q2", "option_id": "a"}, {"question_id": "q3", "option_id": "b"}]).json()
    assert data["level"] == "intermediate"
    assert data["weak_topics"] == ["Уравнения"]


def test_one_of_three_is_beginner():
    data = evaluate([{"question_id": "q1", "option_id": "a"}, {"question_id": "q2", "option_id": "b"}, {"question_id": "q3", "option_id": "b"}]).json()
    assert data["score"] == 33.33
    assert data["level"] == "beginner"


def test_unanswered_question_has_feedback():
    data = evaluate([{"question_id": "q1", "option_id": "a"}]).json()
    item = next(feedback for feedback in data["feedback"] if feedback["question_id"] == "q2")
    assert item["is_correct"] is False
    assert item["selected_option_id"] is None


def test_wrong_topic_generates_additional_task():
    data = evaluate([{"question_id": "q1", "option_id": "b"}, {"question_id": "q2", "option_id": "b"}, {"question_id": "q3", "option_id": "a"}]).json()
    assert data["weak_topics"] == ["Дроби"]
    assert data["additional_tasks"][0]["topic"] == "Дроби"
