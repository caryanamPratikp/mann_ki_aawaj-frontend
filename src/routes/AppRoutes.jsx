import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

// Pages
import { LandingPage } from '../pages/public/LandingPage.jsx';
import { AboutPage } from '../pages/public/AboutPage.jsx';
import { PrivacyPolicyPage } from '../pages/public/PrivacyPolicyPage.jsx';
import { CommunityGuidelinesPage } from '../pages/public/CommunityGuidelinesPage.jsx';
import { ContactPage } from '../pages/public/ContactPage.jsx';
import { FaqPage } from '../pages/public/FaqPage.jsx';
import { DeleteAccountPage } from '../pages/public/DeleteAccountPage.jsx';
import { ChildSafetyPage } from '../pages/public/ChildSafetyPage.jsx';

import { LoginPage } from '../pages/auth/LoginPage.jsx';
import { RegisterPage } from '../pages/auth/RegisterPage.jsx';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage.jsx';
import { ProfileSetupWizardPage } from '../pages/auth/ProfileSetupWizardPage.jsx';
import { OnboardingPage } from '../pages/onboarding/OnboardingPage.jsx';

import { DashboardPage } from '../pages/user/DashboardPage.jsx';
import { HomePage } from '../pages/user/HomePage.jsx';
import { ExplorePage } from '../pages/user/ExplorePage.jsx';
import { CreatePostPage } from '../pages/user/CreatePostPage.jsx';
import { TopicDiscussionPage } from '../pages/user/TopicDiscussionPage.jsx';
import { PostDetailsPage } from '../pages/user/PostDetailsPage.jsx';
import { NotificationsPage } from '../pages/user/NotificationsPage.jsx';
import { SavedPostsPage } from '../pages/user/SavedPostsPage.jsx';
import { MyPostsPage } from '../pages/user/MyPostsPage.jsx';
import { MyReportsPage } from '../pages/user/MyReportsPage.jsx';
import { ProfilePage } from '../pages/user/ProfilePage.jsx';
import { EditProfilePage } from '../pages/user/EditProfilePage.jsx';
import { SettingsPage } from '../pages/user/SettingsPage.jsx';
import { PrivacySettingsPage } from '../pages/user/PrivacySettingsPage.jsx';
import { AccountSettingsPage } from '../pages/user/AccountSettingsPage.jsx';
import { NotificationSettingsPage } from '../pages/user/NotificationSettingsPage.jsx';
import { SafetyModerationPage } from '../pages/user/SafetyModerationPage.jsx';
import { HelpSupportPage } from '../pages/user/HelpSupportPage.jsx';
import { MusicPage } from '../pages/user/MusicPage.jsx';

import { Loader } from '../components/common/Loader.jsx';

