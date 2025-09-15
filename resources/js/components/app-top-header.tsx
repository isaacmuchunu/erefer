import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, MessageSquare, Search, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface AppTopHeaderProps {
    user?: {
        name: string;
        email: string;
        avatar?: string;
    };
    notificationCount?: number;
    messageCount?: number;
}

export function AppTopHeader({ user, notificationCount = 0, messageCount = 0 }: AppTopHeaderProps) {
    return (
        <header className="flex h-24 items-center justify-between border-b bg-white px-6 shadow-sm">
            {/* Left side - Empty space for balance */}
            <div className="flex-1"></div>

            {/* Center - Search */}
            <div className="flex-1 max-w-md mx-8">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search here..."
                        className="pl-10 bg-gray-50 border-gray-200"
                    />
                </div>
            </div>

            {/* Right side - Messages, Notifications, Profile */}
            <div className="flex items-center gap-4">
                {/* Messages */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <MessageSquare className="h-5 w-5" />
                            {messageCount > 0 && (
                                <Badge 
                                    variant="destructive" 
                                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                                >
                                    {messageCount > 9 ? '9+' : messageCount}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <div className="p-4">
                            <h4 className="font-semibold mb-2">Messages</h4>
                            {messageCount === 0 ? (
                                <p className="text-sm text-muted-foreground">No new messages</p>
                            ) : (
                                <div className="space-y-2">
                                    <div className="text-sm">
                                        <p className="font-medium">Dr. Smith</p>
                                        <p className="text-muted-foreground">Patient referral update...</p>
                                    </div>
                                </div>
                            )}
                            <Link href="/messages" className="block mt-3">
                                <Button variant="outline" size="sm" className="w-full">
                                    View All Messages
                                </Button>
                            </Link>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            {notificationCount > 0 && (
                                <Badge 
                                    variant="destructive" 
                                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                                >
                                    {notificationCount > 9 ? '9+' : notificationCount}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <div className="p-4">
                            <h4 className="font-semibold mb-2">Notifications</h4>
                            {notificationCount === 0 ? (
                                <p className="text-sm text-muted-foreground">No new notifications</p>
                            ) : (
                                <div className="space-y-2">
                                    <div className="text-sm">
                                        <p className="font-medium">Emergency Alert</p>
                                        <p className="text-muted-foreground">New ambulance dispatch request</p>
                                    </div>
                                </div>
                            )}
                            <Link href="/notifications" className="block mt-3">
                                <Button variant="outline" size="sm" className="w-full">
                                    View All Notifications
                                </Button>
                            </Link>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={user?.avatar} alt={user?.name} />
                                <AvatarFallback>
                                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : <User className="h-4 w-4" />}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 p-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={user?.avatar} alt={user?.name} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white text-xl">
                                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900 text-lg">
                                    {user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User'}
                                </p>
                                <p className="text-sm text-gray-600 mb-1">
                                    {user?.role || 'Healthcare Professional'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {user?.email || 'user@example.com'}
                                </p>
                                {user?.phone && (
                                    <p className="text-sm text-muted-foreground">
                                        {user.phone}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Status Indicator */}
                        <div className="flex items-center space-x-2 mb-4 p-2 bg-green-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-700 font-medium">Online</span>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                                <p className="text-lg font-semibold text-gray-900">12</p>
                                <p className="text-xs text-gray-600">Active Cases</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                                <p className="text-lg font-semibold text-gray-900">5</p>
                                <p className="text-xs text-gray-600">Pending Tasks</p>
                            </div>
                        </div>

                        <div className="border-t pt-2 space-y-1">
                            <DropdownMenuItem asChild>
                                <Link href="/profile" className="flex items-center space-x-2 w-full">
                                    <User className="h-4 w-4" />
                                    <span>My Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/settings" className="flex items-center space-x-2 w-full">
                                    <Settings className="h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/help" className="flex items-center space-x-2 w-full">
                                    <HelpCircle className="h-4 w-4" />
                                    <span>Help & Support</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/logout" className="flex items-center space-x-2 w-full text-red-600">
                                    <LogOut className="h-4 w-4" />
                                    <span>Sign Out</span>
                                </Link>
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
