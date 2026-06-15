export type QuestionType =
  | "text"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox";

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  placeholder?: string;
  options?: QuestionOption[];
  validation?: ValidationRules;
}

export type Answers = Record<string, string | string[]>;
