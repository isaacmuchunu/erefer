import React, { useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { notification } from 'antd';

type Facility = { id: number; name: string };
type Department = { id: number; name: string };
type BedType = { id: number; name: string };

const BedCreate: React.FC = () => {
  const [data, setData] = useState({
    facility_id: '',
    department_id: '',
    bed_type_id: '',
    bed_number: '',
    room_number: '',
    status: 'available',
    equipment: [] as string[],
    notes: '',
  });

  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [bedTypes, setBedTypes] = useState<BedType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facRes, typeRes] = await Promise.all([
          axios.get('/api/v1/facilities'),
          axios.get('/api/v1/bed-types'),
        ]);
        setFacilities(facRes.data.data || facRes.data || []);
        setBedTypes(typeRes.data.data || typeRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (data.facility_id) {
      axios.get(`/api/v1/facilities/${data.facility_id}/departments`)
        .then(res => setDepartments(res.data.data || res.data || []))
        .catch(err => console.error(err));
    } else {
      setDepartments([]);
    }
  }, [data.facility_id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    axios.post('/api/v1/beds', data)
      .then(() => {
        notification.success({ message: 'Bed created successfully' });
        router.visit('/beds');
      })
      .catch(err => {
        if (err.response && err.response.status === 422 && err.response.data.errors) {
          setErrors(err.response.data.errors);
          notification.error({ message: 'Validation Error', description: 'Please check the form fields.' });
        } else {
          notification.error({ message: 'Error', description: 'Failed to create bed.' });
        }
        console.error('Create bed error', err);
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  const handleValueChange = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleFacilityChange = (value: string) => {
    setData(prev => ({ ...prev, facility_id: value, department_id: '' }));
  };

  const { auth } = usePage().props;

  return (
    <AppLayout user={auth.user}>
      <Head title="Create Bed" />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Create New Bed</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="facility_id">Facility</Label>
                  <Select value={data.facility_id} onValueChange={handleFacilityChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select facility" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilities.map(f => (
                        <SelectItem key={f.id} value={f.id.toString()}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.facility_id && <p className="text-red-500 text-sm">{errors.facility_id[0]}</p>}
                </div>

                <div>
                  <Label htmlFor="department_id">Department</Label>
                  <Select value={data.department_id} onValueChange={(value) => handleValueChange('department_id', value)} disabled={!data.facility_id || departments.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(d => (
                        <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department_id && <p className="text-red-500 text-sm">{errors.department_id[0]}</p>}
                </div>

                <div>
                  <Label htmlFor="bed_type_id">Bed Type</Label>
                  <Select value={data.bed_type_id} onValueChange={(value) => handleValueChange('bed_type_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bed type" />
                    </SelectTrigger>
                    <SelectContent>
                      {bedTypes.map(t => (
                        <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.bed_type_id && <p className="text-red-500 text-sm">{errors.bed_type_id[0]}</p>}
                </div>

                <div>
                  <Label htmlFor="bed_number">Bed Number</Label>
                  <Input id="bed_number" value={data.bed_number} onChange={(e) => handleValueChange('bed_number', e.target.value)} />
                  {errors.bed_number && <p className="text-red-500 text-sm">{errors.bed_number[0]}</p>}
                </div>

                <div>
                  <Label htmlFor="room_number">Room Number</Label>
                  <Input id="room_number" value={data.room_number} onChange={(e) => handleValueChange('room_number', e.target.value)} />
                  {errors.room_number && <p className="text-red-500 text-sm">{errors.room_number[0]}</p>}
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={data.status} onValueChange={(value) => handleValueChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-red-500 text-sm">{errors.status[0]}</p>}
                </div>

                <div>
                  <Label htmlFor="equipment">Equipment (comma-separated)</Label>
                  <Input id="equipment" value={data.equipment.join(', ')} onChange={(e) => handleValueChange('equipment', e.target.value.split(',').map(s => s.trim()))} />
                  {errors.equipment && <p className="text-red-500 text-sm">{errors.equipment[0]}</p>}
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" value={data.notes} onChange={(e) => handleValueChange('notes', e.target.value)} />
                  {errors.notes && <p className="text-red-500 text-sm">{errors.notes[0]}</p>}
                </div>

                <Button type="submit" disabled={processing}>Create Bed</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default BedCreate;