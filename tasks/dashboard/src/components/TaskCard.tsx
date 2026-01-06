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
