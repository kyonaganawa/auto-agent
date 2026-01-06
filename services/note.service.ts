/**
 * Note Service
 * Handles all note-related API operations with Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Note, CreateNoteDTO, UpdateNoteDTO, NoteFilters, ApiResponse } from '../types/note.types';

export class NoteService {
  private supabase: SupabaseClient;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    const url = supabaseUrl || process.env.SUPABASE_URL || '';
    const key = supabaseKey || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

    if (!url || !key) {
      throw new Error('Supabase URL and key are required');
    }

    this.supabase = createClient(url, key);
  }

  /**
   * Get all notes with optional filters
   */
  async getNotes(filters?: NoteFilters): Promise<ApiResponse<Note[]>> {
    try {
      let query = this.supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      if (filters?.searchText) {
        query = query.or(`title.ilike.%${filters.searchText}%,content.ilike.%${filters.searchText}%`);
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data: data as Note[] };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Get a single note by ID
   */
  async getNote(id: string): Promise<ApiResponse<Note>> {
    try {
      const { data, error } = await this.supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data: data as Note };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Create a new note
   */
  async createNote(noteData: CreateNoteDTO): Promise<ApiResponse<Note>> {
    try {
      const { data, error } = await this.supabase
        .from('notes')
        .insert({
          ...noteData,
          status: 'unprocessed',
        })
        .select()
        .single();

      if (error) throw error;

      return { data: data as Note };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Update an existing note
   */
  async updateNote(id: string, updates: UpdateNoteDTO): Promise<ApiResponse<Note>> {
    try {
      const { data, error } = await this.supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data: data as Note };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Delete a note
   */
  async deleteNote(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await this.supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { data: undefined };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Mark note as processed
   */
  async markAsProcessed(id: string): Promise<ApiResponse<Note>> {
    return this.updateNote(id, { status: 'processed' });
  }

  /**
   * Mark note as unprocessed
   */
  async markAsUnprocessed(id: string): Promise<ApiResponse<Note>> {
    return this.updateNote(id, { status: 'unprocessed' });
  }

  /**
   * Get unprocessed notes count
   */
  async getUnprocessedCount(): Promise<ApiResponse<number>> {
    try {
      const { count, error } = await this.supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unprocessed');

      if (error) throw error;

      return { data: count || 0 };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Subscribe to note changes
   */
  subscribeToNotes(callback: (note: Note, event: 'INSERT' | 'UPDATE' | 'DELETE') => void) {
    return this.supabase
      .channel('notes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, (payload) => {
        const event = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
        const note = payload.new as Note;
        callback(note, event);
      })
      .subscribe();
  }
}
