import React from 'react';
import { Feather } from 'lucide-react';
import { Button } from './Button.jsx';

export function EmptyState({
  title = 'No content found',
  description = 'There are no items to display at this time.',
  icon: Icon = Feather,
  actionText,
  onAction,
}) {
  return (
    <div
      className="mka-card flex-col items-center justify-center text-center gap-md"
      style={{ padding: '40px 24px', background: 'var(--soft-white)' }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--swiss-coffee)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--deep-plum)',
        }}
      >
        <Icon size={28} />
      </div>
      <div>
        <h3 className="card-heading" style={{ marginBottom: '6px' }}>{title}</h3>
        <p className="secondary-text" style={{ maxWidth: '400px' }}>{description}</p>
      </div>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
