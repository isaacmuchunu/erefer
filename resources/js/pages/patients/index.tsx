import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
    Plus, 
    Search, 
    Eye, 
    Edit, 
    UserPlus,
    Calendar,
    Phone,
    Mail,
    MapPin,
    AlertTriangle,
    Heart,
    Activity
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import axios from 'axios';

interface Patient {
    id: number;
    medical_record_number: string;
    full_name: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
    blood_group: string;
    address: {
        street: string;
        city: string;
        state: string;
        postal_code: string;
    };
    emergency_contacts: Array<{
        name: string;
        relationship: string;
        phone: string;
    }>;
    medical_history: Array<{
        condition: string;
        date: string;
        notes: string;
    }>;
    allergies: Array<{
        allergen: string;
        severity: string;
        notes: string;
    }>;
    is_high_risk: boolean;
    has_allergies: boolean;
    active_referrals_count: number;
    last_referral_date: string;
}

interface PatientsData {
    data: Patient[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface PatientStats {
    total_patients: number;
    high_risk_patients: number;
    patients_with_allergies: number;
    active_referrals: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Patients', href: '/patients' },
];

export default function PatientsIndex() {
    const [patients, setPatients] = useState<PatientsData | null>(null);
    const [stats, setStats] = useState<PatientStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        gender: '',
        blood_group: '',
        age_range: '',
        high_risk: ''
    });
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    useEffect(() => {
        fetchPatients();
        fetchStats();
    }, [filters]);

