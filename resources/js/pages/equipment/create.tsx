import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import axios from 'axios';
import { notification } from 'antd';

type Facility = { id: number; name: string };
type Department = { id: number; name: string; facility_id: number };

const EquipmentCreate: React.FC<{ user: any }> = ({ user }) => {
  const [data, setData] = useState({
    facility_id: '',
    department_id: '',
    name: '',
    code: '',
    serial_number: '',
    manufacturer: '',
    model: '',
    purchase_date: undefined as Date | undefined,
    warranty_expiry: undefined as Date | undefined,
    next_maintenance_due: undefined as Date | undefined,
    status: 'available',
    specifications: '',
    cost: 0,
  });
  
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facRes, deptRes] = await Promise.all([
          axios.get('/api/v1/facilities'),
          axios.get('/api/v1/departments'),
        ]);
        setFacilities(facRes.data.data);
        setDepartments(deptRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (data.facility_id) {
      setFilteredDepartments(departments.filter(d => d.facility_id === parseInt(data.facility_id)));
    } else {
      setFilteredDepartments([]);
    }
  }, [data.facility_id, departments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    
    const transformedData = {
      ...data,
      purchase_date: data.purchase_date ? format(data.purchase_date, 'yyyy-MM-dd') : null,
      warranty_expiry: data.warranty_expiry ? format(data.warranty_expiry, 'yyyy-MM-dd') : null,
      next_maintenance_due: data.next_maintenance_due ? format(data.next_maintenance_due, 'yyyy-MM-dd') : null,
    };
    
    axios.post('/api/v1/equipment', transformedData)
      .then(() => {
        notification.success({ message: 'Equipment created successfully' });
        router.visit('/equipment');
      })
      .catch(err => {
        if (err.response && err.response.status === 422 && err.response.data.errors) {
          setErrors(err.response.data.errors);
          notification.error({ message: 'Validation Error', description: 'Please check the form fields.' });
        } else {
          notification.error({ message: 'Error', description: 'Failed to create equipment.' });
        }
        console.error('Create equipment error', err);
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  return (
    <AppLayout user={user}>
      <Head title="Create Equipment" />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Create New Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="facility_id">Facility</Label>
                  <Select value={data.facility_id} onValueChange={(value) => setData({...data, facility_id: value})}>
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
                  <Label htmlFor="department_id">Department</Label>
                  <Select value={data.department_id} onValueChange={(value) => setData({...data, department_id: value})} disabled={!data.facility_id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDepartments.map(d => (
                        <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department_id && <p className="text-red-500 text-sm">{errors.department_id}</p>}
                </div>

                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={data.name} onChange={(e) => setData({...data, name: e.target.value})} />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="code">Code</Label>
                  <Input id="code" value={data.code} onChange={(e) => setData({...data, code: e.target.value})} />
                  {errors.code && <p className="text-red-500 text-sm">{errors.code}</p>}
                </div>

                <div>
                  <Label htmlFor="serial_number">Serial Number</Label>
                  <Input id="serial_number" value={data.serial_number} onChange={(e) => setData({...data, serial_number: e.target.value})} />
                  {errors.serial_number && <p className="text-red-500 text-sm">{errors.serial_number}</p>}
                </div>

                <div>
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input id="manufacturer" value={data.manufacturer} onChange={(e) => setData({...data, manufacturer: e.target.value})} />
                  {errors.manufacturer && <p className="text-red-500 text-sm">{errors.manufacturer}</p>}
                </div>

                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" value={data.model} onChange={(e) => setData({...data, model: e.target.value})} />
                  {errors.model && <p className="text-red-500 text-sm">{errors.model}</p>}
                </div>

                <div>
                  <Label>Purchase Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !data.purchase_date && 'text-muted-foreground')}>
                        {data.purchase_date ? format(data.purchase_date, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={data.purchase_date} onSelect={(date) => setData({...data, purchase_date: date})} initialFocus />
                    </PopoverContent>
                  </Popover>
                  {errors.purchase_date && <p className="text-red-500 text-sm">{errors.purchase_date}</p>}
                </div>

                <div>
                  <Label>Warranty Expiry</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !data.warranty_expiry && 'text-muted-foreground')}>
                        {data.warranty_expiry ? format(data.warranty_expiry, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={data.warranty_expiry} onSelect={(date) => setData({...data, warranty_expiry: date})} initialFocus />
                    </PopoverContent>
                  </Popover>
                  {errors.warranty_expiry && <p className="text-red-500 text-sm">{errors.warranty_expiry}</p>}
                </div>

                <div>
                  <Label>Next Maintenance Due</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !data.next_maintenance_due && 'text-muted-foreground')}>
                        {data.next_maintenance_due ? format(data.next_maintenance_due, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={data.next_maintenance_due} onSelect={(date) => setData({...data, next_maintenance_due: date})} initialFocus />
                    </PopoverContent>
                  </Popover>
                  {errors.next_maintenance_due && <p className="text-red-500 text-sm">{errors.next_maintenance_due}</p>}
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={data.status} onValueChange={(value) => setData({...data, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="in_use">In Use</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="out_of_order">Out of Order</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                </div>

                <div>
                  <Label htmlFor="specifications">Specifications</Label>
                  <Textarea id="specifications" value={data.specifications} onChange={(e) => setData({...data, specifications: e.target.value})} />
                  {errors.specifications && <p className="text-red-500 text-sm">{errors.specifications}</p>}
                </div>

                <div>
                  <Label htmlFor="cost">Cost</Label>
                  <Input type="number" id="cost" value={data.cost} onChange={(e) => setData({...data, cost: parseFloat(e.target.value)})} />
                  {errors.cost && <p className="text-red-500 text-sm">{errors.cost}</p>}
                </div>

                <Button type="submit" disabled={processing}>Create Equipment</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default EquipmentCreate;