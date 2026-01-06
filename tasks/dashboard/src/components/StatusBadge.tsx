import React from 'react';
import { TaskStatus, STATUS_COLORS } from '../types/task.types';

interface StatusBadgeProps {
  status: TaskStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const color = STATUS_COLORS[status];
  const label = status.replace('_', ' ').toUpperCase();

  return (
    <span className="badge badge-status" style={{ borderColor: color, color }}>
      {label}
    </span>
  );
};
