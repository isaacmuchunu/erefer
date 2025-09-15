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
  Users, 
  Bed, 
  Clock, 
  Phone,
  MapPin,
  Stethoscope,
  Heart,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  FileText,
  MessageSquare,
  Download,
  Settings,
  DollarSign,
  Shield
} from 'lucide-react';

interface DepartmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: any;
}

export function DepartmentDetailsModal({ isOpen, onClose, department }: DepartmentDetailsModalProps) {
  if (!department) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'limited': return 'bg-amber-100 text-amber-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
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
                <Building2 className="h-6 w-6 text-blue-600 mr-2" />
                {department.name} - Department Management
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Comprehensive department operations, staff management, and performance monitoring
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(department.status)}>
                {department.status.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="border-blue-200 text-blue-700">
                {department.specialty}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 mt-6">
          {/* Department Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Total Staff
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{department.staff}</p>
                <p className="text-xs text-blue-600">Healthcare professionals</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Current Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{department.patients}</p>
                <p className="text-xs text-red-600">Patients in care</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Bed className="h-4 w-4 mr-2" />
                  Bed Capacity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{department.beds}</p>
                <p className="text-xs text-green-600">{department.occupancy}% occupied</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Wait Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{department.waitTime}</p>
                <p className="text-xs text-purple-600">Average wait time</p>
              </CardContent>
            </Card>
          </div>

          {/* Department Head & Contact Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Stethoscope className="h-5 w-5 text-blue-600 mr-2" />
                Department Leadership & Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Department Head</h4>
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {department.head?.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{department.head}</p>
                      <p className="text-sm text-gray-600">Department Head</p>
                      <p className="text-sm text-blue-600">{department.specialty}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{department.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{department.location}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">Annual Budget: {department.budget}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">Equipment: {department.equipment}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Management & Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Users className="h-5 w-5 text-purple-600 mr-2" />
                  Staff Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Staff Breakdown */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Staff Composition</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-xl font-bold text-blue-600">
                          {Math.floor(department.staff * 0.3)}
                        </p>
                        <p className="text-xs text-blue-600">Doctors</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-xl font-bold text-green-600">
                          {Math.floor(department.staff * 0.5)}
                        </p>
                        <p className="text-xs text-green-600">Nurses</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-xl font-bold text-purple-600">
                          {Math.floor(department.staff * 0.15)}
                        </p>
                        <p className="text-xs text-purple-600">Technicians</p>
                      </div>
                      <div className="text-center p-3 bg-amber-50 rounded-lg">
                        <p className="text-xl font-bold text-amber-600">
                          {Math.floor(department.staff * 0.05)}
                        </p>
                        <p className="text-xs text-amber-600">Support Staff</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Current Shift Status */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Current Shift Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm font-medium text-green-900">On Duty</span>
                        <span className="text-sm text-green-600">{Math.floor(department.staff * 0.7)} staff</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-amber-50 rounded">
                        <span className="text-sm font-medium text-amber-900">Break</span>
                        <span className="text-sm text-amber-600">{Math.floor(department.staff * 0.1)} staff</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-900">Off Duty</span>
                        <span className="text-sm text-gray-600">{Math.floor(department.staff * 0.2)} staff</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Patient Satisfaction */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Patient Satisfaction</span>
                      <div className="flex items-center">
                        <span className="text-sm font-bold text-green-600 mr-2">{department.satisfaction}/5.0</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(department.satisfaction)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: `${(department.satisfaction / 5) * 100}%`}}></div>
                    </div>
                  </div>

                  {/* Bed Utilization */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Bed Utilization</span>
                      <span className="text-sm font-bold text-blue-600">{department.occupancy}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: `${department.occupancy}%`}}></div>
                    </div>
                  </div>

                  {/* Staff Efficiency */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Staff Efficiency</span>
                      <span className="text-sm font-bold text-purple-600">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '87%'}}></div>
                    </div>
                  </div>

                  {/* Budget Utilization */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Budget Utilization</span>
                      <span className="text-sm font-bold text-amber-600">72%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{width: '72%'}}></div>
                    </div>
                  </div>

                  <Separator />

                  {/* Monthly Trends */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Monthly Trends</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="flex items-center justify-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">+12%</span>
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
                      <div className="text-center p-2 bg-red-50 rounded">
                        <div className="flex items-center justify-center space-x-1">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-600">-5%</span>
                        </div>
                        <p className="text-xs text-red-600">Wait Time</p>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="flex items-center justify-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-600">+3%</span>
                        </div>
                        <p className="text-xs text-purple-600">Efficiency</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Alerts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Activity className="h-5 w-5 text-indigo-600 mr-2" />
                Recent Activity & Department Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">New Patient Admitted</p>
                        <p className="text-sm text-gray-500">15 minutes ago - Room {department.beds - 2}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Staff Shift Change</p>
                        <p className="text-sm text-gray-500">1 hour ago - Night shift started</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Equipment Maintenance</p>
                        <p className="text-sm text-gray-500">2 hours ago - Routine check completed</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Department Alerts</h4>
                  <div className="space-y-2">
                    {department.status === 'limited' && (
                      <div className="p-3 border-l-4 border-l-amber-500 bg-amber-50 rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-amber-900">Limited Service</p>
                            <p className="text-sm text-amber-700">Equipment maintenance in progress</p>
                          </div>
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>
                      </div>
                    )}
                    
                    <div className="p-3 border-l-4 border-l-green-500 bg-green-50 rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-900">Staffing Optimal</p>
                          <p className="text-sm text-green-700">All positions filled for current shift</p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    </div>

                    <div className="p-3 border-l-4 border-l-blue-500 bg-blue-50 rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-blue-900">Budget Status</p>
                          <p className="text-sm text-blue-700">72% of monthly budget utilized</p>
                        </div>
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
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
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Department Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
