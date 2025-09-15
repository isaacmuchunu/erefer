import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
    Plus,
    Search,
    Eye,
    Edit,
    Building2,
    Bed,
    Users,
    MapPin,
    Phone,
    Mail,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Stethoscope,
    Truck,
    Wrench
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Facility {
    id: number;
    name: string;
    type: string;
    level: string;
    status: 'active' | 'inactive' | 'maintenance';
    address: {
        street: string;
        city: string;
        state: string;
        postal_code: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };
    contact: {
        phone: string;
        email: string;
        emergency_phone: string;
    };
    capacity: {
        total_beds: number;
        available_beds: number;
        icu_beds: number;
        emergency_beds: number;
        occupancy_rate: number;
    };
    departments: Array<{
        id: number;
        name: string;
        head: string;
        bed_count: number;
        available_beds: number;
    }>;
    specialties: Array<{
        id: number;
        name: string;
        available: boolean;
    }>;
    equipment: Array<{
        id: number;
        name: string;
        status: string;
        last_maintenance: string;
    }>;
    ambulances: Array<{
        id: number;
        vehicle_number: string;
        status: string;
        current_location?: string;
    }>;
    doctors_count: number;
    nurses_count: number;
    support_staff_count: number;
    average_response_time: number;
    last_updated: string;
    accepts_referrals: boolean;
    emergency_services: boolean;
}

