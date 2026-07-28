export const MOCK_CONVERSATIONS = [
  {
    id: 'conv_001',
    participants: ['@quietchapter', '@hiddenpage'],
    lastMessage: 'Thank you for sharing your experience on career burnout.',
    updatedAt: '2026-07-27T12:00:00Z',
    unreadCount: 1,
  },
  {
    id: 'conv_002',
    participants: ['@quietchapter', '@thoughtwindow'],
    lastMessage: 'Boundary setting really changed how I deal with expectations.',
    updatedAt: '2026-07-26T18:30:00Z',
    unreadCount: 0,
  }
];

export const MOCK_MESSAGES = [
  {
    id: 'msg_001',
    conversationId: 'conv_001',
    senderUsername: '@hiddenpage',
    senderInitials: 'HP',
    text: 'Hello @quietchapter, I saw your comment on my post regarding workplace burnout.',
    createdAt: '2026-07-27T11:50:00Z',
  },
  {
    id: 'msg_002',
    conversationId: 'conv_001',
    senderUsername: '@quietchapter',
    senderInitials: 'QC',
    text: 'Hi @hiddenpage! Yes, I deeply resonated with your experience. Taking small breaks made a big difference for me.',
    createdAt: '2026-07-27T11:55:00Z',
  },
  {
    id: 'msg_003',
    conversationId: 'conv_001',
    senderUsername: '@hiddenpage',
    senderInitials: 'HP',
    text: 'Thank you for sharing your experience on career burnout.',
    createdAt: '2026-07-27T12:00:00Z',
  },
  {
    id: 'msg_004',
    conversationId: 'conv_002',
    senderUsername: '@thoughtwindow',
    senderInitials: 'TW',
    text: 'Boundary setting really changed how I deal with expectations.',
    createdAt: '2026-07-26T18:30:00Z',
  }
];
