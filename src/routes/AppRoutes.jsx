import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

// Pages
import { LandingPage } from '../pages/public/LandingPage.jsx';
import { AboutPage } from '../pages/public/AboutPage.jsx';
import { PrivacyPolicyPage } from '../pages/public/PrivacyPolicyPage.jsx';
import { CommunityGuidelinesPage } from '../pages/public/CommunityGuidelinesPage.jsx';
import { ContactPage } from '../pages/public/ContactPage.jsx';

import { LoginPage } from '../pages/auth/LoginPage.jsx';
import { RegisterPage } from '../pages/auth/RegisterPage.jsx';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage.jsx';
import { ProfileSetupWizardPage } from '../pages/auth/ProfileSetupWizardPage.jsx';
import { OnboardingPage } from '../pages/onboarding/OnboardingPage.jsx';

import { DashboardPage } from '../pages/user/DashboardPage.jsx';
import { HomePage } from '../pages/user/HomePage.jsx';
import { ExplorePage } from '../pages/user/ExplorePage.jsx';
import { CreatePostPage } from '../pages/user/CreatePostPage.jsx';
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
import { ChatPage } from '../pages/user/ChatPage.jsx';

import { AdminLoginPage } from '../pages/admin/AdminLoginPage.jsx';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage.jsx';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage.jsx';
import { AdminReportDetailsPage } from '../pages/admin/AdminReportDetailsPage.jsx';
import { AdminContentReviewPage } from '../pages/admin/AdminContentReviewPage.jsx';

export function AppRoutes() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { currentUser } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // 1. Root Landing Page: ALWAYS renders LandingPage regardless of auth status
  if (currentPath === '/' || currentPath === '') {
    return <LandingPage onNavigate={navigate} />;
  }

  // 2. Public Informational Routes
  if (currentPath === '/about') {
    return <AboutPage onNavigate={navigate} />;
  }
  if (currentPath === '/privacy-policy') {
    return <PrivacyPolicyPage onNavigate={navigate} />;
  }
  if (currentPath === '/community-guidelines') {
    return <CommunityGuidelinesPage onNavigate={navigate} />;
  }
  if (currentPath === '/contact') {
    return <ContactPage onNavigate={navigate} />;
  }

  // 3. Auth Routes: /login, /register, /forgot-password, /onboarding, /setup-profile
  if (currentPath === '/login') {
    return <LoginPage onNavigate={navigate} />;
  }
  if (currentPath === '/register') {
    return <RegisterPage onNavigate={navigate} />;
  }
  if (currentPath === '/forgot-password') {
    return <ForgotPasswordPage onNavigate={navigate} />;
  }
  if (currentPath === '/onboarding') {
    return <OnboardingPage onNavigate={navigate} />;
  }
  if (currentPath === '/setup-profile' || currentPath === '/profile-setup') {
    return <ProfileSetupWizardPage onNavigate={navigate} />;
  }

  // 4. Admin Routes
  if (currentPath === '/admin/login') {
    return <AdminLoginPage onNavigate={navigate} />;
  }
  if (currentPath === '/admin/dashboard') {
    return <AdminDashboardPage onNavigate={navigate} />;
  }
  if (currentPath === '/admin/reports') {
    return <AdminReportsPage onNavigate={navigate} />;
  }
  if (currentPath.startsWith('/admin/reports/')) {
    const reportId = currentPath.split('/admin/reports/')[1];
    return <AdminReportDetailsPage reportId={reportId} onNavigate={navigate} />;
  }
  if (currentPath === '/admin/content-review') {
    return <AdminContentReviewPage onNavigate={navigate} />;
  }

  // 5. User App Protected Routes (redirect to /login if not logged in)
  if (!currentUser) {
    return <LoginPage onNavigate={navigate} />;
  }

  if (currentPath === '/dashboard') {
    return <DashboardPage onNavigate={navigate} />;
  }
  if (currentPath === '/home') {
    return <HomePage onNavigate={navigate} />;
  }
  if (currentPath.startsWith('/explore')) {
    return <ExplorePage onNavigate={navigate} />;
  }
  if (currentPath === '/create-post') {
    return <CreatePostPage onNavigate={navigate} />;
  }
  if (currentPath.startsWith('/post/')) {
    const postId = currentPath.split('/post/')[1];
    return <PostDetailsPage postId={postId} onNavigate={navigate} />;
  }
  if (currentPath.startsWith('/chat')) {
    const usernameParam = currentPath.startsWith('/chat/') ? currentPath.split('/chat/')[1] : null;
    return <ChatPage targetUsername={usernameParam} onNavigate={navigate} />;
  }
  if (currentPath === '/notifications') {
    return <NotificationsPage onNavigate={navigate} />;
  }
  if (currentPath === '/saved') {
    return <SavedPostsPage onNavigate={navigate} />;
  }
  if (currentPath === '/my-posts') {
    return <MyPostsPage onNavigate={navigate} />;
  }
  if (currentPath === '/my-reports') {
    return <MyReportsPage onNavigate={navigate} />;
  }
  if (currentPath === '/profile' || currentPath === '/profile/me' || currentPath.startsWith('/profile/')) {
    let handle = null;
    if (currentPath === '/profile/me') {
      handle = null; // represents self
    } else if (currentPath.startsWith('/profile/')) {
      handle = currentPath.split('/profile/')[1];
    }
    return <ProfilePage username={handle} onNavigate={navigate} />;
  }
  if (currentPath === '/edit-profile') {
    return <EditProfilePage onNavigate={navigate} />;
  }
  if (currentPath === '/settings') {
    return <SettingsPage onNavigate={navigate} />;
  }
  if (currentPath === '/settings/privacy') {
    return <PrivacySettingsPage onNavigate={navigate} />;
  }
  if (currentPath === '/settings/account') {
    return <AccountSettingsPage onNavigate={navigate} />;
  }

  // Fallback for logged-in users to Dashboard
  return <DashboardPage onNavigate={navigate} />;
}
