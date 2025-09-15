import React, { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MoreHorizontal, Car, Wrench, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { debounce } from 'lodash';

interface Ambulance {
    id: number;
    vehicle_number: string;
    license_plate: string;
    type: string;
    status: 'available' | 'on_trip' | 'out_of_service';
    facility: {
        name: string;
    };
}

interface Stats {
    total: number;
    available: number;
    on_trip: number;
    out_of_service: number;
}

const AmbulancesPage: React.FC = () => {
    const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
    const [stats, setStats] = useState<Stats>({
        total: 0,
        available: 0,
        on_trip: 0,
        out_of_service: 0,
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        type: '',
    });

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/v1/ambulances/stats', { params: filters });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchAmbulances = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/v1/ambulances', {
                params: { ...filters, search: searchTerm },
            });
            setAmbulances(response.data.data);
        } catch (error) {
            console.error('Error fetching ambulances:', error);
        } finally {
            setLoading(false);
        }
    };

    const debouncedFetchAmbulances = useCallback(debounce(fetchAmbulances, 300), [filters, searchTerm]);

    useEffect(() => {
        fetchStats();
        debouncedFetchAmbulances();
    }, [filters, searchTerm]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const statusIcon = (status: string) => {
        switch (status) {
            case 'available':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'on_trip':
                return <Truck className="h-5 w-5 text-blue-500" />;
            case 'out_of_service':
                return <Wrench className="h-5 w-5 text-red-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    return (
        <AppLayout>
            <Head title="Ambulances" />
            <div className="space-y-6">
                <h1 className="cs_fs_32 cs_primary_font cs_bold cs_heading_color">Ambulance Fleet</h1>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Ambulances
                            </CardTitle>
                            <Car className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Available</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.available}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">On Trip</CardTitle>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.on_trip}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Out of Service</CardTitle>
                            <Wrench className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.out_of_service}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Ambulance List</CardTitle>
                        <CardDescription>
                            A list of all ambulances in the system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between space-x-4 pb-4">
                            <Input
                                placeholder="Search by vehicle number or license plate..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="max-w-sm"
                            />
                            <div className="flex space-x-2">
                                <Select
                                    onValueChange={(value) => handleFilterChange('status', value)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="on_trip">On Trip</SelectItem>
                                        <SelectItem value="out_of_service">Out of Service</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    onValueChange={(value) => handleFilterChange('type', value)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="als">ALS</SelectItem>
                                        <SelectItem value="bls">BLS</SelectItem>
                                        <SelectItem value="micu">MICU</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vehicle Number</TableHead>
                                    <TableHead>License Plate</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Facility</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    ambulances.map((ambulance) => (
                                        <TableRow key={ambulance.id}>
                                            <TableCell>{ambulance.vehicle_number}</TableCell>
                                            <TableCell>{ambulance.license_plate}</TableCell>
                                            <TableCell>{ambulance.type}</TableCell>
                                            <TableCell>{ambulance.facility.name}</TableCell>
                                            <TableCell className="flex items-center">
                                                {statusIcon(ambulance.status)}
                                                <span className="ml-2">{ambulance.status}</span>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                                        <DropdownMenuItem>Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default AmbulancesPage;
