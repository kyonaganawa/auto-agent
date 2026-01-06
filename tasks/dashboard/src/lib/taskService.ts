/**
 * Task Service for Dashboard
 * Browser-compatible task operations using Supabase
 */

import { supabase } from './supabase';
import type { Task, TaskFilters, CreateTaskDTO, UpdateTaskDTO, TaskStatus } from '../types/task.types';

export class TaskService {
  /**
   * Get all tasks with optional filters
   */
  async getTasks(filters?: TaskFilters) {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          query = query.in('status', filters.status);
        } else {
          query = query.eq('status', filters.status);
        }
      }

      if (filters?.priority) {
        if (Array.isArray(filters.priority)) {
          query = query.in('priority', filters.priority);
        } else {
          query = query.eq('priority', filters.priority);
        }
      }

      if (filters?.system) {
        query = query.eq('system', filters.system);
      }

      if (filters?.assignee) {
        query = query.eq('assignee', filters.assignee);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data: data as Task[] };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Get a single task by ID
   */
  async getTask(id: string) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data: data as Task };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Create a new task
   */
  async createTask(taskData: CreateTaskDTO) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) throw error;

      return { data: data as Task };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(id: string, updates: UpdateTaskDTO) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data: data as Task };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(id: string, status: TaskStatus) {
    return this.updateTask(id, { status });
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { data: undefined };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Get approval queue (tasks pending approval)
   */
  async getApprovalQueue() {
    return this.getTasks({ status: 'pending_approval' });
  }

  /**
   * Get execution queue (approved tasks ready to execute)
   */
  async getExecutionQueue() {
    return this.getTasks({ status: 'approved' });
  }

  /**
   * Query tasks with options
   */
  async queryTasks(options: { filters?: TaskFilters; limit?: number; offset?: number }) {
    return this.getTasks(options.filters);
  }

  /**
   * Approve a task
   */
  async approveTask(id: string) {
    return this.updateTaskStatus(id, 'approved');
  }

  /**
   * Reject a task
   */
  async rejectTask(id: string, reason?: string) {
    return this.updateTask(id, {
      status: 'needs_refinement',
      metadata: { rejection_reason: reason }
    });
  }

  /**
   * Subscribe to task changes
   */
  subscribeToTasks(callback: (task: Task, event: 'INSERT' | 'UPDATE' | 'DELETE') => void) {
    return supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload: any) => {
        const event = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
        const task = payload.new as Task;
        callback(task, event);
      })
      .subscribe();
  }
}

// Export singleton instance
export const taskService = new TaskService();
