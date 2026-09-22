# Team contract — 40-minute prototype

This document is frozen for the first integration round. If a field or route must change, agree on it before changing code in a personal branch.

## Stack and local ports

- Backend: Python 3.11+, FastAPI, Pydantic, official OpenAI Python SDK.
- Model integration: OpenAI Responses API with Structured Outputs.
- Frontend: React, Vite, TypeScript.
- Backend URL: `http://localhost:8000`.
- Frontend URL: `http://localhost:5173`.
- API prefix: `/api/v1`.
- JSON naming: `snake_case` everywhere.
- Prototype language: Russian (`ru`).
- No database and no authentication in this iteration.

## Shared flow

1. Frontend sends the learning material to `POST /api/v1/generate`.
2. Backend returns a quiz. For this prototype, each question contains its answer key and explanation.
3. Frontend displays only `text` and `options`; it must not reveal `correct_option_id` or `explanation` before submission.
4. Frontend sends the original material, generated questions, and selected answers to `POST /api/v1/evaluate`.
5. Evaluation returns the score, level, weak topics, per-question feedback, and additional tasks.

The API is stateless so independently developed branches can be merged without a shared database. Hiding the answer key on the server is explicitly postponed until after the prototype.

## Endpoints

### `GET /health`

Response: `{"status":"ok"}`.

### `POST /api/v1/generate`

Request:

```json
{
  "material": "Учебный текст длиной не менее 100 символов...",
  "question_count": 5,
  "difficulty": "auto",
  "language": "ru"
}
```

Response:

```json
{
  "quiz_id": "quiz-demo-001",
  "title": "Основы фотосинтеза",
  "questions": [
    {
      "id": "q1",
      "topic": "Световая фаза",
      "text": "Где протекает световая фаза фотосинтеза?",
      "options": [
        {"id": "a", "text": "В ядре"},
        {"id": "b", "text": "В мембранах тилакоидов"},
        {"id": "c", "text": "В цитоплазме"},
        {"id": "d", "text": "В клеточной стенке"}
      ],
      "correct_option_id": "b",
      "explanation": "Световые реакции идут на мембранах тилакоидов хлоропласта."
    }
  ]
}
```

### `POST /api/v1/evaluate`

Request:

```json
{
  "quiz_id": "quiz-demo-001",
  "material": "Исходный учебный материал...",
  "questions": [],
  "answers": [
    {"question_id": "q1", "option_id": "a"}
  ]
}
```

Response:

```json
{
  "quiz_id": "quiz-demo-001",
  "score": 0,
  "correct_count": 0,
  "total": 1,
  "level": "beginner",
  "weak_topics": ["Световая фаза"],
  "feedback": [
    {
      "question_id": "q1",
      "is_correct": false,
      "selected_option_id": "a",
      "correct_option_id": "b",
      "explanation": "Световые реакции идут на мембранах тилакоидов хлоропласта.",
      "recommendation": "Повторите строение хлоропласта и роль тилакоидов."
    }
  ],
  "additional_tasks": [
    {
      "topic": "Световая фаза",
      "task": "Объясните, какую роль играет хлорофилл в световой фазе."
    }
  ]
}
```

The full machine-readable contract is in `openapi.yaml`.

## Error contract

Validation errors use HTTP `422`. Model/provider failures use HTTP `502`:

```json
{
  "detail": {
    "code": "MODEL_ERROR",
    "message": "Не удалось получить корректный ответ модели"
  }
}
```

Never return an API key, provider stack trace, or raw model prompt to the frontend.

## File ownership for the first round

- Danila (`member-3`): `backend/app/routers/generate.py`, model client/services, backend configuration, generation tests.
- Arsen (`member-1`): everything under `frontend/`. Use the exact JSON shapes in this document as mock data.
- Albina (`member-2`): `backend/app/routers/evaluate.py`, evaluation services, five evaluation fixtures/tests.
- Shared files (`backend/app/schemas.py`, `backend/app/main.py`, `openapi.yaml`) are frozen. Change them only after agreement.

## Integration rule

Each person commits and pushes only to their assigned branch. Pull requests target `main`. Do not commit `.env` or any API key.

