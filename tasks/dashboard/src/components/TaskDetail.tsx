import React, { useState } from 'react';
import { Task, TaskStatus } from '../types/task.types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { taskService } from '../lib/taskService';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onUpdate: () => void;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ task, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState(task.status);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');

  const handleSaveEdits = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await taskService.updateTask(task.id, {
        title: editedTitle,
        description: editedDescription
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        setIsEditing(false);
        onUpdate();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description || '');
    setIsEditing(false);
    setError(null);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === task.status) return;

    setLoading(true);
    setError(null);

    try {
      const result = await taskService.updateTaskStatus(task.id, newStatus as TaskStatus);

      if (result.error) {
        setError(result.error.message);
        setSelectedStatus(task.status); // Reset to original status
      } else {
        setSelectedStatus(newStatus as TaskStatus);
        onUpdate();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
      setSelectedStatus(task.status); // Reset to original status
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await taskService.approveTask(task.id);

      if (result.error) {
        setError(result.error.message);
      } else {
        onUpdate();
        onClose(); // Close the detail panel after successful approval
      }
    } catch (err: any) {
      setError(err.message || 'Failed to approve task');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    setLoading(true);
    setError(null);

    try {
      const result = await taskService.rejectTask(task.id, reason);

      if (result.error) {
        setError(result.error.message);
      } else {
        onUpdate();
        onClose(); // Close the detail panel after rejection
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reject task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-detail">
      <div className="task-detail-header">
        <h2>Task Details</h2>
        <div className="header-actions">
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn btn-secondary" disabled={loading}>
              ✎ Edit
            </button>
          )}
          <button onClick={onClose} className="btn-close">×</button>
        </div>
      </div>

      <div className="task-detail-content">
        <div className="task-detail-badges">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>

        {isEditing ? (
          <div className="edit-section">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                disabled={loading}
                className="input-text"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                disabled={loading}
                className="input-textarea"
                rows={6}
              />
            </div>

            <div className="edit-actions">
              <button onClick={handleSaveEdits} className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : '✓ Save'}
              </button>
              <button onClick={handleCancelEdit} className="btn btn-secondary" disabled={loading}>
                ✕ Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3>{task.title}</h3>

            <div className="task-detail-section">
              <h4>Description</h4>
              <p>{task.description}</p>
            </div>
          </>
        )}

        <div className="task-detail-section">
          <h4>Change Status</h4>
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={loading || isEditing}
            className="status-select"
          >
            <option value="draft">Draft</option>
            <option value="suggested">Suggested</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="needs_refinement">Needs Refinement</option>
            <option value="approved">Approved</option>
            <option value="paused">Paused</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {task.prompt && (
          <div className="task-detail-section">
            <h4>AI Prompt</h4>
            <p>{task.prompt}</p>
          </div>
        )}

        <div className="task-detail-meta">
          <div className="meta-item">
            <span className="meta-label">System:</span>
            <span className="meta-value">{task.system}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Recurrence:</span>
            <span className="meta-value">{task.recurrence}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Created:</span>
            <span className="meta-value">{new Date(task.created_at).toLocaleString()}</span>
          </div>
          {task.scheduled_for && (
            <div className="meta-item">
              <span className="meta-label">Scheduled:</span>
              <span className="meta-value">{new Date(task.scheduled_for).toLocaleString()}</span>
            </div>
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="task-detail-section">
            <h4>Tags</h4>
            <div className="task-tags">
              {task.tags.map((tag) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="task-detail-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {task.status === 'pending_approval' && (
          <div className="task-detail-actions">
            <button
              onClick={handleApprove}
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? 'Approving...' : 'Approve'}
            </button>
            <button
              onClick={handleReject}
              className="btn btn-danger"
              disabled={loading}
            >
              {loading ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
