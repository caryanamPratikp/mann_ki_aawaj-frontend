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
    const token = localStorage.getItem('auth_token');
    if (!currentUser || !token) { setMyReports([]); setAdminQueue([]); return; }

    if (currentUser.role === 'ADMIN') {
      try {
        const response = await apiAdminService.getReports();
        const raw = response.data?.content || (Array.isArray(response.data) ? response.data : (response.data || response.content || []));
        const list = Array.isArray(raw) ? raw : [];
        setAdminQueue(list);
      } catch (err) {
        console.warn('Failed to fetch admin report queue:', err?.message || err);
        setAdminQueue([]);
      }
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
      addToast(`Report submitted successfully. Reference ID: #${report.id || 'SUBMITTED'}`, 'success');
      refreshReports();
      return report;
    } catch (err) {
      addToast(err.message || 'Failed to submit report', 'error');
      throw err;
    }
  };

  const blockUser = (username) => setBlockedUsers((previous) => [...new Set([...previous, username])]);

  const unblockUser = (username) => setBlockedUsers((previous) => previous.filter((item) => item !== username));

  const performAdminAction = async (reportId, actionType, actionReason) => {
    try {
      if (actionType === 'Dismiss' || actionType === 'Mark No Violation') await apiAdminService.rejectReport(reportId);
      else await apiAdminService.resolveReport(reportId);
      await refreshReports();
      addToast(`Admin action '${actionType}' applied to report #${reportId}.`, 'success');
      return true;
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
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