// Admin Pages (Lazy Loaded)
const AdminLoginPage = React.lazy(() => import('../pages/admin/AdminLoginPage.jsx').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = React.lazy(() => import('../pages/admin/AdminDashboardPage.jsx').then(m => ({ default: m.AdminDashboardPage })));
const AdminReportsPage = React.lazy(() => import('../pages/admin/AdminReportsPage.jsx').then(m => ({ default: m.AdminReportsPage })));
const AdminReportDetailsPage = React.lazy(() => import('../pages/admin/AdminReportDetailsPage.jsx').then(m => ({ default: m.AdminReportDetailsPage })));
const AdminContentReviewPage = React.lazy(() => import('../pages/admin/AdminContentReviewPage.jsx').then(m => ({ default: m.AdminContentReviewPage })));
const AdminBlockedContentPage = React.lazy(() => import('../pages/admin/AdminBlockedContentPage.jsx').then(m => ({ default: m.AdminBlockedContentPage })));
const AdminUsersPage = React.lazy(() => import('../pages/admin/AdminUsersPage.jsx').then(m => ({ default: m.AdminUsersPage })));
const AdminAnalyticsPage = React.lazy(() => import('../pages/admin/AdminAnalyticsPage.jsx').then(m => ({ default: m.AdminAnalyticsPage })));
const AdminEnquiriesPage = React.lazy(() => import('../pages/admin/AdminEnquiriesPage.jsx').then(m => ({ default: m.AdminEnquiriesPage })));
const AdminMusicPage = React.lazy(() => import('../pages/admin/AdminMusicPage.jsx').then(m => ({ default: m.AdminMusicPage })));

export function AppRoutes() {

  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { currentUser, isAdminLoggedIn } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);
    return () => clearTimeout(timer);
  }, [currentPath]);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };


  // Clean path normalization (strip trailing slashes, query params, hash)
  const normalizedPath = (currentPath ? currentPath.split('?')[0].split('#')[0].replace(/\/+$/, '') : '') || '/';

  // 1. Root Landing Page: ALWAYS renders LandingPage regardless of auth status
  if (normalizedPath === '/' || normalizedPath === '/index.html') {
    return <LandingPage onNavigate={navigate} />;
  }

  // 2. Public Informational Routes
  if (normalizedPath === '/about') {
    return <AboutPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/privacy-policy') {
    return <PrivacyPolicyPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/community-guidelines') {
    return <CommunityGuidelinesPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/contact') {
    return <ContactPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/faq') {
    return <FaqPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/delete-account') {
    return <DeleteAccountPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/child-safety' || normalizedPath === '/child-safety-standards') {
    return <ChildSafetyPage onNavigate={navigate} />;
  }

  // 3. Auth Routes: /login, /register, /forgot-password, /onboarding, /setup-profile
  if (normalizedPath === '/login') {
    return <LoginPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/register') {
    return <RegisterPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/forgot-password') {
    return <ForgotPasswordPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/onboarding') {
    return <OnboardingPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/setup-profile' || normalizedPath === '/profile-setup') {
    return <ProfileSetupWizardPage onNavigate={navigate} />;
  }

  // 4. Admin Routes
  if (normalizedPath.startsWith('/admin')) {
    return (
      <React.Suspense fallback={<Loader />}>
        {(() => {
          if (normalizedPath === '/admin/login') {
            return <AdminLoginPage onNavigate={navigate} />;
          }
          if (!isAdminLoggedIn || currentUser?.role !== 'ADMIN') {
            return <AdminLoginPage onNavigate={navigate} />;
          }
          if (normalizedPath === '/admin/dashboard') {
            return <AdminDashboardPage onNavigate={navigate} />;
          }
          if (normalizedPath === '/admin/reports') {
            return <AdminReportsPage onNavigate={navigate} />;
          }
          if (normalizedPath.startsWith('/admin/reports/')) {
            const reportId = normalizedPath.split('/admin/reports/')[1];
            return <AdminReportDetailsPage reportId={reportId} onNavigate={navigate} />;
          }
          if (normalizedPath === '/admin/content-review') {
            return <AdminContentReviewPage onNavigate={navigate} />;
          }
          if (normalizedPath === '/admin/blocked-content') {
            return <AdminBlockedContentPage onNavigate={navigate} />;
          }
          if (normalizedPath === '/admin/enquiries') {
            return <AdminEnquiriesPage onNavigate={navigate} />;
          }
          if (normalizedPath === '/admin/users') {
            return <AdminUsersPage onNavigate={navigate} />;
          }
          if (normalizedPath === '/admin/analytics') {
            return <AdminAnalyticsPage onNavigate={navigate} />;
          }
          if (normalizedPath === '/admin/music') {
            return <AdminMusicPage onNavigate={navigate} />;
          }
          if (normalizedPath === '/admin/settings') {
            return <AdminDashboardPage onNavigate={navigate} />;
          }
          if (normalizedPath === '/admin/system-logs') {
            return <AdminBlockedContentPage onNavigate={navigate} />;
          }
          return <AdminDashboardPage onNavigate={navigate} />;
        })()}
      </React.Suspense>
    );
  }

  // 5. Public / Guest Accessible Discovery Routes
  if (normalizedPath.startsWith('/explore')) {
    return <ExplorePage onNavigate={navigate} />;
  }

  // 6. User App Protected Routes (redirect to /login if not logged in)
  if (!currentUser) {
    return <LoginPage onNavigate={navigate} />;
  }

  if (normalizedPath === '/dashboard') {
    return <DashboardPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/home') {
    return <HomePage onNavigate={navigate} />;
  }
  if (normalizedPath === '/music') {
    return <MusicPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/create-post') {
    return <CreatePostPage onNavigate={navigate} />;
  }
  if (normalizedPath.startsWith('/topic/')) {
    const topicId = normalizedPath.split('/topic/')[1];
    return <TopicDiscussionPage topicId={topicId} onNavigate={navigate} />;
  }
  if (normalizedPath.startsWith('/post/')) {
    const postId = normalizedPath.split('/post/')[1];
    return <PostDetailsPage postId={postId} onNavigate={navigate} />;
  }
  // 1-on-1 Direct Chat route disabled as per topic-based platform requirements
  // if (normalizedPath.startsWith('/chat')) {
  //   const usernameParam = normalizedPath.startsWith('/chat/') ? normalizedPath.split('/chat/')[1] : null;
  //   return <ChatPage targetUsername={usernameParam} onNavigate={navigate} />;
  // }
  if (normalizedPath === '/notifications') {
    return <NotificationsPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/saved') {
    return <SavedPostsPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/my-posts') {
    return <MyPostsPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/my-reports') {
    return <MyReportsPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/profile' || normalizedPath === '/profile/me' || normalizedPath.startsWith('/profile/')) {
    let handle = null;
    if (normalizedPath === '/profile/me') {
      handle = null; // represents self
    } else if (normalizedPath.startsWith('/profile/')) {
      handle = normalizedPath.split('/profile/')[1];
    }
    return <ProfilePage username={handle} onNavigate={navigate} />;
  }
  if (normalizedPath === '/edit-profile') {
    return <EditProfilePage onNavigate={navigate} />;
  }
  if (normalizedPath === '/settings') {
    return <SettingsPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/settings/privacy') {
    return <PrivacySettingsPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/settings/account') {
    return <AccountSettingsPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/settings/notifications') {
    return <NotificationSettingsPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/settings/safety') {
    return <SafetyModerationPage onNavigate={navigate} />;
  }
  if (normalizedPath === '/help') {
    return <HelpSupportPage onNavigate={navigate} />;
  }

  // Fallback for unhandled routes
  return currentUser ? <HomePage onNavigate={navigate} /> : <LandingPage onNavigate={navigate} />;
}
