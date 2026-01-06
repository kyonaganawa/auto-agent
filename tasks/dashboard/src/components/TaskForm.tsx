import React, { useState } from 'react';
import { taskService } from '../lib/taskService';
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
