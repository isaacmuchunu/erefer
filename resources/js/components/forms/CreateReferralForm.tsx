import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';

interface CreateReferralFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export function CreateReferralForm({ onSubmit, onCancel }: CreateReferralFormProps) {
    const [formData, setFormData] = useState({
        patientName: '',
        patientId: '',
        patientPhone: '',
        patientEmail: '',
        dateOfBirth: undefined as Date | undefined,
        gender: '',
        referringDoctor: '',
        referringFacility: '',
        specialtyRequested: '',
        urgencyLevel: '',
        reasonForReferral: '',
        clinicalNotes: '',
        preferredFacility: '',
        preferredDate: undefined as Date | undefined,
        attachments: [] as File[],
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

        if (!formData.patientName.trim()) newErrors.patientName = 'Patient name is required';
        if (!formData.patientId.trim()) newErrors.patientId = 'Patient ID is required';
        if (!formData.patientPhone.trim()) newErrors.patientPhone = 'Phone number is required';
        if (!formData.specialtyRequested) newErrors.specialtyRequested = 'Specialty is required';
        if (!formData.urgencyLevel) newErrors.urgencyLevel = 'Urgency level is required';
        if (!formData.reasonForReferral.trim()) newErrors.reasonForReferral = 'Reason for referral is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }));
    };

    const removeAttachment = (index: number) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Create New Referral</CardTitle>
                <CardDescription>
                    Fill out the form below to create a new patient referral
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Patient Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="patientName">Patient Name *</Label>
                                <Input
                                    id="patientName"
                                    value={formData.patientName}
                                    onChange={(e) => handleInputChange('patientName', e.target.value)}
                                    className={errors.patientName ? 'border-red-500' : ''}
                                />
                                {errors.patientName && <p className="text-red-500 text-sm mt-1">{errors.patientName}</p>}
                            </div>
                            <div>
                                <Label htmlFor="patientId">Patient ID *</Label>
                                <Input
                                    id="patientId"
                                    value={formData.patientId}
                                    onChange={(e) => handleInputChange('patientId', e.target.value)}
                                    className={errors.patientId ? 'border-red-500' : ''}
                                />
                                {errors.patientId && <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>}
                            </div>
                            <div>
                                <Label htmlFor="patientPhone">Phone Number *</Label>
                                <Input
                                    id="patientPhone"
                                    type="tel"
                                    value={formData.patientPhone}
                                    onChange={(e) => handleInputChange('patientPhone', e.target.value)}
                                    className={errors.patientPhone ? 'border-red-500' : ''}
                                />
                                {errors.patientPhone && <p className="text-red-500 text-sm mt-1">{errors.patientPhone}</p>}
                            </div>
                            <div>
                                <Label htmlFor="patientEmail">Email</Label>
                                <Input
                                    id="patientEmail"
                                    type="email"
                                    value={formData.patientEmail}
                                    onChange={(e) => handleInputChange('patientEmail', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Date of Birth</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
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
                            </div>
                            <div>
                                <Label>Gender</Label>
                                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Referral Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Referral Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="referringDoctor">Referring Doctor</Label>
                                <Input
                                    id="referringDoctor"
                                    value={formData.referringDoctor}
                                    onChange={(e) => handleInputChange('referringDoctor', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="referringFacility">Referring Facility</Label>
                                <Input
                                    id="referringFacility"
                                    value={formData.referringFacility}
                                    onChange={(e) => handleInputChange('referringFacility', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Specialty Requested *</Label>
                                <Select 
                                    value={formData.specialtyRequested} 
                                    onValueChange={(value) => handleInputChange('specialtyRequested', value)}
                                >
                                    <SelectTrigger className={errors.specialtyRequested ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select specialty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cardiology">Cardiology</SelectItem>
                                        <SelectItem value="neurology">Neurology</SelectItem>
                                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                                        <SelectItem value="oncology">Oncology</SelectItem>
                                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                                        <SelectItem value="psychiatry">Psychiatry</SelectItem>
                                        <SelectItem value="dermatology">Dermatology</SelectItem>
                                        <SelectItem value="emergency">Emergency Medicine</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.specialtyRequested && <p className="text-red-500 text-sm mt-1">{errors.specialtyRequested}</p>}
                            </div>
                            <div>
                                <Label>Urgency Level *</Label>
                                <Select 
                                    value={formData.urgencyLevel} 
                                    onValueChange={(value) => handleInputChange('urgencyLevel', value)}
                                >
                                    <SelectTrigger className={errors.urgencyLevel ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select urgency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="routine">Routine</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                        <SelectItem value="emergency">Emergency</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.urgencyLevel && <p className="text-red-500 text-sm mt-1">{errors.urgencyLevel}</p>}
                            </div>
                            <div>
                                <Label>Preferred Facility</Label>
                                <Select 
                                    value={formData.preferredFacility} 
                                    onValueChange={(value) => handleInputChange('preferredFacility', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select facility" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="city-general">City General Hospital</SelectItem>
                                        <SelectItem value="childrens-medical">Children's Medical Center</SelectItem>
                                        <SelectItem value="heart-vascular">Heart & Vascular Institute</SelectItem>
                                        <SelectItem value="emergency-care">Emergency Care Center</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Preferred Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.preferredDate ? format(formData.preferredDate, "PPP") : "Select date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={formData.preferredDate}
                                            onSelect={(date) => handleInputChange('preferredDate', date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    {/* Clinical Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Clinical Information</h3>
                        <div>
                            <Label htmlFor="reasonForReferral">Reason for Referral *</Label>
                            <Textarea
                                id="reasonForReferral"
                                value={formData.reasonForReferral}
                                onChange={(e) => handleInputChange('reasonForReferral', e.target.value)}
                                className={errors.reasonForReferral ? 'border-red-500' : ''}
                                rows={3}
                                placeholder="Describe the reason for this referral..."
                            />
                            {errors.reasonForReferral && <p className="text-red-500 text-sm mt-1">{errors.reasonForReferral}</p>}
                        </div>
                        <div>
                            <Label htmlFor="clinicalNotes">Clinical Notes</Label>
                            <Textarea
                                id="clinicalNotes"
                                value={formData.clinicalNotes}
                                onChange={(e) => handleInputChange('clinicalNotes', e.target.value)}
                                rows={4}
                                placeholder="Additional clinical notes, symptoms, test results, etc..."
                            />
                        </div>
                    </div>

                    {/* Attachments */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
                        <div>
                            <Label htmlFor="attachments">Upload Files</Label>
                            <Input
                                id="attachments"
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                            </p>
                        </div>
                        {formData.attachments.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Attached Files:</p>
                                {formData.attachments.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <span className="text-sm">{file.name}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeAttachment(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                            Create Referral
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
