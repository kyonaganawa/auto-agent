/**
 * Task Dashboard - Main Component
 * Mobile-friendly task management dashboard
 */

import React, { useState, useEffect } from 'react';
import { taskService } from '../../../services/task.service';
import type { Task, TaskFilters, TaskStatus, TaskPriority, ExecutionSystem } from '../../../types/task.types';
import { TaskList } from './TaskList';
import { TaskDetail } from './TaskDetail';
import { TaskForm } from './TaskForm';
import { DashboardStats } from './DashboardStats';
import { FilterPanel } from './FilterPanel';

export const TaskDashboard: React.FC = () => {
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'all' | 'approval' | 'execution'>('all');

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

  // Real-time subscriptions
  useEffect(() => {
    const subscription = taskService.subscribeToTasks((task, event) => {
      if (event === 'INSERT') {
        setTasks((prev) => [task, ...prev]);
      } else if (event === 'UPDATE') {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? task : t))
        );
        if (selectedTask?.id === task.id) {
          setSelectedTask(task);
        }
      } else if (event === 'DELETE') {
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
        if (selectedTask?.id === task.id) {
          setSelectedTask(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedTask]);

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
        <h1>Auto-Agent Tasks</h1>
        <button
          className="btn btn-primary"
          onClick={handleCreateTask}
        >
          + New Task
        </button>
      </header>

      {/* Stats */}
      <DashboardStats />

      {/* View Tabs */}
      <div className="view-tabs">
        <button
          className={`tab ${activeView === 'all' ? 'active' : ''}`}
          onClick={() => setActiveView('all')}
        >
          All Tasks
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
      </div>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onChange={handleFilterChange}
      />

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Task List */}
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

      <style jsx>{`
        .task-dashboard {
          min-height: 100vh;
          background: #f5f5f5;
        }

        .dashboard-header {
          background: white;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .dashboard-header h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #3B82F6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563EB;
        }

        .view-tabs {
          background: white;
          display: flex;
          border-bottom: 1px solid #E5E7EB;
          padding: 0 2rem;
        }

        .tab {
          padding: 1rem 1.5rem;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 0.875rem;
          color: #6B7280;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .tab:hover {
          color: #374151;
        }

        .tab.active {
          color: #3B82F6;
          border-bottom-color: #3B82F6;
        }

        .dashboard-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          padding: 1rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        @media (min-width: 1024px) {
          .dashboard-content {
            grid-template-columns: 2fr 1fr;
          }
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow: auto;
        }

        @media (max-width: 640px) {
          .dashboard-header {
            padding: 1rem;
          }

          .dashboard-header h1 {
            font-size: 1.25rem;
          }

          .view-tabs {
            padding: 0 1rem;
            overflow-x: auto;
          }

          .tab {
            padding: 0.75rem 1rem;
            white-space: nowrap;
          }

          .dashboard-content {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};
