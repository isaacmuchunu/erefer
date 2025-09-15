import React, { useState, useEffect, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
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
import { MoreHorizontal, Package, Wrench, CheckCircle, XCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { debounce } from 'lodash';
import { notification } from 'antd';

interface Equipment {
    id: number;
    name: string;
    code: string;
    status: 'available' | 'in_use' | 'maintenance' | 'out_of_order';
    facility: {
        name: string;
    };
    department: {
        name: string;
    };
}

interface Stats {
    total: number;
    available: number;
    in_use: number;
    maintenance: number;
    out_of_order: number;
}

const EquipmentPage: React.FC = () => {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [stats, setStats] = useState<Stats>({
        total: 0,
        available: 0,
        in_use: 0,
        maintenance: 0,
        out_of_order: 0,
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        facility_id: '',
        department_id: '',
    });

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/v1/equipment/stats', { params: filters });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchEquipment = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/v1/equipment', {
                params: { ...filters, search: searchTerm },
            });
            setEquipment(response.data.data);
        } catch (error) {
            console.error('Error fetching equipment:', error);
        } finally {
            setLoading(false);
        }
    };

    const debouncedFetchEquipment = useCallback(debounce(fetchEquipment, 300), [filters, searchTerm]);

    useEffect(() => {
        fetchStats();
        debouncedFetchEquipment();
    }, [filters, searchTerm]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };
    
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this equipment?')) {
            axios.delete(`/api/v1/equipment/${id}`)
                .then(() => {
                    notification.success({ message: 'Equipment deleted successfully' });
                    fetchEquipment();
                    fetchStats();
                })
                .catch(error => {
                    notification.error({ message: 'Error', description: 'Failed to delete equipment.' });
                    console.error('Delete equipment error', error);
                });
        }
    };

    const statusIcon = (status: string) => {
        switch (status) {
            case 'available':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'in_use':
                return <Package className="h-5 w-5 text-blue-500" />;
            case 'maintenance':
                return <Wrench className="h-5 w-5 text-yellow-500" />;
            case 'out_of_order':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    const { auth } = usePage().props;

    return (
        <AppLayout user={auth.user}>
            <Head title="Equipment" />
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Equipment</h1>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
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
                            <CardTitle className="text-sm font-medium">In Use</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.in_use}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
                            <Wrench className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.maintenance}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Out of Order</CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.out_of_order}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Equipment List</CardTitle>
                        <CardDescription>
                            A list of all equipment in the system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between space-x-4 pb-4">
                            <Input
                                placeholder="Search by name, code, or serial number..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="max-w-sm"
                            />
                            {/* Add filters for facility and department here */}
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Facility</TableHead>
                                    <TableHead>Department</TableHead>
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
                                    equipment.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.code}</TableCell>
                                            <TableCell>{item.facility.name}</TableCell>
                                            <TableCell>{item.department.name}</TableCell>
                                            <TableCell className="flex items-center">
                                                {statusIcon(item.status)}
                                                <span className="ml-2">{item.status}</span>
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
                                                        <DropdownMenuItem onSelect={() => router.visit(`/equipment/${item.id}`)}>View Details</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => router.visit(`/equipment/${item.id}/edit`)}>Edit</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => handleDelete(item.id)} className="text-red-500">Delete</DropdownMenuItem>
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

export default EquipmentPage;