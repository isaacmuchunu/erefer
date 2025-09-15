import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { PageProps } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BreadcrumbItem } from '@/types';


const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Referrals', href: '/referrals' },
  { title: 'View', href: '' },
];

export default function ReferralShow({ auth, referral }: PageProps<{ referral: any }>) {
  return (
    <AppLayout user={auth.user} breadcrumbs={breadcrumbs}>
      <Head title="View Referral" />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Referral Details - {referral.referral_number}</CardTitle>
              <CardDescription>Status: <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>{referral.status}</Badge></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Patient</h3>
                  <p>{referral.patient.full_name}</p>
                  <p>MRN: {referral.patient.medical_record_number}</p>
                  <p>Age: {referral.patient.age}, Gender: {referral.patient.gender}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Referring Facility</h3>
                  <p>{referral.referring_facility.name}</p>
                  <p>Type: {referral.referring_facility.type}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Receiving Facility</h3>
                  <p>{referral.receiving_facility.name}</p>
                  <p>Type: {referral.receiving_facility.type}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Specialty</h3>
                  <p>{referral.specialty.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Urgency</h3>
                  <Badge variant={referral.urgency === 'emergency' ? 'destructive' : 'default'}>{referral.urgency}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold">Dates</h3>
                  <p>Referred At: {referral.referred_at}</p>
                  <p>Response Deadline: {referral.response_deadline}</p>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="font-semibold">Reason for Referral</h3>
                <p>{referral.reason_for_referral}</p>
              </div>
              <div className="mt-6">
                <h3 className="font-semibold">Clinical Summary</h3>
                <p>{referral.clinical_summary}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}