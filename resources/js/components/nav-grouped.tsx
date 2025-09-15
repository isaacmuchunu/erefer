import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

interface NavGroup {
    title: string;
    items: NavItem[];
}

interface NavGroupedProps {
    groups: NavGroup[];
}

export function NavGrouped({ groups = [] }: NavGroupedProps) {
    const page = usePage();

    return (
        <>
            {groups.map((group, index) => (
                <SidebarGroup key={group.title} className={`px-2 py-0 ${index === 0 ? 'mt-6' : ''}`}>
                    <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {group.title}
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {group.items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton 
                                    asChild 
                                    isActive={page.url.startsWith(item.href)} 
                                    tooltip={{ children: item.title }}
                                    className="hover:bg-gray-100 data-[state=open]:bg-gray-100 data-[active=true]:bg-teal-50 data-[active=true]:text-teal-700 data-[active=true]:border-r-2 data-[active=true]:border-teal-500"
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon className="w-4 h-4" />}
                                        <span className="font-medium">{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
