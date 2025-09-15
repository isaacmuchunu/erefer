import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Patients', href: '/patients' },
    { title: 'Create', href: '/patients/create' },
];

export default function PatientCreate() {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        phone: '',
        email: '',
        blood_group: '',
        address: { street: '', city: '', state: '', postal_code: '' },
        emergency_contacts: [{ name: '', relationship: '', phone: '' }],
        medical_history: [{ condition: '', date: '', notes: '' }],
        allergies: [{ allergen: '', severity: '', notes: '' }],
        is_high_risk: false,
    });

    const [contactCount, setContactCount] = useState(1);
    const [historyCount, setHistoryCount] = useState(1);
    const [allergyCount, setAllergyCount] = useState(1);

    const addContact = () => {
        setContactCount(prev => prev + 1);
        setData('emergency_contacts', [...data.emergency_contacts, { name: '', relationship: '', phone: '' }]);
    };

    const removeContact = (index: number) => {
        if (contactCount > 1) {
            setContactCount(prev => prev - 1);
            setData('emergency_contacts', data.emergency_contacts.filter((_, i) => i !== index));
        }
    };

    // Similar functions for history and allergies...

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/api/v1/patients');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Patient" />
            <div className="max-w-4xl mx-auto py-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Patient</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            {/* Personal Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input id="first_name" value={data.first_name} onChange={e => setData('first_name', e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input id="last_name" value={data.last_name} onChange={e => setData('last_name', e.target.value)} />
                                </div>
                            </div>
                            {/* Add other fields similarly */}
                            <Button type="submit" disabled={processing}>Create Patient</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}