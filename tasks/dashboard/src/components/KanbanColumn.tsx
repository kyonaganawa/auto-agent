/**
 * Kanban Column Component
 * Displays a column of tasks for a specific status
 */

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { KanbanCard } from './KanbanCard';
import type { Task } from '../types/task.types';

interface KanbanColumnProps {
  title: string;
  status: string;
  tasks: Task[];
  color: string;
  onTaskClick?: (task: Task) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  tasks,
  color,
  onTaskClick,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className="kanban-column">
      <div className="kanban-column-header" style={{ borderTopColor: color }}>
        <h3 className="kanban-column-title">{title}</h3>
        <span className="kanban-column-count">{tasks.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`kanban-column-content ${isOver ? 'is-over' : ''}`}
      >
        {tasks.length === 0 ? (
          <div className="kanban-column-empty">No tasks</div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task)}
            />
          ))
        )}
      </div>

      <style>{`
        .kanban-column {
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          min-height: 500px;
          max-height: calc(100vh - 300px);
          overflow: hidden;
          width: 400px;
          min-width: 400px;
          flex: 0 0 auto;
        }

        .kanban-column-header {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--color-border);
          border-top: 3px solid;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--color-bg-card);
        }

        .kanban-column-title {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .kanban-column-count {
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          padding: 0.25rem 0.625rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .kanban-column-content {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          overflow-x: hidden;
          transition: background-color 0.2s;
        }

        .kanban-column-content.is-over {
          background-color: rgba(125, 211, 192, 0.1);
        }

        .kanban-column-content::-webkit-scrollbar {
          width: 6px;
        }

        .kanban-column-content::-webkit-scrollbar-track {
          background: var(--color-bg-elevated);
        }

        .kanban-column-content::-webkit-scrollbar-thumb {
          background: var(--color-border);
          border-radius: 3px;
        }

        .kanban-column-content::-webkit-scrollbar-thumb:hover {
          background: var(--color-border-strong);
        }

        .kanban-column-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }

        @media (max-width: 1024px) {
          .kanban-column {
            min-height: 400px;
            max-height: 500px;
          }
        }

        @media (max-width: 640px) {
          .kanban-column {
            width: 280px;
            min-width: 280px;
          }
        }
      `}</style>
    </div>
  );
};
