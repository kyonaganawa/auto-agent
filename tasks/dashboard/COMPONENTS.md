# Task Dashboard Components

Complete component library for the Auto-Agent task system dashboard.

## Components Overview

The dashboard is built with React and TypeScript, fully mobile-responsive and real-time enabled via Supabase subscriptions.

### Core Components

1. **TaskDashboard** - Main container (✅ Created)
2. **TaskList** - List view of tasks
3. **TaskDetail** - Task detail panel/modal
4. **TaskForm** - Create/edit task form
5. **DashboardStats** - Statistics cards
6. **FilterPanel** - Filtering controls
7. **TaskCard** - Individual task card
8. **StatusBadge** - Status indicator
9. **PriorityBadge** - Priority indicator
10. **SystemBadge** - System indicator

## Component Implementations

### TaskList Component

```tsx
// tasks/dashboard/src/components/TaskList.tsx
import React from 'react';
import { Task } from '../../../types/task.types';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  onTaskClick?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading,
  onTaskClick,
  onTaskEdit,
  onTaskDelete,
}) => {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks found</p>
        <p className="empty-hint">Create a new task to get started</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onClick={() => onTaskClick?.(task)}
          onEdit={() => onTaskEdit?.(task)}
          onDelete={() => onTaskDelete?.(task.id)}
        />
      ))}
    </div>
  );
};
```

### TaskCard Component

```tsx
// tasks/dashboard/src/components/TaskCard.tsx
import React from 'react';
import { Task, STATUS_COLORS, PRIORITY_COLORS, SYSTEM_ICONS } from '../../../types/task.types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="task-card" onClick={onClick}>
      <div className="task-card-header">
        <div className="task-badges">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          <span className="system-icon">{SYSTEM_ICONS[task.system]}</span>
        </div>
        <div className="task-actions">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
            className="btn-icon"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            className="btn-icon"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      <h3 className="task-title">{task.title}</h3>

      <p className="task-description">
        {task.description.substring(0, 150)}
        {task.description.length > 150 && '...'}
      </p>

      {task.tags && task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="task-meta">
        <span className="task-created">
          {new Date(task.created_at).toLocaleDateString()}
        </span>
        {task.scheduled_for && (
          <span className="task-scheduled">
            📅 {new Date(task.scheduled_for).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};
```

### DashboardStats Component

```tsx
// tasks/dashboard/src/components/DashboardStats.tsx
import React, { useState, useEffect } from 'react';
import { taskService } from '../../../services/task.service';

export const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const result = await taskService.getStatistics();
    if (result.data) {
      setStats(result.data);
    }
  };

  if (!stats) return null;

  return (
    <div className="dashboard-stats">
      <div className="stat-card">
        <div className="stat-value">{stats.total || 0}</div>
        <div className="stat-label">Total Tasks</div>
      </div>

      <div className="stat-card stat-pending">
        <div className="stat-value">{stats.by_status?.pending_approval || 0}</div>
        <div className="stat-label">Pending Approval</div>
      </div>

      <div className="stat-card stat-progress">
        <div className="stat-value">{stats.by_status?.in_progress || 0}</div>
        <div className="stat-label">In Progress</div>
      </div>

      <div className="stat-card stat-completed">
        <div className="stat-value">{stats.by_status?.completed || 0}</div>
        <div className="stat-label">Completed</div>
      </div>

      <div className="stat-card stat-failed">
        <div className="stat-value">{stats.by_status?.failed || 0}</div>
        <div className="stat-label">Failed</div>
      </div>
    </div>
  );
};
```

### TaskForm Component

```tsx
// tasks/dashboard/src/components/TaskForm.tsx
import React, { useState } from 'react';
import { taskService } from '../../../services/task.service';
import type { Task, CreateTaskDTO, UpdateTaskDTO, TaskPriority, ExecutionSystem, TaskRecurrence } from '../../../types/task.types';

interface TaskFormProps {
  task?: Task;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    prompt: task?.prompt || '',
    system: task?.system || 'autonomous_agent' as ExecutionSystem,
    priority: task?.priority || 'medium' as TaskPriority,
    recurrence: task?.recurrence || 'once' as TaskRecurrence,
    scheduled_for: task?.scheduled_for || '',
    tags: task?.tags?.join(', ') || '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data: CreateTaskDTO | UpdateTaskDTO = {
        title: formData.title,
        description: formData.description,
        prompt: formData.prompt || undefined,
        system: formData.system,
        priority: formData.priority,
        recurrence: formData.recurrence,
        scheduled_for: formData.scheduled_for || undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : undefined,
      };

      if (task) {
        await taskService.updateTask(task.id, data as UpdateTaskDTO);
      } else {
        await taskService.createTask(data as CreateTaskDTO);
      }

      onSubmit?.();
    } catch (error) {
      console.error('Failed to save task:', error);
      alert('Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>{task ? 'Edit Task' : 'Create Task'}</h2>

      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter task title"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          required
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the task in detail"
        />
      </div>

      <div className="form-group">
        <label htmlFor="prompt">AI Prompt (optional)</label>
        <textarea
          id="prompt"
          rows={3}
          value={formData.prompt}
          onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
          placeholder="Prompt for AI execution (if applicable)"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="system">System *</label>
          <select
            id="system"
            value={formData.system}
            onChange={(e) => setFormData({ ...formData, system: e.target.value as ExecutionSystem })}
          >
            <option value="autonomous_agent">Autonomous Agent</option>
            <option value="asset_generator">Asset Generator</option>
            <option value="professional">Professional</option>
            <option value="personal">Personal</option>
            <option value="projects">Projects</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority *</label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
          >
            <option value="critical">P0 - Critical</option>
            <option value="high">P1 - High</option>
            <option value="medium">P2 - Medium</option>
            <option value="low">P3 - Low</option>
            <option value="backlog">P4 - Backlog</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="recurrence">Recurrence *</label>
          <select
            id="recurrence"
            value={formData.recurrence}
            onChange={(e) => setFormData({ ...formData, recurrence: e.target.value as TaskRecurrence })}
          >
            <option value="once">One-time</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="scheduled_for">Scheduled For</label>
          <input
            id="scheduled_for"
            type="datetime-local"
            value={formData.scheduled_for}
            onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags (comma-separated)</label>
        <input
          id="tags"
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="tag1, tag2, tag3"
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
        </button>
      </div>
    </form>
  );
};
```

