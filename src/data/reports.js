export const MOCK_REPORTS = [
  {
    id: 'RPT-8492',
    contentType: 'COMMENT', // POST, COMMENT, REPLY, IMAGE, PROFILE
    targetId: 'comment_007',
    postId: 'post_003',
    reportedContent: 'People who get upset when you set boundaries were often benefiting from your lack of them.',
    authorUsername: '@silentcanvas',
    reporterUsername: '@thoughtwindow', // Private: visible only to admin
    reason: 'Harassment',
    explanation: 'The tone felt overly targeted towards a sensitive personal situation.',
    detectedCategory: 'Harassment',
    riskLevel: 'LOW',
    previousReports: 0,
    previousViolations: 0,
    status: 'Submitted', // Submitted, Under Review, Action Taken, No Violation, Closed
    createdAt: '2026-07-27T08:30:00Z',
    adminAction: null,
    adminNotes: null
  },
  {
    id: 'RPT-8493',
    contentType: 'POST',
    targetId: 'post_005',
    postId: 'post_005',
    reportedContent: 'Two years ago, a bad investment decision wiped out 70% of my hard-earned emergency fund...',
    authorUsername: '@unfinishedline',
    reporterUsername: '@plaintruth',
    reason: 'Scam',
    explanation: 'Checking if financial advice violates safety guidelines.',
    detectedCategory: 'Scam wording',
    riskLevel: 'MEDIUM',
    previousReports: 1,
    previousViolations: 0,
    status: 'Under Review',
    createdAt: '2026-07-27T09:15:00Z',
    adminAction: null,
    adminNotes: 'Reviewing for unregistered financial advisory claims.'
  }
];
