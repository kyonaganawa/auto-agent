/**
 * Auto-Agent Task System - Service Layer
 * Handles all task operations with Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  Task,
  TaskExecution,
  TaskComment,
  TaskTemplate,
  TaskApprovalRule,
  CreateTaskDTO,
  UpdateTaskDTO,
  ApproveTaskDTO,
  CompleteTaskDTO,
  FailTaskDTO,
  TaskFilters,
  TaskQueryOptions,
  TaskStatus,
  TaskPriority,
  CommentType,
  ApiResponse,
  PaginatedResponse,
} from '../types/task.types';

export class TaskService {
  private supabase: SupabaseClient;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    // Initialize Supabase client
    this.supabase = createClient(
      supabaseUrl || process.env.SUPABASE_URL || '',
      supabaseKey || process.env.SUPABASE_ANON_KEY || ''
    );
  }

  // ============================================
  // TASK CRUD OPERATIONS
  // ============================================

  /**
   * Create a new task
   */
  async createTask(data: CreateTaskDTO): Promise<ApiResponse<Task>> {
    try {
      const { data: task, error } = await this.supabase
        .from('tasks')
        .insert({
          ...data,
          status: 'pending_approval',  // Default status
          priority: data.priority || 'medium',
          recurrence: data.recurrence || 'once',
        })
        .select()
        .single();

      if (error) throw error;
      return { data: task };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Get task by ID
   */
  async getTask(id: string): Promise<ApiResponse<Task>> {
    try {
      const { data: task, error } = await this.supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data: task };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Update task
   */
  async updateTask(id: string, data: UpdateTaskDTO): Promise<ApiResponse<Task>> {
    try {
      const { data: task, error } = await this.supabase
        .from('tasks')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: task };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Delete task
   */
  async deleteTask(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await this.supabase
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
   * Query tasks with filters and pagination
   */
  async queryTasks(options: TaskQueryOptions = {}): Promise<PaginatedResponse<Task>> {
    try {
      let query = this.supabase.from('tasks').select('*', { count: 'exact' });

      // Apply filters
      if (options.filters) {
        query = this.applyFilters(query, options.filters);
      }

      // Apply sorting
      if (options.sort) {
        query = query.order(options.sort.field, { ascending: options.sort.direction === 'asc' });
      } else {
        // Default sort: priority DESC, created_at ASC
        query = query.order('priority', { ascending: false }).order('created_at', { ascending: true });
      }

      // Apply pagination
      const limit = options.limit || 50;
      const offset = options.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data: tasks, error, count } = await query;

      if (error) throw error;

      return {
        data: tasks || [],
        count: count || 0,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error: any) {
      throw new Error(`Failed to query tasks: ${error.message}`);
    }
  }

  /**
   * Apply filters to Supabase query
   */
  private applyFilters(query: any, filters: TaskFilters): any {
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    if (filters.priority) {
      if (Array.isArray(filters.priority)) {
        query = query.in('priority', filters.priority);
      } else {
        query = query.eq('priority', filters.priority);
      }
    }

    if (filters.system) {
      if (Array.isArray(filters.system)) {
        query = query.in('system', filters.system);
      } else {
        query = query.eq('system', filters.system);
      }
    }

    if (filters.created_by) {
      if (Array.isArray(filters.created_by)) {
        query = query.in('created_by', filters.created_by);
      } else {
        query = query.eq('created_by', filters.created_by);
      }
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.scheduled_from) {
      query = query.gte('scheduled_for', filters.scheduled_from);
    }

    if (filters.scheduled_to) {
      query = query.lte('scheduled_for', filters.scheduled_to);
    }

    if (filters.created_from) {
      query = query.gte('created_at', filters.created_from);
    }

    if (filters.created_to) {
      query = query.lte('created_at', filters.created_to);
    }

    return query;
  }

  // ============================================
  // STATE TRANSITIONS
  // ============================================

  /**
   * Approve a task
   */
  async approveTask(id: string, data: ApproveTaskDTO): Promise<ApiResponse<Task>> {
    try {
      const { data: task, error } = await this.supabase
        .from('tasks')
        .update({
          status: 'approved',
          approved_by: data.approved_by,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('status', 'pending_approval')  // Only approve if pending
        .select()
        .single();

      if (error) throw error;

      // Add approval comment
      await this.addComment(id, {
        comment: 'Task approved',
        comment_type: 'approval',
        author_type: 'human',
        author_user_id: data.approved_by,
      });

      // Auto-execute if requested
      if (data.auto_execute) {
        await this.executeTask(id);
      }

      return { data: task };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Request refinement on a task
   */
  async requestRefinement(id: string, notes: string, userId: string): Promise<ApiResponse<Task>> {
    try {
      const { data: task, error } = await this.supabase
        .from('tasks')
        .update({
          status: 'needs_refinement',
          refinement_notes: notes,
        })
        .eq('id', id)
        .eq('status', 'pending_approval')
        .select()
        .single();

      if (error) throw error;

      // Add refinement comment
      await this.addComment(id, {
        comment: notes,
        comment_type: 'refinement',
        author_type: 'human',
        author_user_id: userId,
      });

      return { data: task };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Refine a task (move from needs_refinement back to pending_approval)
   */
  async refineTask(id: string, updates: UpdateTaskDTO): Promise<ApiResponse<Task>> {
    try {
      const { data: task, error } = await this.supabase
        .from('tasks')
        .update({
          ...updates,
          status: 'pending_approval',
          refinement_notes: null,
        })
        .eq('id', id)
        .eq('status', 'needs_refinement')
        .select()
        .single();

      if (error) throw error;
      return { data: task };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Execute a task (start execution)
   */
  async executeTask(id: string, executedBy?: string): Promise<ApiResponse<Task>> {
    try {
      const { data: task, error } = await this.supabase
        .from('tasks')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('status', 'approved')
        .select()
        .single();

      if (error) throw error;
      return { data: task };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Complete a task successfully
   */
  async completeTask(id: string, data: CompleteTaskDTO): Promise<ApiResponse<Task>> {
    try {
      const completedAt = new Date().toISOString();

      // Update task
      const { data: task, error } = await this.supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: completedAt,
          execution_log: data.execution_log_path,
        })
        .eq('id', id)
        .eq('status', 'in_progress')
        .select()
        .single();

      if (error) throw error;

      // Create execution record
      if (task && task.started_at) {
        const durationSeconds = Math.floor(
          (new Date(completedAt).getTime() - new Date(task.started_at).getTime()) / 1000
        );

        await this.supabase.from('task_executions').insert({
          task_id: id,
          started_at: task.started_at,
          completed_at: completedAt,
          duration_seconds: durationSeconds,
          status: 'completed',
          output_summary: data.output_summary,
          output_data: data.output_data,
          tokens_used: data.tokens_used,
          cost_usd: data.cost_usd,
          execution_log_path: data.execution_log_path,
        });
      }

      return { data: task };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Fail a task
   */
  async failTask(id: string, data: FailTaskDTO): Promise<ApiResponse<Task>> {
    try {
      const failedAt = new Date().toISOString();

      // Update task
      const { data: task, error } = await this.supabase
        .from('tasks')
        .update({
          status: 'failed',
          failed_at: failedAt,
          error_message: data.error_message,
          execution_log: data.execution_log_path,
        })
        .eq('id', id)
        .eq('status', 'in_progress')
        .select()
        .single();

      if (error) throw error;

      // Create execution record
      if (task && task.started_at) {
        const durationSeconds = Math.floor(
          (new Date(failedAt).getTime() - new Date(task.started_at).getTime()) / 1000
        );

        await this.supabase.from('task_executions').insert({
          task_id: id,
          started_at: task.started_at,
          completed_at: failedAt,
          duration_seconds: durationSeconds,
          status: 'failed',
          error_message: data.error_message,
          execution_log_path: data.execution_log_path,
        });
      }

      return { data: task };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Cancel a task
   */
  async cancelTask(id: string, reason?: string, userId?: string): Promise<ApiResponse<Task>> {
    try {
      const { data: task, error } = await this.supabase
        .from('tasks')
        .update({
          status: 'cancelled',
        })
        .eq('id', id)
        .neq('status', 'in_progress')  // Can't cancel in-progress tasks
        .neq('status', 'completed')
        .neq('status', 'failed')
        .select()
        .single();

      if (error) throw error;

      // Add cancellation comment
      if (reason && userId) {
        await this.addComment(id, {
          comment: `Task cancelled: ${reason}`,
          comment_type: 'system',
          author_type: 'human',
          author_user_id: userId,
        });
      }

      return { data: task };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  // ============================================
  // COMMENTS
  // ============================================

  /**
   * Add comment to task
   */
  async addComment(
    taskId: string,
    comment: {
      comment: string;
      comment_type?: CommentType;
      author_type: 'human' | 'agent_autonomous' | 'agent_daily' | 'agent_asset' | 'system';
      author_user_id?: string;
      author_agent?: string;
    }
  ): Promise<ApiResponse<TaskComment>> {
    try {
      const { data: taskComment, error } = await this.supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          ...comment,
          comment_type: comment.comment_type || 'comment',
        })
        .select()
        .single();

      if (error) throw error;
      return { data: taskComment };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Get comments for a task
   */
  async getComments(taskId: string): Promise<ApiResponse<TaskComment[]>> {
    try {
      const { data: comments, error } = await this.supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data: comments || [] };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  // ============================================
  // QUEUES AND VIEWS
  // ============================================

  /**
   * Get approval queue (tasks waiting for approval)
   */
  async getApprovalQueue(limit: number = 50): Promise<ApiResponse<Task[]>> {
    try {
      const { data: tasks, error } = await this.supabase
        .from('v_approval_queue')
        .select('*')
        .limit(limit);

      if (error) throw error;
      return { data: tasks || [] };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Get execution queue (approved tasks ready to run)
   */
  async getExecutionQueue(limit: number = 50): Promise<ApiResponse<Task[]>> {
    try {
      const { data: tasks, error } = await this.supabase
        .from('v_execution_queue')
        .select('*')
        .limit(limit);

      if (error) throw error;
      return { data: tasks || [] };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Get next task to execute (highest priority, ready to run)
   */
  async getNextTask(): Promise<ApiResponse<Task | null>> {
    try {
      const now = new Date().toISOString();

      const { data: task, error } = await this.supabase
        .from('tasks')
        .select('*')
        .eq('status', 'approved')
        .or(`scheduled_for.is.null,scheduled_for.lte.${now}`)
        .order('priority', { ascending: false })
        .order('scheduled_for', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;  // PGRST116 = no rows
      return { data: task || null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get task statistics
   */
  async getStatistics(): Promise<any> {
    try {
      const { data: stats, error } = await this.supabase
        .from('v_task_statistics')
        .select('*');

      if (error) throw error;

      // Transform to dashboard-friendly format
      const result = {
        total: 0,
        by_status: {} as Record<string, number>,
        by_priority: {} as Record<string, number>,
        by_system: {} as Record<string, number>,
      };

      stats?.forEach((stat) => {
        result.total += stat.task_count;
        result.by_status[stat.status] = (result.by_status[stat.status] || 0) + stat.task_count;
        result.by_priority[stat.priority] = (result.by_priority[stat.priority] || 0) + stat.task_count;
        result.by_system[stat.system] = (result.by_system[stat.system] || 0) + stat.task_count;
      });

      return { data: result };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  // ============================================
  // TEMPLATES
  // ============================================

  /**
   * Get all task templates
   */
  async getTemplates(): Promise<ApiResponse<TaskTemplate[]>> {
    try {
      const { data: templates, error } = await this.supabase
        .from('task_templates')
        .select('*')
        .order('use_count', { ascending: false });

      if (error) throw error;
      return { data: templates || [] };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Create task from template
   */
  async createFromTemplate(
    templateId: string,
    variables: Record<string, string> = {}
  ): Promise<ApiResponse<Task>> {
    try {
      // Get template
      const { data: template, error: templateError } = await this.supabase
        .from('task_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      // Replace variables in templates
      const title = this.replaceVariables(template.title_template || '', variables);
      const description = this.replaceVariables(template.description_template || '', variables);
      const prompt = this.replaceVariables(template.prompt_template || '', variables);

      // Create task
      const taskData: CreateTaskDTO = {
        title,
        description,
        prompt,
        system: template.system || 'autonomous_agent',
        priority: template.priority,
        recurrence: template.recurrence,
        tags: template.tags,
      };

      const result = await this.createTask(taskData);

      // Update template usage
      if (result.data) {
        await this.supabase
          .from('task_templates')
          .update({
            use_count: template.use_count + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq('id', templateId);
      }

      return result;
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  /**
   * Replace variables in template string
   */
  private replaceVariables(template: string, variables: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => variables[key] || match);
  }

  // ============================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================

  /**
   * Subscribe to task changes
   */
  subscribeToTask(taskId: string, callback: (task: Task) => void) {
    return this.supabase
      .channel(`task:${taskId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `id=eq.${taskId}` },
        (payload) => callback(payload.new as Task)
      )
      .subscribe();
  }

  /**
   * Subscribe to all task changes
   */
  subscribeToTasks(callback: (task: Task, event: string) => void) {
    return this.supabase
      .channel('tasks')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => callback(payload.new as Task, payload.eventType)
      )
      .subscribe();
  }

  /**
   * Subscribe to approval queue changes
   */
  subscribeToApprovalQueue(callback: () => void) {
    return this.supabase
      .channel('approval_queue')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: 'status=in.(pending_approval,needs_refinement)' },
        callback
      )
      .subscribe();
  }
}

// Export singleton instance
export const taskService = new TaskService();
