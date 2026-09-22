import { evaluateQuiz as evaluateMock, generateQuiz as generateMock } from "./mockApi";
import type {
  EvaluateRequest,
  EvaluateResponse,
  GenerateRequest,
  GenerateResponse,
  QuizQuestion,
} from "./types";

export const isDemoMode = import.meta.env.VITE_API_MODE !== "api";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isQuestion(value: unknown): value is QuizQuestion {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.topic === "string"
    && typeof value.text === "string"
    && typeof value.correct_option_id === "string"
    && typeof value.explanation === "string"
    && Array.isArray(value.options)
    && value.options.length >= 2
    && value.options.every((option) => isRecord(option)
      && typeof option.id === "string"
      && typeof option.text === "string");
}

function isGenerateResponse(value: unknown): value is GenerateResponse {
  return isRecord(value)
    && typeof value.quiz_id === "string"
    && typeof value.title === "string"
    && Array.isArray(value.questions)
    && value.questions.length > 0
    && value.questions.every(isQuestion);
}

function isEvaluateResponse(value: unknown): value is EvaluateResponse {
  return isRecord(value)
    && typeof value.quiz_id === "string"
    && typeof value.score === "number"
    && typeof value.correct_count === "number"
    && typeof value.total === "number"
    && ["beginner", "intermediate", "advanced"].includes(String(value.level))
    && Array.isArray(value.weak_topics)
    && Array.isArray(value.feedback)
    && value.feedback.every((item) => isRecord(item)
      && typeof item.question_id === "string"
      && typeof item.is_correct === "boolean"
      && typeof item.correct_option_id === "string"
      && typeof item.explanation === "string"
      && typeof item.recommendation === "string")
    && Array.isArray(value.additional_tasks)
    && value.additional_tasks.every((task) => isRecord(task)
      && typeof task.topic === "string"
      && typeof task.task === "string");
}

async function postJson(path: string, body: GenerateRequest | EvaluateRequest): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Не удалось связаться с сервером. Проверьте, что backend запущен на порту 8000.");
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 422) {
      throw new Error("Сервер не принял данные. Проверьте материал и попробуйте снова.");
    }
    if (isRecord(payload) && isRecord(payload.detail) && typeof payload.detail.message === "string") {
      throw new Error(payload.detail.message);
    }
    if (response.status >= 500) {
      throw new Error("Сервер недоступен или вернул ошибку. Проверьте backend на порту 8000.");
    }
    throw new Error("Не удалось выполнить запрос. Попробуйте ещё раз.");
  }

  return payload;
}

export async function generateQuiz(request: GenerateRequest): Promise<GenerateResponse> {
  if (isDemoMode) return generateMock(request);
  const result = await postJson("/api/v1/generate", request);
  if (!isGenerateResponse(result)) throw new Error("Сервер вернул тест в неожиданном формате.");
  return result;
}

export async function evaluateQuiz(request: EvaluateRequest): Promise<EvaluateResponse> {
  if (isDemoMode) return evaluateMock(request);
  const result = await postJson("/api/v1/evaluate", request);
  if (!isEvaluateResponse(result)) throw new Error("Сервер вернул результат в неожиданном формате.");
  return result;
}
