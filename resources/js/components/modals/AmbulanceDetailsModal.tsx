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
  Ambulance,
  MapPin, 
  Phone, 
  Clock, 
  Users,
  Fuel,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Heart,
  Shield,
  Wrench,
  Calendar,
  FileText,
  MessageSquare,
  Download
} from 'lucide-react';

interface AmbulanceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ambulance: any;
}

export function AmbulanceDetailsModal({ isOpen, onClose, ambulance }: AmbulanceDetailsModalProps) {
  if (!ambulance) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'on-route': return 'bg-blue-100 text-blue-800';
      case 'at-hospital': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEquipmentColor = (equipment: string) => {
    switch (equipment) {
      case 'ALS': return 'bg-red-100 text-red-800';
      case 'BLS': return 'bg-blue-100 text-blue-800';
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
                <Ambulance className="h-6 w-6 text-red-600 mr-2" />
                Ambulance {ambulance.id} - Command Center
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Real-time ambulance monitoring, crew management, and dispatch control
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(ambulance.status)}>
                {ambulance.status.toUpperCase()}
              </Badge>
              <Badge className={getEquipmentColor(ambulance.equipment)}>
                {ambulance.equipment}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 mt-6">
          {/* Real-time Status Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Current Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-gray-900">{ambulance.location}</p>
                <p className="text-xs text-gray-500">{ambulance.coordinates}</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Fuel className="h-4 w-4 mr-2" />
                  Fuel Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-gray-900">{ambulance.fuel}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{width: ambulance.fuel}}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Mileage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-gray-900">{ambulance.mileage}</p>
                <p className="text-xs text-gray-500">Next service due</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Last Update
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-gray-900">{ambulance.lastUpdate}</p>
                <div className="flex items-center text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  Live tracking active
                </div>
              </CardContent>
            </Card>
          </div>

          {/* GPS Tracking Map */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Navigation className="h-5 w-5 text-blue-600 mr-2" />
                Live GPS Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-red-500 mx-auto mb-3 animate-bounce" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Real-time GPS Location</h3>
                    <p className="text-gray-600 mb-3">Ambulance {ambulance.id} - {ambulance.location}</p>
                    <div className="flex justify-center space-x-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Navigation className="h-4 w-4 mr-2" />
                        Track Route
                      </Button>
                      <Button size="sm" variant="outline">
                        <MapPin className="h-4 w-4 mr-2" />
                        Set Destination
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Simulated GPS indicator */}
                <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">GPS Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Crew Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Users className="h-5 w-5 text-purple-600 mr-2" />
                  Crew Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ambulance.crew[0] !== 'N/A' ? (
                    <>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {ambulance.crew[0]?.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{ambulance.crew[0]}</p>
                          <p className="text-sm text-gray-500">Paramedic - Lead</p>
                          <p className="text-xs text-green-600">On duty since 06:00</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {ambulance.crew[1]?.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{ambulance.crew[1]}</p>
                          <p className="text-sm text-gray-500">EMT - Assistant</p>
                          <p className="text-xs text-green-600">On duty since 06:00</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No crew assigned</p>
                      <p className="text-sm text-gray-400">Unit in maintenance</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Heart className="h-5 w-5 text-red-600 mr-2" />
                  Medical Equipment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm font-medium">Defibrillator</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm font-medium">Oxygen Tank (Full)</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm font-medium">IV Supplies</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-amber-50 rounded">
                    <span className="text-sm font-medium">Stretcher</span>
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm font-medium">First Aid Kit</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Equipment Level</span>
                    <Badge className={getEquipmentColor(ambulance.equipment)}>
                      {ambulance.equipment === 'ALS' ? 'Advanced Life Support' : 'Basic Life Support'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vehicle Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Wrench className="h-5 w-5 text-orange-600 mr-2" />
                Vehicle Information & Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Vehicle Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Unit ID</span>
                      <span className="text-sm font-medium">{ambulance.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Make/Model</span>
                      <span className="text-sm font-medium">Ford Transit 350</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Year</span>
                      <span className="text-sm font-medium">2022</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">VIN</span>
                      <span className="text-sm font-medium">1FTBW3XM8NKA12345</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Mileage</span>
                      <span className="text-sm font-medium">{ambulance.mileage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fuel Level</span>
                      <span className="text-sm font-medium">{ambulance.fuel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Engine Hours</span>
                      <span className="text-sm font-medium">2,340 hrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg MPG</span>
                      <span className="text-sm font-medium">12.5 mpg</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Maintenance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Service</span>
                      <span className="text-sm font-medium">Dec 15, 2023</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Next Service</span>
                      <span className="text-sm font-medium">{ambulance.nextMaintenance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Oil Change</span>
                      <span className="text-sm font-medium text-green-600">✓ Current</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Inspection</span>
                      <span className="text-sm font-medium text-green-600">✓ Valid</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Activity className="h-5 w-5 text-indigo-600 mr-2" />
                Recent Activity & Dispatch History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Unit Available</p>
                    <p className="text-sm text-gray-500">Today at 2:30 PM - Returned to station</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Emergency Response Completed</p>
                    <p className="text-sm text-gray-500">Today at 1:45 PM - Cardiac emergency at Main Street</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Emergency Dispatch</p>
                    <p className="text-sm text-gray-500">Today at 1:20 PM - Priority 1 call received</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Routine Check Completed</p>
                    <p className="text-sm text-gray-500">Today at 12:00 PM - Equipment inspection passed</p>
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
              <Phone className="h-4 w-4 mr-2" />
              Contact Crew
            </Button>
            <Button variant="outline" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
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
            <Button className="bg-red-600 hover:bg-red-700 flex items-center">
              <Navigation className="h-4 w-4 mr-2" />
              Dispatch Unit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
