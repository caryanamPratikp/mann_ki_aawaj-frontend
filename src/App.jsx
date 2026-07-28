import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { PostProvider } from './context/PostContext.jsx';
import { CommentProvider } from './context/CommentContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { ReportProvider } from './context/ReportContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';
import { AppRoutes } from './routes/AppRoutes.jsx';
import { ToastContainer } from './components/common/Toast.jsx';
import './styles/global.css';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <LanguageProvider>
            <PostProvider>
              <CommentProvider>
                <NotificationProvider>
                  <ReportProvider>
                    <ChatProvider>
                      <AppRoutes />
                      <ToastContainer />
                    </ChatProvider>
                  </ReportProvider>
                </NotificationProvider>
              </CommentProvider>
            </PostProvider>
          </LanguageProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
