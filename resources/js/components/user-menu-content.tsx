import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { LogOut, Settings, User as UserIcon, HelpCircle, Shield } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>

            {/* Status Indicator */}
            <div className="flex items-center space-x-2 mx-2 my-2 p-2 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 font-medium">Online</span>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 mx-2 mb-2">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900">12</p>
                    <p className="text-xs text-gray-600">Active</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900">5</p>
                    <p className="text-xs text-gray-600">Pending</p>
                </div>
            </div>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href="/profile" as="button" prefetch onClick={cleanup}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        My Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route('profile.edit')} as="button" prefetch onClick={cleanup}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href="/help" as="button" prefetch onClick={cleanup}>
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Help & Support
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link className="block w-full" method="post" href={route('logout')} as="button" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
