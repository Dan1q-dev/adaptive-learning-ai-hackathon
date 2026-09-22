export type Difficulty = "auto" | "easy" | "medium" | "hard";
export type Level = "beginner" | "intermediate" | "advanced";

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  topic: string;
  text: string;
  options: QuizOption[];
  correct_option_id: string;
  explanation: string;
}

export interface GenerateRequest {
  material: string;
  question_count: number;
  difficulty: Difficulty;
  language: "ru";
}

export interface GenerateResponse {
  quiz_id: string;
  title: string;
  questions: QuizQuestion[];
}

export interface UserAnswer {
  question_id: string;
  option_id: string;
}

export interface EvaluateRequest {
  quiz_id: string;
  material: string;
  questions: QuizQuestion[];
  answers: UserAnswer[];
}

export interface QuestionFeedback {
  question_id: string;
  is_correct: boolean;
  selected_option_id: string;
  correct_option_id: string;
  explanation: string;
  recommendation: string;
}

export interface AdditionalTask {
  topic: string;
  task: string;
}

export interface EvaluateResponse {
  quiz_id: string;
  score: number;
  correct_count: number;
  total: number;
  level: Level;
  weak_topics: string[];
  feedback: QuestionFeedback[];
  additional_tasks: AdditionalTask[];
}
