/**
 * Kanban Board Component
 * Main board view with task columns organized by status
 */

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { taskService } from '../lib/taskService';
import type { Task, TaskStatus } from '../types/task.types';

interface KanbanBoardProps {
  onTaskClick?: (task: Task) => void;
  refreshTrigger?: number;
}

interface ColumnConfig {
  statuses: string[]; // Support multiple statuses per column
  title: string;
  color: string;
  showOnlyIfHasTasks?: boolean; // Optional: only show if tasks exist
}

const COLUMNS: ColumnConfig[] = [
  {
    statuses: ['paused', 'pending_approval'],
    title: 'Pending / Paused',
    color: '#f59e0b', // Orange
  },
  {
    statuses: ['approved'],
    title: 'Approved',
    color: '#3b82f6', // Blue
  },
  {
    statuses: ['in_progress'],
    title: 'In Progress',
    color: 'var(--color-accent-primary)', // Teal
    showOnlyIfHasTasks: true,
  },
  {
    statuses: ['review'],
    title: 'Review',
    color: '#a855f7', // Purple-500
    showOnlyIfHasTasks: true,
  },
  {
    statuses: ['completed'],
    title: 'Completed',
    color: 'var(--status-completed)', // Green
  },
  {
    statuses: ['failed'],
    title: 'Failed',
    color: 'var(--status-failed)', // Red
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ onTaskClick, refreshTrigger }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    })
  );

  // Load all tasks
  useEffect(() => {
    loadTasks();
  }, [refreshTrigger]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const result = await taskService.queryTasks({ limit: 500 });
      if (result.data) {
        setTasks(result.data);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    // Find the task
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistically update UI
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as any } : t))
    );

    // Update in database
    try {
      await taskService.updateTaskStatus(taskId, newStatus as TaskStatus);
    } catch (error) {
      console.error('Failed to update task status:', error);
      // Revert on error
      loadTasks();
    }
  };

  // Group tasks by statuses (supports multiple statuses per column)
  const getTasksByStatuses = (statuses: string[]): Task[] => {
    return tasks.filter((task) => statuses.includes(task.status));
  };

  // Check if column has tasks
  const columnHasTasks = (statuses: string[]): boolean => {
    return tasks.some((task) => statuses.includes(task.status));
  };

  // Filter columns based on visibility rules
  const visibleColumns = COLUMNS.filter(column => {
    if (column.showOnlyIfHasTasks) {
      return columnHasTasks(column.statuses);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="kanban-loading">
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>

        <style>{`
          .kanban-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            color: var(--color-text-muted);
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--color-border);
            border-top-color: var(--color-accent-primary);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 1rem;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        <div className="kanban-board-header">
          <h2>Task Board</h2>
          <div className="kanban-stats">
            <span className="kanban-stat">
              Total: <strong>{tasks.length}</strong>
            </span>
            <span className="kanban-stat">
              In Progress: <strong>{getTasksByStatuses(['in_progress']).length}</strong>
            </span>
            <span className="kanban-stat">
              Pending: <strong>{getTasksByStatuses(['pending_approval', 'paused']).length}</strong>
            </span>
          </div>
        </div>

        <div className="kanban-columns">
          {visibleColumns.map((column) => (
            <KanbanColumn
              key={column.statuses.join('-')}
              title={column.title}
              status={column.statuses[0]}
              tasks={getTasksByStatuses(column.statuses)}
              color={column.color}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>

        <style>{`
        .kanban-board {
          width: 100%;
        }

        .kanban-board-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding: 0 2rem;
        }

        .kanban-board-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--color-text-primary);
        }

        .kanban-stats {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .kanban-stat {
          font-size: 0.9rem;
          color: var(--color-text-muted);
        }

        .kanban-stat strong {
          color: var(--color-text-primary);
          font-weight: 600;
        }

        .kanban-columns {
          display: flex;
          flex-wrap: nowrap;
          gap: 1rem;
          padding: 0 2rem 1rem 2rem;
          width: max-content;
        }

        @media (max-width: 640px) {
          .kanban-board-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            padding: 0 1rem;
          }

          .kanban-columns {
            padding: 0 1rem 1rem 1rem;
          }

          .kanban-stats {
            width: 100%;
            justify-content: space-between;
            gap: 1rem;
          }

          .kanban-stat {
            font-size: 0.8rem;
          }
        }
        `}</style>
      </div>
    </DndContext>
  );
};
