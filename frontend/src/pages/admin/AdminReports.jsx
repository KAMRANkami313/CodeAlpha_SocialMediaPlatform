import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import Avatar from '../../components/common/Avatar';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import {
  Flag,
  CheckCircle2,
  Ban,
  AlertCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Inbox
} from 'lucide-react';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' }
];

const STATUS_BADGE = {
  pending: { label: 'Pending', className: 'pending' },
  reviewed: { label: 'Reviewed', className: 'reviewed' },
  resolved: { label: 'Resolved', className: 'resolved' },
  dismissed: { label: 'Dismissed', className: 'dismissed' }
};

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionNote, setActionNote] = useState('');
  const [expandedReport, setExpandedReport] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getReports({
        page,
        limit: 15,
        ...(statusFilter ? { status: statusFilter } : {})
      });
      setReports(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotalReports(res.data.totalReports);
      setHasMore(res.data.hasMore);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleAction = async (reportId, action) => {
    setActionLoading(reportId);
    try {
      await adminService.takeReportAction(reportId, action, actionNote);
      setExpandedReport(null);
      setActionNote('');
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleExpand = (reportId) => {
    setExpandedReport(expandedReport === reportId ? null : reportId);
    setActionNote('');
  };

  return (
    <div className="admin-reports-page">
      <div className="admin-page-header">
        <h1>Reports</h1>
        <p>{totalReports} total report{totalReports === 1 ? '' : 's'}</p>
      </div>

      <div className="admin-filter-bar">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            className={`admin-filter-chip ${statusFilter === f.value ? 'active' : ''}`}
            onClick={() => handleStatusFilterChange(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="admin-loading">
          <Loader2 size={28} className="spin" />
          <span>Loading reports…</span>
        </div>
      )}

      {error && (
        <div className="admin-error-state">
          <AlertCircle size={28} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="admin-empty-state">
          <Inbox size={48} />
          <h3>No reports found</h3>
          <p>When users report posts, they'll appear here for review.</p>
        </div>
      )}

      {!loading && !error && reports.length > 0 && (
        <div className="admin-reports-list">
          {reports.map((report) => {
            const status = STATUS_BADGE[report.status];
            const isExpanded = expandedReport === report._id;
            const isPending = report.status === 'pending' || report.status === 'reviewed';
            return (
              <div key={report._id} className="admin-report-card">
                <div
                  className="admin-report-header"
                  onClick={() => toggleExpand(report._id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') toggleExpand(report._id); }}
                >
                  <div className="admin-report-meta">
                    <div className="admin-report-reporter">
                      <Avatar
                        src={report.reporter?.profilePicture}
                        alt="Reporter"
                        className="admin-report-avatar"
                      />
                      <div>
                        <div className="admin-report-name">
                          {report.reporter?.username || 'Unknown'}
                        </div>
                        <div className="admin-report-sub">
                          reported {new Date(report.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <span className={`admin-status-badge ${status.className}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="admin-report-body">
                    <div className="admin-report-reason">
                      <Flag size={13} />
                      <strong>{report.reason}</strong>
                    </div>
                    {report.description && (
                      <p className="admin-report-description">{report.description}</p>
                    )}
                    {report.post && (
                      <div className="admin-report-post">
                        {report.post.image && (
                          <img src={report.post.image} alt="Reported post" className="admin-report-thumb" />
                        )}
                        <div className="admin-report-postinfo">
                          <span className="admin-report-postuser">
                            by @{report.post.user?.username || 'unknown'}
                            {report.post.user?.isSuspended && (
                              <span className="admin-suspended-tag">suspended</span>
                            )}
                          </span>
                          <span className="admin-report-caption">
                            {report.post.caption || '(no caption)'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {report.resolvedBy && (
                    <div className="admin-report-resolution">
                      <span>Resolved by @{report.resolvedBy.username || 'admin'}</span>
                      {report.action !== 'none' && (
                        <span className="admin-action-tag">{report.action.replace(/_/g, ' ')}</span>
                      )}
                      {report.resolutionNote && (
                        <span className="admin-resolution-note">"{report.resolutionNote}"</span>
                      )}
                    </div>
                  )}
                </div>

                {isExpanded && isPending && (
                  <div className="admin-report-actions">
                    <input
                      type="text"
                      placeholder="Optional note (e.g. 'Removed - spam')"
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      className="admin-action-input"
                    />
                    <div className="admin-action-buttons">
                      <button
                        className="admin-action-btn resolve"
                        onClick={() => handleAction(report._id, 'resolve')}
                        disabled={actionLoading === report._id}
                      >
                        <CheckCircle2 size={14} />
                        Remove Post
                      </button>
                      <button
                        className="admin-action-btn suspend"
                        onClick={() => handleAction(report._id, 'suspend_user')}
                        disabled={actionLoading === report._id}
                      >
                        <Ban size={14} />
                        Suspend User
                      </button>
                      <button
                        className="admin-action-btn warn"
                        onClick={() => handleAction(report._id, 'warn_user')}
                        disabled={actionLoading === report._id}
                      >
                        <AlertCircle size={14} />
                        Warn User
                      </button>
                      <button
                        className="admin-action-btn dismiss"
                        onClick={() => handleAction(report._id, 'dismiss')}
                        disabled={actionLoading === report._id}
                      >
                        <XCircle size={14} />
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                {isExpanded && !isPending && (
                  <div className="admin-report-closed">
                    <span>This report is closed. No further actions available.</span>
                  </div>
                )}

                {actionLoading === report._id && (
                  <div className="admin-report-loading">
                    <Loader2 size={16} className="spin" />
                    Processing action…
                  </div>
                )}
              </div>
            );
          })}

          {(hasMore || page > 1) && (
            <div className="admin-pagination">
              <button
                className="admin-page-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <span className="admin-page-info">
                Page {page} of {Math.max(1, totalPages)}
              </span>
              <button
                className="admin-page-btn"
                onClick={() => setPage(p => p + 1)}
                disabled={!hasMore || loading}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReports;