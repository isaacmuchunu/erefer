import { NavFooter } from '@/components/nav-footer';
import { NavGroupedWithDropdown } from '@/components/nav-grouped-with-dropdown';
import { DashboardNav } from '@/components/dashboard-nav';
import { NavUser } from '@/components/nav-user';
import AppLogo from '@/components/app-logo';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';

import {
    Ambulance,
    BookOpen,
    Building,
    ClipboardList,
    HeartPulse,
    LayoutGrid,
    LineChart,
    Settings,
    Stethoscope,
    Users,
    Calendar,
    FileText,
    Activity,
    Phone,
    Shield,
    UserCheck,
    Truck
} from 'lucide-react';

// Dashboard Navigation Groups with sub-items
const dashboardNavItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
        subItems: [
            {
                title: 'Admin Dashboard',
                href: '/admin/dashboard',
                icon: Shield,
            },
            {
                title: 'Doctor Dashboard',
                href: '/doctor/dashboard',
                icon: Stethoscope,
            },
            {
                title: 'Patient Dashboard',
                href: '/patient/dashboard',
                icon: UserCheck,
            },
            {
                title: 'Dispatcher Dashboard',
                href: '/dispatcher-dashboard',
                icon: Truck,
                roles: ['dispatcher'], // Only show for dispatcher role
            },
        ],
    },
];

// Core Healthcare Operations
const coreNavItems: NavItem[] = [
    {
        title: 'Referrals',
        href: '/referrals',
        icon: ClipboardList,
    },
    {
        title: 'Patients',
        href: '/patients',
        icon: Users,
    },
    {
        title: 'Appointments',
        href: '/appointments',
        icon: Calendar,
    },
];

// Emergency & Transport
const emergencyNavItems: NavItem[] = [
    {
        title: 'Emergency',
        href: '/emergency',
        icon: Phone,
    },
    {
        title: 'Ambulances',
        href: '/ambulances',
        icon: Ambulance,
    },
];

// Healthcare Resources
const resourceNavItems: NavItem[] = [
    {
        title: 'Doctors',
        href: '/doctors',
        icon: Stethoscope,
    },
    {
        title: 'Departments',
        href: '/departments',
        icon: HeartPulse,
    },
    {
        title: 'Facilities',
        href: '/facilities',
        icon: Building,
    },
    {
        title: 'Equipment',
        href: '/equipment',
        icon: Activity,
    },
];

// Analytics & Reports
const analyticsNavItems: NavItem[] = [
    {
        title: 'Analytics',
        href: '/analytics',
        icon: LineChart,
    },
    {
        title: 'Reports',
        href: '/reports',
        icon: FileText,
    },
];

// Operations
const operationsNavItems: NavItem[] = [
    {
        title: 'Operations',
        href: '/operations',
        icon: Settings,
    },
];

// Navigation groups for organized sidebar
const navigationGroups = [
    {
        title: 'Main Menu',
        items: dashboardNavItems,
    },
    {
        title: 'Healthcare',
        items: coreNavItems,
    },
    {
        title: 'Emergency',
        items: emergencyNavItems,
    },
    {
        title: 'Resources',
        items: resourceNavItems,
    },
    {
        title: 'Analytics',
        items: analyticsNavItems,
    },
    {
        title: 'Operations',
        items: operationsNavItems,
    },
];

// Combine all main nav items for backward compatibility
const mainNavItems: NavItem[] = [
    ...dashboardNavItems,
    ...coreNavItems,
    ...emergencyNavItems,
    ...resourceNavItems,
    ...analyticsNavItems,
    ...operationsNavItems,
];

const footerNavItems: NavItem[] = [
    {
        title: 'Knowledge Base',
        href: '/knowledge-base',
        icon: BookOpen,
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
];

interface AppSidebarProps {
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    isDashboard?: boolean;
    user?: any;
}

export function AppSidebar({ activeTab, onTabChange, isDashboard = false, user }: AppSidebarProps) {
    // Filter navigation items based on user role
    const filterItemsByRole = (items: any[]) => {
        return items.map(item => ({
            ...item,
            subItems: item.subItems?.filter((subItem: any) => {
                if (!subItem.roles) return true; // Show if no role restriction
                return subItem.roles.includes(user?.role);
            })
        })).filter(item => {
            // Keep main items that have visible sub-items or no sub-items
            return !item.subItems || item.subItems.length > 0;
        });
    };

    const filteredDashboardNavItems = user ? filterItemsByRole(dashboardNavItems) : dashboardNavItems;
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="border-b border-sidebar-border">
                <div className="flex items-center justify-center p-4 group-data-[collapsible=icon]:p-2">
                    <div className="group-data-[collapsible=icon]:scale-75 transition-transform">
                        <AppLogo />
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                {isDashboard && activeTab && onTabChange ? (
                    <DashboardNav items={mainNavItems} activeTab={activeTab} onTabChange={onTabChange} />
                ) : (
                    <NavGroupedWithDropdown groups={[
                        {
                            title: 'Main Menu',
                            items: filteredDashboardNavItems,
                        },
                        ...navigationGroups.slice(1) // Keep other groups as-is
                    ]} />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
