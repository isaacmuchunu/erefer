import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { notification } from 'antd';

import { AmbulanceType, PageProps } from '@/types';

type Facility = { id: number; name: string };

const AmbulanceEdit: React.FC<PageProps<{ ambulance: any }>> = ({ ambulance }) => {
  const [data, setData] = useState({
    facility_id: ambulance.facility_id?.toString() || '',
    vehicle_number: ambulance.vehicle_number || '',
    license_plate: ambulance.license_plate || '',
    type: ambulance.type || '' as AmbulanceType,
    make_model: ambulance.make_model || '',
    year_of_manufacture: ambulance.year_of_manufacture || '',
    equipment_inventory: Array.isArray(ambulance.equipment_inventory) ? ambulance.equipment_inventory : [],
    capacity: ambulance.capacity || '',
    gps_device_info: ambulance.gps_device_info || '',
    insurance_expiry: ambulance.insurance_expiry || '',
    license_expiry: ambulance.license_expiry || '',
    last_maintenance: ambulance.last_maintenance || '',
    next_maintenance_due: ambulance.next_maintenance_due || '',
    status: ambulance.status || 'available',
    fuel_level: ambulance.fuel_level || 100,
  });

  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [facilities, setFacilities] = useState<Facility[]>([]);

  useEffect(() => {
    axios.get('/api/v1/facilities')
      .then(response => setFacilities(response.data.data || response.data))
      .catch(error => console.error('Error fetching facilities:', error));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    axios.put(`/api/v1/ambulances/${ambulance.id}`, data)
      .then(() => {
        notification.success({ message: 'Ambulance updated successfully' });
        router.visit('/ambulances');
      })
      .catch(err => {
        if (err.response && err.response.status === 422 && err.response.data.errors) {
          setErrors(err.response.data.errors);
          notification.error({ message: 'Validation Error', description: 'Please check the form fields.' });
        } else {
          notification.error({ message: 'Error', description: 'Failed to update ambulance.' });
        }
        console.error('Update ambulance error', err);
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  const handleValueChange = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AppLayout>
      <Head title={`Edit Ambulance - ${ambulance.vehicle_number}`} />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Edit Ambulance</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList>
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                    <TabsTrigger value="equipment">Equipment</TabsTrigger>
                  </TabsList>
                  <TabsContent value="basic" className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="facility_id">Facility</Label>
                        <Select value={data.facility_id} onValueChange={(value) => handleValueChange('facility_id', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select facility" />
                          </SelectTrigger>
                          <SelectContent>
                            {facilities.map((facility: any) => (
                              <SelectItem key={facility.id} value={facility.id.toString()}>{facility.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.facility_id && <p className="text-red-500 text-sm mt-1">{errors.facility_id[0]}</p>}
                      </div>
                      <div>
                        <Label htmlFor="vehicle_number">Vehicle Number</Label>
                        <Input id="vehicle_number" value={data.vehicle_number} onChange={(e) => handleValueChange('vehicle_number', e.target.value)} />
                        {errors.vehicle_number && <p className="text-red-500 text-sm mt-1">{errors.vehicle_number[0]}</p>}
                      </div>
                      <div>
                        <Label htmlFor="license_plate">License Plate</Label>
                        <Input id="license_plate" value={data.license_plate} onChange={(e) => handleValueChange('license_plate', e.target.value)} />
                        {errors.license_plate && <p className="text-red-500 text-sm mt-1">{errors.license_plate[0]}</p>}
                      </div>
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select value={data.type} onValueChange={(value) => handleValueChange('type', value as AmbulanceType)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bls">Basic Life Support (BLS)</SelectItem>
                            <SelectItem value="als">Advanced Life Support (ALS)</SelectItem>
                            <SelectItem value="micu">Mobile Intensive Care Unit (MICU)</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type[0]}</p>}
                      </div>
                      <div>
                        <Label htmlFor="make_model">Make/Model</Label>
                        <Input id="make_model" value={data.make_model} onChange={(e) => handleValueChange('make_model', e.target.value)} />
                        {errors.make_model && <p className="text-red-500 text-sm mt-1">{errors.make_model[0]}</p>}
                      </div>
                      <div>
                        <Label htmlFor="year_of_manufacture">Year of Manufacture</Label>
                        <Input type="number" id="year_of_manufacture" value={data.year_of_manufacture} onChange={(e) => handleValueChange('year_of_manufacture', e.target.value)} />
                        {errors.year_of_manufacture && <p className="text-red-500 text-sm mt-1">{errors.year_of_manufacture[0]}</p>}
                      </div>
                      <div>
                        <Label htmlFor="capacity">Capacity (patients)</Label>
                        <Input type="number" id="capacity" value={data.capacity} onChange={(e) => handleValueChange('capacity', e.target.value)} />
                        {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity[0]}</p>}
                      </div>
                      <div>
                        <Label htmlFor="fuel_level">Fuel Level (%)</Label>
                        <Input type="number" id="fuel_level" value={data.fuel_level} onChange={(e) => handleValueChange('fuel_level', parseInt(e.target.value))} />
                        {errors.fuel_level && <p className="text-red-500 text-sm mt-1">{errors.fuel_level[0]}</p>}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="maintenance" className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="last_maintenance">Last Maintenance Date</Label>
                        <Input type="date" id="last_maintenance" value={data.last_maintenance} onChange={(e) => handleValueChange('last_maintenance', e.target.value)} />
                        {errors.last_maintenance && <p className="text-red-500 text-sm mt-1">{errors.last_maintenance[0]}</p>}
                      </div>
                      <div>
                        <Label htmlFor="next_maintenance_due">Next Maintenance Due</Label>
                        <Input type="date" id="next_maintenance_due" value={data.next_maintenance_due} onChange={(e) => handleValueChange('next_maintenance_due', e.target.value)} />
                        {errors.next_maintenance_due && <p className="text-red-500 text-sm mt-1">{errors.next_maintenance_due[0]}</p>}
                      </div>
                      <div>
                        <Label htmlFor="insurance_expiry">Insurance Expiry</Label>
                        <Input type="date" id="insurance_expiry" value={data.insurance_expiry} onChange={(e) => handleValueChange('insurance_expiry', e.target.value)} />
                        {errors.insurance_expiry && <p className="text-red-500 text-sm mt-1">{errors.insurance_expiry[0]}</p>}
                      </div>
                      <div>
                        <Label htmlFor="license_expiry">License Expiry</Label>
                        <Input type="date" id="license_expiry" value={data.license_expiry} onChange={(e) => handleValueChange('license_expiry', e.target.value)} />
                        {errors.license_expiry && <p className="text-red-500 text-sm mt-1">{errors.license_expiry[0]}</p>}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="equipment" className="pt-4">
                    <div>
                      <Label htmlFor="equipment_inventory">Equipment Inventory (comma-separated)</Label>
                      <Textarea id="equipment_inventory" value={data.equipment_inventory.join(', ')} onChange={(e) => handleValueChange('equipment_inventory', e.target.value.split(',').map(s => s.trim()))} />
                      <p className="text-sm text-muted-foreground mt-1">Enter equipment items separated by commas.</p>
                      {errors.equipment_inventory && <p className="text-red-500 text-sm mt-1">{errors.equipment_inventory[0]}</p>}
                    </div>
                  </TabsContent>
                </Tabs>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={processing}>Update Ambulance</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AmbulanceEdit;