import { useForm } from '@inertiajs/react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { type BreadcrumbItem, type User } from '@/types';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FormDataConvertible } from '@inertiajs/core';

interface Facility {
    id: number;
    name: string;
}

interface Specialty {
    id: number;
    name: string;
}

type DoctorFormData = {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    facility_id: string;
    specialties: number[];
    medical_license_number: string;
    license_expiry: string;
    qualifications: string[];
    years_of_experience: number;
    languages_spoken: string[];
    bio: string;
    consultation_fee: number;
    accepts_referrals: boolean;
    max_daily_referrals: number;
    status: string;
} & Record<string, FormDataConvertible>;

type ArrayKeys = 'specialties' | 'qualifications' | 'languages_spoken';

type ValueType<K extends ArrayKeys> = K extends 'specialties' ? number : string;

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Doctors', href: '/doctors' },
    { title: 'Create', href: '/doctors/create' },
];

export default function DoctorCreate({ user }: { user: User }) {
    const { data, setData, post, processing, errors } = useForm<DoctorFormData>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        facility_id: '',
        specialties: [] as number[],
        medical_license_number: '',
        license_expiry: '',
        qualifications: [] as string[],
        years_of_experience: 0,
        languages_spoken: [] as string[],
        bio: '',
        consultation_fee: 0,
        accepts_referrals: true,
        max_daily_referrals: 0,
        status: 'active',
    });

    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [languages] = useState<string[]>(['English', 'Spanish', 'French', 'German', 'Chinese']); // Example languages

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [facRes, specRes] = await Promise.all([
                    axios.get('/api/v1/facilities?minimal=true'),
                    axios.get('/api/v1/specialties')
                ]);
                setFacilities(facRes.data.data || []);
                setSpecialties(specRes.data.data || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/doctors');
    };

    const handleMultiSelect = <K extends ArrayKeys>(field: K, value: ValueType<K>) => {
        const current = data[field] as DoctorFormData[K];
        setData(field, current.includes(value) ? current.filter(v => v !== value) : [...current, value]);
    };

    return (
        <AppLayout user={user} breadcrumbs={breadcrumbs}>
            <Head title="Create Doctor" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Create New Doctor</h1>
                    <Button variant="outline" asChild>
                        <Link href="/doctors">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Doctor Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">First Name</label>
                                        <Input value={data.first_name} onChange={e => setData('first_name', e.target.value)} />
                                        {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Last Name</label>
                                        <Input value={data.last_name} onChange={e => setData('last_name', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Email</label>
                                        <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Phone</label>
                                        <Input value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Facility</label>
                                        <Select value={data.facility_id} onValueChange={value => setData('facility_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select facility" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {facilities.map(fac => (
                                                    <SelectItem key={fac.id} value={fac.id.toString()}>{fac.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Specialties</label>
                                        <div className="space-y-2">
                                            {specialties.map(spec => (
                                                <div key={spec.id} className="flex items-center">
                                                    <Checkbox checked={data.specialties.includes(spec.id)} onCheckedChange={() => handleMultiSelect('specialties', spec.id)} />
                                                    <span className="ml-2">{spec.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Add more fields similarly for other attributes */}
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                Create Doctor
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}