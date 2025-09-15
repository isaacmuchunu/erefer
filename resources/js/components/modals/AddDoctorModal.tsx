import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Stethoscope,
  Upload,
  User,
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Award,
  GraduationCap,
  Globe,
  Camera,
  X,
  Plus,
  Save,
  UserPlus
} from 'lucide-react';

interface AddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (doctorData: any) => void;
}

export function AddDoctorModal({ isOpen, onClose, onSubmit }: AddDoctorModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    department: '',
    licenseNumber: '',
    experience: '',
    education: '',
    certifications: [''],
    languages: [''],
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    bio: '',
    schedule: {
      monday: { start: '08:00', end: '17:00', available: true },
      tuesday: { start: '08:00', end: '17:00', available: true },
      wednesday: { start: '08:00', end: '17:00', available: true },
      thursday: { start: '08:00', end: '17:00', available: true },
      friday: { start: '08:00', end: '17:00', available: true },
      saturday: { start: '08:00', end: '12:00', available: false },
      sunday: { start: '08:00', end: '12:00', available: false }
    }
  });

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].map((item: string, i: number) => 
        i === index ? value : item
      )
    }));
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field as keyof typeof prev], '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].filter((_: any, i: number) => i !== index)
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const doctorData = {
      ...formData,
      profilePhoto: profilePhoto,
      fullName: `Dr. ${formData.firstName} ${formData.lastName}`,
      name: `Dr. ${formData.firstName} ${formData.lastName}`,
      status: 'available',
      rating: 0,
      patients: 0,
      nextAvailable: 'Available Now'
    };

    onSubmit(doctorData);
    onClose();
    
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialty: '',
      department: '',
      licenseNumber: '',
      experience: '',
      education: '',
      certifications: [''],
      languages: [''],
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      bio: '',
      schedule: {
        monday: { start: '08:00', end: '17:00', available: true },
        tuesday: { start: '08:00', end: '17:00', available: true },
        wednesday: { start: '08:00', end: '17:00', available: true },
        thursday: { start: '08:00', end: '17:00', available: true },
        friday: { start: '08:00', end: '17:00', available: true },
        saturday: { start: '08:00', end: '12:00', available: false },
        sunday: { start: '08:00', end: '12:00', available: false }
      }
    });
    setProfilePhoto(null);
    setPhotoPreview('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1189px] max-h-[842px] w-[1189px] h-[842px] overflow-y-auto" style={{
        width: '1189px', // A4 landscape width in pixels at 96 DPI
        height: '842px', // A4 landscape height in pixels at 96 DPI
        maxWidth: '95vw',
        maxHeight: '95vh'
      }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
            <UserPlus className="h-6 w-6 text-emerald-600 mr-2" />
            Add New Medical Professional
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Complete doctor registration with professional credentials and photo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Profile Photo Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Camera className="h-5 w-5 text-blue-600 mr-2" />
                Professional Profile Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50 overflow-hidden">
                    {photoPreview ? (
                      <img 
                        src={photoPreview} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Upload Photo</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="mt-3 cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </label>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">Photo Requirements</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Professional headshot recommended</li>
                    <li>• Maximum file size: 5MB</li>
                    <li>• Supported formats: JPG, PNG, GIF</li>
                    <li>• Minimum resolution: 300x300 pixels</li>
                    <li>• Square aspect ratio preferred</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <User className="h-5 w-5 text-green-600 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="doctor@hospital.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Home address"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="Emergency contact name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Stethoscope className="h-5 w-5 text-blue-600 mr-2" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialty">Medical Specialty *</Label>
                  <Select value={formData.specialty} onValueChange={(value) => handleInputChange('specialty', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">Emergency Medicine</SelectItem>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="orthopedics">Orthopedic Surgery</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="radiology">Radiology</SelectItem>
                      <SelectItem value="surgery">General Surgery</SelectItem>
                      <SelectItem value="internal">Internal Medicine</SelectItem>
                      <SelectItem value="psychiatry">Psychiatry</SelectItem>
                      <SelectItem value="oncology">Oncology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">Emergency Department</SelectItem>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="radiology">Radiology</SelectItem>
                      <SelectItem value="surgery">Surgery</SelectItem>
                      <SelectItem value="icu">Intensive Care Unit</SelectItem>
                      <SelectItem value="maternity">Maternity Ward</SelectItem>
                      <SelectItem value="psychiatry">Psychiatry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="licenseNumber">Medical License Number *</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    placeholder="MD-123456789"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="10"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="education">Education & Medical School *</Label>
                  <Input
                    id="education"
                    value={formData.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    placeholder="MD, Harvard Medical School"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 flex items-center">
              <Save className="h-4 w-4 mr-2" />
              Add Doctor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
