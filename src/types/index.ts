export interface Task {
  id: string;
  title: string;
  created_at: string;
  is_paid: boolean;
  user_id: string;
  score?: number;
}

export interface TaskDetail extends Task {
  code_content: string;
  ai_feedback: {
    strengths: string[];
    weaknesses: string[];
    refactored_code: string;
    summary: string;
    score: number;
  } | null;
}

export interface UserSession {
  user: {
    id: string;
    email: string;
  } | null;
}