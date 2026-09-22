import { evaluateQuiz as evaluateMockQuiz, generateQuiz as generateMockQuiz } from "./mockApi";
import type { EvaluateRequest, EvaluateResponse, GenerateRequest, GenerateResponse } from "./types";

const useMockApi = import.meta.env.VITE_API_MODE === "mock";
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");

async function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Не удалось связаться с сервером. Проверьте, что backend запущен.");
  }

  if (!response.ok) {
    if (response.status === 422) {
      throw new Error("Проверьте введённый материал или ответы и попробуйте снова.");
    }
    if (response.status === 502) {
      throw new Error("Модель временно не ответила. Попробуйте ещё раз.");
    }
    throw new Error(`Сервер вернул ошибку ${response.status}. Попробуйте ещё раз.`);
  }

  try {
    return (await response.json()) as TResponse;
  } catch {
    throw new Error("Сервер вернул некорректный ответ. Попробуйте ещё раз.");
  }
}

export function generateQuiz(request: GenerateRequest): Promise<GenerateResponse> {
  return useMockApi
    ? generateMockQuiz(request)
    : postJson<GenerateResponse>("/generate", request);
}

export function evaluateQuiz(request: EvaluateRequest): Promise<EvaluateResponse> {
  return useMockApi
    ? evaluateMockQuiz(request)
    : postJson<EvaluateResponse>("/evaluate", request);
}
