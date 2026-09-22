import { useMemo, useState } from "react";
import { evaluateQuiz, generateQuiz } from "./api";
import type { EvaluateResponse, GenerateResponse, UserAnswer } from "./types";

type Screen = "home" | "quiz" | "result";

const exampleMaterial = `Фотосинтез — это процесс, при котором зелёные растения преобразуют энергию света в химическую энергию. Процесс происходит в хлоропластах клеток с участием пигмента хлорофилла. Растение поглощает углекислый газ и воду, а затем под действием света образует глюкозу и выделяет кислород. Фотосинтез состоит из световой и темновой фаз.`;

const levelLabels = {
  beginner: "Начальный",
  intermediate: "Уверенный",
  advanced: "Продвинутый",
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [material, setMaterial] = useState("");
  const [quiz, setQuiz] = useState<GenerateResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [result, setResult] = useState<EvaluateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const answeredCount = Object.keys(answers).length;
  const question = quiz?.questions[currentQuestion];
  const selectedAnswer = question ? answers[question.id] : undefined;
  const progress = quiz ? ((currentQuestion + 1) / quiz.questions.length) * 100 : 0;

  const resultByQuestion = useMemo(
    () => new Map(result?.feedback.map((item) => [item.question_id, item])),
    [result],
  );

  async function startQuiz() {
    if (material.trim().length < 100) {
      setError(`Добавьте ещё ${100 - material.trim().length} символов.`);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const generated = await generateQuiz({ material, question_count: 5, difficulty: "auto", language: "ru" });
      setQuiz(generated);
      setAnswers({});
      setCurrentQuestion(0);
      setScreen("quiz");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Не удалось создать тест.");
    } finally {
      setLoading(false);
    }
  }

  async function submitQuiz() {
    if (!quiz || answeredCount !== quiz.questions.length) return;
    setError("");
    setLoading(true);
    const userAnswers: UserAnswer[] = quiz.questions.map((item) => ({
      question_id: item.id,
      option_id: answers[item.id],
    }));
    try {
      const evaluated = await evaluateQuiz({
        quiz_id: quiz.quiz_id,
        material,
        questions: quiz.questions,
        answers: userAnswers,
      });
      setResult(evaluated);
      setScreen("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Не удалось проверить ответы.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setScreen("home");
    setQuiz(null);
    setResult(null);
    setAnswers({});
    setCurrentQuestion(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      <header className="header">
        <button className="brand" onClick={reset} type="button" aria-label="На главную">
          <span className="brand-mark">П</span>
          <span>Понимай</span>
        </button>
        <span className="header-caption">AI-помощник для учёбы</span>
      </header>

      {screen === "home" && (
        <main>
          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow">Персональное обучение</span>
              <h1>Не просто учи.<br /><em>Понимай.</em></h1>
              <p>Добавь учебный материал. AI создаст тест, оценит понимание и объяснит темы, которые стоит повторить.</p>
              <div className="benefits">
                <span><b>✓</b> Тест по твоему тексту</span>
                <span><b>✓</b> Разбор слабых тем</span>
              </div>
            </div>

            <div className="panel material-panel">
              <div className="panel-heading">
                <div><span>Шаг 1 из 3</span><h2>Добавь материал</h2></div>
                <i>✦</i>
              </div>
              <label htmlFor="material">Текст для изучения</label>
              <div className="textarea-wrap">
                <textarea
                  id="material"
                  value={material}
                  maxLength={12000}
                  onChange={(event) => { setMaterial(event.target.value); setError(""); }}
                  placeholder="Вставь сюда конспект, параграф учебника или статью…"
                />
                <small>{material.length.toLocaleString("ru-RU")} / 12 000</small>
              </div>
              <div className="field-help">
                <span>Минимум 100 символов</span>
                <button type="button" onClick={() => setMaterial(exampleMaterial)}>Вставить пример</button>
              </div>
              <p className="error" role="alert">{error}</p>
              <button className="primary" type="button" onClick={startQuiz} disabled={loading}>
                <span>{loading ? "Анализируем…" : "Создать персональный тест"}</span><span>→</span>
              </button>
              <p className="privacy">◇ Материал используется только для теста</p>
            </div>
          </section>

          <section className="steps">
            <div><b>01</b><h3>Добавь материал</h3><p>Вставь текст, который хочешь изучить.</p></div>
            <div><b>02</b><h3>Пройди тест</h3><p>Ответь на вопросы, созданные AI.</p></div>
            <div><b>03</b><h3>Получи разбор</h3><p>Узнай свой уровень и слабые темы.</p></div>
          </section>
        </main>
      )}

      {screen === "quiz" && quiz && question && (
        <main className="workspace">
          <section className="quiz-header">
            <div><span className="eyebrow">Шаг 2 из 3</span><h1>{quiz.title}</h1></div>
            <span className="counter">{answeredCount} / {quiz.questions.length} отвечено</span>
          </section>
          <div className="progress"><span style={{ width: `${progress}%` }} /></div>
          {error && <p className="error" role="alert">{error}</p>}
          <section className="panel quiz-panel">
            <div className="question-meta"><span>Вопрос {currentQuestion + 1} из {quiz.questions.length}</span><span>{question.topic}</span></div>
            <h2>{question.text}</h2>
            <div className="options">
              {question.options.map((option, index) => (
                <button
                  type="button"
                  className={selectedAnswer === option.id ? "selected" : ""}
                  key={option.id}
                  onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                >
                  <span>{String.fromCharCode(65 + index)}</span>{option.text}
                </button>
              ))}
            </div>
            <div className="quiz-actions">
              <button className="secondary" type="button" disabled={currentQuestion === 0} onClick={() => setCurrentQuestion((value) => value - 1)}>← Назад</button>
              {currentQuestion < quiz.questions.length - 1 ? (
                <button className="primary primary-small" type="button" disabled={!selectedAnswer} onClick={() => setCurrentQuestion((value) => value + 1)}>Далее →</button>
              ) : (
                <button className="primary primary-small" type="button" disabled={answeredCount !== quiz.questions.length || loading} onClick={submitQuiz}>
                  {loading ? "Проверяем…" : "Завершить тест"}
                </button>
              )}
            </div>
          </section>
        </main>
      )}

      {screen === "result" && result && quiz && (
        <main className="workspace result-page">
          <section className="result-summary panel">
            <span className="eyebrow">Шаг 3 из 3 · Результат</span>
            <div className="score-ring"><strong>{result.score}%</strong><span>{result.correct_count} из {result.total}</span></div>
            <h1>{result.score >= 80 ? "Отличная работа!" : result.score >= 50 ? "Хорошая основа" : "Есть над чем поработать"}</h1>
            <p>Уровень понимания: <b>{levelLabels[result.level]}</b></p>
            {result.weak_topics.length > 0 && <div className="topics"><span>Повторить:</span>{result.weak_topics.map((topic) => <b key={topic}>{topic}</b>)}</div>}
          </section>

          <section className="review">
            <h2>Разбор ответов</h2>
            {quiz.questions.map((item, index) => {
              const feedback = resultByQuestion.get(item.id)!;
              const correctText = item.options.find((option) => option.id === feedback.correct_option_id)?.text;
              return (
                <article className={`review-card ${feedback.is_correct ? "correct" : "incorrect"}`} key={item.id}>
                  <span className="status">{feedback.is_correct ? "✓ Верно" : "× Стоит повторить"}</span>
                  <h3>{index + 1}. {item.text}</h3>
                  {!feedback.is_correct && <p><b>Правильный ответ:</b> {correctText}</p>}
                  <p>{feedback.explanation}</p>
                  {!feedback.is_correct && <small>{feedback.recommendation}</small>}
                </article>
              );
            })}
          </section>

          {result.additional_tasks.length > 0 && (
            <section className="tasks panel">
              <span className="eyebrow">Для закрепления</span><h2>Дополнительные задания</h2>
              {result.additional_tasks.map((task) => <div key={task.topic}><b>{task.topic}</b><p>{task.task}</p></div>)}
            </section>
          )}
          <button className="primary restart" type="button" onClick={reset}>Изучить другой материал →</button>
        </main>
      )}

      <footer><span>Понимай</span><small>Учебный AI-прототип · 2026</small></footer>
    </div>
  );
}
