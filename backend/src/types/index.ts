export type QuestionType =
  | "multiple_choice"
  | "checkbox"
  | "short_answer"
  | "rating";

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
}

export interface Survey {
    id?: string;
    title: string;
    description: string;
    expiryDate: string; // ISO string (UTC)
    published: boolean;
    createdAt: string;  // ISO string (UTC)
    createdBy: string;  // Firebase UID
    questions: Question[];
}