import { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';
import { messageService } from '../../services/messageService';
import { userService } from '../../services/userService';

const SharePostModal = ({ post, onClose, onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [convRes, sugRes] = await Promise.all([
          messageService.getConversations().catch(() => ({ data: [] })),
          userService.getSuggested().catch(() => ({ data: [] }))
        ]);
        if (cancelled) return;
        const seen = new Set();
        const merged = [];
        [...(convRes.data || []), ...(sugRes.data || [])].forEach((u) => {
          if (u && u._id && !seen.has(u._id)) {
            seen.add(u._id);
            merged.push(u);
          }
        });
        setUsers(merged);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter((u) => (u.username || '').toLowerCase().includes(q));
  }, [users, query]);

  const handlePick = async (u) => {
    setSendingId(u._id);
    try {
      await onSelectUser(u);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <Modal title="Share to DM" onClose={onClose}>
      <div className="share-post-modal">
        {post?.image && (
          <div className="share-post-preview">
            <img src={post.image} alt="Post preview" />
            <div className="share-post-preview-meta">
              <span className="share-post-preview-label">Sharing post by</span>
              <span className="share-post-preview-author">@{post.user?.username}</span>
            </div>
          </div>
        )}
        <input
          type="text"
          className="share-post-search"
          placeholder="Search people…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search people to share with"
        />
        <div className="share-post-list">
          {loading && (
            <div className="share-post-empty">Loading people…</div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="share-post-empty">
              No one to share with yet. Start a conversation first!
            </div>
          )}
          {!loading && filtered.map((u) => (
            <button
              key={u._id}
              className="share-post-user"
              onClick={() => handlePick(u)}
              disabled={sendingId !== null}
            >
              <Avatar
                src={u.profilePicture}
                alt=""
                className="suggestion-avatar"
                style={{ width: '40px', height: '40px', flexShrink: 0 }}
              />
              <span className="share-post-username">
                {u.username}
                <VerifiedBadge show={u.isVerified} />
              </span>
              <span className="share-post-send">
                {sendingId === u._id ? 'Sending…' : 'Send'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default SharePostModal;