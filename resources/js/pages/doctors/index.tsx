// resources/js/pages/doctors/index.tsx
import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/pagination';
import { CalendarDays, User, Building2, Award, Star, Clock, Phone, Mail, Calendar } from 'lucide-react';
import axios from 'axios';

export interface Doctor {
  id: number;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  facility: {
    id: number;
    name: string;
  };
  specialties: Array<{
    id: number;
    name: string;
    primary_specialty: boolean;
  }>;
  medical_license_number: string;
  license_expiry: string;
  qualifications: string[];
  years_of_experience: number;
  languages_spoken: string[];
  bio: string;
  consultation_fee: number;
  availability_schedule: Record<string, any>;
  accepts_referrals: boolean;
  max_daily_referrals: number;
  rating: number;
  rating_count: number;
  status: 'active' | 'inactive' | 'on_leave';
  is_available: boolean;
  daily_referral_count: number;
  can_accept_more_referrals: boolean;
  referralsMade?: Array<object>;
  referralsReceived?: Array<object>;
}

interface DoctorsResponse {
  data: Doctor[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export default function Doctors({ auth }: PageProps) {
  const [doctors, setDoctors] = useState<DoctorsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [facilities, setFacilities] = useState<Array<{ id: number; name: string }>>([]);
  const [specialties, setSpecialties] = useState<Array<{ id: number; name: string }>>([]);
    const [stats, setStats] = useState({
        total_doctors: 0,
        active_doctors: 0,
        on_duty_doctors: 0,
        accepting_referrals: 0,
    });

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/v1/doctors/stats');
            setStats(response.data.stats);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (facilityFilter) params.append('facility_id', facilityFilter);
            if (specialtyFilter) params.append('specialty_id', specialtyFilter);
            if (statusFilter) params.append('status', statusFilter);
            if (availabilityFilter === 'available') params.append('available_now', 'true');
            params.append('page', currentPage.toString());

            const response = await axios.get(`/api/v1/doctors?${params.toString()}`);
            const data = response.data;
            setDoctors(data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        } finally {
            setLoading(false);
        }
    };

  const fetchFilters = async () => {
    try {
      const [facilitiesRes, specialtiesRes] = await Promise.all([
        axios.get('/api/v1/facilities?minimal=true'),
        axios.get('/api/v1/specialties')
      ]);
      const facilitiesData = facilitiesRes.data;
      const specialtiesData = specialtiesRes.data;
      
      setFacilities(facilitiesData.data || []);
      setSpecialties(specialtiesData.data || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchFilters();
    fetchStats();
  }, [currentPage, searchQuery, facilityFilter, specialtyFilter, statusFilter, availabilityFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDoctors();
  };

  const handleReset = () => {
    setSearchQuery('');
    setFacilityFilter('');
    setSpecialtyFilter('');
    setStatusFilter('');
    setAvailabilityFilter('');
    setCurrentPage(1);
  };

  const handleDoctorClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500">Inactive</Badge>;
      case 'on_leave':
        return <Badge className="bg-yellow-500">On Leave</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  return (
    <AppLayout user={auth.user}>
      <Head title="Doctors" />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Doctors Management</h1>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <User className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-2xl font-bold">{stats.total_doctors}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-2xl font-bold">{stats.active_doctors}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">On Duty Doctors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-2xl font-bold">{stats.on_duty_doctors}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Accepting Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                <User className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-2xl font-bold">{stats.accepting_referrals}</span>
              </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Filters */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter the doctors list based on various criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <Input 
                    placeholder="Search by name" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Facility</label>
                  <Select value={facilityFilter} onValueChange={setFacilityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Facilities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Facilities</SelectItem>
                      {facilities.map((facility) => (
                        <SelectItem key={facility.id} value={facility.id.toString()}>
                          {facility.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Specialty</label>
                  <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Specialties</SelectItem>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty.id} value={specialty.id.toString()}>
                          {specialty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Availability</label>
                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="available">Available Now</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end space-x-2">
                  <Button type="submit">Apply Filters</Button>
                  <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Doctors List */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Doctors List</CardTitle>
              <CardDescription>
                Showing {doctors?.meta?.from || 0} - {doctors?.meta?.to || 0} of {doctors?.meta?.total || 0} doctors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading doctors...</p>
                </div>
              ) : doctors?.data?.length ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Facility</TableHead>
                        <TableHead>Specialties</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {doctors.data.map((doctor) => (
                        <TableRow key={doctor.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleDoctorClick(doctor)}>
                          <TableCell>
                            <div className="font-medium">{doctor.user.first_name} {doctor.user.last_name}</div>
                            <div className="text-sm text-gray-500">{doctor.medical_license_number}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Building2 className="h-4 w-4 mr-1 text-gray-500" />
                              <span>{doctor.facility.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {doctor.specialties.map((specialty) => (
                                <Badge key={specialty.id} variant={specialty.primary_specialty ? "default" : "outline"}>
                                  {specialty.name}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(doctor.status)}
                            {doctor.is_available && (
                              <Badge className="ml-1 bg-green-100 text-green-800 border-green-200">Available</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {renderStars(doctor.rating)}
                              <span className="ml-1 text-sm text-gray-500">({doctor.rating_count})</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" onClick={(e) => {
                              e.stopPropagation();
                              handleDoctorClick(doctor);
                            }}>View</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination */}
                  <div className="mt-4">
                    <Pagination
                      currentPage={doctors.meta.current_page}
                      lastPage={doctors.meta.last_page}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </>
              ) : (
                <div className="flex justify-center items-center h-64">
                  <p>No doctors found matching the criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Doctor Detail Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDoctor?.user.first_name} {selectedDoctor?.user.last_name}
            </DialogTitle>
            <DialogDescription>
              {selectedDoctor?.specialties.filter(s => s.primary_specialty).map(s => s.name).join(', ')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDoctor && (
            <Tabs defaultValue="details">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="referrals">Referrals</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{selectedDoctor.user.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{selectedDoctor.user.phone}</span>
                      </div>
                      <div className="flex items-start">
                        <Award className="h-4 w-4 mr-2 text-gray-500 mt-1" />
                        <div>
                          <div className="font-medium">Qualifications</div>
                          <ul className="list-disc list-inside text-sm">
                            {selectedDoctor.qualifications.map((qual, i) => (
                              <li key={i}>{qual}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{selectedDoctor.years_of_experience} years of experience</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Professional Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <div className="font-medium">License</div>
                        <div className="text-sm">
                          {selectedDoctor.medical_license_number} (Expires: {new Date(selectedDoctor.license_expiry).toLocaleDateString()})
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Languages</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedDoctor.languages_spoken.map((lang, i) => (
                            <Badge key={i} variant="outline">{lang}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Specialties</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedDoctor.specialties.map((specialty) => (
                            <Badge key={specialty.id} variant={specialty.primary_specialty ? "default" : "outline"}>
                              {specialty.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Consultation Fee</div>
                        <div className="text-sm">${selectedDoctor.consultation_fee.toFixed(2)}</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-base">Biography</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedDoctor.bio}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="schedule">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Availability Schedule</CardTitle>
                    <CardDescription>
                      {selectedDoctor.accepts_referrals ? 
                        `Accepting referrals (Max ${selectedDoctor.max_daily_referrals} per day)` : 
                        'Not currently accepting referrals'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(selectedDoctor.availability_schedule || {}).map(([day, hours]) => (
                        <div key={day} className="border rounded p-3">
                          <div className="font-medium capitalize">{day}</div>
                          {Array.isArray(hours) && hours.length > 0 ? (
                            <div className="text-sm mt-1">
                              {hours.map((slot: string, i: number) => (
                                <div key={i}>{slot}</div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 mt-1">Not available</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="referrals">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Referral Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded p-4 text-center">
                        <div className="text-2xl font-bold">{selectedDoctor.referralsReceived?.length || 0}</div>
                        <div className="text-sm text-gray-500">Recent Referrals Received</div>
                      </div>
                      <div className="border rounded p-4 text-center">
                        <div className="text-2xl font-bold">{selectedDoctor.referralsMade?.length || 0}</div>
                        <div className="text-sm text-gray-500">Recent Referrals Made</div>
                      </div>
                      <div className="border rounded p-4 text-center">
                        <div className="text-2xl font-bold">{selectedDoctor.daily_referral_count} / {selectedDoctor.max_daily_referrals}</div>
                        <div className="text-sm text-gray-500">Today's Referrals</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}