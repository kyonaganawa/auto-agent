/**
 * Execution Service
 * Handles Claude Code execution log operations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vsyhhgkfjwkjubvsdqjw.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzeWhoZ2tmandranVidnNkcWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5OTQxODksImV4cCI6MjA4MjU3MDE4OX0.TaC7S0Xi7Vj8cgp7IKuRk4VyhNkf8Vyqdt_-uzd9uqo';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface ClaudeExecution {
  id: string;
  session_id: string;
  context: string;
  prompt: string;
  working_directory: string;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  files_created?: string[];
  files_modified?: string[];
  files_deleted?: string[];
  git_commits?: any[];
  tokens_used?: number;
  cost_usd?: number;
  linked_task_id?: string;
  metadata?: any;
  created_at: string;
}

class ExecutionService {
  async getExecutions(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('claude_execution_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Failed to fetch executions:', error);
      return { data: null, error };
    }
  }

  async getExecutionById(id: string) {
    try {
      const { data, error } = await supabase
        .from('claude_execution_logs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Failed to fetch execution:', error);
      return { data: null, error };
    }
  }

  async getExecutionsByTask(taskId: string) {
    try {
      const { data, error } = await supabase
        .from('claude_execution_logs')
        .select('*')
        .eq('linked_task_id', taskId)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Failed to fetch task executions:', error);
      return { data: null, error };
    }
  }
}

export const executionService = new ExecutionService();
