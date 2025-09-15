import { useState, useEffect, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Plus,
    Search,
    Clock,
    CheckCircle,
    XCircle,
    Send,
    FileText
} from 'lucide-react';
import { debounce } from 'lodash';
import { type BreadcrumbItem } from '@/types';

interface Referral {
    id: number;
    patient: { full_name: string; };
    referring_facility: { name: string; };
    receiving_facility: { name: string; };
    specialty: { name: string; };
    urgency: string;
    status: string;
    referred_at: string;
}

interface ReferralsData {
    data: Referral[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Stats {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    completed: number;
    in_transit: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Referrals' },
];

export default function ReferralsIndex() {
    const [referrals, setReferrals] = useState<ReferralsData | null>(null);
    const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, accepted: 0, rejected: 0, completed: 0, in_transit: 0 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        urgency: '',
    });

    const fetchReferrals = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
            });
            const response = await axios.get(`/api/v1/referrals?${params}`);
            setReferrals(response.data);
        } catch (error) {
            console.error('Failed to fetch referrals:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const fetchStats = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
            });
            const response = await axios.get(`/api/v1/referrals/stats?${params}`);
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    }, [filters]);

    const debouncedFetch = useCallback(debounce(() => {
        fetchReferrals();
        fetchStats();
    }, 300), [fetchReferrals, fetchStats]);

    useEffect(() => {
        debouncedFetch();
        return debouncedFetch.cancel;
    }, [filters, debouncedFetch]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
            case 'accepted': return <Badge><CheckCircle className="mr-1 h-3 w-3" />Accepted</Badge>;
            case 'rejected': return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
            case 'completed': return <Badge variant="default"><CheckCircle className="mr-1 h-3 w-3" />Completed</Badge>;
            case 'in_transit': return <Badge color="blue"><Send className="mr-1 h-3 w-3" />In Transit</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Referrals" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="cs_fs_32 cs_primary_font cs_bold cs_heading_color">Referrals</h1>
                        <p className="cs_body_color cs_secondary_font">Track and manage all patient referrals.</p>
                    </div>
                    <Button asChild className="cs_btn cs_style_1 cs_primary_font">
                        <Link href="/referrals/create">
                            <Plus className="mr-2 h-4 w-4" /> New Referral
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
                    <div className="cs_white_bg cs_radius_20 cs_shadow_1 p-6 hover:cs_shadow_2 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm cs_medium cs_body_color cs_secondary_font">Total Referrals</span>
                            <FileText className="h-4 w-4 cs_accent_color" />
                        </div>
                        <div className="cs_fs_24 cs_bold cs_accent_color cs_primary_font">{stats.total}</div>
                    </div>
                    <div className="cs_white_bg cs_radius_20 cs_shadow_1 p-6 hover:cs_shadow_2 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm cs_medium cs_body_color cs_secondary_font">Pending</span>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div className="cs_fs_24 cs_bold text-yellow-600 cs_primary_font">{stats.pending}</div>
                    </div>
                    <div className="cs_white_bg cs_radius_20 cs_shadow_1 p-6 hover:cs_shadow_2 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm cs_medium cs_body_color cs_secondary_font">Accepted</span>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="cs_fs_24 cs_bold text-green-600 cs_primary_font">{stats.accepted}</div>
                    </div>
                    <div className="cs_white_bg cs_radius_20 cs_shadow_1 p-6 hover:cs_shadow_2 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm cs_medium cs_body_color cs_secondary_font">In Transit</span>
                            <Send className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="cs_fs_24 cs_bold text-blue-600 cs_primary_font">{stats.in_transit}</div>
                    </div>
                    <div className="cs_white_bg cs_radius_20 cs_shadow_1 p-6 hover:cs_shadow_2 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm cs_medium cs_body_color cs_secondary_font">Completed</span>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="cs_fs_24 cs_bold text-green-600 cs_primary_font">{stats.completed}</div>
                    </div>
                    <div className="cs_white_bg cs_radius_20 cs_shadow_1 p-6 hover:cs_shadow_2 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm cs_medium cs_body_color cs_secondary_font">Rejected</span>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="cs_fs_24 cs_bold text-red-600 cs_primary_font">{stats.rejected}</div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-4">
                            <Input
                                placeholder="Search by patient, facility..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="max-w-sm"
                            />
                            <div className="flex gap-2">
                                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="accepted">Accepted</SelectItem>
                                        <SelectItem value="in_transit">In Transit</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={filters.urgency} onValueChange={(value) => setFilters(prev => ({ ...prev, urgency: value }))}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by urgency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Urgencies</SelectItem>
                                        <SelectItem value="emergency">Emergency</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                        <SelectItem value="semi_urgent">Semi-Urgent</SelectItem>
                                        <SelectItem value="routine">Routine</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>From</TableHead>
                                    <TableHead>To</TableHead>
                                    <TableHead>Specialty</TableHead>
                                    <TableHead>Urgency</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Referred At</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>
                                ) : referrals?.data.map((referral) => (
                                    <TableRow key={referral.id}>
                                        <TableCell>{referral.patient.full_name}</TableCell>
                                        <TableCell>{referral.referring_facility.name}</TableCell>
                                        <TableCell>{referral.receiving_facility.name}</TableCell>
                                        <TableCell>{referral.specialty.name}</TableCell>
                                        <TableCell><Badge variant={referral.urgency === 'emergency' || referral.urgency === 'urgent' ? 'destructive' : 'secondary'}>{referral.urgency}</Badge></TableCell>
                                        <TableCell>{getStatusBadge(referral.status)}</TableCell>
                                        <TableCell>{new Date(referral.referred_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/referrals/${referral.id}`}>View</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
