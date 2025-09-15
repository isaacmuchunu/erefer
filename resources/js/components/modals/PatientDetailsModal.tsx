import React from 'react';
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
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Heart,
  Activity,
  Edit,
  Download,
  MessageSquare,
  Stethoscope,
  Shield,
  Plus
} from 'lucide-react';

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
}

export function PatientDetailsModal({ isOpen, onClose, patient }: PatientDetailsModalProps) {
  if (!patient) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'stable': return 'bg-blue-100 text-blue-800';
      case 'discharged': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'routine': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Patient Profile - {patient.name}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Complete patient medical record and information
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(patient.status)}>
                {patient.status}
              </Badge>
              <Badge className={getPriorityColor(patient.priority)}>
                {patient.priority}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 mt-6">
          {/* Patient Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Users className="h-5 w-5 text-emerald-600 mr-2" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-lg font-semibold text-gray-900">{patient.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Patient ID</label>
                    <p className="text-lg font-semibold text-gray-900">{patient.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Age</label>
                    <p className="text-lg font-semibold text-gray-900">{patient.age} years old</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="text-lg font-semibold text-gray-900">{patient.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-lg font-semibold text-gray-900">March 15, 1979</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Blood Type</label>
                    <p className="text-lg font-semibold text-gray-900">{patient.bloodType}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Activity className="h-5 w-5 text-blue-600 mr-2" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Visits</span>
                  <span className="text-lg font-semibold text-gray-900">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Visit</span>
                  <span className="text-sm font-medium text-gray-900">{new Date(patient.lastVisit).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Next Appointment</span>
                  <span className="text-sm font-medium text-gray-900">{new Date(patient.nextAppointment).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Primary Doctor</span>
                  <span className="text-sm font-medium text-gray-900">{patient.primaryDoctor}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Insurance Status</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Phone className="h-5 w-5 text-purple-600 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-lg font-semibold text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {patient.phone}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email Address</label>
                  <p className="text-lg font-semibold text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {patient.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-lg font-semibold text-gray-900 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    123 Main St, City, State 12345
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                  <p className="text-lg font-semibold text-gray-900">John Smith (Spouse)</p>
                  <p className="text-sm text-gray-500">+1 (555) 987-6543</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Insurance Provider</label>
                  <p className="text-lg font-semibold text-gray-900">Blue Cross Blue Shield</p>
                  <p className="text-sm text-gray-500">Policy: BC123456789</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Stethoscope className="h-5 w-5 text-red-600 mr-2" />
                  Medical History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Primary Condition</label>
                    <p className="text-lg font-semibold text-gray-900">{patient.condition}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Allergies</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Penicillin</Badge>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Shellfish</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Current Medications</label>
                    <div className="space-y-2 mt-1">
                      <div className="p-2 bg-gray-50 rounded">
                        <p className="font-medium text-sm">Lisinopril 10mg</p>
                        <p className="text-xs text-gray-500">Once daily for hypertension</p>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <p className="font-medium text-sm">Metformin 500mg</p>
                        <p className="text-xs text-gray-500">Twice daily for diabetes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Heart className="h-5 w-5 text-pink-600 mr-2" />
                  Vital Signs & Measurements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">120/80</p>
                    <p className="text-xs text-blue-600">Blood Pressure</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">72</p>
                    <p className="text-xs text-green-600">Heart Rate</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">98.6°F</p>
                    <p className="text-xs text-purple-600">Temperature</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">98%</p>
                    <p className="text-xs text-orange-600">O2 Saturation</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Height</label>
                    <p className="text-lg font-semibold text-gray-900">5'6" (168 cm)</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Weight</label>
                    <p className="text-lg font-semibold text-gray-900">145 lbs (66 kg)</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">BMI</label>
                    <p className="text-lg font-semibold text-gray-900">23.4 (Normal)</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="text-sm text-gray-500">{new Date(patient.lastVisit).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Clock className="h-5 w-5 text-indigo-600 mr-2" />
                Recent Activity & Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Routine Checkup Completed</p>
                    <p className="text-sm text-gray-500">January 15, 2024 at 2:30 PM - Dr. Michael Chen</p>
                    <p className="text-sm text-gray-600">Blood pressure stable, medication adjusted</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Lab Results Received</p>
                    <p className="text-sm text-gray-500">January 12, 2024 at 10:15 AM</p>
                    <p className="text-sm text-gray-600">HbA1c: 6.8% (improved from previous)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Prescription Refilled</p>
                    <p className="text-sm text-gray-500">January 8, 2024 at 4:45 PM</p>
                    <p className="text-sm text-gray-600">Metformin 500mg - 90 day supply</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <div className="flex space-x-2">
            <Button variant="outline" className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
            <Button variant="outline" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export Records
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 flex items-center">
              <Edit className="h-4 w-4 mr-2" />
              Edit Patient
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
