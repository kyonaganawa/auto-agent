/**
 * Executions Panel Component
 * Displays Claude Code execution logs
 */

import React, { useState, useEffect } from 'react';
import { executionService, ClaudeExecution } from '../lib/executionService';

export const ExecutionsPanel: React.FC = () => {
  const [executions, setExecutions] = useState<ClaudeExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<ClaudeExecution | null>(null);

  useEffect(() => {
    loadExecutions();
  }, []);

  const loadExecutions = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await executionService.getExecutions(100);
      if (result.error) {
        setError(result.error.message || 'Failed to load executions');
      } else if (result.data) {
        setExecutions(result.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load executions');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toFixed(0)}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="executions-loading">
        <div className="loading-spinner"></div>
        <p>Loading executions...</p>

        <style>{`
          .executions-loading {
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

  if (error) {
    return (
      <div className="executions-error">
        <h3>⚠️ Error Loading Executions</h3>
        <p>{error}</p>
        <p className="hint">
          Note: The claude_execution_logs table may not be created yet.
          Apply the migration from tasks/database/claude_execution_logs_table.sql
        </p>
        <button onClick={loadExecutions} className="btn btn-primary">
          Retry
        </button>

        <style>{`
          .executions-error {
            padding: 2rem;
            text-align: center;
            color: var(--color-text-muted);
          }

          .executions-error h3 {
            color: var(--status-failed);
            margin-bottom: 1rem;
          }

          .executions-error .hint {
            font-size: 0.9rem;
            background: var(--color-bg-elevated);
            padding: 1rem;
            border-radius: var(--radius-md);
            margin: 1rem 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="executions-panel">
      <div className="executions-header">
        <h2>Claude Code Executions</h2>
        <button onClick={loadExecutions} className="btn btn-secondary">
          🔄 Refresh
        </button>
      </div>

      {executions.length === 0 ? (
        <div className="executions-empty">
          <p>No executions logged yet</p>
          <p className="hint">
            Execute tasks using Claude Code to see logs here
          </p>
        </div>
      ) : (
        <div className="executions-table-container">
          <table className="executions-table">
            <thead>
              <tr>
                <th>Started</th>
                <th>Context</th>
                <th>Duration</th>
                <th>Files Changed</th>
                <th>Tokens</th>
                <th>Cost</th>
                <th>Task</th>
              </tr>
            </thead>
            <tbody>
              {executions.map((execution) => (
                <tr
                  key={execution.id}
                  onClick={() => setSelectedExecution(execution)}
                  className="execution-row"
                >
                  <td>{formatDate(execution.started_at)}</td>
                  <td>
                    <span className="context-badge">{execution.context}</span>
                  </td>
                  <td>{formatDuration(execution.duration_seconds)}</td>
                  <td>
                    <span className="file-count">
                      {(execution.files_created?.length || 0) +
                        (execution.files_modified?.length || 0) +
                        (execution.files_deleted?.length || 0)}
                    </span>
                  </td>
                  <td>{execution.tokens_used?.toLocaleString() || '-'}</td>
                  <td>
                    {execution.cost_usd ? `$${execution.cost_usd.toFixed(4)}` : '-'}
                  </td>
                  <td>{execution.linked_task_id ? '🔗' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedExecution && (
        <div className="modal-overlay" onClick={() => setSelectedExecution(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="execution-detail">
              <div className="execution-detail-header">
                <h3>Execution Details</h3>
                <button onClick={() => setSelectedExecution(null)} className="btn-close">
                  ×
                </button>
              </div>

              <div className="execution-detail-content">
                <div className="detail-row">
                  <strong>Session ID:</strong>
                  <code>{selectedExecution.session_id}</code>
                </div>
                <div className="detail-row">
                  <strong>Context:</strong>
                  <span>{selectedExecution.context}</span>
                </div>
                <div className="detail-row">
                  <strong>Working Directory:</strong>
                  <code>{selectedExecution.working_directory}</code>
                </div>
                <div className="detail-row">
                  <strong>Prompt:</strong>
                  <p className="prompt-text">{selectedExecution.prompt}</p>
                </div>

                {selectedExecution.files_created && selectedExecution.files_created.length > 0 && (
                  <div className="detail-row">
                    <strong>Files Created ({selectedExecution.files_created.length}):</strong>
                    <ul>
                      {selectedExecution.files_created.map((file, i) => (
                        <li key={i}>
                          <code>{file}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedExecution.files_modified && selectedExecution.files_modified.length > 0 && (
                  <div className="detail-row">
                    <strong>Files Modified ({selectedExecution.files_modified.length}):</strong>
                    <ul>
                      {selectedExecution.files_modified.map((file, i) => (
                        <li key={i}>
                          <code>{file}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedExecution.git_commits && selectedExecution.git_commits.length > 0 && (
                  <div className="detail-row">
                    <strong>Git Commits ({selectedExecution.git_commits.length}):</strong>
                    <ul>
                      {selectedExecution.git_commits.map((commit: any, i: number) => (
                        <li key={i}>
                          <code>{commit.message}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .executions-panel {
          padding: 2rem;
          max-width: 1600px;
          margin: 0 auto;
        }

        .executions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .executions-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--color-text-primary);
        }

        .executions-empty {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--color-text-muted);
        }

        .executions-empty .hint {
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .executions-table-container {
          overflow-x: auto;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .executions-table {
          width: 100%;
          border-collapse: collapse;
        }

        .executions-table th {
          text-align: left;
          padding: 1rem;
          background: var(--color-bg-elevated);
          border-bottom: 1px solid var(--color-border);
          font-weight: 600;
          color: var(--color-text-primary);
          font-size: 0.9rem;
        }

        .executions-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          font-size: 0.9rem;
        }

        .execution-row {
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .execution-row:hover {
          background-color: var(--color-bg-elevated);
        }

        .context-badge {
          background: rgba(125, 211, 192, 0.1);
          color: var(--color-accent-primary);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 500;
        }

        .file-count {
          background: var(--color-bg-elevated);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
          font-weight: 600;
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
        }

        .modal-content {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow: auto;
        }

        .execution-detail {
          padding: 2rem;
        }

        .execution-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .execution-detail-header h3 {
          margin: 0;
          color: var(--color-text-primary);
        }

        .execution-detail-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .detail-row {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-row strong {
          color: var(--color-text-primary);
          font-size: 0.9rem;
        }

        .detail-row code {
          background: var(--color-bg-elevated);
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          color: var(--color-accent-primary);
        }

        .prompt-text {
          background: var(--color-bg-elevated);
          padding: 1rem;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          white-space: pre-wrap;
          margin: 0;
        }

        .detail-row ul {
          margin: 0;
          padding-left: 1.5rem;
          list-style: none;
        }

        .detail-row li {
          margin: 0.25rem 0;
          font-size: 0.85rem;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 2rem;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 0;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
        }

        .btn-close:hover {
          background: var(--color-bg-elevated);
          color: var(--color-text-primary);
        }

        @media (max-width: 640px) {
          .executions-panel {
            padding: 1rem;
          }

          .executions-table th,
          .executions-table td {
            padding: 0.75rem 0.5rem;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};
