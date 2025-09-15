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
  Building2,
  MapPin, 
  Phone, 
  Users,
  Bed,
  Heart,
  Shield,
  Calendar,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  MessageSquare,
  Download,
  Settings,
  Star,
  Award,
  Stethoscope
} from 'lucide-react';

interface FacilityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: any;
}

export function FacilityDetailsModal({ isOpen, onClose, facility }: FacilityDetailsModalProps) {
  if (!facility) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-amber-100 text-amber-800';
      case 'renovation': return 'bg-blue-100 text-blue-800';
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
                <Building2 className="h-6 w-6 text-indigo-600 mr-2" />
                {facility.name} - Facility Management
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Comprehensive facility operations, performance monitoring, and resource management
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(facility.status)}>
                {facility.status.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="border-indigo-200 text-indigo-700">
                {facility.type}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 mt-6">
          {/* Facility Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Bed className="h-4 w-4 mr-2" />
                  Bed Capacity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{facility.beds || 'N/A'}</p>
                <p className="text-xs text-purple-600">
                  {facility.beds > 0 ? `${facility.occupancy}% occupied` : 'Outpatient facility'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Total Staff
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{facility.staff}</p>
                <p className="text-xs text-blue-600">Healthcare professionals</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Patient Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{facility.rating}</p>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(facility.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Established
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{facility.established}</p>
                <p className="text-xs text-amber-600">{new Date().getFullYear() - parseInt(facility.established)} years of service</p>
              </CardContent>
            </Card>
          </div>

          {/* Facility Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Building2 className="h-5 w-5 text-indigo-600 mr-2" />
                Facility Information & Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{facility.name}</p>
                        <p className="text-sm text-gray-600">{facility.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Stethoscope className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{facility.specialty}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Award className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">Accredited by {facility.accreditation}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">
                        {facility.emergencyServices ? 'Emergency Services Available' : 'No Emergency Services'}
                      </span>
                    </div>
                    {facility.traumaLevel !== 'N/A' && (
                      <div className="flex items-center space-x-3">
                        <Heart className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-900">Trauma Level: {facility.traumaLevel}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{facility.location}</p>
                        <p className="text-sm text-gray-600">{facility.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{facility.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">Established in {facility.established}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Capacity & Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
                  Capacity & Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {facility.beds > 0 && (
                    <>
                      {/* Bed Utilization */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Bed Occupancy</span>
                          <span className="text-sm font-bold text-purple-600">{facility.occupancy}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              facility.occupancy >= 90 ? 'bg-red-500' :
                              facility.occupancy >= 75 ? 'bg-amber-500' :
                              'bg-green-500'
                            }`}
                            style={{width: `${facility.occupancy}%`}}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.floor(facility.beds * facility.occupancy / 100)} of {facility.beds} beds occupied
                        </p>
                      </div>

                      <Separator />
                    </>
                  )}

                  {/* Staff Utilization */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Staff Utilization</span>
                      <span className="text-sm font-bold text-blue-600">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '87%'}}></div>
                    </div>
                  </div>

                  {/* Patient Satisfaction */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Patient Satisfaction</span>
                      <div className="flex items-center">
                        <span className="text-sm font-bold text-green-600 mr-2">{facility.rating}/5.0</span>
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: `${(facility.rating / 5) * 100}%`}}></div>
                    </div>
                  </div>

                  {/* Facility Efficiency */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Facility Efficiency</span>
                      <span className="text-sm font-bold text-teal-600">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-teal-500 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Activity className="h-5 w-5 text-indigo-600 mr-2" />
                  Recent Activity & Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Recent Activity */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium text-gray-900">Patient Admitted</p>
                          <p className="text-sm text-gray-500">30 minutes ago - {facility.specialty} unit</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium text-gray-900">Staff Shift Change</p>
                          <p className="text-sm text-gray-500">2 hours ago - Day shift started</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium text-gray-900">Equipment Maintenance</p>
                          <p className="text-sm text-gray-500">Yesterday - Routine inspection completed</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Facility Status */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Current Status</h4>
                    <div className="space-y-2">
                      <div className={`p-3 border-l-4 rounded ${
                        facility.status === 'operational' ? 'border-l-green-500 bg-green-50' :
                        facility.status === 'maintenance' ? 'border-l-amber-500 bg-amber-50' :
                        'border-l-red-500 bg-red-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${
                              facility.status === 'operational' ? 'text-green-900' :
                              facility.status === 'maintenance' ? 'text-amber-900' :
                              'text-red-900'
                            }`}>
                              {facility.status === 'operational' ? 'Fully Operational' :
                               facility.status === 'maintenance' ? 'Under Maintenance' :
                               'Service Disruption'}
                            </p>
                            <p className={`text-sm ${
                              facility.status === 'operational' ? 'text-green-700' :
                              facility.status === 'maintenance' ? 'text-amber-700' :
                              'text-red-700'
                            }`}>
                              {facility.status === 'operational' ? 'All services available' :
                               facility.status === 'maintenance' ? 'Limited services during maintenance' :
                               'Some services may be affected'}
                            </p>
                          </div>
                          {facility.status === 'operational' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                          )}
                        </div>
                      </div>

                      {facility.emergencyServices && (
                        <div className="p-3 border-l-4 border-l-blue-500 bg-blue-50 rounded">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-blue-900">Emergency Services</p>
                              <p className="text-sm text-blue-700">24/7 emergency care available</p>
                            </div>
                            <Shield className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Performance Trends */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Performance Trends</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="flex items-center justify-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">+5%</span>
                        </div>
                        <p className="text-xs text-green-600">Patient Volume</p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="flex items-center justify-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">+3%</span>
                        </div>
                        <p className="text-xs text-blue-600">Satisfaction</p>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="flex items-center justify-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-600">+2%</span>
                        </div>
                        <p className="text-xs text-purple-600">Efficiency</p>
                      </div>
                      <div className="text-center p-2 bg-amber-50 rounded">
                        <div className="flex items-center justify-center space-x-1">
                          <TrendingDown className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-600">-1%</span>
                        </div>
                        <p className="text-xs text-amber-600">Wait Time</p>
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
              <Users className="h-4 w-4 mr-2" />
              Manage Staff
            </Button>
            <Button variant="outline" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button variant="outline" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Facility Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
