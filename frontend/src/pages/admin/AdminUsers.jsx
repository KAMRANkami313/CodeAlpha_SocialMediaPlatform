import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Avatar from '../../components/common/Avatar';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import {
  Users as UsersIcon,
  Search,
  Ban,
  Unlock,
  Trash2,
  ShieldCheck,
  User as UserIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  ShieldAlert
} from 'lucide-react';

const ROLE_FILTERS = [
  { value: '', label: 'All Roles' },
  { value: 'user', label: 'Users' },
  { value: 'admin', label: 'Admins' },
  { value: 'super_admin', label: 'Super Admins' }
];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [suspendedFilter, setSuspendedFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmRole, setConfirmRole] = useState(null);
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = storedUser.role === 'super_admin';

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (suspendedFilter) params.suspended = suspendedFilter;
      const res = await adminService.getUsers(params);
      setUsers(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotalUsers(res.data.totalUsers);
      setHasMore(res.data.hasMore);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, suspendedFilter]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(delay);
  }, [fetchUsers]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleFilterChange = (value) => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleSuspendedToggle = () => {
    setSuspendedFilter(suspendedFilter === 'true' ? '' : 'true');
    setPage(1);
  };

  const handleSuspend = async (userId) => {
    setActionLoading(userId);
    try {
      await adminService.suspendUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isSuspended: true } : u));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to suspend user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnsuspend = async (userId) => {
    setActionLoading(userId);
    try {
      await adminService.unsuspendUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isSuspended: false } : u));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unsuspend user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetRole = async (userId, role) => {
    setActionLoading(userId);
    try {
      await adminService.setUserRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      setConfirmRole(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    setActionLoading(userId);
    try {
      await adminService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setConfirmDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'super_admin') {
      return (
        <span className="admin-role-badge super_admin">
          <ShieldCheck size={11} />
          Super Admin
        </span>
      );
    }
    if (role === 'admin') {
      return (
        <span className="admin-role-badge admin">
          <ShieldAlert size={11} />
          Admin
        </span>
      );
    }
    return (
      <span className="admin-role-badge user">
        <UserIcon size={11} />
        User
      </span>
    );
  };

  return (
    <div className="admin-users-page">
      <div className="admin-page-header">
        <h1>Users</h1>
        <p>{totalUsers} total user{totalUsers === 1 ? '' : 's'}</p>
      </div>

      <div className="admin-users-toolbar">
        <div className="admin-search-wrapper">
          <Search size={16} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search by username or email…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="admin-search-input"
          />
          {search && (
            <button
              className="admin-search-clear"
              onClick={() => handleSearchChange('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select
          className="admin-select"
          value={roleFilter}
          onChange={(e) => handleRoleFilterChange(e.target.value)}
        >
          {ROLE_FILTERS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>

        <button
          className={`admin-filter-chip ${suspendedFilter === 'true' ? 'active' : ''}`}
          onClick={handleSuspendedToggle}
        >
          <Ban size={13} />
          Suspended only
        </button>
      </div>

      {loading && (
        <div className="admin-loading">
          <Loader2 size={28} className="spin" />
          <span>Loading users…</span>
        </div>
      )}

      {error && (
        <div className="admin-error-state">
          <AlertCircle size={28} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <div className="admin-empty-state">
          <UsersIcon size={48} />
          <h3>No users found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}

      {!loading && !error && users.length > 0 && (
        <>
          <div className="admin-users-table">
            <div className="admin-users-row admin-users-header">
              <div className="admin-col-user">User</div>
              <div className="admin-col-email">Email</div>
              <div className="admin-col-role">Role</div>
              <div className="admin-col-stats">Stats</div>
              <div className="admin-col-joined">Joined</div>
              <div className="admin-col-actions">Actions</div>
            </div>

            {users.map((u) => {
              const isMe = u.id === storedUser.id;
              const canManage = !isMe && u.role !== 'super_admin' && (isSuperAdmin || u.role === 'user');
              return (
                <div key={u.id} className={`admin-users-row ${u.isSuspended ? 'suspended' : ''}`}>
                  <div className="admin-col-user">
                    <Avatar
                      src={u.profilePicture}
                      alt={u.username}
                      className="admin-user-avatar"
                    />
                    <div className="admin-user-info">
                      <Link to={`/profile/${u.id}`} className="admin-user-name">
                        {u.username}
                        <VerifiedBadge show={u.isVerified} size="small" />
                      </Link>
                      {u.isSuspended && (
                        <span className="admin-suspended-tag">Suspended</span>
                      )}
                    </div>
                  </div>
                  <div className="admin-col-email">{u.email}</div>
                  <div className="admin-col-role">
                    {getRoleBadge(u.role)}
                  </div>
                  <div className="admin-col-stats">
                    <span>{u.followersCount} followers</span>
                    <span>{u.followingCount} following</span>
                  </div>
                  <div className="admin-col-joined">
                    {new Date(u.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </div>
                  <div className="admin-col-actions">
                    {isMe ? (
                      <span className="admin-you-tag">You</span>
                    ) : u.role === 'super_admin' ? (
                      <span className="admin-protected-tag">Protected</span>
                    ) : (
                      <div className="admin-user-actions">
                        {u.isSuspended ? (
                          <button
                            className="admin-action-btn unsuspend"
                            onClick={() => handleUnsuspend(u.id)}
                            disabled={actionLoading === u.id}
                            title="Unsuspend user"
                          >
                            <Unlock size={14} />
                          </button>
                        ) : (
                          <button
                            className="admin-action-btn suspend"
                            onClick={() => handleSuspend(u.id)}
                            disabled={actionLoading === u.id || !canManage}
                            title="Suspend user"
                          >
                            <Ban size={14} />
                          </button>
                        )}
                        {isSuperAdmin && u.role !== 'super_admin' && (
                          <button
                            className="admin-action-btn role"
                            onClick={() => setConfirmRole({ user: u, role: u.role === 'admin' ? 'user' : 'admin' })}
                            disabled={actionLoading === u.id}
                            title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                          >
                            <ShieldCheck size={14} />
                          </button>
                        )}
                        {canManage && (
                          <button
                            className="admin-action-btn delete"
                            onClick={() => setConfirmDelete(u)}
                            disabled={actionLoading === u.id}
                            title="Delete user"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

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
        </>
      )}

      {confirmDelete && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-confirm-icon">
              <AlertCircle size={40} />
            </div>
            <h3>Delete @{confirmDelete.username}?</h3>
            <p>
              This will permanently delete the user and ALL their posts, comments,
              stories, and reports. This action cannot be undone.
            </p>
            <div className="admin-confirm-buttons">
              <button
                className="btn admin-cancel-btn"
                onClick={() => setConfirmDelete(null)}
                disabled={actionLoading === confirmDelete.id}
              >
                Cancel
              </button>
              <button
                className="btn settings-danger-btn"
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={actionLoading === confirmDelete.id}
              >
                {actionLoading === confirmDelete.id ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmRole && (
        <div className="admin-modal-overlay" onClick={() => setConfirmRole(null)}>
          <div className="admin-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-confirm-icon role">
              <ShieldCheck size={40} />
            </div>
            <h3>
              {confirmRole.role === 'admin' ? 'Promote' : 'Demote'} @{confirmRole.user.username}?
            </h3>
            <p>
              {confirmRole.role === 'admin'
                ? 'This user will gain admin powers: dashboard access, report moderation, and user management.'
                : 'This user will lose all admin powers and become a regular user.'}
            </p>
            <div className="admin-confirm-buttons">
              <button
                className="btn admin-cancel-btn"
                onClick={() => setConfirmRole(null)}
                disabled={actionLoading === confirmRole.user.id}
              >
                Cancel
              </button>
              <button
                className="btn"
                onClick={() => handleSetRole(confirmRole.user.id, confirmRole.role)}
                disabled={actionLoading === confirmRole.user.id}
              >
                {actionLoading === confirmRole.user.id ? <Loader2 size={14} className="spin" /> : <ShieldCheck size={14} />}
                {confirmRole.role === 'admin' ? 'Promote to Admin' : 'Demote to User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;