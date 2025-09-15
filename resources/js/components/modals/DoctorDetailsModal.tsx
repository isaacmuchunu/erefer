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
  Stethoscope,
  Phone, 
  Mail, 
  Clock, 
  Users,
  Heart,
  Activity,
  Calendar,
  Award,
  MapPin,
  MessageSquare,
  Download,
  Settings,
  Star,
  Globe,
  GraduationCap,
  Shield,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

interface DoctorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: any;
}

export function DoctorDetailsModal({ isOpen, onClose, doctor }: DoctorDetailsModalProps) {
  if (!doctor) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-duty': return 'bg-green-100 text-green-800';
      case 'available': return 'bg-blue-100 text-blue-800';
      case 'busy': return 'bg-amber-100 text-amber-800';
      case 'off-duty': return 'bg-gray-100 text-gray-800';
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
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                <Stethoscope className="h-6 w-6 text-emerald-600 mr-2" />
                {doctor.name} - Medical Professional Profile
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Comprehensive doctor information, schedule management, and performance metrics
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(doctor.status)}>
                {doctor.status.replace('-', ' ').toUpperCase()}
              </Badge>
              <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                {doctor.specialty}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 mt-6">
          {/* Doctor Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{doctor.experience}</p>
                <p className="text-xs text-emerald-600">Medical practice</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Patients Treated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{doctor.patients}</p>
                <p className="text-xs text-blue-600">Total patients</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Patient Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{doctor.rating}</p>
                <div className="flex mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(doctor.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Next Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold text-gray-900">{doctor.nextAvailable}</p>
                <p className="text-xs text-purple-600">Appointment slot</p>
              </CardContent>
            </Card>
          </div>

          {/* Professional Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <GraduationCap className="h-5 w-5 text-blue-600 mr-2" />
                Professional Information & Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Education & Credentials</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                      <span className="text-gray-900">{doctor.education}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Award className="h-4 w-4 text-purple-600" />
                      <span className="text-gray-900">Certifications: {doctor.certifications.join(', ')}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Heart className="h-4 w-4 text-red-600" />
                      <span className="text-gray-900">Specialty: {doctor.specialty}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="text-gray-900">Department: {doctor.department}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <span className="text-gray-900">{doctor.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-green-600" />
                      <span className="text-gray-900">{doctor.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Globe className="h-4 w-4 text-purple-600" />
                      <span className="text-gray-900">Languages: {doctor.languages.join(', ')}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span className="text-gray-900">Schedule: {doctor.schedule}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule & Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="h-5 w-5 text-green-600 mr-2" />
                  Schedule & Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Schedule */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Today's Schedule</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-green-900">Current Shift</p>
                          <p className="text-sm text-green-700">{doctor.schedule}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium text-blue-900">Next Available</p>
                          <p className="text-sm text-blue-700">{doctor.nextAvailable}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">Open</Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Weekly Schedule */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Weekly Schedule</h4>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                        <div key={day} className={`p-2 rounded text-xs ${
                          i < 5 ? 'bg-green-100 text-green-800' : 
                          i === 5 ? 'bg-amber-100 text-amber-800' : 
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <p className="font-medium">{day}</p>
                          <p>{i < 5 ? '8-4' : i === 5 ? '8-12' : 'Off'}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Appointment Stats */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Today's Appointments</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="text-lg font-bold text-blue-600">12</p>
                        <p className="text-xs text-blue-600">Scheduled</p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="text-lg font-bold text-green-600">8</p>
                        <p className="text-xs text-green-600">Completed</p>
                      </div>
                      <div className="text-center p-2 bg-amber-50 rounded">
                        <p className="text-lg font-bold text-amber-600">4</p>
                        <p className="text-xs text-amber-600">Remaining</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Activity className="h-5 w-5 text-purple-600 mr-2" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Performance Indicators */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Patient Satisfaction</span>
                      <span className="text-sm font-bold text-green-600">{doctor.rating}/5.0</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: `${(doctor.rating / 5) * 100}%`}}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Appointment Efficiency</span>
                      <span className="text-sm font-bold text-blue-600">94%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '94%'}}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Treatment Success Rate</span>
                      <span className="text-sm font-bold text-purple-600">97%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '97%'}}></div>
                    </div>
                  </div>

                  <Separator />

                  {/* Monthly Stats */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Monthly Performance</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="flex items-center justify-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">+15%</span>
                        </div>
                        <p className="text-xs text-green-600">Patient Volume</p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="flex items-center justify-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">+8%</span>
                        </div>
                        <p className="text-xs text-blue-600">Satisfaction</p>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="flex items-center justify-center space-x-1">
                          <CheckCircle className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-600">98%</span>
                        </div>
                        <p className="text-xs text-purple-600">On-time Rate</p>
                      </div>
                      <div className="text-center p-2 bg-amber-50 rounded">
                        <div className="flex items-center justify-center space-x-1">
                          <Star className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-600">Top 5%</span>
                        </div>
                        <p className="text-xs text-amber-600">Hospital Rank</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Recent Achievements */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Recent Achievements</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-gold-500" />
                        <span className="text-sm text-gray-700">Doctor of the Month - January 2024</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-700">Patient Safety Excellence Award</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-purple-500" />
                        <span className="text-sm text-gray-700">5-Star Patient Reviews (50+ reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <div className="flex space-x-2">
            <Button variant="outline" className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Contact Doctor
            </Button>
            <Button variant="outline" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
            <Button variant="outline" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export Profile
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Manage Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
