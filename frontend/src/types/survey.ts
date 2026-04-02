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
  id: string;
  title: string;
  description: string;
  expiryDate: string;
  published: boolean;
  publicLinkToken?: string | null;   
  createdAt: any;
  createdBy: string;
  questions: Question[];
  isExpired?: boolean;   
}