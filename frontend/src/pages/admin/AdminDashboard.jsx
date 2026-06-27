import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  Users as UsersIcon,
  FileText,
  MessageCircle,
  Image as ImageIcon,
  Flag,
  ShieldBan,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  Loader2
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, sublabel, color }) => (
  <div className={`admin-stat-card ${color || ''}`}>
    <div className="admin-stat-icon">
      <Icon size={22} />
    </div>
    <div className="admin-stat-body">
      <span className="admin-stat-value">{value}</span>
      <span className="admin-stat-label">{label}</span>
      {sublabel && <span className="admin-stat-sublabel">{sublabel}</span>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getStats();
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <Loader2 size={28} className="spin" />
        <span>Loading dashboard…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error-state">
        <AlertTriangle size={32} />
        <span>{error}</span>
      </div>
    );
  }

  const { totals, weekly, topReportedReasons } = stats;

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Platform overview for the last 7 days</p>
      </div>

      <section className="admin-stats-grid">
        <StatCard
          icon={UsersIcon}
          label="Total Users"
          value={totals.users}
          sublabel={`+${weekly.newUsers} this week`}
          color="primary"
        />
        <StatCard
          icon={FileText}
          label="Total Posts"
          value={totals.posts}
          sublabel={`+${weekly.newPosts} this week`}
          color="accent"
        />
        <StatCard
          icon={MessageCircle}
          label="Total Comments"
          value={totals.comments}
        />
        <StatCard
          icon={ImageIcon}
          label="Total Stories"
          value={totals.stories}
        />
        <StatCard
          icon={Flag}
          label="Pending Reports"
          value={totals.pendingReports}
          sublabel={`${totals.resolvedReports} resolved`}
          color="warning"
        />
        <StatCard
          icon={ShieldBan}
          label="Suspended Users"
          value={totals.suspendedUsers}
          color="danger"
        />
        <StatCard
          icon={UserCheck}
          label="Verified Users"
          value={totals.users > 0 ? `${Math.round((totals.users / Math.max(1, totals.users)) * 100)}%` : '0%'}
          sublabel={`${totals.users - totals.suspendedUsers} active`}
        />
        <StatCard
          icon={TrendingUp}
          label="New Reports (week)"
          value={weekly.newReports}
        />
      </section>

      <section className="admin-bottom-grid">
        <div className="admin-card">
          <h2 className="admin-card-title">Weekly Activity</h2>
          <div className="admin-weekly-list">
            <div className="admin-weekly-row">
              <span className="admin-weekly-label">New users</span>
              <span className="admin-weekly-value">{weekly.newUsers}</span>
            </div>
            <div className="admin-weekly-row">
              <span className="admin-weekly-label">New posts</span>
              <span className="admin-weekly-value">{weekly.newPosts}</span>
            </div>
            <div className="admin-weekly-row">
              <span className="admin-weekly-label">New reports</span>
              <span className="admin-weekly-value">{weekly.newReports}</span>
            </div>
            <div className="admin-weekly-row total">
              <span className="admin-weekly-label">Archived posts</span>
              <span className="admin-weekly-value">{totals.archivedPosts}</span>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="admin-card-title">Top Report Reasons</h2>
          {topReportedReasons.length === 0 ? (
            <div className="admin-empty-inline">No reports yet</div>
          ) : (
            <div className="admin-reasons-list">
              {topReportedReasons.map((r) => (
                <div key={r.reason} className="admin-reason-row">
                  <span className="admin-reason-label">{r.reason}</span>
                  <div className="admin-reason-bar-bg">
                    <div
                      className="admin-reason-bar-fg"
                      style={{
                        width: `${Math.min(100, (r.count / Math.max(1, topReportedReasons[0].count)) * 100)}%`
                      }}
                    />
                  </div>
                  <span className="admin-reason-count">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;