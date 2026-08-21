import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiReportService } from '../services/apiReportService.js';
import { apiAdminService } from '../services/apiAdminService.js';
import { apiUserService } from '../services/apiUserService.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const ReportContext = createContext(null);

export function ReportProvider({ children }) {
  const [myReports, setMyReports] = useState([]);
  const [adminQueue, setAdminQueue] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [mutedUsers, setMutedUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('mka_muted_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { currentUser } = useAuth();
  const { addToast } = useToast();

  // Sync muted users list with backend API on mount / login
  const refreshMutedUsers = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!currentUser || !token || token.startsWith('mock')) return;

    try {
      const res = await apiUserService.getMutedUsers();
      const list = res?.data || res || [];
      if (Array.isArray(list)) {
        const formatted = [];
        list.forEach(u => {
          const raw = u.replace(/^@/, '');
          formatted.push(raw, `@${raw}`);
        });
        const unique = [...new Set(formatted)];
        setMutedUsers(unique);
        try { localStorage.setItem('mka_muted_users', JSON.stringify(unique)); } catch {}
      }
    } catch (err) {
      console.warn('[ReportContext] Backend muted users sync notice:', err?.message || err);
    }
  }, [currentUser]);

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
    refreshMutedUsers();
  }, [refreshReports, refreshMutedUsers]);

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

  const muteUser = useCallback(async (username) => {
    if (!username) return;
    const rawClean = String(username).replace(/^@/, '').trim();
    if (!rawClean) return;
    const cleanHandle = `@${rawClean}`;

    setMutedUsers((prev = []) => {
      const current = Array.isArray(prev) ? prev : [];
      const map = new Map();
      [...current, cleanHandle].forEach((u) => {
        if (!u) return;
        const key = String(u).toLowerCase().replace(/^@/, '').trim();
        if (key && !map.has(key)) {
          map.set(key, `@${key}`);
        }
      });
      const next = Array.from(map.values());
      try { localStorage.setItem('mka_muted_users', JSON.stringify(next)); } catch {}
      return next;
    });

    addToast(`Muted @${rawClean}. Their posts are now hidden from your feed.`, 'info');

    try {
      console.log('[ReportContext] Executing Mute User API call for:', rawClean);
      if (apiUserService?.muteUser) await apiUserService.muteUser(rawClean);
    } catch (err) {
      console.warn('[ReportContext] Mute user API notice:', err?.message || err);
    }
  }, [addToast]);

  const unmuteUser = useCallback(async (username) => {
    if (!username) return;
    const rawClean = String(username).replace(/^@/, '').toLowerCase().trim();

    setMutedUsers((prev = []) => {
      const current = Array.isArray(prev) ? prev : [];
      const next = current.filter((item) => String(item).toLowerCase().replace(/^@/, '').trim() !== rawClean);
      try { localStorage.setItem('mka_muted_users', JSON.stringify(next)); } catch {}
      return next;
    });

    addToast(`Unmuted @${rawClean}. Their posts are visible again.`, 'success');

    try {
      console.log('[ReportContext] Executing Unmute User API call for:', rawClean);
      if (apiUserService?.unmuteUser) await apiUserService.unmuteUser(rawClean);
    } catch (err) {
      console.warn('[ReportContext] Unmute user API notice:', err?.message || err);
    }
  }, [addToast]);


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

  const [hiddenPosts, setHiddenPosts] = useState([]);

  // Sync hidden posts list directly from backend DB on mount / login
  const refreshHiddenPosts = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!currentUser || !token || token.startsWith('mock')) return;

    try {
      const res = await apiUserService.getHiddenPosts();
      const list = res?.data || res || [];
      if (Array.isArray(list)) {
        const formatted = list.map((item) => ({
          id: item.postId || item.id,
          title: item.postTitle || item.title || `Thought #${item.postId || item.id}`,
          content: item.postTitle || item.content || '',
          username: item.authorUsername || item.username || '@anonymous',
          hiddenAt: item.createdAt || new Date().toISOString(),
        }));
        setHiddenPosts(formatted);
      }
    } catch (err) {
      console.warn('[ReportContext] Backend hidden posts sync notice:', err?.message || err);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshReports();
    refreshMutedUsers();
    refreshHiddenPosts();
  }, [refreshReports, refreshMutedUsers, refreshHiddenPosts]);

  const hidePost = useCallback(async (postId, postData = {}) => {
    if (!postId) return;

    setHiddenPosts((prev = []) => {
      const current = Array.isArray(prev) ? prev : [];
      const strId = String(postId);
      const exists = current.some((item) => (typeof item === 'object' ? String(item.id) === strId : String(item) === strId));
      if (exists) return current;

      const record = {
        id: postId,
        title: postData.title || postData.originalTitle || 'Hidden Thought',
        content: postData.content || postData.originalContent || '',
        username: postData.username || postData.authorUsername || '@anonymous',
        hiddenAt: new Date().toISOString(),
      };
      return [record, ...current];
    });

    addToast('Post hidden. You can unhide it anytime from Profile / Safety Settings.', 'info');

    try {
      if (apiUserService?.hidePost) {
        await apiUserService.hidePost(postId);
        refreshHiddenPosts();
      }
    } catch (e) {
      console.warn('[ReportContext] Hide post API notice:', e?.message || e);
    }
  }, [addToast, refreshHiddenPosts]);

  const unhidePost = useCallback(async (postId) => {
    if (!postId) return;
    const strId = String(postId);

    setHiddenPosts((prev = []) => {
      const current = Array.isArray(prev) ? prev : [];
      return current.filter((item) => (typeof item === 'object' ? String(item.id) !== strId : String(item) !== strId));
    });

    addToast('Post unhidden! It is now visible in your feed again.', 'success');

    try {
      if (apiUserService?.unhidePost) {
        await apiUserService.unhidePost(postId);
        refreshHiddenPosts();
      }
    } catch (e) {
      console.warn('[ReportContext] Unhide post API notice:', e?.message || e);
    }
  }, [addToast, refreshHiddenPosts]);

  return (
    <ReportContext.Provider value={{
      myReports,
      adminQueue,
      blockedUsers,
      mutedUsers,
      hiddenPosts,
      refreshReports,
      refreshMutedUsers,
      refreshHiddenPosts,
      submitReport,
      blockUser,
      unblockUser,
      muteUser,
      unmuteUser,
      hidePost,
      unhidePost,
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
