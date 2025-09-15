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
  XCircle,
  Edit,
  Download,
  MessageSquare
} from 'lucide-react';

interface ReferralDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  referral: any;
}

export function ReferralDetailsModal({ isOpen, onClose, referral }: ReferralDetailsModalProps) {
  if (!referral) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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
                Referral Details - {referral.id}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Complete referral information and status
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(referral.status)}>
                {referral.status}
              </Badge>
              <Badge className={getPriorityColor(referral.priority)}>
                {referral.priority}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 mt-6">
          {/* Patient Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-lg font-semibold text-gray-900">{referral.patient}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Age</label>
                  <p className="text-lg font-semibold text-gray-900">{referral.age} years old</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Patient ID</label>
                  <p className="text-lg font-semibold text-gray-900">{referral.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gender</label>
                  <p className="text-lg font-semibold text-gray-900">Female</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-lg font-semibold text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    +1 (555) 123-4567
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg font-semibold text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {referral.patient.toLowerCase().replace(' ', '.')}@email.com
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 text-emerald-600 mr-2" />
                Referral Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Specialty Requested</label>
                    <p className="text-lg font-semibold text-gray-900">{referral.specialty}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Referring Doctor</label>
                    <p className="text-lg font-semibold text-gray-900">{referral.doctor}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Preferred Facility</label>
                    <p className="text-lg font-semibold text-gray-900 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {referral.facility}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date Submitted</label>
                    <p className="text-lg font-semibold text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {new Date(referral.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Urgency Level</label>
                    <Badge className={getPriorityColor(referral.priority)}>
                      {referral.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Current Status</label>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(referral.status)}>
                        {referral.status.toUpperCase()}
                      </Badge>
                      {referral.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {referral.status === 'pending' && <Clock className="h-4 w-4 text-amber-600" />}
                      {referral.status === 'urgent' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 text-purple-600 mr-2" />
                Clinical Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Reason for Referral</label>
                  <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
                    Patient presents with chest pain and shortness of breath. ECG shows abnormal ST segments. 
                    Requires urgent cardiology consultation for possible acute coronary syndrome evaluation.
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Clinical Notes</label>
                  <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
                    Vital signs: BP 150/95, HR 110, RR 22, O2 Sat 96%. Patient has history of hypertension 
                    and diabetes. Current medications include Lisinopril and Metformin. No known allergies.
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Attachments</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-900">ECG_Report.pdf</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-900">Lab_Results.pdf</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Clock className="h-5 w-5 text-indigo-600 mr-2" />
                Referral Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Referral Submitted</p>
                    <p className="text-sm text-gray-500">January 15, 2024 at 2:30 PM</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-amber-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Under Review</p>
                    <p className="text-sm text-gray-500">January 15, 2024 at 3:15 PM</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-400">Pending Approval</p>
                    <p className="text-sm text-gray-400">Waiting for specialist review</p>
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
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Note
            </Button>
            <Button variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 flex items-center">
              <Edit className="h-4 w-4 mr-2" />
              Edit Referral
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
