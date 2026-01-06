/**
 * Auto-Agent Task System - TypeScript Types (Dashboard Version)
 * Simplified types using string literals instead of enums for better compatibility
 */

// ============================================
// STRING LITERAL TYPES
// ============================================

export type TaskStatus =
  | 'draft'
  | 'suggested'
  | 'pending_approval'
  | 'needs_refinement'
  | 'approved'
  | 'paused'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'blocked';

export type TaskPriority =
  | 'critical'  // P0
  | 'high'      // P1
  | 'medium'    // P2
  | 'low'       // P3
  | 'backlog';  // P4

export type TaskRecurrence =
  | 'once'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'custom';

export type ExecutionSystem =
  | 'autonomous_agent'
  | 'asset_generator'
  | 'professional'
  | 'personal'
  | 'projects'
  | 'custom';

export type ExecutionType =
  | 'claude_session'  // Execute via Claude Code with prompt
  | 'script'          // Execute pre-created script
  | 'hybrid';         // Script that calls Claude Code

export type CreatorType =
  | 'human'
  | 'agent_autonomous'
  | 'agent_daily'
  | 'agent_asset'
  | 'system';

export type CommentType =
  | 'comment'
  | 'refinement'
  | 'approval'
  | 'system';

export type AssigneeType =
  | 'system'                    // Automated system/agent execution
  | 'human_owner'               // Owner should execute
  | 'human_third_party';        // Third party human should execute

// ============================================
// CORE INTERFACES
// ============================================

export interface Task {
  // Identity
  id: string;

  // Core fields
  title: string;
  description: string;
  prompt?: string | null;

  // System and execution
  system: ExecutionSystem;
  custom_system?: string | null;

  // Execution type and configuration
  execution_type: ExecutionType;
  script_path?: string | null;
  script_args?: Record<string, any> | null;
  timeout_seconds: number;

  // Status and workflow
  status: TaskStatus;
  priority: TaskPriority;

  // Creator tracking
  created_by: CreatorType;
  created_by_user_id?: string | null;
  created_by_agent?: string | null;

  // Assignee tracking
  assigned_to_type: AssigneeType;
  assigned_to_user_id?: string | null;
  assigned_to_name?: string | null;

  // Recurrence
  recurrence: TaskRecurrence;
  recurrence_pattern?: string | null;

  // Scheduling
  scheduled_for?: string | null;
  execute_after?: string | null;
  deadline?: string | null;

  // Dependencies
  depends_on?: string[] | null;
  blocks?: string[] | null;

  // Approval and refinement
  approved_by?: string | null;
  approved_at?: string | null;
  refinement_notes?: string | null;

  // Execution tracking
  started_at?: string | null;
  completed_at?: string | null;
  failed_at?: string | null;
  error_message?: string | null;
  execution_log?: string | null;

  // Metadata
  tags?: string[] | null;
  metadata?: Record<string, any> | null;

  // Auto-approval
  auto_approve_pattern?: string | null;
  is_pre_approved: boolean;

  // Recurrence tracking
  parent_task_id?: string | null;
  recurrence_instance_date?: string | null;
  next_recurrence_at?: string | null;

  // Audit
  created_at: string;
  updated_at: string;
}

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

export interface CreateTaskDTO {
  title: string;
  description: string;
  prompt?: string;
  system: ExecutionSystem;
  custom_system?: string;
  execution_type?: ExecutionType;
  script_path?: string;
  script_args?: Record<string, any>;
  timeout_seconds?: number;
  priority?: TaskPriority;
  recurrence?: TaskRecurrence;
  recurrence_pattern?: string;
  scheduled_for?: string;
  execute_after?: string;
  deadline?: string;
  depends_on?: string[];
  blocks?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
  created_by?: CreatorType;
  created_by_agent?: string;
  assigned_to_type?: AssigneeType;
  assigned_to_user_id?: string;
  assigned_to_name?: string;
  status?: TaskStatus;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  prompt?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  scheduled_for?: string;
  deadline?: string;
  refinement_notes?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

// ============================================
// FILTER AND QUERY TYPES
// ============================================

export interface TaskFilters {
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  system?: ExecutionSystem | ExecutionSystem[];
  created_by?: CreatorType | CreatorType[];
  assignee?: AssigneeType;
  tags?: string[];
  search?: string;
  scheduled_from?: string;
  scheduled_to?: string;
  created_from?: string;
  created_to?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  count?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
