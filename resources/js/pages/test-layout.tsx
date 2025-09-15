import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { type BreadcrumbItem, type PageProps } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Test Layout', href: '/test-layout' },
];

export default function TestLayout({ auth }: PageProps) {
    return (
        <AppLayout 
            user={auth.user} 
            breadcrumbs={breadcrumbs}
            notificationCount={5}
            messageCount={3}
        >
            <Head title="Test Layout" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Test Layout</h1>
                        <p className="text-muted-foreground">Testing the new top header layout.</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">Card 1</h3>
                        <p className="text-gray-600">This is a test card to see how the layout looks.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">Card 2</h3>
                        <p className="text-gray-600">Another test card with some content.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">Card 3</h3>
                        <p className="text-gray-600">A third card to fill out the grid.</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
