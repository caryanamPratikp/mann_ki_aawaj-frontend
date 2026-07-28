import React, { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { Textarea } from '../common/Textarea.jsx';
import { ShieldAlert } from 'lucide-react';

const ADMIN_ACTIONS = [
  { key: 'Dismiss', label: 'Dismiss Report', danger: false },
  { key: 'Mark No Violation', label: 'Mark No Violation', danger: false },
  { key: 'Ask User to Edit', label: 'Ask User to Edit', danger: false },
  { key: 'Hide Content', label: 'Hide Content', danger: true },
  { key: 'Remove Content', label: 'Remove Content', danger: true },
  { key: 'Warn User', label: 'Warn User', danger: true },
  { key: 'Restrict Commenting', label: 'Restrict Commenting (7 Days)', danger: true },
  { key: 'Restrict Posting', label: 'Restrict Posting', danger: true },
  { key: 'Temporarily Suspend', label: 'Temporarily Suspend User', danger: true },
  { key: 'Permanently Ban', label: 'Permanently Ban User', danger: true },
];

export function AdminActionModal({ isOpen, onClose, report, onExecuteAction }) {
  const [selectedAction, setSelectedAction] = useState(ADMIN_ACTIONS[0].key);
  const [actionReason, setActionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !report) return null;

  const currentActionConfig = ADMIN_ACTIONS.find((a) => a.key === selectedAction);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!actionReason.trim()) return;

    setSubmitting(true);
    try {
      await onExecuteAction(report.id, selectedAction, actionReason.trim(), adminNotes.trim());
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Take Action on ${report.id}`} maxWidth="560px">
      <form onSubmit={handleSubmit} className="flex-col gap-md">
        <div className="mka-panel flex-col gap-xs">
          <div className="flex-row justify-between items-center">
            <span className="caption-text bold">Target: {report.contentType} ({report.id})</span>
            <span className="badge badge-warning">Author: {report.authorUsername}</span>
          </div>
          <p className="secondary-text" style={{ fontSize: '13px' }}>
            Reported Reason: <strong>{report.reason}</strong>
          </p>
        </div>

        <div className="flex-col gap-xs">
          <label style={{ fontSize: '14px', fontWeight: 500 }}>Select Administrative Action *</label>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              fontSize: '14px',
              background: 'var(--pure-white)',
            }}
          >
            {ADMIN_ACTIONS.map((act) => (
              <option key={act.key} value={act.key}>
                {act.label}
              </option>
            ))}
          </select>
        </div>

        <Textarea
          label="Action Reason (Required) *"
          value={actionReason}
          onChange={(e) => setActionReason(e.target.value)}
          placeholder="State the justification for this moderation action..."
          rows={3}
          required
        />

        <Textarea
          label="Internal Admin Notes (Optional)"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Internal notes visible to other moderators..."
          rows={2}
        />

        <div className="flex-row justify-between items-center" style={{ marginTop: '12px' }}>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant={currentActionConfig?.danger ? 'danger' : 'primary'}
            type="submit"
            disabled={!actionReason.trim() || submitting}
            icon={ShieldAlert}
          >
            {submitting ? 'Applying...' : `Execute ${selectedAction}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
