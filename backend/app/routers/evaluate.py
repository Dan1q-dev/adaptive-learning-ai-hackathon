from collections import defaultdict

from fastapi import APIRouter

from app.schemas import AdditionalTask, EvaluateRequest, EvaluateResponse, QuestionFeedback


router = APIRouter()


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_answers(request: EvaluateRequest) -> EvaluateResponse:
    """Check submitted answers and make deterministic personalised feedback."""
    answers_by_question = {answer.question_id: answer.option_id for answer in request.answers}
    topic_total: dict[str, int] = defaultdict(int)
    topic_correct: dict[str, int] = defaultdict(int)
    feedback: list[QuestionFeedback] = []
    correct_count = 0

    for question in request.questions:
        selected_option_id = answers_by_question.get(question.id)
        is_correct = selected_option_id == question.correct_option_id
        topic_total[question.topic] += 1
        topic_correct[question.topic] += int(is_correct)
        correct_count += int(is_correct)

        recommendation = (
            "Отлично! Закрепите результат ещё одним вопросом по этой теме."
            if is_correct
            else f"Повторите тему «{question.topic}», затем решите похожее задание самостоятельно."
        )
        feedback.append(
            QuestionFeedback(
                question_id=question.id,
                is_correct=is_correct,
                selected_option_id=selected_option_id,
                correct_option_id=question.correct_option_id,
                explanation=question.explanation,
                recommendation=recommendation,
            )
        )

    total = len(request.questions)
    score = round(correct_count * 100 / total, 2)
    weak_topics = [
        topic for topic, count in topic_total.items()
        if topic_correct[topic] / count < 0.7
    ]

    level = "advanced" if score >= 80 else "intermediate" if score >= 50 else "beginner"
    additional_tasks = [
        AdditionalTask(
            topic=topic,
            task=f"Объясните ключевую идею темы «{topic}» своими словами и приведите один пример.",
        )
        for topic in weak_topics
    ]

    return EvaluateResponse(
        quiz_id=request.quiz_id,
        score=score,
        correct_count=correct_count,
        total=total,
        level=level,
        weak_topics=weak_topics,
        feedback=feedback,
        additional_tasks=additional_tasks,
    )