    const fetchPatients = async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
            });
            
            const response = await axios.get(`/api/v1/patients?${params}`);
            const data = response.data;
            setPatients(data);
        } catch (error) {
            console.error('Failed to fetch patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/v1/patients/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch patient stats:', error);
        }
    };

    const getAgeGroup = (age: number) => {
        if (age < 18) return 'Minor';
        if (age < 65) return 'Adult';
        return 'Senior';
    };

    const getGenderIcon = (gender: string) => {
        return gender === 'male' ? '♂' : gender === 'female' ? '♀' : '⚧';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patients Management" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
                        <p className="text-muted-foreground">
                            Manage patient records and medical information
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/patients/create">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Patient
                        </Link>
                    </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                            <UserPlus className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_patients || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.high_risk_patients || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">With Allergies</CardTitle>
                            <Heart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.patients_with_allergies || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.active_referrals || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search patients..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    className="pl-8"
                                />
                            </div>
                            
                            <Select value={filters.gender} onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Genders</SelectItem>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filters.blood_group} onValueChange={(value) => setFilters(prev => ({ ...prev, blood_group: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Blood Group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Blood Groups</SelectItem>
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

                            <Select value={filters.age_range} onValueChange={(value) => setFilters(prev => ({ ...prev, age_range: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Age Range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Ages</SelectItem>
                                    <SelectItem value="0-17">0-17 (Minor)</SelectItem>
                                    <SelectItem value="18-64">18-64 (Adult)</SelectItem>
                                    <SelectItem value="65+">65+ (Senior)</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filters.high_risk} onValueChange={(value) => setFilters(prev => ({ ...prev, high_risk: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Risk Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Patients</SelectItem>
                                    <SelectItem value="true">High Risk Only</SelectItem>
                                    <SelectItem value="false">Standard Risk</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button 
                                variant="outline" 
                                onClick={() => setFilters({
                                    search: '', gender: '', blood_group: '', age_range: '', high_risk: ''
                                })}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Patients Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Patients List</CardTitle>
                        <CardDescription>
                            {patients?.total || 0} total patients
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-16 bg-gray-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>MRN</TableHead>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Age/Gender</TableHead>
                                        <TableHead>Blood Group</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Risk Factors</TableHead>
                                        <TableHead>Active Referrals</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patients?.data?.map((patient) => (
                                        <TableRow key={patient.id}>
                                            <TableCell className="font-medium">
                                                {patient.medical_record_number}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{patient.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        DOB: {new Date(patient.date_of_birth).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span>{patient.age}y</span>
                                                    <span className="text-lg">{getGenderIcon(patient.gender)}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {getAgeGroup(patient.age)}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{patient.blood_group}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        <span>{patient.phone}</span>
                                                    </div>
                                                    {patient.email && (
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Mail className="h-3 w-3" />
                                                            <span>{patient.email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {patient.is_high_risk && (
                                                        <Badge variant="destructive" className="text-xs">
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            High Risk
                                                        </Badge>
                                                    )}
                                                    {patient.has_allergies && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            <Heart className="h-3 w-3 mr-1" />
                                                            Allergies
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-center">
                                                    <Badge variant={patient.active_referrals_count > 0 ? "default" : "secondary"}>
                                                        {patient.active_referrals_count}
                                                    </Badge>
                                                    {patient.last_referral_date && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Last: {new Date(patient.last_referral_date).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => setSelectedPatient(patient)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-4xl">
                                                            <DialogHeader>
                                                                <DialogTitle>Patient Details</DialogTitle>
                                                                <DialogDescription>
                                                                    {selectedPatient?.medical_record_number} - {selectedPatient?.full_name}
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            {selectedPatient && (
                                                                <div className="grid gap-6 py-4">
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <h4 className="font-semibold mb-2">Personal Information</h4>
                                                                            <div className="space-y-2 text-sm">
                                                                                <p><strong>Name:</strong> {selectedPatient.full_name}</p>
                                                                                <p><strong>Age:</strong> {selectedPatient.age} years</p>
                                                                                <p><strong>Gender:</strong> {selectedPatient.gender}</p>
                                                                                <p><strong>Blood Group:</strong> {selectedPatient.blood_group}</p>
                                                                                <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                                                                                {selectedPatient.email && (
                                                                                    <p><strong>Email:</strong> {selectedPatient.email}</p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-semibold mb-2">Address</h4>
                                                                            <div className="text-sm">
                                                                                <p>{selectedPatient.address?.street}</p>
                                                                                <p>{selectedPatient.address?.city}, {selectedPatient.address?.state}</p>
                                                                                <p>{selectedPatient.address?.postal_code}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {selectedPatient.emergency_contacts?.length > 0 && (
                                                                        <div>
                                                                            <h4 className="font-semibold mb-2">Emergency Contacts</h4>
                                                                            <div className="space-y-2">
                                                                                {selectedPatient.emergency_contacts.map((contact, index) => (
                                                                                    <div key={index} className="text-sm border rounded p-2">
                                                                                        <p><strong>{contact.name}</strong> ({contact.relationship})</p>
                                                                                        <p>{contact.phone}</p>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {selectedPatient.medical_history?.length > 0 && (
                                                                        <div>
                                                                            <h4 className="font-semibold mb-2">Medical History</h4>
                                                                            <div className="space-y-2">
                                                                                {selectedPatient.medical_history.map((history, index) => (
                                                                                    <div key={index} className="text-sm border rounded p-2">
                                                                                        <p><strong>{history.condition}</strong></p>
                                                                                        <p className="text-muted-foreground">{history.date}</p>
                                                                                        {history.notes && <p>{history.notes}</p>}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {selectedPatient.allergies?.length > 0 && (
                                                                        <div>
                                                                            <h4 className="font-semibold mb-2">Allergies</h4>
                                                                            <div className="space-y-2">
                                                                                {selectedPatient.allergies.map((allergy, index) => (
                                                                                    <div key={index} className="text-sm border rounded p-2">
                                                                                        <p><strong>{allergy.allergen}</strong></p>
                                                                                        <Badge variant="destructive" className="text-xs">
                                                                                            {allergy.severity}
                                                                                        </Badge>
                                                                                        {allergy.notes && <p className="mt-1">{allergy.notes}</p>}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </DialogContent>
                                                    </Dialog>
                                                    
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/patients/${patient.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        {/* Pagination */}
                        {patients && patients.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {((patients.current_page - 1) * patients.per_page) + 1} to{' '}
                                    {Math.min(patients.current_page * patients.per_page, patients.total)} of{' '}
                                    {patients.total} results
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchPatients(patients.current_page - 1)}
                                        disabled={patients.current_page <= 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchPatients(patients.current_page + 1)}
                                        disabled={patients.current_page >= patients.last_page}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}