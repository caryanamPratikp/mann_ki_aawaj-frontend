import React from 'react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';
import { AlertTriangle } from 'lucide-react';

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex-col gap-md">
        <div className="flex-row items-center gap-md">
          <div
            style={{
              padding: '10px',
              borderRadius: '50%',
              background: danger ? 'var(--error-bg)' : 'var(--warning-bg)',
              color: danger ? 'var(--error)' : 'var(--warning)',
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <p className="body-text">{message}</p>
        </div>
        <div className="flex-row justify-between items-center" style={{ marginTop: '12px' }}>
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
