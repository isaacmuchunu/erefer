import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Settings,
    Database,
    Server,
    Activity,
    Users,
    Shield,
    Wifi,
    HardDrive,
    Cpu,
    BarChart3
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Operations',
        href: '/operations',
    },
];

interface OperationsProps {
    auth: {
        user: any;
    };
}

export default function Operations(props: OperationsProps) {
    const { user } = props.auth;

    const systemMetrics = [
        { label: 'System Uptime', value: '99.9%', status: 'excellent', icon: Activity },
        { label: 'Database Health', value: 'Optimal', status: 'good', icon: Database },
        { label: 'Server Load', value: '45%', status: 'normal', icon: Server },
        { label: 'Network Status', value: 'Stable', status: 'good', icon: Wifi },
        { label: 'Storage Usage', value: '67%', status: 'normal', icon: HardDrive },
        { label: 'CPU Usage', value: '32%', status: 'good', icon: Cpu },
    ];

    const operationalTasks = [
        { title: 'System Backup', description: 'Automated daily backup at 2:00 AM', status: 'scheduled' },
        { title: 'Security Scan', description: 'Weekly security vulnerability scan', status: 'completed' },
        { title: 'Database Optimization', description: 'Monthly database performance optimization', status: 'pending' },
        { title: 'User Access Review', description: 'Quarterly user access and permissions review', status: 'in-progress' },
    ];

    return (
        <AppLayout
            user={user}
            breadcrumbs={breadcrumbs}
            notificationCount={5}
            messageCount={3}
        >
            <Head title="Operations" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-gray-50">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden min-h-[200px]">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold mb-2">Operations Center</h1>
                            <p className="text-gray-300 text-lg mb-6">Monitor and manage system operations and infrastructure</p>
                            <button className="bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                                <Settings className="w-5 h-5 inline mr-2" />
                                System Settings
                            </button>
                        </div>
                        <div className="hidden lg:block">
                            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                                <Settings className="w-16 h-16 text-white" />
                            </div>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
                </div>

                {/* System Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {systemMetrics.map((metric, index) => (
                        <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">{metric.label}</CardTitle>
                                <metric.icon className="h-4 w-4 text-gray-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                                <div className={`text-xs mt-1 ${
                                    metric.status === 'excellent' ? 'text-green-600' :
                                    metric.status === 'good' ? 'text-blue-600' :
                                    'text-amber-600'
                                }`}>
                                    {metric.status}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Operational Tasks */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="shadow-sm">
                        <CardHeader className="p-6 pb-4">
                            <CardTitle className="text-lg font-semibold text-gray-900">Operational Tasks</CardTitle>
                            <p className="text-gray-600 text-sm">Scheduled and ongoing system operations</p>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100">
                                {operationalTasks.map((task, index) => (
                                    <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{task.title}</p>
                                                <p className="text-sm text-gray-500">{task.description}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                                task.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {task.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="p-6 pb-4">
                            <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
                            <p className="text-gray-600 text-sm">Common operational tasks and tools</p>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <div className="grid gap-3">
                                <Button variant="outline" className="justify-start h-12">
                                    <Database className="h-5 w-5 mr-3" />
                                    Database Management
                                </Button>
                                <Button variant="outline" className="justify-start h-12">
                                    <Users className="h-5 w-5 mr-3" />
                                    User Management
                                </Button>
                                <Button variant="outline" className="justify-start h-12">
                                    <Shield className="h-5 w-5 mr-3" />
                                    Security Settings
                                </Button>
                                <Button variant="outline" className="justify-start h-12">
                                    <BarChart3 className="h-5 w-5 mr-3" />
                                    System Reports
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
