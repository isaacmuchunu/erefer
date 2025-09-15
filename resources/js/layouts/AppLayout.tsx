import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    user: User;
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    isDashboard?: boolean;
    notificationCount?: number;
    messageCount?: number;
}

export default ({ children, breadcrumbs, user, activeTab, onTabChange, isDashboard, notificationCount, messageCount, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate
        breadcrumbs={breadcrumbs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        isDashboard={isDashboard}
        user={user}
        notificationCount={notificationCount}
        messageCount={messageCount}
        {...props}
    >
        {children}
    </AppLayoutTemplate>
);
