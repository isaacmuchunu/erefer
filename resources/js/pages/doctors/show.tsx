// resources/js/pages/doctors/show.tsx
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Mail, Phone, Award, CalendarDays, Building2, Star } from 'lucide-react';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Doctor } from './index';

type Props = PageProps & {
    doctor: Doctor;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Doctors', href: '/doctors' },
    { title: 'Details', href: '#' },
];

export default function DoctorShow({ auth, doctor }: Props) {
    const renderStars = (rating: number) => {
        return Array(5).fill(0).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
        ));
    };

    return (
        <AppLayout user={auth.user} breadcrumbs={breadcrumbs}>
            <Head title={`Doctor: ${doctor.user.first_name} ${doctor.user.last_name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">{doctor.user.first_name} {doctor.user.last_name}</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/doctors">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/doctors/${doctor.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between">
                            <CardTitle>Doctor Overview</CardTitle>
                            <Badge variant={doctor.status === 'active' ? 'default' : 'secondary'}>
                                {doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Contact Information</h3>
                            <p className="flex items-center"><Mail className="mr-2 h-4 w-4" /> {doctor.user.email}</p>
                            <p className="flex items-center"><Phone className="mr-2 h-4 w-4" /> {doctor.user.phone}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Professional</h3>
                            <p className="flex items-center"><Building2 className="mr-2 h-4 w-4" /> {doctor.facility.name}</p>
                            <p>License: {doctor.medical_license_number} (Expires: {new Date(doctor.license_expiry).toLocaleDateString()})</p>
                            <p className="flex items-center"><Award className="mr-2 h-4 w-4" /> {doctor.years_of_experience} years experience</p>
                            <div className="flex items-center mt-2">{renderStars(doctor.rating)} ({doctor.rating_count})</div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="details" className="relative mr-auto w-full">
                    <TabsList>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        <TabsTrigger value="referrals">Referrals</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details">
                        <Card>
                            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
                            <CardContent>
                                <h4 className="font-medium">Specialties</h4>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {doctor.specialties.map((spec: { id: number; name: string; primary_specialty: boolean }) => (
                                        <Badge key={spec.id} variant={spec.primary_specialty ? 'default' : 'outline'}>{spec.name}</Badge>
                                    ))}
                                </div>
                                <h4 className="font-medium">Languages</h4>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {doctor.languages_spoken.map((lang: string) => <Badge key={lang}>{lang}</Badge>)}
                                </div>
                                <h4 className="font-medium">Qualifications</h4>
                                <ul className="list-disc pl-5 mb-4">
                                    {doctor.qualifications.map((qual: string) => <li key={qual}>{qual}</li>)}
                                </ul>
                                <h4 className="font-medium">Bio</h4>
                                <p>{doctor.bio}</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="schedule">
                        <Card>
                            <CardHeader><CardTitle>Schedule</CardTitle></CardHeader>
                            <CardContent>
                                <p>Accepts Referrals: {doctor.accepts_referrals ? 'Yes' : 'No'} (Max {doctor.max_daily_referrals}/day)</p>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    {Object.entries(doctor.availability_schedule).map(([day, slots]: [string, string[]]) => (
                                        <div key={day}>
                                            <h5 className="capitalize font-medium">{day}</h5>
                                            {slots.map((slot: string) => <p key={slot}>{slot}</p>)}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="referrals">
                        <Card>
                            <CardHeader><CardTitle>Referrals</CardTitle></CardHeader>
                            <CardContent>
                                <p>Today's Count: {doctor.daily_referral_count} / {doctor.max_daily_referrals}</p>
                                {/* Add more referral stats if available */}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}