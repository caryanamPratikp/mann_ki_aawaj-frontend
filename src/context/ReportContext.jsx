import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiReportService } from '../services/apiReportService.js';
import { apiAdminService } from '../services/apiAdminService.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const ReportContext = createContext(null);

export function ReportProvider({ children }) {
  const [myReports, setMyReports] = useState([]);
  const [adminQueue, setAdminQueue] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const refreshReports = useCallback(async () => {
    if (!currentUser) { setMyReports([]); setAdminQueue([]); return; }
    if (currentUser.role === 'ADMIN') {
      const response = await apiAdminService.getReports();
      setAdminQueue(response.data?.content || []);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshReports();
  }, [refreshReports]);

  const submitReport = async (reportData) => {
    if (!currentUser) throw new Error('Must be logged in to report content.');
    try {
      const { contentType, targetId, reason, explanation } = reportData;
      const response = contentType === 'COMMENT'
        ? await apiReportService.reportComment(targetId, reason, explanation)
        : await apiReportService.reportPost(targetId, reason, explanation);
      const report = response.data;
      setMyReports((previous) => [report, ...previous]);
      addToast(`Report submitted successfully. Reference: ${report.id}`, 'success');
      return report;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  // The backend has no user-to-user block feature; this remains a local UI preference.
  const blockUser = (username) => setBlockedUsers((previous) => [...new Set([...previous, username])]);

  const unblockUser = (username) => setBlockedUsers((previous) => previous.filter((item) => item !== username));

  const performAdminAction = async (reportId, actionType, actionReason) => {
    try {
      if (actionType === 'Dismiss' || actionType === 'Mark No Violation') await apiAdminService.rejectReport(reportId);
      else await apiAdminService.resolveReport(reportId);
      await refreshReports();
      addToast(`Admin action '${actionType}' applied to ${reportId}.`, 'success');
      return true;
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
