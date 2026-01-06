/**
 * Kanban Card Component
 * Displays a task as a card in the Kanban board
 */

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Task} from '../../../../tasks/types/task.types';

interface KanbanCardProps {
  task: Task;
  onClick?: () => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'var(--status-failed)';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return 'var(--color-accent-primary)';
      case 'low':
        return 'var(--color-text-muted)';
      default:
        return 'var(--color-border)';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      ref={setNodeRef}
      className="kanban-card"
      style={style}
      {...listeners}
      {...attributes}
    >
      <div className="kanban-card-header" onClick={onClick}>
        <h4 className="kanban-card-title">{task.title}</h4>
        <span
          className="kanban-card-priority"
          style={{ color: getPriorityColor(task.priority) }}
        >
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="kanban-card-description" onClick={onClick}>
          {task.description.length > 120
            ? task.description.substring(0, 120) + '...'
            : task.description}
        </p>
      )}

      <div className="kanban-card-footer" onClick={onClick}>
        <span className="kanban-card-system">{task.system}</span>
        <span className="kanban-card-date">
          {task.started_at
            ? formatDate(task.started_at)
            : task.approved_at
            ? formatDate(task.approved_at)
            : formatDate(task.created_at)}
        </span>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="kanban-card-tags" onClick={onClick}>
          {task.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="kanban-card-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <style>{`
        .kanban-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 1rem;
          margin-bottom: 0.75rem;
          cursor: pointer;
          transition: all var(--transition-base);
          box-shadow: var(--shadow-sm);
        }

        .kanban-card:hover {
          border-color: var(--color-accent-primary);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .kanban-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .kanban-card-title {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-text-primary);
          line-height: 1.3;
          flex: 1;
        }

        .kanban-card-priority {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .kanban-card-description {
          margin: 0.5rem 0;
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          line-height: 1.4;
        }

        .kanban-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--color-border);
        }

        .kanban-card-system {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          background: var(--color-bg-elevated);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
        }

        .kanban-card-date {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .kanban-card-tags {
          display: flex;
          gap: 0.375rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
        }

        .kanban-card-tag {
          font-size: 0.7rem;
          color: var(--color-accent-primary);
          background: rgba(125, 211, 192, 0.1);
          border: 1px solid var(--color-accent-primary);
          padding: 0.125rem 0.4rem;
          border-radius: var(--radius-sm);
        }
      `}</style>
    </div>
  );
};
