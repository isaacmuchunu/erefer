import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'emerald' | 'blue' | 'amber' | 'red' | 'purple' | 'teal' | 'indigo';
}

export function StatCard({ title, value, icon: Icon, description, trend, color = 'emerald' }: StatCardProps) {
    const colorClasses = {
        emerald: 'border-l-emerald-500 text-emerald-600',
        blue: 'border-l-blue-500 text-blue-600',
        amber: 'border-l-amber-500 text-amber-600',
        red: 'border-l-red-500 text-red-600',
        purple: 'border-l-purple-500 text-purple-600',
        teal: 'border-l-teal-500 text-teal-600',
        indigo: 'border-l-indigo-500 text-indigo-600',
    };

    return (
        <Card className={`border-l-4 ${colorClasses[color].split(' ')[0]} shadow-md hover:shadow-lg transition-shadow`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
                <Icon className={`h-5 w-5 ${colorClasses[color].split(' ')[1]}`} />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-gray-900">{value}</div>
                {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
                {trend && (
                    <div className={`flex items-center text-sm mt-1 ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        <span className="font-medium">
                            {trend.isPositive ? '+' : ''}{trend.value}%
                        </span>
                        <span className="text-gray-500 ml-1">from last month</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}