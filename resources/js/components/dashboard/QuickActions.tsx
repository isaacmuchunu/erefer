import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Plus, Users, Building, BarChart3, Calendar, Phone, MessageSquare, Ambulance } from 'lucide-react';

export function QuickActions() {
    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <Plus className="h-5 w-5 text-emerald-600 mr-2" />
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white h-12" asChild>
                    <Link href="/referrals/create">
                        <Plus className="h-4 w-4 mr-2" />
                        New Referral
                    </Link>
                </Button>
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 h-12" asChild>
                    <Link href="/patients/create">
                        <Users className="h-4 w-4 mr-2" />
                        Add Patient
                    </Link>
                </Button>
                <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50 h-12" asChild>
                    <Link href="/appointments/create">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                    </Link>
                </Button>
                <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 h-12" asChild>
                    <Link href="/emergency">
                        <Phone className="h-4 w-4 mr-2" />
                        Emergency
                    </Link>
                </Button>
                <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 h-12" asChild>
                    <Link href="/messages">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Messages
                    </Link>
                </Button>
                <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 h-12" asChild>
                    <Link href="/ambulances">
                        <Ambulance className="h-4 w-4 mr-2" />
                        Ambulances
                    </Link>
                </Button>
                <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 h-12" asChild>
                    <Link href="/facilities">
                        <Building className="h-4 w-4 mr-2" />
                        Facilities
                    </Link>
                </Button>
                <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-12" asChild>
                    <Link href="/analytics">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}