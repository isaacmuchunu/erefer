import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit } from 'lucide-react';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { type Facility } from './index';

type Props = PageProps<{
    facility: Facility;
}>;

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Facilities', href: '/facilities' },
    { title: 'Details', href: '#' },
];

export default function FacilityShow({ auth, facility }: Props) {
    return (
        <AppLayout user={auth.user} breadcrumbs={breadcrumbs}>
            <Head title={`Facility: ${facility.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">{facility.name}</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/facilities">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/facilities/${facility.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between">
                            <CardTitle>Facility Overview</CardTitle>
                            <Badge variant={facility.status === 'active' ? 'default' : 'secondary'}>
                                {facility.status.charAt(0).toUpperCase() + facility.status.slice(1)}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Contact Information</h3>
                            <p>Phone: {facility.contact.phone}</p>
                            <p>Email: {facility.contact.email}</p>
                            <p>Emergency: {facility.contact.emergency_phone}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Address</h3>
                            <p>{facility.address.street}</p>
                            <p>{facility.address.city}, {facility.address.state} {facility.address.postal_code}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Capacity</h3>
                            <p>Total Beds: {facility.capacity.total_beds}</p>
                            <p>ICU Beds: {facility.capacity.icu_beds}</p>
                            <p>Emergency Beds: {facility.capacity.emergency_beds}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Services</h3>
                            <p>Accepts Referrals: {facility.accepts_referrals ? 'Yes' : 'No'}</p>
                            <p>Emergency Services: {facility.emergency_services ? 'Yes' : 'No'}</p>
                            <p>Average Response Time: {facility.avg_response_time} min</p>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="departments" className="relative mr-auto w-full">
                    <TabsList>
                        <TabsTrigger value="departments">Departments</TabsTrigger>
                        <TabsTrigger value="specialties">Specialties</TabsTrigger>
                        <TabsTrigger value="equipment">Equipment</TabsTrigger>
                        <TabsTrigger value="ambulances">Ambulances</TabsTrigger>
                    </TabsList>
                    <TabsContent value="departments">
                        <Card>
                            <CardHeader>
                                <CardTitle>Departments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Head</TableHead>
                                            <TableHead>Staff Count</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {facility.departments.map(dept => (
                                            <TableRow key={dept.id}>
                                                <TableCell>{dept.name}</TableCell>
                                                <TableCell>{dept.head_name}</TableCell>
                                                <TableCell>{dept.staff_count}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="specialties">
                        <Card>
                            <CardHeader>
                                <CardTitle>Specialties</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {facility.specialties.map(spec => (
                                        <Badge key={spec}>{spec}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="equipment">
                        <Card>
                            <CardHeader>
                                <CardTitle>Equipment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Quantity</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {facility.equipment.map(eq => (
                                            <TableRow key={eq.id}>
                                                <TableCell>{eq.name}</TableCell>
                                                <TableCell>{eq.status}</TableCell>
                                                <TableCell>{eq.quantity}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="ambulances">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ambulances</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Vehicle Number</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Type</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {facility.ambulances.map(amb => (
                                            <TableRow key={amb.id}>
                                                <TableCell>{amb.vehicle_number}</TableCell>
                                                <TableCell>{amb.status}</TableCell>
                                                <TableCell>{amb.type}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}