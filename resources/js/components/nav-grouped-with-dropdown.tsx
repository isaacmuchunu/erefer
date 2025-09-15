import { useState } from 'react';
import { 
    SidebarGroup, 
    SidebarGroupLabel, 
    SidebarMenu, 
    SidebarMenuButton, 
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface NavItemWithSub extends NavItem {
    subItems?: NavItem[];
}

interface NavGroup {
    title: string;
    items: NavItemWithSub[];
}

interface NavGroupedWithDropdownProps {
    groups: NavGroup[];
}

export function NavGroupedWithDropdown({ groups = [] }: NavGroupedWithDropdownProps) {
    const page = usePage();
    const [openItems, setOpenItems] = useState<string[]>([]);

    const toggleItem = (itemTitle: string) => {
        setOpenItems(prev => 
            prev.includes(itemTitle) 
                ? prev.filter(item => item !== itemTitle)
                : [...prev, itemTitle]
        );
    };

    const isItemOpen = (itemTitle: string) => openItems.includes(itemTitle);

    return (
        <>
            {groups.map((group, index) => (
                <SidebarGroup key={group.title} className="px-2 py-0">
                    <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {group.title}
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {group.items.map((item) => {
                            const hasSubItems = item.subItems && item.subItems.length > 0;
                            const isActive = page.url.startsWith(item.href);
                            const isOpen = isItemOpen(item.title);

                            if (hasSubItems) {
                                return (
                                    <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleItem(item.title)}>
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton
                                                    className="hover:bg-gray-100 data-[state=open]:bg-gray-100 data-[active=true]:bg-teal-50 data-[active=true]:text-teal-700 data-[active=true]:border-r-2 data-[active=true]:border-teal-500"
                                                    tooltip={{ children: item.title }}
                                                >
                                                    {item.icon && <item.icon className="w-4 h-4" />}
                                                    <span className="font-medium">{item.title}</span>
                                                    <ChevronDown
                                                        className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                                                            isOpen ? 'rotate-180' : ''
                                                        }`}
                                                    />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.subItems?.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.title}>
                                                            <SidebarMenuSubButton 
                                                                asChild
                                                                isActive={page.url.startsWith(subItem.href)}
                                                            >
                                                                <Link href={subItem.href} prefetch>
                                                                    {subItem.icon && <subItem.icon className="w-4 h-4" />}
                                                                    <span>{subItem.title}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                );
                            }

                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton 
                                        asChild 
                                        isActive={isActive} 
                                        tooltip={{ children: item.title }}
                                        className="hover:bg-gray-100 data-[state=open]:bg-gray-100 data-[active=true]:bg-teal-50 data-[active=true]:text-teal-700 data-[active=true]:border-r-2 data-[active=true]:border-teal-500"
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon className="w-4 h-4" />}
                                            <span className="font-medium">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
