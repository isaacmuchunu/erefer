import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from '@inertiajs/react';

interface Patient {
    id: number;
    name: string;
    date_of_birth: string;
    status: string;
    created_at: string;
}

interface RecentPatientsProps {
    patients: Patient[];
}

export function RecentPatients({ patients }: RecentPatientsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
                <CardDescription>Latest patient records</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Registered</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {patients?.length > 0 ? (
                            patients.map((patient) => {
                                const birthDate = new Date(patient.date_of_birth);
                                const age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                                return (
                                    <TableRow key={patient.id}>
                                        <TableCell>{patient.name}</TableCell>
                                        <TableCell>{age}</TableCell>
                                        <TableCell><Badge>{patient.status}</Badge></TableCell>
                                        <TableCell>{new Date(patient.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Link href={`/patients/${patient.id}`} className="text-blue-600 hover:underline">
                                                View
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">No recent patients</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}