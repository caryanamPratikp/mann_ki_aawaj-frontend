import { STORAGE_KEYS } from '../utils/storageKeys.js';
import { MOCK_REPORTS } from '../data/reports.js';
import { moderationCheck } from '../utils/moderationCheck.js';
import { mockAuthService } from './mockAuthService.js';
import { mockPostService } from './mockPostService.js';
import { mockCommentService } from './mockCommentService.js';

export const mockReportService = {
  getReports() {
    const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(MOCK_REPORTS));
      return MOCK_REPORTS;
    }
    return JSON.parse(data);
  },

  getBlockedUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BLOCKED_USERS) || '[]');
  },

  blockUser(usernameToBlock) {
    const blocked = this.getBlockedUsers();
    if (!blocked.includes(usernameToBlock)) {
      blocked.push(usernameToBlock);
      localStorage.setItem(STORAGE_KEYS.BLOCKED_USERS, JSON.stringify(blocked));
    }
    return true;
  },

  unblockUser(usernameToUnblock) {
    const blocked = this.getBlockedUsers().filter(u => u !== usernameToUnblock);
    localStorage.setItem(STORAGE_KEYS.BLOCKED_USERS, JSON.stringify(blocked));
    return true;
  },

  createReport(reportData, currentUser) {
    const reports = this.getReports();

    // Check duplicate reporting by the same user
    const existing = reports.find(
      r => r.reporterUsername === currentUser.username &&
           r.targetId === reportData.targetId &&
           r.contentType === reportData.contentType
    );

    if (existing) {
      throw new Error('You have already submitted a report for this content.');
    }

    // Run moderation check on optional explanation
    const modResult = reportData.explanation ? moderationCheck(reportData.explanation) : { category: reportData.reason, risk: 'MEDIUM' };

    const newReport = {
      id: `RPT-${Math.floor(1000 + Math.random() * 9000)}`,
      contentType: reportData.contentType, // POST, COMMENT, REPLY, IMAGE, PROFILE
      targetId: reportData.targetId,
      postId: reportData.postId || null,
      reportedContent: reportData.reportedContent || '',
      authorUsername: reportData.authorUsername || 'Anonymous',
      reporterUsername: currentUser.username, // Visible ONLY to admin
      reason: reportData.reason,
      explanation: reportData.explanation || '',
      detectedCategory: modResult.category || reportData.reason,
      riskLevel: modResult.risk || 'MEDIUM',
      previousReports: reports.filter(r => r.authorUsername === reportData.authorUsername).length,
      previousViolations: 0,
      status: 'Submitted', // Submitted, Under Review, Action Taken, No Violation, Closed
      createdAt: new Date().toISOString(),
      adminAction: null,
      adminNotes: null
    };

    reports.unshift(newReport);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

    // Optionally hide content for reporting user or block author
    if (reportData.blockAuthor && reportData.authorUsername) {
      this.blockUser(reportData.authorUsername);
    }

    return newReport;
  },

  getUserReports(reporterUsername) {
    return this.getReports().filter(r => r.reporterUsername === reporterUsername);
  },

  getAdminReportsQueue(filterType = 'All') {
    const reports = this.getReports();
    if (filterType === 'All') return reports;
    if (filterType === 'High Risk') return reports.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL');
    return reports.filter(r => r.contentType === filterType.toUpperCase());
  },

  performAdminAction(reportId, actionType, actionReason, adminNotes = '') {
    const reports = this.getReports();
    const index = reports.findIndex(r => r.id === reportId);
    if (index === -1) throw new Error('Report not found.');

    const report = reports[index];
    report.adminAction = actionType;
    report.adminNotes = adminNotes;
    report.status = actionType === 'Dismiss' || actionType === 'Mark No Violation' ? 'No Violation' : 'Action Taken';

    // Execute target action
    if (actionType === 'Hide Content' || actionType === 'Remove Content') {
      if (report.contentType === 'POST') {
        mockPostService.updatePost(report.targetId, { status: 'REMOVED', removeReason: actionReason });
      } else if (report.contentType === 'COMMENT') {
        const comments = mockCommentService.getComments();
        const idx = comments.findIndex(c => c.id === report.targetId);
        if (idx !== -1) {
          comments[idx].status = 'REMOVED';
          comments[idx].removeReason = actionReason;
          localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
        }
      } else if (report.contentType === 'REPLY') {
        const replies = mockCommentService.getReplies();
        const idx = replies.findIndex(r => r.id === report.targetId);
        if (idx !== -1) {
          replies[idx].status = 'REMOVED';
          replies[idx].removeReason = actionReason;
          localStorage.setItem(STORAGE_KEYS.REPLIES, JSON.stringify(replies));
        }
      }
    }

    if (actionType === 'Restrict Commenting') {
      const users = mockAuthService.getUsers();
      const targetUser = users.find(u => u.username === report.authorUsername);
      if (targetUser) {
        mockAuthService.updateProfile(targetUser.id, {
          status: 'COMMENT_RESTRICTED',
          restrictionReason: actionReason,
          restrictionEndsAt: new Date(Date.now() + 7 * 86400000).toISOString() // 7 days
        });
      }
    }

    if (actionType === 'Restrict Posting') {
      const users = mockAuthService.getUsers();
      const targetUser = users.find(u => u.username === report.authorUsername);
      if (targetUser) {
        mockAuthService.updateProfile(targetUser.id, {
          status: 'POST_RESTRICTED',
          restrictionReason: actionReason
        });
      }
    }

    if (actionType === 'Temporarily Suspend' || actionType === 'Permanently Ban') {
      const users = mockAuthService.getUsers();
      const targetUser = users.find(u => u.username === report.authorUsername);
      if (targetUser) {
        mockAuthService.updateProfile(targetUser.id, {
          status: actionType === 'Permanently Ban' ? 'BANNED' : 'TEMPORARILY_SUSPENDED',
          restrictionReason: actionReason
        });
      }
    }

    reports[index] = report;
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    return report;
  }
};
