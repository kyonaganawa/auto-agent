/**
 * Daily Todo Service for Dashboard
 * Browser-compatible daily todo operations using Supabase
 */

import { supabase } from './supabase';
import type { DailyTodo, CreateDailyTodoDTO, UpdateDailyTodoDTO } from '../types/dailyTodo.types';

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export class DailyTodoService {
  /**
   * Get all todos for a specific date
   */
  async getTodosByDate(date: string) {
    try {
      const { data, error } = await supabase
        .from('daily_todos')
        .select('*')
        .eq('date', date)
        .order('position', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;

      return { data: data as DailyTodo[] };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Get all unassigned todos (no date)
   */
  async getUnassignedTodos() {
    try {
      const { data, error } = await supabase
        .from('daily_todos')
        .select('*')
        .is('date', null)
        .order('position', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;

      return { data: data as DailyTodo[] };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Assign a todo to a specific date
   */
  async assignToDate(id: string, date: string | null) {
    try {
      const { data, error } = await supabase
        .from('daily_todos')
        .update({ date })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data: data as DailyTodo };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Get a single todo by ID
   */
  async getTodo(id: string) {
    try {
      const { data, error } = await supabase
        .from('daily_todos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data: data as DailyTodo };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Create a new todo
   */
  async createTodo(todoData: CreateDailyTodoDTO) {
    try {
      // Determine date: null if explicitly null, otherwise use provided date or today
      const date = todoData.date === null ? null : (todoData.date || getTodayDate());

      // Get the max position for the date (or unassigned) to add at the end
      let positionQuery = supabase
        .from('daily_todos')
        .select('position')
        .order('position', { ascending: false })
        .limit(1);

      if (date === null) {
        positionQuery = positionQuery.is('date', null);
      } else {
        positionQuery = positionQuery.eq('date', date);
      }

      const { data: existing } = await positionQuery;

      const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0;

      const { data, error } = await supabase
        .from('daily_todos')
        .insert({
          title: todoData.title,
          date: date,
          position: todoData.position ?? nextPosition,
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;

      return { data: data as DailyTodo };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Update an existing todo
   */
  async updateTodo(id: string, updates: UpdateDailyTodoDTO) {
    try {
      const { data, error } = await supabase
        .from('daily_todos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data: data as DailyTodo };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Delete a todo
   */
  async deleteTodo(id: string) {
    try {
      const { error } = await supabase
        .from('daily_todos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { data: undefined };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Toggle todo completion status
   */
  async toggleCompleted(id: string) {
    try {
      // First get current status
      const { data: current, error: fetchError } = await supabase
        .from('daily_todos')
        .select('completed')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Toggle the status
      const { data, error } = await supabase
        .from('daily_todos')
        .update({ completed: !current.completed })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data: data as DailyTodo };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Copy todos to another date
   */
  async copyTodosToDate(todoIds: string[], targetDate: string) {
    try {
      // Fetch the todos to copy
      const { data: todos, error: fetchError } = await supabase
        .from('daily_todos')
        .select('*')
        .in('id', todoIds);

      if (fetchError) throw fetchError;
      if (!todos || todos.length === 0) {
        return { data: [] };
      }

      // Get the max position for the target date
      const { data: existing } = await supabase
        .from('daily_todos')
        .select('position')
        .eq('date', targetDate)
        .order('position', { ascending: false })
        .limit(1);

      let nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0;

      // Create new todos for the target date
      const newTodos = todos.map((todo) => ({
        title: todo.title,
        date: targetDate,
        position: nextPosition++,
        completed: false,
      }));

      const { data, error } = await supabase
        .from('daily_todos')
        .insert(newTodos)
        .select();

      if (error) throw error;

      return { data: data as DailyTodo[] };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Get dates that have todos (for calendar indicators)
   */
  async getDatesWithTodos(startDate?: string, endDate?: string) {
    try {
      let query = supabase
        .from('daily_todos')
        .select('date')
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get unique dates
      const uniqueDates = [...new Set(data?.map((d) => d.date) || [])];
      return { data: uniqueDates };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Get completion stats for a date
   */
  async getStatsForDate(date: string) {
    try {
      const { data, error } = await supabase
        .from('daily_todos')
        .select('completed')
        .eq('date', date);

      if (error) throw error;

      const total = data?.length || 0;
      const completed = data?.filter((t) => t.completed).length || 0;

      return { data: { total, completed } };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Subscribe to todo changes for a specific date
   */
  subscribeToTodos(callback: (todo: DailyTodo, event: 'INSERT' | 'UPDATE' | 'DELETE') => void) {
    return supabase
      .channel('daily-todos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_todos' }, (payload: any) => {
        const event = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
        const todo = (event === 'DELETE' ? payload.old : payload.new) as DailyTodo;
        callback(todo, event);
      })
      .subscribe();
  }
}

// Export singleton instance
export const dailyTodoService = new DailyTodoService();
