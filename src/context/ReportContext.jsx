import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockReportService } from '../services/mockReportService.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const ReportContext = createContext(null);

export function ReportProvider({ children }) {
  const [myReports, setMyReports] = useState([]);
  const [adminQueue, setAdminQueue] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const refreshReports = useCallback(() => {
    if (currentUser) {
      setMyReports(mockReportService.getUserReports(currentUser.username));
    }
    setAdminQueue(mockReportService.getAdminReportsQueue('All'));
    setBlockedUsers(mockReportService.getBlockedUsers());
  }, [currentUser]);

  useEffect(() => {
    refreshReports();
  }, [refreshReports]);

  const submitReport = (reportData) => {
    if (!currentUser) throw new Error('Must be logged in to report content.');
    try {
      const report = mockReportService.createReport(reportData, currentUser);
      refreshReports();
      addToast(`Report submitted successfully. Reference: ${report.id}`, 'success');
      return report;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const blockUser = (username) => {
    mockReportService.blockUser(username);
    refreshReports();
    addToast(`User ${username} blocked. You won't see their posts or comments.`, 'info');
  };

  const unblockUser = (username) => {
    mockReportService.unblockUser(username);
    refreshReports();
    addToast(`User ${username} unblocked.`, 'info');
  };

  const performAdminAction = (reportId, actionType, actionReason, adminNotes) => {
    try {
      const updated = mockReportService.performAdminAction(reportId, actionType, actionReason, adminNotes);
      refreshReports();
      addToast(`Admin action '${actionType}' applied to ${reportId}.`, 'success');
      return updated;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  return (
    <ReportContext.Provider value={{
      myReports,
      adminQueue,
      blockedUsers,
      refreshReports,
      submitReport,
      blockUser,
      unblockUser,
      performAdminAction
    }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportContext);
  if (!context) throw new Error('useReports must be used within ReportProvider');
  return context;
}
