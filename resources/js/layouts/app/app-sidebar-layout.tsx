import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { AppTopHeader } from '@/components/app-top-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

interface AppSidebarLayoutProps {
    breadcrumbs?: BreadcrumbItem[];
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    isDashboard?: boolean;
    user?: {
        name: string;
        email: string;
        avatar?: string;
    };
    notificationCount?: number;
    messageCount?: number;
}

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    activeTab,
    onTabChange,
    isDashboard,
    user,
    notificationCount = 0,
    messageCount = 0
}: PropsWithChildren<AppSidebarLayoutProps>) {
    return (
        <div className="flex h-screen flex-col">
            <AppTopHeader
                user={user}
                notificationCount={notificationCount}
                messageCount={messageCount}
            />
            <AppShell variant="sidebar" className="flex-1">
                <AppSidebar
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    isDashboard={isDashboard}
                    user={user}
                />
                <AppContent variant="sidebar" className="overflow-x-hidden">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    {children}
                </AppContent>
            </AppShell>
        </div>
    );
}
