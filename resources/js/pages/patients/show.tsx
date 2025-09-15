import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Heart, Phone, Mail, MapPin, Calendar, User } from 'lucide-react';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { type Patient } from './index';

export default function PatientShow({ auth, patient }: PageProps<{ patient: Patient }>) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Patients', href: '/patients' },
        { title: patient.full_name, href: `/patients/${patient.id}` },
    ];

    return (
        <AppLayout user={auth.user} breadcrumbs={breadcrumbs}>
            <Head title={`Patient: ${patient.full_name}`} />
            <div className="max-w-4xl mx-auto py-6 space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">{patient.full_name}</h1>
                        <p className="text-muted-foreground">MRN: {patient.medical_record_number}</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={`/patients/${patient.id}/edit`}>Edit Patient</Link>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>DOB: {new Date(patient.date_of_birth).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>Age: {patient.age} | Gender: {patient.gender}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">Blood Group: {patient.blood_group}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{patient.phone}</span>
                            </div>
                            {patient.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{patient.email}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{patient.address.street}, {patient.address.city}, {patient.address.state} {patient.address.postal_code}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Risk Factors</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {patient.is_high_risk && (
                                <Badge variant="destructive">
                                    <AlertTriangle className="h-4 w-4 mr-1" />
                                    High Risk
                                </Badge>
                            )}
                            {patient.has_allergies && (
                                <Badge variant="secondary">
                                    <Heart className="h-4 w-4 mr-1" />
                                    Has Allergies
                                </Badge>
                            )}
                            <div>
                                Active Referrals: {patient.active_referrals_count}
                            </div>
                            {patient.last_referral_date && (
                                <div>
                                    Last Referral: {new Date(patient.last_referral_date).toLocaleDateString()}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="emergency" className="relative mr-auto w-full">
                    <TabsList>
                        <TabsTrigger value="emergency">Emergency Contacts</TabsTrigger>
                        <TabsTrigger value="history">Medical History</TabsTrigger>
                        <TabsTrigger value="allergies">Allergies</TabsTrigger>
                    </TabsList>
                    <TabsContent value="emergency">
                        <Card>
                            <CardHeader>
                                <CardTitle>Emergency Contacts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {patient.emergency_contacts.length > 0 ? (
                                    <div className="space-y-4">
                                        {patient.emergency_contacts.map((contact, index) => (
                                            <div key={index} className="p-4 border rounded">
                                                <p className="font-medium">{contact.name} ({contact.relationship})</p>
                                                <p>{contact.phone}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No emergency contacts recorded.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="history">
                        <Card>
                            <CardHeader>
                                <CardTitle>Medical History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {patient.medical_history.length > 0 ? (
                                    <div className="space-y-4">
                                        {patient.medical_history.map((history, index) => (
                                            <div key={index} className="p-4 border rounded">
                                                <p className="font-medium">{history.condition}</p>
                                                <p className="text-muted-foreground">{new Date(history.date).toLocaleDateString()}</p>
                                                {history.notes && <p>{history.notes}</p>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No medical history recorded.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="allergies">
                        <Card>
                            <CardHeader>
                                <CardTitle>Allergies</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {patient.allergies.length > 0 ? (
                                    <div className="space-y-4">
                                        {patient.allergies.map((allergy, index) => (
                                            <div key={index} className="p-4 border rounded">
                                                <p className="font-medium">{allergy.allergen}</p>
                                                <Badge variant="destructive">{allergy.severity}</Badge>
                                                {allergy.notes && <p className="mt-2">{allergy.notes}</p>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No allergies recorded.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}