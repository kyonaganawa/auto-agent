/**
 * Note Types
 * Type definitions for the personal notes system
 */

export type NoteStatus = 'unprocessed' | 'processed';

export interface Note {
  id: string;
  title?: string;
  content: string;
  status: NoteStatus;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

export interface CreateNoteDTO {
  title?: string;
  content: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateNoteDTO {
  title?: string;
  content?: string;
  status?: NoteStatus;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface NoteFilters {
  status?: NoteStatus;
  tags?: string[];
  searchText?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}
