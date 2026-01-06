import React, { useState, useEffect } from 'react';
import { taskService } from '../lib/taskService';

export const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const result = await taskService.getStatistics();
    if (result.data) {
      setStats(result.data);
    }
  };

  if (!stats) return null;

  return (
    <div className="dashboard-stats">
      <div className="stat-card">
        <div className="stat-value">{stats.total || 0}</div>
        <div className="stat-label">Total Tasks</div>
      </div>

      <div className="stat-card stat-pending">
        <div className="stat-value">{stats.by_status?.pending_approval || 0}</div>
        <div className="stat-label">Pending Approval</div>
      </div>

      <div className="stat-card stat-progress">
        <div className="stat-value">{stats.by_status?.in_progress || 0}</div>
        <div className="stat-label">In Progress</div>
      </div>

      <div className="stat-card stat-completed">
        <div className="stat-value">{stats.by_status?.completed || 0}</div>
        <div className="stat-label">Completed</div>
      </div>

      <div className="stat-card stat-failed">
        <div className="stat-value">{stats.by_status?.failed || 0}</div>
        <div className="stat-label">Failed</div>
      </div>
    </div>
  );
};
