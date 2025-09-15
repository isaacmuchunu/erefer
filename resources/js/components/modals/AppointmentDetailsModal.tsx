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
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Users,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Download,
  MessageSquare,
  Plus
} from 'lucide-react';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
}

export function AppointmentDetailsModal({ isOpen, onClose, appointment }: AppointmentDetailsModalProps) {
  if (!appointment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-amber-100 text-amber-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Surgery': return 'bg-red-100 text-red-800';
      case 'Consultation': return 'bg-blue-100 text-blue-800';
      case 'Follow-up': return 'bg-green-100 text-green-800';
      case 'Check-up': return 'bg-purple-100 text-purple-800';
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
                Appointment Details - {appointment.id}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Complete appointment information and medical records
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status}
              </Badge>
              <Badge className={getTypeColor(appointment.type)}>
                {appointment.type}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 mt-6">
          {/* Appointment Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Appointment Information */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  Appointment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Appointment ID</label>
                    <p className="text-lg font-semibold text-gray-900">{appointment.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <p className="text-lg font-semibold text-gray-900">{appointment.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date & Time</label>
                    <p className="text-lg font-semibold text-gray-900 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {appointment.time} - {appointment.endTime}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Duration</label>
                    <p className="text-lg font-semibold text-gray-900">{appointment.duration}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="text-lg font-semibold text-gray-900 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {appointment.room}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
                <Button variant="outline" className="w-full">
                  <Clock className="h-4 w-4 mr-2" />
                  Reschedule
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>
                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Appointment
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Patient Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Users className="h-5 w-5 text-purple-600 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Patient Name</label>
                  <p className="text-lg font-semibold text-gray-900">{appointment.patient}</p>
                  <p className="text-sm text-gray-500">{appointment.patientId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Information</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Phone className="h-3 w-3 mr-2 text-gray-400" />
                    +1 (555) 123-4567
                  </p>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Mail className="h-3 w-3 mr-2 text-gray-400" />
                    {appointment.patient.toLowerCase().replace(' ', '.')}@email.com
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Medical Information</label>
                  <p className="text-sm text-gray-900">Age: 45 years</p>
                  <p className="text-sm text-gray-900">Blood Type: A+</p>
                  <p className="text-sm text-gray-900">Allergies: Penicillin</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Stethoscope className="h-5 w-5 text-teal-600 mr-2" />
                Healthcare Provider
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Doctor</label>
                  <p className="text-lg font-semibold text-gray-900">{appointment.doctor}</p>
                  <p className="text-sm text-gray-500">{appointment.specialty}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-lg font-semibold text-gray-900">{appointment.specialty} Department</p>
                  <p className="text-sm text-gray-500">3rd Floor, West Wing</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact</label>
                  <p className="text-sm text-gray-900">Ext: 2345</p>
                  <p className="text-sm text-gray-900">Pager: 555-DOCS</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 text-indigo-600 mr-2" />
                Appointment Notes & Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Reason for Visit</label>
                  <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
                    {appointment.notes || 'Regular checkup and consultation for ongoing treatment plan.'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Pre-appointment Instructions</label>
                  <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                    <ul className="text-sm text-blue-900 space-y-1">
                      <li>• Please arrive 15 minutes early for check-in</li>
                      <li>• Bring your insurance card and photo ID</li>
                      <li>• List of current medications</li>
                      <li>• Fasting required if blood work is needed</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Special Requirements</label>
                  <p className="text-gray-900 mt-1 p-3 bg-amber-50 rounded-lg">
                    Patient requires wheelchair accessibility. Interpreter services may be needed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment History */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Clock className="h-5 w-5 text-orange-600 mr-2" />
                Appointment Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Appointment Scheduled</p>
                    <p className="text-sm text-gray-500">January 10, 2024 at 9:15 AM</p>
                    <p className="text-sm text-gray-600">Scheduled by reception staff</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Confirmation Sent</p>
                    <p className="text-sm text-gray-500">January 14, 2024 at 2:00 PM</p>
                    <p className="text-sm text-gray-600">SMS and email confirmation sent to patient</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-amber-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Reminder Sent</p>
                    <p className="text-sm text-gray-500">January 15, 2024 at 8:00 AM</p>
                    <p className="text-sm text-gray-600">24-hour reminder notification</p>
                  </div>
                </div>
                {appointment.status === 'completed' && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Appointment Completed</p>
                      <p className="text-sm text-gray-500">January 15, 2024 at {appointment.endTime}</p>
                      <p className="text-sm text-gray-600">Visit completed successfully</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <div className="flex space-x-2">
            <Button variant="outline" className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
            <Button variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Print Details
            </Button>
            <Button variant="outline" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Patient
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center">
              <Edit className="h-4 w-4 mr-2" />
              Edit Appointment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
