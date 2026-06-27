import { useState } from 'react';
import Modal from '../common/Modal';
import { reportService } from '../../services/reportService';
import { CheckCircle2, Flag } from 'lucide-react';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'violence', label: 'Violence or harmful behavior' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'other', label: 'Other' }
];

const ReportModal = ({ postId, onClose }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReason) {
      setError('Please select a reason');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await reportService.createReport(postId, selectedReason, description);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Modal title="Report Submitted" onClose={onClose}>
        <div className="report-success">
          <CheckCircle2 size={48} className="report-success-icon" />
          <p className="report-success-text">
            Thank you for your report. Our team will review it shortly.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Report Post" onClose={onClose}>
      <form onSubmit={handleSubmit} className="settings-form">
        {error && <p className="auth-error">{error}</p>}
        <p className="report-intro">
          <Flag size={14} />
          Why are you reporting this post?
        </p>
        <div className="report-reasons">
          {REPORT_REASONS.map((reason) => (
            <label
              key={reason.value}
              className={`report-reason ${selectedReason === reason.value ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="reason"
                value={reason.value}
                checked={selectedReason === reason.value}
                onChange={(e) => setSelectedReason(e.target.value)}
                style={{ accentColor: 'var(--accent)' }}
              />
              <span>{reason.label}</span>
            </label>
          ))}
        </div>
        <div className="form-group">
          <textarea
            placeholder="Additional details (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            maxLength="500"
          />
        </div>
        <button type="submit" className="btn settings-danger-btn" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </Modal>
  );
};

export default ReportModal;