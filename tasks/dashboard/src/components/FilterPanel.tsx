import React, { useState } from 'react';
import { TaskFilters, TaskStatus, TaskPriority, ExecutionSystem } from '../../../types/task.types';

interface FilterPanelProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onChange }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    onChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearFilters = () => {
    onChange({});
  };

  return (
    <div className="filter-panel">
      <button
        className="filter-toggle"
        onClick={() => setShowFilters(!showFilters)}
      >
        🔍 Filters {Object.keys(filters).length > 0 && `(${Object.keys(filters).length})`}
      </button>

      {showFilters && (
        <div className="filter-content">
          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Priority</label>
            <select
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">All</option>
              <option value="critical">P0 - Critical</option>
              <option value="high">P1 - High</option>
              <option value="medium">P2 - Medium</option>
              <option value="low">P3 - Low</option>
              <option value="backlog">P4 - Backlog</option>
            </select>
          </div>

          <div className="filter-group">
            <label>System</label>
            <select
              value={filters.system || ''}
              onChange={(e) => handleFilterChange('system', e.target.value)}
            >
              <option value="">All</option>
              <option value="autonomous_agent">Autonomous Agent</option>
              <option value="asset_generator">Asset Generator</option>
              <option value="professional">Professional</option>
              <option value="personal">Personal</option>
              <option value="projects">Projects</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="filter-actions">
            <button onClick={clearFilters} className="btn btn-secondary btn-sm">
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
