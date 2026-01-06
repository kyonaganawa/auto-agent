/**
 * Note Service for Dashboard
 * Browser-compatible wrapper for NoteService
 */

import { NoteService } from '../../../../services/note.service';

// Hardcoded Supabase credentials for browser usage
const supabaseUrl = 'https://vsyhhgkfjwkjubvsdqjw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzeWhoZ2tmandranVidnNkcWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5OTQxODksImV4cCI6MjA4MjU3MDE4OX0.TaC7S0Xi7Vj8cgp7IKuRk4VyhNkf8Vyqdt_-uzd9uqo';

export const noteService = new NoteService(supabaseUrl, supabaseAnonKey);
