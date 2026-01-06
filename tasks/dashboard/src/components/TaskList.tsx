import React from 'react';
import { Task } from '../types/task.types';
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
