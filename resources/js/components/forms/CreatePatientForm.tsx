import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface CreatePatientFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export function CreatePatientForm({ onSubmit, onCancel }: CreatePatientFormProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: undefined as Date | undefined,
        gender: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactPhone: '',
        insuranceProvider: '',
        insurancePolicyNumber: '',
        allergies: '',
        medications: '',
        medicalHistory: '',
        primaryCarePhysician: '',
        bloodType: '',
        height: '',
        weight: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Add New Patient</CardTitle>
                <CardDescription>
                    Enter patient information to create a new patient record
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    className={errors.firstName ? 'border-red-500' : ''}
                                />
                                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                            </div>
                            <div>
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    className={errors.lastName ? 'border-red-500' : ''}
                                />
                                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                            </div>
                            <div>
                                <Label>Date of Birth *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : "Select date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={formData.dateOfBirth}
                                            onSelect={(date) => handleInputChange('dateOfBirth', date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                            </div>
                            <div>
                                <Label>Gender *</Label>
                                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                                    <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className={errors.phone ? 'border-red-500' : ''}
                                />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label htmlFor="address">Street Address</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="state">State</Label>
                                <Input
                                    id="state"
                                    value={formData.state}
                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="zipCode">ZIP Code</Label>
                                <Input
                                    id="zipCode"
                                    value={formData.zipCode}
                                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="emergencyContactName">Contact Name</Label>
                                <Input
                                    id="emergencyContactName"
                                    value={formData.emergencyContactName}
                                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                                <Input
                                    id="emergencyContactRelationship"
                                    value={formData.emergencyContactRelationship}
                                    onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="emergencyContactPhone">Phone Number</Label>
                                <Input
                                    id="emergencyContactPhone"
                                    type="tel"
                                    value={formData.emergencyContactPhone}
                                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Insurance Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Insurance Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                                <Input
                                    id="insuranceProvider"
                                    value={formData.insuranceProvider}
                                    onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                                <Input
                                    id="insurancePolicyNumber"
                                    value={formData.insurancePolicyNumber}
                                    onChange={(e) => handleInputChange('insurancePolicyNumber', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Medical Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Medical Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="bloodType">Blood Type</Label>
                                <Select value={formData.bloodType} onValueChange={(value) => handleInputChange('bloodType', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select blood type" />
                                    </SelectTrigger>
                                    <SelectContent>
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
                            </div>
                            <div>
                                <Label htmlFor="primaryCarePhysician">Primary Care Physician</Label>
                                <Input
                                    id="primaryCarePhysician"
                                    value={formData.primaryCarePhysician}
                                    onChange={(e) => handleInputChange('primaryCarePhysician', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="height">Height (cm)</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    value={formData.height}
                                    onChange={(e) => handleInputChange('height', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="weight">Weight (kg)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    value={formData.weight}
                                    onChange={(e) => handleInputChange('weight', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="allergies">Allergies</Label>
                                <Textarea
                                    id="allergies"
                                    value={formData.allergies}
                                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                                    rows={2}
                                    placeholder="List any known allergies..."
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="medications">Current Medications</Label>
                                <Textarea
                                    id="medications"
                                    value={formData.medications}
                                    onChange={(e) => handleInputChange('medications', e.target.value)}
                                    rows={2}
                                    placeholder="List current medications..."
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="medicalHistory">Medical History</Label>
                                <Textarea
                                    id="medicalHistory"
                                    value={formData.medicalHistory}
                                    onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                                    rows={3}
                                    placeholder="Relevant medical history..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                            Add Patient
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
