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
  publicLinkToken?: string | null;
  createdAt: string;
  createdBy: string;
  questions: any[];
  isExpired?: boolean;   // virtual, computed in backend
}

export interface Participant {
  id?: string;
  email: string;
  surveyId: string;
  accessToken: string;
  invitedAt?: string | null;
}