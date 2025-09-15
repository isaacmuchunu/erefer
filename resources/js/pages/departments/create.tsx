import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';

type Facility = { id: number; name: string };
type User = { id: number; name: string };

const DepartmentCreate: React.FC<{ auth: { user: any } }> = ({ auth }) => {
  const { data, setData, post, processing, errors } = useForm({
    facility_id: '',
    name: '',
    code: '',
    description: '',
    services_offered: [] as string[],
    equipment_available: [] as string[],
    head_of_department: '',
    status: 'active',
  });

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facRes, userRes] = await Promise.all([
          axios.get('/api/v1/facilities'),
          axios.get('/api/v1/users'),
        ]);
        setFacilities(facRes.data.data);
        setUsers(userRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/departments');
  };

  return (
    <AppLayout user={auth.user}>
      <Head title="Create Department" />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Create New Department</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="facility_id">Facility</Label>
                  <Select value={data.facility_id} onValueChange={(value) => setData('facility_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select facility" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilities.map(f => (
                        <SelectItem key={f.id} value={f.id.toString()}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.facility_id && <p className="text-red-500 text-sm">{errors.facility_id}</p>}
                </div>

                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="code">Code</Label>
                  <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} />
                  {errors.code && <p className="text-red-500 text-sm">{errors.code}</p>}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                  {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                </div>

                <div>
                  <Label htmlFor="services_offered">Services Offered (comma-separated)</Label>
                  <Input id="services_offered" value={data.services_offered.join(', ')} onChange={(e) => setData('services_offered', e.target.value.split(', '))} />
                  {errors.services_offered && <p className="text-red-500 text-sm">{errors.services_offered}</p>}
                </div>

                <div>
                  <Label htmlFor="equipment_available">Equipment Available (comma-separated)</Label>
                  <Input id="equipment_available" value={data.equipment_available.join(', ')} onChange={(e) => setData('equipment_available', e.target.value.split(', '))} />
                  {errors.equipment_available && <p className="text-red-500 text-sm">{errors.equipment_available}</p>}
                </div>

                <div>
                  <Label htmlFor="head_of_department">Head of Department</Label>
                  <Select value={data.head_of_department} onValueChange={(value) => setData('head_of_department', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select head" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.head_of_department && <p className="text-red-500 text-sm">{errors.head_of_department}</p>}
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default DepartmentCreate;