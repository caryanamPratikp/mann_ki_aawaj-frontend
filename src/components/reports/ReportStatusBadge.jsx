import React from 'react';

export function ReportStatusBadge({ status }) {
  let style = { background: 'var(--swiss-coffee)', color: 'var(--eclipse)' };

  switch (status) {
    case 'Submitted':
      style = { background: 'var(--swiss-coffee)', color: 'var(--eclipse)' };
      break;
    case 'Under Review':
      style = { background: 'var(--warning-bg)', color: 'var(--warning)' };
      break;
    case 'Action Taken':
      style = { background: 'var(--success-bg)', color: 'var(--success)' };
      break;
    case 'No Violation':
      style = { background: 'var(--deep-plum-light)', color: 'var(--deep-plum)' };
      break;
    case 'Closed':
      style = { background: 'var(--swiss-coffee)', color: 'var(--hurricane)' };
      break;
    default:
      break;
  }

  return (
    <span className="badge" style={style}>
      {status}
    </span>
  );
}
