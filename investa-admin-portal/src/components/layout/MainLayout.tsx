import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { User } from '@/types';
import ChatRequestListener from '@/features/support/ChatRequestListener';
import ChatConversationsListener from '@/features/support/ChatConversationsListener';
import BackendHealthMonitor from '@/services/backendHealth';
import Notifications from '@/components/common/Notifications';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';

interface MainLayoutProps {
  currentUser: User;
  handleLogout: () => void;
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ currentUser, handleLogout, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const toggleSidebar  = () => setIsSidebarOpen(o => !o);
  const toggleCollapse = () => setIsCollapsed(c => !c);

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <BackendHealthMonitor />
      <Notifications />

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
      />

      {/* Main canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          currentUser={currentUser}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <ChatRequestListener />
        <ChatConversationsListener />

        <a className="skip-link" href="#main-content">{t('centralAdmin.skipToContent')}</a>
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto overflow-x-hidden bg-background focus:outline-none">
          <div className="workspace-content animate-in fade-in slide-up duration-500">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