interface FacilitiesData {
    data: Facility[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Facilities', href: '/facilities' },
];

export default function FacilitiesIndex() {
    const [facilities, setFacilities] = useState<FacilitiesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        type: '',
        level: '',
        status: '',
        city: '',
        accepts_referrals: ''
    });
    const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

    const [stats, setStats] = useState({
        total_facilities: 0,
        verified_facilities: 0,
        emergency_ready: 0,
        accepting_referrals: 0,
        total_beds: 0,
        available_beds: 0,
        average_occupancy: 0,
    });

    useEffect(() => {
        fetchFacilities();
        fetchStats();
    }, [filters]);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/v1/facilities/stats');
            setStats(response.data.stats);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchFacilities = async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
            });

            const response = await axios.get(`/api/facilities?${params}`);
            setFacilities(response.data);
        } catch (error) {
            console.error('Failed to fetch facilities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500';
            case 'inactive': return 'bg-red-500';
            case 'maintenance': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    const getOccupancyColor = (rate: number) => {
        if (rate >= 90) return 'text-red-600';
        if (rate >= 75) return 'text-yellow-600';
        return 'text-green-600';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Facilities Management" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="cs_fs_32 cs_primary_font cs_bold cs_heading_color">Healthcare Facilities</h1>
                        <p className="cs_body_color cs_secondary_font">
                            Manage healthcare facilities and their resources
                        </p>
                    </div>
                    <Button asChild className="cs_btn cs_style_1 cs_primary_font">
                        <Link href="/facilities/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Facility
                        </Link>
                    </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Facilities</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{facilities?.total || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {facilities?.data?.filter(f => f.status === 'active').length || 0} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
                            <Bed className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {facilities?.data?.reduce((sum, f) => sum + f.capacity.total_beds, 0) || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {facilities?.data?.reduce((sum, f) => sum + f.capacity.available_beds, 0) || 0} available
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Occupancy</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {facilities?.data?.length ?
                                    Math.round(facilities.data.reduce((sum, f) => sum + f.capacity.occupancy_rate, 0) / facilities.data.length)
                                    : 0}%
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Emergency Ready</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {facilities?.data?.filter(f => f.emergency_services && f.status === 'active').length || 0}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search facilities..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    className="pl-8"
                                />
                            </div>

                            <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Types</SelectItem>
                                    <SelectItem value="hospital">Hospital</SelectItem>
                                    <SelectItem value="clinic">Clinic</SelectItem>
                                    <SelectItem value="emergency">Emergency Center</SelectItem>
                                    <SelectItem value="specialty">Specialty Center</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filters.level} onValueChange={(value) => setFilters(prev => ({ ...prev, level: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Levels</SelectItem>
                                    <SelectItem value="primary">Primary</SelectItem>
                                    <SelectItem value="secondary">Secondary</SelectItem>
                                    <SelectItem value="tertiary">Tertiary</SelectItem>
                                    <SelectItem value="quaternary">Quaternary</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                placeholder="City"
                                value={filters.city}
                                onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                            />

                            <Select value={filters.accepts_referrals} onValueChange={(value) => setFilters(prev => ({ ...prev, accepts_referrals: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Referrals" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All</SelectItem>
                                    <SelectItem value="true">Accepts Referrals</SelectItem>
                                    <SelectItem value="false">No Referrals</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                onClick={() => setFilters({
                                    search: '', type: '', level: '', status: '', city: '', accepts_referrals: ''
                                })}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Facilities Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Facilities List</CardTitle>
                        <CardDescription>
                            {facilities?.total || 0} total facilities
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-20 bg-gray-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Facility</TableHead>
                                        <TableHead>Type/Level</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Capacity</TableHead>
                                        <TableHead>Occupancy</TableHead>
                                        <TableHead>Services</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {facilities?.data?.map((facility) => (
                                        <TableRow key={facility.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{facility.name}</p>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Phone className="h-3 w-3" />
                                                        <span>{facility.contact.phone}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <Badge variant="outline">{facility.type}</Badge>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {facility.level}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        <span>{facility.address.city}, {facility.address.state}</span>
                                                    </div>
                                                    <p className="text-muted-foreground">{facility.address.street}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p><strong>{facility.capacity.total_beds}</strong> total beds</p>
                                                    <p className="text-green-600">{facility.capacity.available_beds} available</p>
                                                    <p className="text-muted-foreground">
                                                        ICU: {facility.capacity.icu_beds} | ER: {facility.capacity.emergency_beds}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm font-medium ${getOccupancyColor(facility.capacity.occupancy_rate)}`}>
                                                            {facility.capacity.occupancy_rate}%
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={facility.capacity.occupancy_rate}
                                                        className="h-2"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {facility.accepts_referrals && (
                                                        <Badge variant="default" className="text-xs">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Referrals
                                                        </Badge>
                                                    )}
                                                    {facility.emergency_services && (
                                                        <Badge variant="destructive" className="text-xs">
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            Emergency
                                                        </Badge>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">
                                                        {facility.specialties.length} specialties
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(facility.status)}`}></div>
                                                    <span className="text-sm capitalize">{facility.status}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Updated: {new Date(facility.last_updated).toLocaleDateString()}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setSelectedFacility(facility)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-6xl">
                                                            <DialogHeader>
                                                                <DialogTitle>Facility Details</DialogTitle>
                                                                <DialogDescription>
                                                                    {selectedFacility?.name} - {selectedFacility?.type}
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            {selectedFacility && (
                                                                <Tabs defaultValue="overview" className="w-full">
                                                                    <TabsList className="grid w-full grid-cols-5">
                                                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                                                        <TabsTrigger value="departments">Departments</TabsTrigger>
                                                                        <TabsTrigger value="specialties">Specialties</TabsTrigger>
                                                                        <TabsTrigger value="equipment">Equipment</TabsTrigger>
                                                                        <TabsTrigger value="ambulances">Ambulances</TabsTrigger>
                                                                    </TabsList>

                                                                    <TabsContent value="overview" className="space-y-4">
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div>
                                                                                <h4 className="font-semibold mb-2">Contact Information</h4>
                                                                                <div className="space-y-2 text-sm">
                                                                                    <p><strong>Phone:</strong> {selectedFacility.contact.phone}</p>
                                                                                    <p><strong>Email:</strong> {selectedFacility.contact.email}</p>
                                                                                    <p><strong>Emergency:</strong> {selectedFacility.contact.emergency_phone}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="font-semibold mb-2">Address</h4>
                                                                                <div className="text-sm">
                                                                                    <p>{selectedFacility.address.street}</p>
                                                                                    <p>{selectedFacility.address.city}, {selectedFacility.address.state}</p>
                                                                                    <p>{selectedFacility.address.postal_code}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid grid-cols-3 gap-4">
                                                                            <Card>
                                                                                <CardHeader className="pb-2">
                                                                                    <CardTitle className="text-sm">Bed Capacity</CardTitle>
                                                                                </CardHeader>
                                                                                <CardContent>
                                                                                    <div className="text-2xl font-bold">{selectedFacility.capacity.total_beds}</div>
                                                                                    <p className="text-xs text-muted-foreground">
                                                                                        {selectedFacility.capacity.available_beds} available
                                                                                    </p>
                                                                                </CardContent>
                                                                            </Card>
                                                                            <Card>
                                                                                <CardHeader className="pb-2">
                                                                                    <CardTitle className="text-sm">Staff Count</CardTitle>
                                                                                </CardHeader>
                                                                                <CardContent>
                                                                                    <div className="text-2xl font-bold">
                                                                                        {selectedFacility.doctors_count + selectedFacility.nurses_count + selectedFacility.support_staff_count}
                                                                                    </div>
                                                                                    <p className="text-xs text-muted-foreground">
                                                                                        {selectedFacility.doctors_count} doctors
                                                                                    </p>
                                                                                </CardContent>
                                                                            </Card>
                                                                            <Card>
                                                                                <CardHeader className="pb-2">
                                                                                    <CardTitle className="text-sm">Response Time</CardTitle>
                                                                                </CardHeader>
                                                                                <CardContent>
                                                                                    <div className="text-2xl font-bold">{selectedFacility.average_response_time}m</div>
                                                                                    <p className="text-xs text-muted-foreground">average</p>
                                                                                </CardContent>
                                                                            </Card>
                                                                        </div>
                                                                    </TabsContent>

                                                                    <TabsContent value="departments">
                                                                        <div className="space-y-4">
                                                                            {selectedFacility.departments.map((dept) => (
                                                                                <Card key={dept.id}>
                                                                                    <CardContent className="pt-4">
                                                                                        <div className="flex justify-between items-start">
                                                                                            <div>
                                                                                                <h4 className="font-semibold">{dept.name}</h4>
                                                                                                <p className="text-sm text-muted-foreground">Head: {dept.head}</p>
                                                                                            </div>
                                                                                            <div className="text-right">
                                                                                                <p className="text-sm"><strong>{dept.bed_count}</strong> beds</p>
                                                                                                <p className="text-sm text-green-600">{dept.available_beds} available</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </CardContent>
                                                                                </Card>
                                                                            ))}
                                                                        </div>
                                                                    </TabsContent>

                                                                    <TabsContent value="specialties">
                                                                        <div className="grid grid-cols-3 gap-4">
                                                                            {selectedFacility.specialties.map((specialty) => (
                                                                                <Card key={specialty.id}>
                                                                                    <CardContent className="pt-4">
                                                                                        <div className="flex items-center justify-between">
                                                                                            <span className="text-sm">{specialty.name}</span>
                                                                                            {specialty.available ? (
                                                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                                                            ) : (
                                                                                                <XCircle className="h-4 w-4 text-red-500" />
                                                                                            )}
                                                                                        </div>
                                                                                    </CardContent>
                                                                                </Card>
                                                                            ))}
                                                                        </div>
                                                                    </TabsContent>

                                                                    <TabsContent value="equipment">
                                                                        <div className="space-y-4">
                                                                            {selectedFacility.equipment.map((equip) => (
                                                                                <Card key={equip.id}>
                                                                                    <CardContent className="pt-4">
                                                                                        <div className="flex justify-between items-center">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <Wrench className="h-4 w-4" />
                                                                                                <span>{equip.name}</span>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-2">
                                                                                                <Badge variant={equip.status === 'operational' ? 'default' : 'destructive'}>
                                                                                                    {equip.status}
                                                                                                </Badge>
                                                                                                <span className="text-xs text-muted-foreground">
                                                                                                    Last maintenance: {new Date(equip.last_maintenance).toLocaleDateString()}
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </CardContent>
                                                                                </Card>
                                                                            ))}
                                                                        </div>
                                                                    </TabsContent>

                                                                    <TabsContent value="ambulances">
                                                                        <div className="space-y-4">
                                                                            {selectedFacility.ambulances.map((ambulance) => (
                                                                                <Card key={ambulance.id}>
                                                                                    <CardContent className="pt-4">
                                                                                        <div className="flex justify-between items-center">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <Truck className="h-4 w-4" />
                                                                                                <span>{ambulance.vehicle_number}</span>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-2">
                                                                                                <Badge variant={ambulance.status === 'available' ? 'default' : 'secondary'}>
                                                                                                    {ambulance.status}
                                                                                                </Badge>
                                                                                                {ambulance.current_location && (
                                                                                                    <span className="text-xs text-muted-foreground">
                                                                                                        @ {ambulance.current_location}
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </CardContent>
                                                                                </Card>
                                                                            ))}
                                                                        </div>
                                                                    </TabsContent>
                                                                </Tabs>
                                                            )}
                                                        </DialogContent>
                                                    </Dialog>

                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/facilities/${facility.id}/edit`}>
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
                        {facilities && facilities.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {((facilities.current_page - 1) * facilities.per_page) + 1} to{' '}
                                    {Math.min(facilities.current_page * facilities.per_page, facilities.total)} of{' '}
                                    {facilities.total} results
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchFacilities(facilities.current_page - 1)}
                                        disabled={facilities.current_page <= 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchFacilities(facilities.current_page + 1)}
                                        disabled={facilities.current_page >= facilities.last_page}
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
