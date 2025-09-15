import AppLayout from '@/layouts/AppLayout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Analytics', href: '/analytics' },
];

export default function AnalyticsIndex({ auth }: PageProps) {
    return (
        <AppLayout user={auth.user} breadcrumbs={breadcrumbs}>
            <Head title="Analytics" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Analytics</h1>
                        <p className="text-muted-foreground">View key metrics and insights.</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}