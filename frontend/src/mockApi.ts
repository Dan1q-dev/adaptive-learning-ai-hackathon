import type {
  EvaluateRequest,
  EvaluateResponse,
  GenerateRequest,
  GenerateResponse,
  Level,
} from "./types";

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

const mockQuiz: GenerateResponse = {
  quiz_id: "quiz-demo-001",
  title: "Основы фотосинтеза",
  questions: [
    {
      id: "q1",
      topic: "Световая фаза",
      text: "Где протекает световая фаза фотосинтеза?",
      options: [
        { id: "a", text: "В ядре" },
        { id: "b", text: "В мембранах тилакоидов" },
        { id: "c", text: "В цитоплазме" },
        { id: "d", text: "В клеточной стенке" },
      ],
      correct_option_id: "b",
      explanation: "Световые реакции идут на мембранах тилакоидов хлоропласта.",
    },
    {
      id: "q2",
      topic: "Роль хлорофилла",
      text: "Какую главную функцию выполняет хлорофилл?",
      options: [
        { id: "a", text: "Поглощает энергию света" },
        { id: "b", text: "Запасает воду" },
        { id: "c", text: "Переносит кислород" },
        { id: "d", text: "Делит клетку" },
      ],
      correct_option_id: "a",
      explanation: "Хлорофилл поглощает свет и запускает цепь превращений энергии.",
    },
    {
      id: "q3",
      topic: "Продукты фотосинтеза",
      text: "Какие вещества образуются в результате фотосинтеза?",
      options: [
        { id: "a", text: "Углекислый газ и вода" },
        { id: "b", text: "Глюкоза и кислород" },
        { id: "c", text: "Азот и соли" },
        { id: "d", text: "Белки и жиры" },
      ],
      correct_option_id: "b",
      explanation: "Растение образует глюкозу и выделяет кислород.",
    },
    {
      id: "q4",
      topic: "Исходные вещества",
      text: "Какие вещества растение поглощает для фотосинтеза?",
      options: [
        { id: "a", text: "Глюкозу и кислород" },
        { id: "b", text: "Азот и глюкозу" },
        { id: "c", text: "Углекислый газ и воду" },
        { id: "d", text: "Кислород и белки" },
      ],
      correct_option_id: "c",
      explanation: "Для фотосинтеза растение использует углекислый газ и воду.",
    },
    {
      id: "q5",
      topic: "Преобразование энергии",
      text: "Во что при фотосинтезе превращается энергия света?",
      options: [
        { id: "a", text: "В механическую энергию движения" },
        { id: "b", text: "В химическую энергию органических веществ" },
        { id: "c", text: "Только в тепло" },
        { id: "d", text: "В электрический ток" },
      ],
      correct_option_id: "b",
      explanation: "Энергия света запасается в химических связях образованных органических веществ.",
    },
  ],
};

export async function generateQuiz(request: GenerateRequest): Promise<GenerateResponse> {
  await wait(700);
  return {
    ...structuredClone(mockQuiz),
    questions: structuredClone(mockQuiz.questions.slice(0, request.question_count)),
  };
}

export async function evaluateQuiz(request: EvaluateRequest): Promise<EvaluateResponse> {
  await wait(650);
  const feedback = request.questions.map((question) => {
    const selected = request.answers.find((answer) => answer.question_id === question.id);
    const isCorrect = selected?.option_id === question.correct_option_id;
    return {
      question_id: question.id,
      is_correct: isCorrect,
      selected_option_id: selected?.option_id ?? "",
      correct_option_id: question.correct_option_id,
      explanation: question.explanation,
      recommendation: isCorrect
        ? "Тема усвоена. Переходите к следующей."
        : `Повторите тему «${question.topic}» и объясните её своими словами.`,
    };
  });
  const correctCount = feedback.filter((item) => item.is_correct).length;
  const score = Math.round((correctCount / request.questions.length) * 100);
  const level: Level = score >= 80 ? "advanced" : score >= 50 ? "intermediate" : "beginner";
  const weakTopics = request.questions
    .filter((question) => feedback.some((item) => item.question_id === question.id && !item.is_correct))
    .map((question) => question.topic);

  return {
    quiz_id: request.quiz_id,
    score,
    correct_count: correctCount,
    total: request.questions.length,
    level,
    weak_topics: weakTopics,
    feedback,
    additional_tasks: weakTopics.map((topic) => ({
      topic,
      task: `Объясните основную идею темы «${topic}» и приведите один пример.`,
    })),
  };
}
