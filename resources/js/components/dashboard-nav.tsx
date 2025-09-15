import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';

interface DashboardNavProps {
    items: NavItem[];
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function DashboardNav({ items = [], activeTab, onTabChange }: DashboardNavProps) {
    const handleTabClick = (item: NavItem) => {
        if (item.onClick) {
            item.onClick();
        } else {
            // Map href to tab values
            const tabMap: Record<string, string> = {
                '/dashboard': 'overview',
                '/referrals': 'referrals',
                '/patients': 'patients',
                '/appointments': 'appointments',
                '/ambulances': 'ambulances',
                '/emergency': 'emergency',
                '/departments': 'departments',
                '/doctors': 'doctors',
                '/facilities': 'facilities',
                '/equipment': 'equipment',
                '/messages': 'messages',
                '/notifications': 'notifications',
                '/analytics': 'analytics',
                '/reports': 'operations',
                '/knowledge-base': 'knowledge-base',
                '/settings': 'settings',
            };
            
            const tabValue = tabMap[item.href] || 'overview';
            onTabChange(tabValue);
        }
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const tabMap: Record<string, string> = {
                        '/dashboard': 'overview',
                        '/referrals': 'referrals',
                        '/patients': 'patients',
                        '/appointments': 'appointments',
                        '/ambulances': 'ambulances',
                        '/emergency': 'emergency',
                        '/departments': 'departments',
                        '/doctors': 'doctors',
                        '/facilities': 'facilities',
                        '/equipment': 'equipment',
                        '/messages': 'messages',
                        '/notifications': 'notifications',
                        '/analytics': 'analytics',
                        '/reports': 'operations',
                        '/knowledge-base': 'knowledge-base',
                        '/settings': 'settings',
                    };
                    
                    const tabValue = tabMap[item.href] || 'overview';
                    const isActive = activeTab === tabValue;
                    
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton 
                                isActive={isActive} 
                                tooltip={{ children: item.title }}
                                onClick={() => handleTabClick(item)}
                                className="cursor-pointer"
                            >
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
