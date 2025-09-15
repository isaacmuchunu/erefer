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
  Phone,
  MapPin, 
  Clock, 
  Users,
  Ambulance,
  Shield,
  AlertTriangle,
  CheckCircle,
  Activity,
  Heart,
  Building2,
  Navigation,
  MessageSquare,
  FileText,
  Download,
  Radio
} from 'lucide-react';

interface EmergencyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergency: any;
}

export function EmergencyDetailsModal({ isOpen, onClose, emergency }: EmergencyDetailsModalProps) {
  if (!emergency) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'routine': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'responding': return 'bg-blue-100 text-blue-800';
      case 'dispatched': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
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
                <Phone className="h-6 w-6 text-red-600 mr-2" />
                911 Emergency Call - {emergency.id}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Emergency response coordination and incident management
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getPriorityColor(emergency.priority)}>
                {emergency.priority.toUpperCase()}
              </Badge>
              <Badge className={getStatusColor(emergency.status)}>
                {emergency.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 mt-6">
          {/* Emergency Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Emergency Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-gray-900">{emergency.type}</p>
                <p className="text-xs text-gray-500">Call received at {emergency.time}</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-gray-900">{emergency.location}</p>
                <p className="text-xs text-gray-500">{emergency.coordinates}</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-gray-900">{emergency.eta}</p>
                <p className="text-xs text-gray-500">Target: 8 minutes</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Units Dispatched
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-gray-900">{emergency.units?.length || 0}</p>
                <p className="text-xs text-gray-500">Multi-agency response</p>
              </CardContent>
            </Card>
          </div>

          {/* Caller Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Phone className="h-5 w-5 text-blue-600 mr-2" />
                Caller Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Caller Name</label>
                  <p className="text-lg font-semibold text-gray-900">{emergency.caller}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-lg font-semibold text-gray-900">{emergency.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Relationship</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {emergency.caller === 'Anonymous' ? 'Bystander' : 'Patient/Family'}
                  </p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <label className="text-sm font-medium text-gray-500">Call Details</label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">
                    "Patient is experiencing {emergency.type.toLowerCase()} symptoms. 
                    {emergency.type === 'Cardiac Arrest' && 'Patient is unconscious and not breathing. CPR in progress.'}
                    {emergency.type === 'Motor Vehicle Accident' && 'Multiple vehicles involved. Injuries reported.'}
                    {emergency.type === 'Stroke Symptoms' && 'Patient showing signs of facial drooping and speech difficulty.'}
                    {emergency.type === 'Chest Pain' && 'Severe chest pain radiating to left arm. Patient conscious.'}
                    Requesting immediate medical assistance."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dispatched Units */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Ambulance className="h-5 w-5 text-red-600 mr-2" />
                Dispatched Emergency Units
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emergency.units && emergency.units.length > 0 ? (
                  emergency.units.map((unit: string, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                          unit.startsWith('AMB') ? 'bg-red-500' :
                          unit.startsWith('FIRE') ? 'bg-orange-500' :
                          unit.startsWith('POLICE') ? 'bg-blue-500' : 'bg-gray-500'
                        }`}>
                          {unit.startsWith('AMB') ? <Ambulance className="h-5 w-5" /> :
                           unit.startsWith('FIRE') ? <AlertTriangle className="h-5 w-5" /> :
                           unit.startsWith('POLICE') ? <Shield className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{unit}</p>
                          <p className="text-sm text-gray-500">
                            {unit.startsWith('AMB') ? 'Emergency Medical Services' :
                             unit.startsWith('FIRE') ? 'Fire & Rescue' :
                             unit.startsWith('POLICE') ? 'Law Enforcement' : 'Emergency Services'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          En Route
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">ETA: {emergency.eta}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No units dispatched yet</p>
                    <p className="text-sm text-gray-500">Awaiting dispatch coordination</p>
                    <Button className="mt-3 bg-red-600 hover:bg-red-700">
                      <Ambulance className="h-4 w-4 mr-2" />
                      Dispatch Units
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Incident Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Activity className="h-5 w-5 text-indigo-600 mr-2" />
                  Incident Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">911 Call Received</p>
                      <p className="text-sm text-gray-500">{emergency.time} - Emergency reported</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Call Processed</p>
                      <p className="text-sm text-gray-500">{emergency.time} - Priority assessment completed</p>
                    </div>
                  </div>
                  {emergency.status !== 'pending' && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Units Dispatched</p>
                        <p className="text-sm text-gray-500">Units en route to scene</p>
                      </div>
                    </div>
                  )}
                  {emergency.status === 'responding' && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 animate-pulse"></div>
                      <div>
                        <p className="font-medium text-gray-900">Response in Progress</p>
                        <p className="text-sm text-gray-500">Units responding to emergency</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Radio className="h-5 w-5 text-green-600 mr-2" />
                  Communication Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-blue-900">Dispatcher</span>
                      <span className="text-xs text-blue-600">{emergency.time}</span>
                    </div>
                    <p className="text-sm text-blue-800">
                      "Units {emergency.units?.join(', ') || 'pending'} respond to {emergency.type} at {emergency.location}"
                    </p>
                  </div>
                  
                  {emergency.status !== 'pending' && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-green-900">Unit {emergency.units?.[0] || 'AMB-001'}</span>
                        <span className="text-xs text-green-600">+2 min</span>
                      </div>
                      <p className="text-sm text-green-800">
                        "Copy dispatch, en route to scene. ETA {emergency.eta}"
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-amber-900">Caller</span>
                      <span className="text-xs text-amber-600">+3 min</span>
                    </div>
                    <p className="text-sm text-amber-800">
                      "Patient condition {emergency.priority === 'critical' ? 'critical' : 'stable'}, 
                      {emergency.type === 'Cardiac Arrest' ? 'CPR ongoing' : 'conscious and responsive'}"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Medical Protocols */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Heart className="h-5 w-5 text-pink-600 mr-2" />
                Medical Protocols & Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Pre-arrival Instructions</h4>
                  <div className="space-y-2">
                    {emergency.type === 'Cardiac Arrest' && (
                      <>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Continue CPR - 30 compressions, 2 breaths</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Check for AED availability</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Clear airway if visible obstruction</span>
                        </div>
                      </>
                    )}
                    {emergency.type === 'Stroke Symptoms' && (
                      <>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Note time of symptom onset</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Keep patient calm and still</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Do not give food or water</span>
                        </div>
                      </>
                    )}
                    {emergency.type === 'Chest Pain' && (
                      <>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Have patient sit upright</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Loosen tight clothing</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Aspirin if no allergies</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Hospital Notification</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-blue-900">City General Hospital</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Notified</Badge>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        {emergency.type} patient incoming - ETA {emergency.eta}
                      </p>
                    </div>
                    
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-purple-900">Trauma Team</span>
                        <Badge variant="outline" className="border-purple-500 text-purple-700">
                          {emergency.priority === 'critical' ? 'Activated' : 'Standby'}
                        </Badge>
                      </div>
                      <p className="text-sm text-purple-700 mt-1">
                        {emergency.priority === 'critical' ? 'Level 1 trauma activation' : 'Level 2 standby'}
                      </p>
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
              <Radio className="h-4 w-4 mr-2" />
              Radio Contact
            </Button>
            <Button variant="outline" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Update Status
            </Button>
            <Button variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Incident Report
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 flex items-center">
              <Navigation className="h-4 w-4 mr-2" />
              Dispatch Additional Units
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
