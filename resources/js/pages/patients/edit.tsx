import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, AlertTriangle, Heart } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { type BreadcrumbItem } from '@/types';
import { type Patient } from './index'; // Adjust path if necessary

export default function PatientEdit({ patient }: { patient: Patient }) {
    const { data, setData, put, processing, errors } = useForm({
        ...patient,
        address: patient.address || { street: '', city: '', state: '', postal_code: '' },
        emergency_contacts: patient.emergency_contacts || [{ name: '', relationship: '', phone: '' }],
        medical_history: patient.medical_history || [{ condition: '', date: '', notes: '' }],
        allergies: patient.allergies || [{ allergen: '', severity: '', notes: '' }],
    });

    const [contactCount, setContactCount] = useState(data.emergency_contacts.length);
    const [historyCount, setHistoryCount] = useState(data.medical_history.length);
    const [allergyCount, setAllergyCount] = useState(data.allergies.length);

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

    const addHistory = () => {
        setHistoryCount(prev => prev + 1);
        setData('medical_history', [...data.medical_history, { condition: '', date: '', notes: '' }]);
    };

    const removeHistory = (index: number) => {
        if (historyCount > 1) {
            setHistoryCount(prev => prev - 1);
            setData('medical_history', data.medical_history.filter((_, i) => i !== index));
        }
    };

    const addAllergy = () => {
        setAllergyCount(prev => prev + 1);
        setData('allergies', [...data.allergies, { allergen: '', severity: '', notes: '' }]);
    };

    const removeAllergy = (index: number) => {
        if (allergyCount > 1) {
            setAllergyCount(prev => prev - 1);
            setData('allergies', data.allergies.filter((_, i) => i !== index));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/patients/${patient.id}`);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Patients', href: '/patients' },
        { title: 'Edit', href: `/patients/${patient.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Patient" />
            <div className="max-w-4xl mx-auto py-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Patient: {patient.full_name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-8">
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Personal Information</h3>
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
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                                        <Input type="date" id="date_of_birth" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="gender">Gender</Label>
                                        <Select value={data.gender} onValueChange={value => setData('gender', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="blood_group">Blood Group</Label>
                                        <Select value={data.blood_group} onValueChange={value => setData('blood_group', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select blood group" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A+">A+</SelectItem>
                                                <SelectItem value="A-">A-</SelectItem>
                                                <SelectItem value="B+">B+</SelectItem>
                                                <SelectItem value="B-">B-</SelectItem>
                                                <SelectItem value="AB+">AB+</SelectItem>
                                                <SelectItem value="AB-">AB-</SelectItem>
                                                <SelectItem value="O+">O+</SelectItem>
                                                <SelectItem value="O-">O-</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input id="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Address</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="street">Street</Label>
                                        <Input id="street" value={data.address.street} onChange={e => setData('address', { ...data.address, street: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" value={data.address.city} onChange={e => setData('address', { ...data.address, city: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="state">State</Label>
                                        <Input id="state" value={data.address.state} onChange={e => setData('address', { ...data.address, state: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label htmlFor="postal_code">Postal Code</Label>
                                        <Input id="postal_code" value={data.address.postal_code} onChange={e => setData('address', { ...data.address, postal_code: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Emergency Contacts</h3>
                                    <Button type="button" variant="outline" size="sm" onClick={addContact}><Plus className="h-4 w-4" /></Button>
                                </div>
                                {data.emergency_contacts.map((contact, index) => (
                                    <div key={index} className="grid grid-cols-4 gap-4 items-end">
                                        <div>
                                            <Label htmlFor={`contact-name-${index}`}>Name</Label>
                                            <Input id={`contact-name-${index}`} value={contact.name} onChange={e => {
                                                const newContacts = [...data.emergency_contacts];
                                                newContacts[index].name = e.target.value;
                                                setData('emergency_contacts', newContacts);
                                            }} />
                                        </div>
                                        <div>
                                            <Label htmlFor={`contact-relationship-${index}`}>Relationship</Label>
                                            <Input id={`contact-relationship-${index}`} value={contact.relationship} onChange={e => {
                                                const newContacts = [...data.emergency_contacts];
                                                newContacts[index].relationship = e.target.value;
                                                setData('emergency_contacts', newContacts);
                                            }} />
                                        </div>
                                        <div>
                                            <Label htmlFor={`contact-phone-${index}`}>Phone</Label>
                                            <Input id={`contact-phone-${index}`} value={contact.phone} onChange={e => {
                                                const newContacts = [...data.emergency_contacts];
                                                newContacts[index].phone = e.target.value;
                                                setData('emergency_contacts', newContacts);
                                            }} />
                                        </div>
                                        <Button type="button" variant="destructive" size="sm" onClick={() => removeContact(index)} disabled={contactCount <= 1}><Minus className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Medical History</h3>
                                    <Button type="button" variant="outline" size="sm" onClick={addHistory}><Plus className="h-4 w-4" /></Button>
                                </div>
                                {data.medical_history.map((history, index) => (
                                    <div key={index} className="grid grid-cols-4 gap-4 items-end">
                                        <div>
                                            <Label htmlFor={`history-condition-${index}`}>Condition</Label>
                                            <Input id={`history-condition-${index}`} value={history.condition} onChange={e => {
                                                const newHistory = [...data.medical_history];
                                                newHistory[index].condition = e.target.value;
                                                setData('medical_history', newHistory);
                                            }} />
                                        </div>
                                        <div>
                                            <Label htmlFor={`history-date-${index}`}>Date</Label>
                                            <Input type="date" id={`history-date-${index}`} value={history.date} onChange={e => {
                                                const newHistory = [...data.medical_history];
                                                newHistory[index].date = e.target.value;
                                                setData('medical_history', newHistory);
                                            }} />
                                        </div>
                                        <div>
                                            <Label htmlFor={`history-notes-${index}`}>Notes</Label>
                                            <Textarea id={`history-notes-${index}`} value={history.notes} onChange={e => {
                                                const newHistory = [...data.medical_history];
                                                newHistory[index].notes = e.target.value;
                                                setData('medical_history', newHistory);
                                            }} />
                                        </div>
                                        <Button type="button" variant="destructive" size="sm" onClick={() => removeHistory(index)} disabled={historyCount <= 1}><Minus className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Allergies</h3>
                                    <Button type="button" variant="outline" size="sm" onClick={addAllergy}><Plus className="h-4 w-4" /></Button>
                                </div>
                                {data.allergies.map((allergy, index) => (
                                    <div key={index} className="grid grid-cols-4 gap-4 items-end">
                                        <div>
                                            <Label htmlFor={`allergy-allergen-${index}`}>Allergen</Label>
                                            <Input id={`allergy-allergen-${index}`} value={allergy.allergen} onChange={e => {
                                                const newAllergies = [...data.allergies];
                                                newAllergies[index].allergen = e.target.value;
                                                setData('allergies', newAllergies);
                                            }} />
                                        </div>
                                        <div>
                                            <Label htmlFor={`allergy-severity-${index}`}>Severity</Label>
                                            <Select value={allergy.severity} onValueChange={value => {
                                                const newAllergies = [...data.allergies];
                                                newAllergies[index].severity = value;
                                                setData('allergies', newAllergies);
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select severity" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="mild">Mild</SelectItem>
                                                    <SelectItem value="moderate">Moderate</SelectItem>
                                                    <SelectItem value="severe">Severe</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor={`allergy-notes-${index}`}>Notes</Label>
                                            <Textarea id={`allergy-notes-${index}`} value={allergy.notes} onChange={e => {
                                                const newAllergies = [...data.allergies];
                                                newAllergies[index].notes = e.target.value;
                                                setData('allergies', newAllergies);
                                            }} />
                                        </div>
                                        <Button type="button" variant="destructive" size="sm" onClick={() => removeAllergy(index)} disabled={allergyCount <= 1}><Minus className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch id="is_high_risk" checked={data.is_high_risk} onCheckedChange={checked => setData('is_high_risk', checked)} />
                                <Label htmlFor="is_high_risk">High Risk Patient</Label>
                            </div>

                            <Button type="submit" disabled={processing}>Update Patient</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}