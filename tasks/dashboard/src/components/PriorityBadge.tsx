import React from 'react';
import { TaskPriority, PRIORITY_COLORS, PRIORITY_LABELS } from '../types/task.types';

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const color = PRIORITY_COLORS[priority];
  const label = PRIORITY_LABELS[priority];

  return (
    <span className="badge badge-priority" style={{ borderColor: color, color }}>
      {label}
    </span>
  );
};
