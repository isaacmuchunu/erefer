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
import { FormDataConvertible } from '@inertiajs/core';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Define interfaces
interface Facility {
    id: number;
    name: string;
}

interface Specialty {
    id: number;
    name: string;
}

interface Doctor {
    id: number;
    user: User;
    facility: Facility;
    specialties: Specialty[];
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

type Props = {
    doctor: Doctor;
    user: User;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Doctors', href: '/doctors' },
    { title: 'Edit', href: '#' },
];

export default function DoctorEdit({ doctor, user }: Props) {
    const { data, setData, put, processing, errors } = useForm<DoctorFormData>({
        first_name: doctor.user.first_name || '',
        last_name: doctor.user.last_name || '',
        email: doctor.user.email || '',
        phone: doctor.user.phone || '',
        facility_id: doctor.facility?.id?.toString() || '',
        specialties: doctor.specialties?.map(s => s.id) || [],
        medical_license_number: doctor.medical_license_number || '',
        license_expiry: doctor.license_expiry || '',
        qualifications: doctor.qualifications || [],
        years_of_experience: doctor.years_of_experience || 0,
        languages_spoken: doctor.languages_spoken || [],
        bio: doctor.bio || '',
        consultation_fee: doctor.consultation_fee || 0,
        accepts_referrals: doctor.accepts_referrals || false,
        max_daily_referrals: doctor.max_daily_referrals || 0,
        status: doctor.status || '',
    });

    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [languages] = useState<string[]>(['English', 'Spanish', 'French', 'German', 'Chinese']);

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
        put(`/doctors/${doctor.id}`);
    };

    const handleSpecialtySelect = (value: number) => {
        const current = data.specialties ?? [];
        setData('specialties', current.includes(value) ? current.filter(v => v !== value) : [...current, value]);
    };

    const handleLanguageSelect = (value: string) => {
        const current = data.languages_spoken ?? [];
        setData('languages_spoken', current.includes(value) ? current.filter(v => v !== value) : [...current, value]);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} user={user}>
            <Head title="Edit Doctor" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Edit Doctor: {doctor.user.first_name || ''} {doctor.user.last_name || ''}
                    </h1>
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
                                        <Input
                                            value={data.first_name}
                                            onChange={e => setData('first_name', e.target.value)}
                                        />
                                        {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Last Name</label>
                                        <Input
                                            value={data.last_name}
                                            onChange={e => setData('last_name', e.target.value)}
                                        />
                                        {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Email</label>
                                        <Input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                        />
                                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Phone</label>
                                        <Input
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                        />
                                        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Medical License Number</label>
                                        <Input
                                            value={data.medical_license_number}
                                            onChange={e => setData('medical_license_number', e.target.value)}
                                        />
                                        {errors.medical_license_number && <p className="text-red-500 text-sm">{errors.medical_license_number}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">License Expiry</label>
                                        <Input
                                            type="date"
                                            value={data.license_expiry}
                                            onChange={e => setData('license_expiry', e.target.value)}
                                        />
                                        {errors.license_expiry && <p className="text-red-500 text-sm">{errors.license_expiry}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Years of Experience</label>
                                        <Input
                                            type="number"
                                            value={data.years_of_experience}
                                            onChange={e => setData('years_of_experience', parseInt(e.target.value) || 0)}
                                        />
                                        {errors.years_of_experience && <p className="text-red-500 text-sm">{errors.years_of_experience}</p>}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Facility</label>
                                        <Select
                                            value={data.facility_id}
                                            onValueChange={(value: string) => setData('facility_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select facility" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {facilities.map(fac => (
                                                    <SelectItem key={fac.id} value={fac.id.toString()}>
                                                        {fac.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.facility_id && <p className="text-red-500 text-sm">{errors.facility_id}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Specialties</label>
                                        <div className="space-y-2">
                                            {specialties.map(spec => (
                                                <div key={spec.id} className="flex items-center">
                                                    <Checkbox
                                                        checked={data.specialties.includes(spec.id)}
                                                        onCheckedChange={() => handleSpecialtySelect(spec.id)}
                                                    />
                                                    <span className="ml-2">{spec.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {errors.specialties && <p className="text-red-500 text-sm">{errors.specialties}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Languages Spoken</label>
                                        <div className="space-y-2">
                                            {languages.map(lang => (
                                                <div key={lang} className="flex items-center">
                                                    <Checkbox
                                                        checked={data.languages_spoken.includes(lang)}
                                                        onCheckedChange={() => handleLanguageSelect(lang)}
                                                    />
                                                    <span className="ml-2">{lang}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {errors.languages_spoken && <p className="text-red-500 text-sm">{errors.languages_spoken}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Qualifications (comma-separated)</label>
                                        <Textarea
                                            value={data.qualifications.join(', ')}
                                            onChange={e => setData('qualifications', e.target.value.split(', ').filter(q => q.trim()))}
                                        />
                                        {errors.qualifications && <p className="text-red-500 text-sm">{errors.qualifications}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Bio</label>
                                        <Textarea
                                            value={data.bio}
                                            onChange={e => setData('bio', e.target.value)}
                                        />
                                        {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Consultation Fee</label>
                                        <Input
                                            type="number"
                                            value={data.consultation_fee}
                                            onChange={e => setData('consultation_fee', parseFloat(e.target.value) || 0)}
                                        />
                                        {errors.consultation_fee && <p className="text-red-500 text-sm">{errors.consultation_fee}</p>}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            checked={data.accepts_referrals}
                                            onCheckedChange={(checked: boolean) => setData('accepts_referrals', checked)}
                                        />
                                        <label className="text-sm font-medium">Accepts Referrals</label>
                                    </div>
                                    {errors.accepts_referrals && <p className="text-red-500 text-sm">{errors.accepts_referrals}</p>}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Max Daily Referrals</label>
                                        <Input
                                            type="number"
                                            value={data.max_daily_referrals}
                                            onChange={e => setData('max_daily_referrals', parseInt(e.target.value) || 0)}
                                        />
                                        {errors.max_daily_referrals && <p className="text-red-500 text-sm">{errors.max_daily_referrals}</p>}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Status</label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value: string) => setData('status', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="on_leave">On Leave</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                Update Doctor
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}