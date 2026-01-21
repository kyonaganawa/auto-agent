/**
 * Daily Todo Types
 * Simple daily checklist items
 */

export interface DailyTodo {
  id: string;
  title: string;
  completed: boolean;
  date: string | null; // ISO date string (YYYY-MM-DD) or null for unassigned
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDailyTodoDTO {
  title: string;
  date?: string | null; // null for unassigned, undefined defaults to today
  position?: number;
}

export interface UpdateDailyTodoDTO {
  title?: string;
  completed?: boolean;
  position?: number;
  date?: string | null;
}

export interface DailyTodoFilters {
  date?: string;
  completed?: boolean;
}
