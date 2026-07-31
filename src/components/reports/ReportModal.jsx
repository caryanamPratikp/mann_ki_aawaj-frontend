import React, { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { Textarea } from '../common/Textarea.jsx';
import { Checkbox } from '../common/Checkbox.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { Flag, ShieldAlert } from 'lucide-react';

// These values must match the backend ReportReason enum exactly.
const REPORT_REASONS = [
  'HATE_SPEECH', 'RELIGIOUS_HATE', 'CASTE_DISCRIMINATION', 'GENDER_HARASSMENT',
  'ABUSIVE_LANGUAGE', 'VIOLENCE', 'SPAM', 'FAKE_INFORMATION', 'SEXUAL_CONTENT', 'OTHER',
];

export function ReportModal({
  isOpen,
  onClose,
  contentType = 'POST', // POST, COMMENT, REPLY, IMAGE, PROFILE
  targetId,
  postId,
  reportedContent,
  authorUsername,
}) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [explanation, setExplanation] = useState('');
  const [blockAuthor, setBlockAuthor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { submitReport } = useReports();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await submitReport({
        contentType,
        targetId,
        postId,
        reportedContent,
        authorUsername,
        reason,
        explanation,
        blockAuthor,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Report ${contentType.toLowerCase()}`}>
      <form onSubmit={handleSubmit} className="flex-col gap-md">
        <div className="flex-row items-center gap-sm" style={{ color: 'var(--warning)', background: 'var(--warning-bg)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
          <ShieldAlert size={20} />
          <span style={{ fontSize: '13px' }}>
            Your report is completely anonymous. Our team will review this {contentType.toLowerCase()} against community guidelines.
          </span>
        </div>

        {reportedContent && (
          <div className="mka-panel flex-col gap-xs">
            <span className="caption-text bold">Content Preview ({authorUsername}):</span>
            <p className="secondary-text" style={{ fontStyle: 'italic', fontSize: '13px' }}>
              "{reportedContent.slice(0, 150)}{reportedContent.length > 150 ? '...' : ''}"
            </p>
          </div>
        )}

        <div className="flex-col gap-xs">
          <label style={{ fontSize: '14px', fontWeight: 500 }}>Select Reason *</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              fontSize: '14px',
              background: 'var(--pure-white)',
            }}
          >
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <Textarea
          label="Optional Explanation"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Provide additional details to help our moderation team understand the context..."
          rows={3}
          maxLength={500}
        />

        <Checkbox
          id="blockAuthorCheck"
          label={`Also block posts and comments from ${authorUsername}`}
          checked={blockAuthor}
          onChange={(e) => setBlockAuthor(e.target.checked)}
        />

        <div className="flex-row justify-between items-center" style={{ marginTop: '12px' }}>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="danger" type="submit" disabled={submitting} icon={Flag}>
            {submitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
