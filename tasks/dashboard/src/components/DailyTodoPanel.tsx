/**
 * Daily Todo Panel Component
 * Two-column layout: Daily todos on left, unassigned todos on right
 */

import React, { useState, useEffect, useRef } from 'react';
import { dailyTodoService } from '../lib/dailyTodoService';
import type { DailyTodo } from '../types/dailyTodo.types';

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Format date for display
 */
function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  if (dateOnly.getTime() === today.getTime()) {
    return 'Today';
  } else if (dateOnly.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else if (dateOnly.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Add days to a date string
 */
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Todo Item Component - shared between both columns
 */
interface TodoItemProps {
  todo: DailyTodo;
  onToggle: (todo: DailyTodo) => void;
  onDelete: (todoId: string) => void;
  onAssignToDate?: (todoId: string, date: string) => void;
  onUnassign?: (todoId: string) => void;
  selectedDate: string;
  isUnassigned?: boolean;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onDelete,
  onAssignToDate,
  onUnassign,
  selectedDate,
  isUnassigned = false,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <label className="todo-checkbox-label">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo)}
          className="todo-checkbox"
        />
        <span className="checkmark"></span>
      </label>
      <span className="todo-title">{todo.title}</span>
      <div className="todo-actions">
        {isUnassigned && onAssignToDate && (
          <>
            {showDatePicker ? (
              <div className="assign-picker">
                <button
                  className="assign-today-btn"
                  onClick={() => {
                    onAssignToDate(todo.id, selectedDate);
                    setShowDatePicker(false);
                  }}
                  title={`Assign to ${formatDisplayDate(selectedDate)}`}
                >
                  {formatDisplayDate(selectedDate)}
                </button>
                <button
                  className="assign-cancel-btn"
                  onClick={() => setShowDatePicker(false)}
                >
                  x
                </button>
              </div>
            ) : (
              <button
                className="action-btn assign-btn"
                onClick={() => setShowDatePicker(true)}
                title="Assign to date"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </button>
            )}
          </>
        )}
        {!isUnassigned && onUnassign && (
          <button
            className="action-btn unassign-btn"
            onClick={() => onUnassign(todo.id)}
            title="Move to backlog"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </button>
        )}
        <button
          className="action-btn delete-btn"
          onClick={() => onDelete(todo.id)}
          title="Delete"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export const DailyTodoPanel: React.FC = () => {
  const [dailyTodos, setDailyTodos] = useState<DailyTodo[]>([]);
  const [unassignedTodos, setUnassignedTodos] = useState<DailyTodo[]>([]);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [loadingUnassigned, setLoadingUnassigned] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [newDailyTodoText, setNewDailyTodoText] = useState('');
  const [newUnassignedTodoText, setNewUnassignedTodoText] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dailyInputRef = useRef<HTMLInputElement>(null);
  const unassignedInputRef = useRef<HTMLInputElement>(null);

  // Load daily todos for selected date
  useEffect(() => {
    loadDailyTodos();
  }, [selectedDate]);

  // Load unassigned todos on mount
  useEffect(() => {
    loadUnassignedTodos();
  }, []);

  const loadDailyTodos = async () => {
    setLoadingDaily(true);
    try {
      const result = await dailyTodoService.getTodosByDate(selectedDate);
      if (result.data) {
        setDailyTodos(result.data);
      }
    } catch (err) {
      console.error('Failed to load daily todos:', err);
    } finally {
      setLoadingDaily(false);
    }
  };

  const loadUnassignedTodos = async () => {
    setLoadingUnassigned(true);
    try {
      const result = await dailyTodoService.getUnassignedTodos();
      if (result.data) {
        setUnassignedTodos(result.data);
      }
    } catch (err) {
      console.error('Failed to load unassigned todos:', err);
    } finally {
      setLoadingUnassigned(false);
    }
  };

  // Real-time subscriptions
  useEffect(() => {
    const subscription = dailyTodoService.subscribeToTodos((todo, event) => {
      if (todo.date === selectedDate) {
        // Daily todos for selected date
        if (event === 'INSERT') {
          setDailyTodos((prev) => [...prev, todo].sort((a, b) => a.position - b.position));
        } else if (event === 'UPDATE') {
          // Check if todo moved from unassigned to this date
          setUnassignedTodos((prev) => prev.filter((t) => t.id !== todo.id));
          setDailyTodos((prev) => {
            const exists = prev.find((t) => t.id === todo.id);
            if (exists) {
              return prev.map((t) => (t.id === todo.id ? todo : t));
            } else {
              return [...prev, todo].sort((a, b) => a.position - b.position);
            }
          });
        } else if (event === 'DELETE') {
          setDailyTodos((prev) => prev.filter((t) => t.id !== todo.id));
        }
      } else if (todo.date === null) {
        // Unassigned todos
        if (event === 'INSERT') {
          setUnassignedTodos((prev) => [...prev, todo].sort((a, b) => a.position - b.position));
        } else if (event === 'UPDATE') {
          // Check if todo moved from daily to unassigned
          setDailyTodos((prev) => prev.filter((t) => t.id !== todo.id));
          setUnassignedTodos((prev) => {
            const exists = prev.find((t) => t.id === todo.id);
            if (exists) {
              return prev.map((t) => (t.id === todo.id ? todo : t));
            } else {
              return [...prev, todo].sort((a, b) => a.position - b.position);
            }
          });
        } else if (event === 'DELETE') {
          setUnassignedTodos((prev) => prev.filter((t) => t.id !== todo.id));
        }
      } else {
        // Todo belongs to a different date - remove from current views if present
        if (event === 'UPDATE') {
          setDailyTodos((prev) => prev.filter((t) => t.id !== todo.id));
          setUnassignedTodos((prev) => prev.filter((t) => t.id !== todo.id));
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedDate]);

  // Focus daily input on mount and date change
  useEffect(() => {
    if (!loadingDaily && dailyInputRef.current) {
      dailyInputRef.current.focus();
    }
  }, [loadingDaily, selectedDate]);

  const handleAddDailyTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDailyTodoText.trim()) return;

    try {
      await dailyTodoService.createTodo({
        title: newDailyTodoText.trim(),
        date: selectedDate,
      });
      setNewDailyTodoText('');
      dailyInputRef.current?.focus();
    } catch (err) {
      console.error('Failed to create daily todo:', err);
    }
  };

  const handleAddUnassignedTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnassignedTodoText.trim()) return;

    try {
      await dailyTodoService.createTodo({
        title: newUnassignedTodoText.trim(),
        date: null,
      });
      setNewUnassignedTodoText('');
      unassignedInputRef.current?.focus();
    } catch (err) {
      console.error('Failed to create unassigned todo:', err);
    }
  };

  const handleToggleTodo = async (todo: DailyTodo) => {
    try {
      await dailyTodoService.toggleCompleted(todo.id);
    } catch (err) {
      console.error('Failed to toggle todo:', err);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      await dailyTodoService.deleteTodo(todoId);
    } catch (err) {
      console.error('Failed to delete todo:', err);
    }
  };

  const handleAssignToDate = async (todoId: string, date: string) => {
    try {
      await dailyTodoService.assignToDate(todoId, date);
    } catch (err) {
      console.error('Failed to assign todo to date:', err);
    }
  };

  const handleUnassign = async (todoId: string) => {
    try {
      await dailyTodoService.assignToDate(todoId, null);
    } catch (err) {
      console.error('Failed to unassign todo:', err);
    }
  };

  const goToToday = () => {
    setSelectedDate(getTodayDate());
  };

  const goToPrevDay = () => {
    setSelectedDate(addDays(selectedDate, -1));
  };

  const goToNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const dailyCompletedCount = dailyTodos.filter((t) => t.completed).length;
  const dailyTotalCount = dailyTodos.length;
  const unassignedCompletedCount = unassignedTodos.filter((t) => t.completed).length;
  const unassignedTotalCount = unassignedTodos.length;
  const isToday = selectedDate === getTodayDate();

  return (
    <div className="daily-todo-container">
      {/* Left Column - Daily Todos */}
      <div className="daily-todo-panel">
        {/* Date Navigation */}
        <div className="panel-header">
          <div className="date-display">
            <span className="date-label">{formatDisplayDate(selectedDate)}</span>
            <span className="date-separator">·</span>
            <span className="date-full">{selectedDate}</span>
          </div>
          <div className="date-nav-buttons">
            {!isToday && (
              <button className="today-btn" onClick={goToToday}>
                Today
              </button>
            )}
            <button className="nav-btn" onClick={goToPrevDay} title="Previous day">
              &lt;
            </button>
            <button className="nav-btn" onClick={goToNextDay} title="Next day">
              &gt;
            </button>
            <div className="date-picker-wrapper">
              <button
                className="calendar-btn"
                onClick={() => setShowDatePicker(!showDatePicker)}
                title="Pick a date"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </button>
              {showDatePicker && (
                <div className="date-picker-dropdown">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setShowDatePicker(false);
                    }}
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Add Input */}
        <form className="add-todo-form" onSubmit={handleAddDailyTodo}>
          <input
            ref={dailyInputRef}
            type="text"
            placeholder="Add a todo... (press Enter)"
            value={newDailyTodoText}
            onChange={(e) => setNewDailyTodoText(e.target.value)}
            className="add-todo-input"
          />
        </form>

        {/* Todo List */}
        <div className="todo-list">
          {loadingDaily ? (
            <div className="loading-state">Loading...</div>
          ) : dailyTodos.length === 0 ? (
            <div className="empty-state">
              No todos for {formatDisplayDate(selectedDate).toLowerCase()}.
              <br />
              <span className="empty-hint">Type above or assign from backlog.</span>
            </div>
          ) : (
            dailyTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
                onUnassign={handleUnassign}
                selectedDate={selectedDate}
              />
            ))
          )}
        </div>

        {/* Progress Footer */}
        {dailyTotalCount > 0 && (
          <div className="progress-footer">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(dailyCompletedCount / dailyTotalCount) * 100}%` }}
              />
            </div>
            <span className="progress-text">
              {dailyCompletedCount}/{dailyTotalCount} completed
            </span>
          </div>
        )}
      </div>

      {/* Right Column - Unassigned Todos (Backlog) */}
      <div className="daily-todo-panel backlog-panel">
        <div className="panel-header">
          <h3 className="panel-title">Backlog</h3>
          <span className="panel-count">{unassignedTotalCount} items</span>
        </div>

        {/* Quick Add Input */}
        <form className="add-todo-form" onSubmit={handleAddUnassignedTodo}>
          <input
            ref={unassignedInputRef}
            type="text"
            placeholder="Add to backlog... (press Enter)"
            value={newUnassignedTodoText}
            onChange={(e) => setNewUnassignedTodoText(e.target.value)}
            className="add-todo-input"
          />
        </form>

        {/* Todo List */}
        <div className="todo-list">
          {loadingUnassigned ? (
            <div className="loading-state">Loading...</div>
          ) : unassignedTodos.length === 0 ? (
            <div className="empty-state">
              No items in backlog.
              <br />
              <span className="empty-hint">Add todos without a date here.</span>
            </div>
          ) : (
            unassignedTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
                onAssignToDate={handleAssignToDate}
                selectedDate={selectedDate}
                isUnassigned
              />
            ))
          )}
        </div>

        {/* Progress Footer */}
        {unassignedTotalCount > 0 && (
          <div className="progress-footer">
            <div className="progress-bar">
              <div
                className="progress-fill backlog-fill"
                style={{ width: `${(unassignedCompletedCount / unassignedTotalCount) * 100}%` }}
              />
            </div>
            <span className="progress-text">
              {unassignedCompletedCount}/{unassignedTotalCount} completed
            </span>
          </div>
        )}
      </div>

      <style>{`
        .daily-todo-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          height: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .daily-todo-panel {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-md);
          min-height: 0;
          max-height: calc(100vh - 200px);
        }

        .backlog-panel {
          border-color: var(--color-border);
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--color-border);
          min-height: 36px;
        }

        .panel-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0;
        }

        .panel-count {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          background: var(--color-bg-elevated);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-sm);
        }

        .date-nav-buttons {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all var(--transition-base);
        }

        .nav-btn:hover {
          background: var(--color-bg-card);
          border-color: var(--color-accent-primary);
          color: var(--color-accent-primary);
        }

        .date-display {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .date-label {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .date-separator {
          color: var(--color-text-muted);
        }

        .date-full {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        .today-btn {
          padding: 0.375rem 0.75rem;
          background: rgba(125, 211, 192, 0.1);
          border: 1px solid var(--color-accent-primary);
          border-radius: var(--radius-sm);
          color: var(--color-accent-primary);
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all var(--transition-base);
        }

        .today-btn:hover {
          background: rgba(125, 211, 192, 0.2);
        }

        .date-picker-wrapper {
          position: relative;
        }

        .calendar-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .calendar-btn:hover {
          border-color: var(--color-accent-primary);
          color: var(--color-accent-primary);
        }

        .date-picker-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 0.5rem;
          box-shadow: var(--shadow-lg);
          z-index: 100;
        }

        .date-picker-dropdown input {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-primary);
          padding: 0.5rem;
          font-size: 0.9rem;
        }

        .add-todo-form {
          margin-bottom: 1rem;
        }

        .add-todo-input {
          width: 100%;
          padding: 0.875rem 1rem;
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-size: 1rem;
          transition: all var(--transition-base);
        }

        .add-todo-input:focus {
          outline: none;
          border-color: var(--color-accent-primary);
          box-shadow: 0 0 0 3px rgba(125, 211, 192, 0.1);
        }

        .add-todo-input::placeholder {
          color: var(--color-text-muted);
        }

        .todo-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .todo-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          transition: all var(--transition-base);
        }

        .todo-item:hover {
          border-color: var(--color-border-strong);
        }

        .todo-item.completed {
          opacity: 0.6;
        }

        .todo-item.completed .todo-title {
          text-decoration: line-through;
          color: var(--color-text-muted);
        }

        .todo-checkbox-label {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          cursor: pointer;
        }

        .todo-checkbox {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
        }

        .checkmark {
          width: 22px;
          height: 22px;
          border: 2px solid var(--color-border-strong);
          border-radius: 6px;
          transition: all var(--transition-base);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .todo-checkbox:checked + .checkmark {
          background: var(--status-completed);
          border-color: var(--status-completed);
        }

        .todo-checkbox:checked + .checkmark::after {
          content: '';
          width: 6px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
          margin-bottom: 2px;
        }

        .todo-checkbox:hover + .checkmark {
          border-color: var(--color-accent-primary);
        }

        .todo-title {
          flex: 1;
          color: var(--color-text-primary);
          font-size: 0.95rem;
        }

        .todo-actions {
          display: flex;
          gap: 0.25rem;
          opacity: 0;
          transition: opacity var(--transition-base);
        }

        .todo-item:hover .todo-actions {
          opacity: 1;
        }

        .action-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--radius-sm);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .action-btn:hover {
          background: var(--color-bg-card);
          border-color: var(--color-border);
        }

        .assign-btn:hover {
          color: var(--color-accent-primary);
          border-color: var(--color-accent-primary);
        }

        .unassign-btn:hover {
          color: var(--color-accent-secondary);
          border-color: var(--color-accent-secondary);
        }

        .delete-btn:hover {
          color: var(--status-failed);
          border-color: var(--status-failed);
        }

        .assign-picker {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .assign-today-btn {
          padding: 0.25rem 0.5rem;
          background: var(--color-accent-primary);
          border: none;
          border-radius: var(--radius-sm);
          color: var(--color-bg-primary);
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .assign-today-btn:hover {
          opacity: 0.9;
        }

        .assign-cancel-btn {
          padding: 0.25rem 0.5rem;
          background: transparent;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-muted);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .assign-cancel-btn:hover {
          border-color: var(--status-failed);
          color: var(--status-failed);
        }

        .progress-footer {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .progress-bar {
          flex: 1;
          height: 6px;
          background: var(--color-bg-elevated);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--status-completed);
          border-radius: 3px;
          transition: width var(--transition-base);
        }

        .backlog-fill {
          background: var(--color-accent-secondary);
        }

        .progress-text {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          white-space: nowrap;
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--color-text-muted);
        }

        .empty-hint {
          font-size: 0.875rem;
          opacity: 0.7;
        }

        @media (max-width: 900px) {
          .daily-todo-container {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .daily-todo-panel {
            max-height: none;
          }
        }

        @media (max-width: 640px) {
          .daily-todo-panel {
            padding: 1rem;
          }

          .panel-header {
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .date-display {
            width: 100%;
          }

          .date-nav-buttons {
            width: 100%;
            justify-content: flex-end;
          }

          .date-label {
            font-size: 1rem;
          }

          .date-full {
            display: none;
          }

          .date-separator {
            display: none;
          }

          .todo-actions {
            opacity: 1;
          }

          .todo-item {
            padding: 0.625rem 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};
