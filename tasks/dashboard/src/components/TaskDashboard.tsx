/**
 * Task Dashboard - Main Component
 * Mobile-friendly task management dashboard
 */

import React, { useState, useEffect } from 'react';
import { taskService } from '../lib/taskService';
import type { Task, TaskFilters, TaskStatus, TaskPriority, ExecutionSystem } from '../../../types/task.types';
import { TaskList } from './TaskList';
import { TaskDetail } from './TaskDetail';
import { TaskForm } from './TaskForm';
import { DashboardStats } from './DashboardStats';
import { FilterPanel } from './FilterPanel';
import { NotesPanel } from './NotesPanel';
import { KanbanBoard } from './KanbanBoard';
import { ExecutionsPanel } from './ExecutionsPanel';

export const TaskDashboard: React.FC = () => {
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'all' | 'approval' | 'execution' | 'notes' | 'executions'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load tasks
  useEffect(() => {
    loadTasks();
  }, [filters, activeView]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      let result;

      if (activeView === 'approval') {
        result = await taskService.getApprovalQueue();
      } else if (activeView === 'execution') {
        result = await taskService.getExecutionQueue();
      } else {
        result = await taskService.queryTasks({ filters, limit: 100 });
      }

      if (result.data) {
        setTasks('data' in result ? result.data : result.data);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleTaskDelete = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await taskService.deleteTask(taskId);
      loadTasks();
    }
  };

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setShowTaskForm(true);
  };

  const handleFormSubmit = async () => {
    setShowTaskForm(false);
    setEditingTask(undefined);
    setRefreshTrigger(prev => prev + 1); // Trigger KanbanBoard refresh
    loadTasks();
  };

  const handleFormCancel = () => {
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  const handleFilterChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="task-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        {/* Single Row: Title | Tabs | Buttons */}
        <div className="dashboard-header-top">
          <h1>Auto-Agent Tasks</h1>

          {/* View Tabs */}
          <div className="view-tabs">
          <button
            className={`tab ${activeView === 'all' ? 'active' : ''}`}
            onClick={() => setActiveView('all')}
          >
            Board
          </button>
          <button
            className={`tab ${activeView === 'approval' ? 'active' : ''}`}
            onClick={() => setActiveView('approval')}
          >
            Approval Queue
          </button>
          <button
            className={`tab ${activeView === 'execution' ? 'active' : ''}`}
            onClick={() => setActiveView('execution')}
          >
            Execution Queue
          </button>
          <button
            className={`tab ${activeView === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveView('notes')}
          >
            Notes
          </button>
          <button
            className={`tab ${activeView === 'executions' ? 'active' : ''}`}
            onClick={() => setActiveView('executions')}
          >
            Executions
          </button>
          </div>

          {/* Header Actions */}
          <div className="dashboard-header-actions">
            {activeView !== 'notes' && activeView !== 'all' && activeView !== 'executions' && (
              <button
                className={`btn btn-secondary ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? '✕ Hide Filters' : '⚙ Filters'}
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={handleCreateTask}
            >
              + New Task
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <DashboardStats />

      {/* Filter Panel - only show for approval/execution views when toggled */}
      {showFilters && activeView !== 'notes' && activeView !== 'all' && activeView !== 'executions' && (
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
        />
      )}

      {/* Main Content */}
      <div className="dashboard-content">
        {activeView === 'executions' ? (
          /* Executions Panel */
          <div className="executions-container">
            <ExecutionsPanel />
          </div>
        ) : activeView === 'notes' ? (
          /* Notes Panel */
          <div className="notes-container">
            <NotesPanel />
          </div>
        ) : activeView === 'all' ? (
          /* Kanban Board for All Tasks view */
          <div className="kanban-container">
            <KanbanBoard onTaskClick={handleTaskClick} refreshTrigger={refreshTrigger} />
          </div>
        ) : (
          <>
            {/* Task List for Approval and Execution queues */}
            <div className="task-list-container">
              <TaskList
                tasks={tasks}
                loading={loading}
                onTaskClick={handleTaskClick}
                onTaskEdit={handleTaskEdit}
                onTaskDelete={handleTaskDelete}
              />
            </div>

            {/* Task Detail Panel (mobile: modal, desktop: sidebar) */}
            {selectedTask && (
              <TaskDetail
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onUpdate={loadTasks}
              />
            )}
          </>
        )}

        {/* Task Detail Modal - show for kanban board clicks */}
        {selectedTask && activeView === 'all' && (
          <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
            <div className="modal-content task-detail-modal" onClick={(e) => e.stopPropagation()}>
              <TaskDetail
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onUpdate={() => {
                  setRefreshTrigger(prev => prev + 1); // Trigger KanbanBoard refresh
                  setSelectedTask(null);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="modal-overlay" onClick={handleFormCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <TaskForm
              task={editingTask}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}

      <style>{`
        .task-dashboard {
          min-height: 100vh;
          background: var(--color-bg-primary);
          position: relative;
          z-index: 1;
        }

        .dashboard-header {
          background: var(--color-bg-card);
          padding: 1rem 2rem;
          border-bottom: 1px solid var(--color-border);
          position: relative;
          animation: slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: var(--shadow-sm);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
        }

        .dashboard-header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .dashboard-header-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex-shrink: 0;
        }

        .dashboard-header h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .dashboard-header h1::before {
          content: '';
          width: 4px;
          height: 20px;
          background: linear-gradient(180deg, var(--color-accent-primary), var(--color-accent-secondary));
          border-radius: 2px;
        }

        .view-tabs {
          background: transparent;
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          flex: 1;
        }

        .tab {
          padding: 0.5rem 1rem;
          border: none;
          background: var(--color-bg-card);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--color-text-muted);
          transition: all var(--transition-base);
          white-space: nowrap;
          border: 1px solid var(--color-border);
        }

        .tab:hover {
          color: var(--color-text-primary);
          background: var(--color-bg-elevated);
          border-color: var(--color-border-strong);
        }

        .tab.active {
          color: var(--color-accent-primary);
          background: rgba(125, 211, 192, 0.1);
          border-color: var(--color-accent-primary);
          box-shadow: 0 0 20px rgba(125, 211, 192, 0.15);
        }

        .dashboard-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          padding: 2rem;
          position: relative;
        }

        .dashboard-content:has(.kanban-container) {
          padding: 0;
          max-width: 100%;
        }

        @media (min-width: 1024px) {
          .dashboard-content:not(:has(.kanban-container)) {
            max-width: 1600px;
            margin: 0 auto;
            grid-template-columns: 2fr 1fr;
          }
        }

        .task-list-container {
          position: relative;
          z-index: 1;
        }

        .notes-container,
        .executions-container {
          grid-column: 1 / -1;
          max-width: 1600px;
          margin: 0 auto;
          width: 100%;
          min-height: 600px;
        }

        .kanban-container {
          grid-column: 1 / -1;
          width: 100%;
          max-width: 100%;
          padding: 2rem 0;
          overflow-x: scroll;
          overflow-y: hidden;
        }

        .task-detail-modal {
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          backdrop-filter: blur(8px);
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
        }

        .modal-content {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow: auto;
          box-shadow: var(--shadow-lg), var(--shadow-glow);
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
        }

        @media (max-width: 1024px) {
          .dashboard-header-top {
            flex-wrap: wrap;
          }

          .view-tabs {
            order: 3;
            width: 100%;
            margin-top: 0.5rem;
          }
        }

        @media (max-width: 640px) {
          .dashboard-header {
            padding: 1rem;
          }

          .dashboard-header-top {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .dashboard-header-actions {
            width: 100%;
            justify-content: stretch;
          }

          .dashboard-header-actions > button {
            flex: 1;
          }

          .dashboard-header h1 {
            font-size: 1.3rem;
          }

          .view-tabs {
            width: 100%;
            order: 3;
            margin-top: 0;
          }

          .tab {
            padding: 0.5rem 0.75rem;
            font-size: 0.85rem;
          }

          .dashboard-content {
            padding: 1rem;
            gap: 1rem;
          }

          .dashboard-content:has(.kanban-container) {
            padding: 0;
          }

          .kanban-board {
            padding: 0 1rem;
          }
        }
      `}</style>
    </div>
  );
};
