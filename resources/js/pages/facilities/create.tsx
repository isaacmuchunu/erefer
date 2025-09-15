import { useForm } from '@inertiajs/react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Facilities', href: '/facilities' },
    { title: 'Create', href: '/facilities/create' },
];

export default function FacilityCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: '',
        level: '',
        status: 'active',
        address: { street: '', city: '', state: '', postal_code: '' },
        contact: { phone: '', email: '', emergency_phone: '' },
        capacity: { total_beds: 0, icu_beds: 0, emergency_beds: 0 },
        accepts_referrals: true,
        emergency_services: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/facilities');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Facility" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Create New Facility</h1>
                    <Button variant="outline" asChild>
                        <Link href="/facilities">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Facility Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Name</label>
                                        <Input 
                                            value={data.name} 
                                            onChange={e => setData('name', e.target.value)} 
                                            placeholder="Facility Name" 
                                        />
                                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Type</label>
                                        <Select value={data.type} onValueChange={value => setData('type', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="hospital">Hospital</SelectItem>
                                                <SelectItem value="clinic">Clinic</SelectItem>
                                                <SelectItem value="emergency">Emergency Center</SelectItem>
                                                <SelectItem value="specialty">Specialty Center</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Level</label>
                                        <Select value={data.level} onValueChange={value => setData('level', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="primary">Primary</SelectItem>
                                                <SelectItem value="secondary">Secondary</SelectItem>
                                                <SelectItem value="tertiary">Tertiary</SelectItem>
                                                <SelectItem value="quaternary">Quaternary</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Status</label>
                                        <Select value={data.status} onValueChange={value => setData('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Street</label>
                                        <Input 
                                            value={data.address.street} 
                                            onChange={e => setData('address', { ...data.address, street: e.target.value })} 
                                            placeholder="Street Address" 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">City</label>
                                        <Input 
                                            value={data.address.city} 
                                            onChange={e => setData('address', { ...data.address, city: e.target.value })} 
                                            placeholder="City" 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">State</label>
                                        <Input 
                                            value={data.address.state} 
                                            onChange={e => setData('address', { ...data.address, state: e.target.value })} 
                                            placeholder="State" 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Postal Code</label>
                                        <Input 
                                            value={data.address.postal_code} 
                                            onChange={e => setData('address', { ...data.address, postal_code: e.target.value })} 
                                            placeholder="Postal Code" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone</label>
                                    <Input 
                                        value={data.contact.phone} 
                                        onChange={e => setData('contact', { ...data.contact, phone: e.target.value })} 
                                        placeholder="Phone Number" 
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <Input 
                                        value={data.contact.email} 
                                        onChange={e => setData('contact', { ...data.contact, email: e.target.value })} 
                                        placeholder="Email" 
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Emergency Phone</label>
                                    <Input 
                                        value={data.contact.emergency_phone} 
                                        onChange={e => setData('contact', { ...data.contact, emergency_phone: e.target.value })} 
                                        placeholder="Emergency Phone" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Total Beds</label>
                                    <Input 
                                        type="number" 
                                        value={data.capacity.total_beds} 
                                        onChange={e => setData('capacity', { ...data.capacity, total_beds: parseInt(e.target.value) })} 
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">ICU Beds</label>
                                    <Input 
                                        type="number" 
                                        value={data.capacity.icu_beds} 
                                        onChange={e => setData('capacity', { ...data.capacity, icu_beds: parseInt(e.target.value) })} 
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Emergency Beds</label>
                                    <Input 
                                        type="number" 
                                        value={data.capacity.emergency_beds} 
                                        onChange={e => setData('capacity', { ...data.capacity, emergency_beds: parseInt(e.target.value) })} 
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <Input 
                                        type="checkbox" 
                                        checked={data.accepts_referrals} 
                                        onChange={e => setData('accepts_referrals', e.target.checked)} 
                                    />
                                    Accepts Referrals
                                </label>
                                <label className="flex items-center gap-2">
                                    <Input 
                                        type="checkbox" 
                                        checked={data.emergency_services} 
                                        onChange={e => setData('emergency_services', e.target.checked)} 
                                    />
                                    Emergency Services
                                </label>
                            </div>

                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                Create Facility
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}