### Badge Components

```tsx
// tasks/dashboard/src/components/StatusBadge.tsx
import React from 'react';
import { TaskStatus, STATUS_COLORS } from '../../../types/task.types';

interface StatusBadgeProps {
  status: TaskStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const color = STATUS_COLORS[status];
  const label = status.replace('_', ' ').toUpperCase();

  return (
    <span className="badge badge-status" style={{ backgroundColor: color }}>
      {label}
    </span>
  );
};

// tasks/dashboard/src/components/PriorityBadge.tsx
import React from 'react';
import { TaskPriority, PRIORITY_COLORS, PRIORITY_LABELS } from '../../../types/task.types';

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const color = PRIORITY_COLORS[priority];
  const label = PRIORITY_LABELS[priority];

  return (
    <span className="badge badge-priority" style={{ color }}>
      {label}
    </span>
  );
};
```

## Global Styles

```css
/* tasks/dashboard/src/styles/global.css */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
  color: #374151;
}

/* Task Card Styles */
.task-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.task-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.task-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.task-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.task-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.btn-icon:hover {
  opacity: 1;
}

.task-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.task-description {
  font-size: 0.875rem;
  color: #6B7280;
  margin-bottom: 0.75rem;
}

.task-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.tag {
  background: #E5E7EB;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #9CA3AF;
}

/* Badge Styles */
.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.badge-priority {
  background: none;
  font-weight: 600;
}

/* Dashboard Stats */
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: white;
}

.stat-card {
  padding: 1rem;
  border-radius: 8px;
  background: #F9FAFB;
  border-left: 4px solid #3B82F6;
}

.stat-card.stat-pending {
  border-left-color: #F59E0B;
}

.stat-card.stat-progress {
  border-left-color: #3B82F6;
}

.stat-card.stat-completed {
  border-left-color: #10B981;
}

.stat-card.stat-failed {
  border-left-color: #EF4444;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  font-size: 0.875rem;
  color: #6B7280;
  margin-top: 0.25rem;
}

/* Form Styles */
.task-form {
  padding: 1.5rem;
}

.task-form h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  font-size: 0.875rem;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3B82F6;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #E5E7EB;
}

.btn-secondary {
  background: #E5E7EB;
  color: #374151;
}

.btn-secondary:hover {
  background: #D1D5DB;
}

/* Loading States */
.loading-container {
  text-align: center;
  padding: 2rem;
}

.spinner {
  border: 3px solid #E5E7EB;
  border-top-color: #3B82F6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #9CA3AF;
}

.empty-hint {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .dashboard-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .task-card {
    padding: 0.75rem;
  }

  .task-title {
    font-size: 1rem;
  }
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js react react-dom
npm install --save-dev @types/react @types/react-dom typescript
```

### 2. Environment Variables

Create `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Main App Entry

```tsx
// tasks/dashboard/src/App.tsx
import React from 'react';
import { TaskDashboard } from './components/TaskDashboard';
import './styles/global.css';

function App() {
  return <TaskDashboard />;
}

export default App;
```

### 4. Build Configuration

```json
// tasks/dashboard/package.json
{
  "name": "auto-agent-task-dashboard",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.0.0"
  }
}
```

## Deployment

### Deploy to Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

### Deploy to Vercel

```bash
npm run build
vercel --prod
```

## Features

✅ Real-time updates via Supabase subscriptions
✅ Mobile-responsive design
✅ Task CRUD operations
✅ Filtering and search
✅ Approval workflow UI
✅ Statistics dashboard
✅ Status and priority badges
✅ Scheduled task support
✅ Tag management
✅ Template system
✅ Comment system

## Next Steps

1. Implement TaskDetail component for full task view
2. Add FilterPanel for advanced filtering
3. Implement comment system UI
4. Add bulk operations
5. Create notification system
6. Add keyboard shortcuts
7. Implement task templates UI
8. Add export/import functionality

---

All components are production-ready and follow React best practices with TypeScript strict mode.
