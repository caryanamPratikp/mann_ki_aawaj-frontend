export const MOCK_CONVERSATIONS = [
  // Active conversation 1
  {
    id: 'conv_001',
    participants: ['@quietchapter', '@hiddenpage'],
    lastMessage: 'Thank you for sharing your experience on career burnout.',
    updatedAt: '2026-07-28T14:00:00Z',
    unreadCount: 0,
    requestStatus: 'ACCEPTED',
    requestSender: '@hiddenpage',
  },
  // Active conversation 2
  {
    id: 'conv_002',
    participants: ['@quietchapter', '@thoughtwindow'],
    lastMessage: 'Boundary setting really changed how I deal with expectations.',
    updatedAt: '2026-07-28T12:30:00Z',
    unreadCount: 0,
    requestStatus: 'ACCEPTED',
    requestSender: '@thoughtwindow',
  },
  // Outgoing pending request (Our pending chat user request sent to @plaintruth)
  {
    id: 'conv_003_out',
    participants: ['@quietchapter', '@plaintruth'],
    lastMessage: 'Hey @plaintruth, your reminder about taking life step-by-step really touched me today.',
    updatedAt: '2026-07-28T16:10:00Z',
    unreadCount: 0,
    requestStatus: 'PENDING',
    requestSender: '@quietchapter',
  },
  // Incoming pending request (Request yet to accept from another user @unfinishedline)
  {
    id: 'conv_004_in',
    participants: ['@quietchapter', '@unfinishedline'],
    lastMessage: 'Hi @quietchapter, I saw your post on celebrating quiet victories and wanted to ask advice anonymously.',
    updatedAt: '2026-07-28T17:30:00Z',
    unreadCount: 1,
    requestStatus: 'PENDING',
    requestSender: '@unfinishedline',
  }
];

export const MOCK_MESSAGES = [
  {
    id: 'msg_001',
    conversationId: 'conv_001',
    senderUsername: '@hiddenpage',
    senderInitials: 'HP',
    text: 'Hello @quietchapter, I saw your comment on my post regarding workplace burnout.',
    createdAt: '2026-07-28T13:50:00Z',
  },
  {
    id: 'msg_002',
    conversationId: 'conv_001',
    senderUsername: '@quietchapter',
    senderInitials: 'QC',
    text: 'Hi @hiddenpage! Yes, I deeply resonated with your experience.',
    createdAt: '2026-07-28T13:55:00Z',
  },
  {
    id: 'msg_003',
    conversationId: 'conv_001',
    senderUsername: '@hiddenpage',
    senderInitials: 'HP',
    text: 'Thank you for sharing your experience on career burnout.',
    createdAt: '2026-07-28T14:00:00Z',
  },
  {
    id: 'msg_004',
    conversationId: 'conv_002',
    senderUsername: '@thoughtwindow',
    senderInitials: 'TW',
    text: 'Boundary setting really changed how I deal with expectations.',
    createdAt: '2026-07-28T12:30:00Z',
  },
  {
    id: 'msg_005',
    conversationId: 'conv_003_out',
    senderUsername: '@quietchapter',
    senderInitials: 'QC',
    text: 'Hey @plaintruth, your reminder about taking life step-by-step really touched me today.',
    createdAt: '2026-07-28T16:10:00Z',
  },
  {
    id: 'msg_006',
    conversationId: 'conv_004_in',
    senderUsername: '@unfinishedline',
    senderInitials: 'UL',
    text: 'Hi @quietchapter, I saw your post on celebrating quiet victories and wanted to ask advice anonymously.',
    createdAt: '2026-07-28T17:30:00Z',
  }
];
