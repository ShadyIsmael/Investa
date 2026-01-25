import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { User } from '@/types';
import ChatRequestListener from '@/features/support/ChatRequestListener';
import ChatConversationsListener from '@/features/support/ChatConversationsListener';
import BackendHealthMonitor from '@/services/backendHealth';
import Notifications from '@/components/common/Notifications';

interface MainLayoutProps {
    currentUser: User;
    handleLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ currentUser, handleLogout }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    return (
        <div className="h-screen flex overflow-hidden">
            <BackendHealthMonitor />
            <Notifications />
            <div className="flex w-full h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans antialiased text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-700">
                <Sidebar
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    isCollapsed={isCollapsed}
                    toggleCollapse={toggleCollapse}
                />
                <div className={`flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300`}>
                    <Header
                        toggleSidebar={toggleSidebar}
                        currentUser={currentUser}
                        onLogout={handleLogout}
                    />
                    <ChatRequestListener />
                    <ChatConversationsListener />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-5 lg:p-6 scroll-smooth">
                        <div className="app-container max-w-7xl mx-auto">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
