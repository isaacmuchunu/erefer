import React, { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { BreadcrumbItem } from '@/types';

import { PageProps } from '@/types';

type Props = {
  referral: any;
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Referrals', href: '/referrals' },
  { title: 'Edit', href: '' },
];

export default function ReferralEdit({ referral, auth }: Props & PageProps) {
  const { data, setData, put, processing, errors } = useForm({
    patient_id: referral.patient_id || '',
    referring_facility_id: referral.referring_facility_id || '',
    receiving_facility_id: referral.receiving_facility_id || '',
    specialty_id: referral.specialty_id || '',
    urgency: referral.urgency || '',
    clinical_summary: referral.clinical_summary || '',
    reason_for_referral: referral.reason_for_referral || '',
    status: referral.status || 'pending',
  });

  const [patients, setPatients] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    axios.get('/api/v1/patients').then(res => setPatients(res.data.data));
    axios.get('/api/v1/facilities').then(res => setFacilities(res.data.data));
    axios.get('/api/v1/specialties').then(res => setSpecialties(res.data.data));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/referrals/${referral.id}`);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
      <Head title="Edit Referral" />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Edit Referral</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList>
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="clinical">Clinical Details</TabsTrigger>
                  </TabsList>
                  <TabsContent value="basic">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="patient_id">Patient</Label>
                        <Select value={data.patient_id.toString()} onValueChange={(value) => setData('patient_id', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {patients.map((patient: any) => (
                              <SelectItem key={patient.id} value={patient.id.toString()}>{patient.full_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="referring_facility_id">Referring Facility</Label>
                        <Select value={data.referring_facility_id.toString()} onValueChange={(value) => setData('referring_facility_id', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select facility" />
                          </SelectTrigger>
                          <SelectContent>
                            {facilities.map((facility: any) => (
                              <SelectItem key={facility.id} value={facility.id.toString()}>{facility.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="receiving_facility_id">Receiving Facility</Label>
                        <Select value={data.receiving_facility_id.toString()} onValueChange={(value) => setData('receiving_facility_id', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select facility" />
                          </SelectTrigger>
                          <SelectContent>
                            {facilities.map((facility: any) => (
                              <SelectItem key={facility.id} value={facility.id.toString()}>{facility.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="specialty_id">Specialty</Label>
                        <Select value={data.specialty_id.toString()} onValueChange={(value) => setData('specialty_id', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select specialty" />
                          </SelectTrigger>
                          <SelectContent>
                            {specialties.map((specialty: any) => (
                              <SelectItem key={specialty.id} value={specialty.id.toString()}>{specialty.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="urgency">Urgency</Label>
                        <Select value={data.urgency} onValueChange={(value) => setData('urgency', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="emergency">Emergency</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="semi_urgent">Semi-Urgent</SelectItem>
                            <SelectItem value="routine">Routine</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="clinical">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="reason_for_referral">Reason for Referral</Label>
                        <Textarea id="reason_for_referral" value={data.reason_for_referral} onChange={(e) => setData('reason_for_referral', e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="clinical_summary">Clinical Summary</Label>
                        <Textarea id="clinical_summary" value={data.clinical_summary} onChange={(e) => setData('clinical_summary', e.target.value)} />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <Button type="submit" disabled={processing}>Update Referral</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}