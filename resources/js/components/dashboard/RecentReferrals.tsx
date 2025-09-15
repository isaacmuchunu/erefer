import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from '@inertiajs/react';

interface Referral {
    id: number;
    referral_number: string;
    patient_name: string;
    urgency: string;
    status: string;
    created_at: string;
    referring_facility: string;
    receiving_facility: string;
}

interface RecentReferralsProps {
    referrals: Referral[];
}

const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
        case 'emergency': return 'destructive';
        case 'urgent': return 'destructive';
        case 'semi_urgent': return 'default';
        case 'routine': return 'secondary';
        default: return 'secondary';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'default';
        case 'accepted': return 'default';
        case 'in_transit': return 'default';
        case 'completed': return 'default';
        case 'rejected': return 'destructive';
        default: return 'secondary';
    }
};

export function RecentReferrals({ referrals }: RecentReferralsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Referrals</CardTitle>
                <CardDescription>Latest referral requests in the system</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Referral #</TableHead>
                            <TableHead>Patient</TableHead>
                            <TableHead>Urgency</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>From</TableHead>
                            <TableHead>To</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {referrals?.length > 0 ? (
                            referrals.map((referral) => (
                                <TableRow key={referral.id}>
                                    <TableCell>{referral.referral_number}</TableCell>
                                    <TableCell>{referral.patient_name}</TableCell>
                                    <TableCell><Badge variant={getUrgencyColor(referral.urgency)}>{referral.urgency}</Badge></TableCell>
                                    <TableCell><Badge variant={getStatusColor(referral.status)}>{referral.status}</Badge></TableCell>
                                    <TableCell>{referral.referring_facility}</TableCell>
                                    <TableCell>{referral.receiving_facility}</TableCell>
                                    <TableCell>{new Date(referral.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Link href={`/referrals/${referral.id}`} className="text-blue-600 hover:underline">
                                            View
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">No recent referrals</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}