import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { type PageProps } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AmbulanceTrackingMap } from '@/components/ambulance/AmbulanceTrackingMap';
import { 
    Truck, 
    MapPin, 
    Clock, 
    Route, 
    Users, 
    AlertTriangle,
    CheckCircle,
    Navigation,
    Fuel,
    Phone
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Ambulance {
    id: number;
    vehicle_number: string;
    license_plate: string;
    type: string;
    status: string;
    fuel_level: number;
    current_location: {
        lat: number;
        lng: number;
        timestamp: string;
    } | null;
    facility: {
        id: number;
        name: string;
    };
    equipment_inventory: Array<{
        name: string;
        quantity: number;
        status: string;
    }>;
}

interface RouteOption {
    route_index: number;
    summary: string;
    distance: {
        text: string;
        km: number;
    };
    duration: {
        text: string;
        minutes: number;
    };
    duration_in_traffic?: {
        text: string;
        minutes: number;
    };
    traffic_conditions: {
        condition: string;
        delay_minutes: number;
    };
    fuel_estimate: {
        liters: number;
        cost: number;
    };
    recommended: boolean;
}

interface DispatchFormData {
    ambulance_id: string;
    referral_id: string;
    pickup_location: {
        lat: number;
        lng: number;
        address: string;
    } | null;
    destination_location: {
        lat: number;
        lng: number;
        address: string;
    } | null;
    crew_members: string[];
    special_instructions: string;
    urgency: string;
}

export default function AmbulanceDispatch({ auth }: PageProps) {
    const [formData, setFormData] = useState<DispatchFormData>({
        ambulance_id: '',
        referral_id: '',
        pickup_location: null,
        destination_location: null,
        crew_members: [],
        special_instructions: '',
        urgency: 'routine'
    });

    const [availableAmbulances, setAvailableAmbulances] = useState<Ambulance[]>([]);
    const [recommendedAmbulance, setRecommendedAmbulance] = useState<Ambulance | null>(null);
    const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Location, 2: Ambulance, 3: Route, 4: Confirm

    useEffect(() => {
        fetchAvailableAmbulances();
    }, []);

    const fetchAvailableAmbulances = async () => {
        try {
            const response = await axios.get('/api/v1/ambulances', {
                params: { status: 'available' }
            });
            setAvailableAmbulances(response.data.data);
        } catch (error) {
            console.error('Failed to fetch ambulances:', error);
            toast.error('Failed to load available ambulances');
        }
    };

    const findOptimalAmbulance = async () => {
        if (!formData.pickup_location) {
            toast.error('Please set pickup location first');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post('/api/v1/ambulances/find-optimal', {
                pickup_lat: formData.pickup_location.lat,
                pickup_lng: formData.pickup_location.lng,
                urgency: formData.urgency
            });

            if (response.data.ambulance) {
                setRecommendedAmbulance(response.data.ambulance);
                setFormData(prev => ({ ...prev, ambulance_id: response.data.ambulance.id.toString() }));
                toast.success('Optimal ambulance found');
            } else {
                toast.error('No suitable ambulance found');
            }
        } catch (error) {
            console.error('Failed to find optimal ambulance:', error);
            toast.error('Failed to find optimal ambulance');
        } finally {
            setLoading(false);
        }
    };

    const calculateRoutes = async () => {
        if (!formData.pickup_location || !formData.destination_location) {
            toast.error('Please set both pickup and destination locations');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post('/api/v1/ambulances/optimize-route', {
                from_lat: formData.pickup_location.lat,
                from_lng: formData.pickup_location.lng,
                to_lat: formData.destination_location.lat,
                to_lng: formData.destination_location.lng,
                departure_time: 'now'
            });

            if (response.data.routes) {
                setRouteOptions(response.data.routes);
                setSelectedRoute(response.data.routes.find((r: RouteOption) => r.recommended) || response.data.routes[0]);
                toast.success('Routes calculated successfully');
            }
        } catch (error) {
            console.error('Failed to calculate routes:', error);
            toast.error('Failed to calculate routes');
        } finally {
            setLoading(false);
        }
    };

    const handleDispatch = async () => {
        if (!formData.ambulance_id || !formData.pickup_location || !formData.destination_location) {
            toast.error('Please complete all required fields');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post('/api/v1/ambulances/dispatch', {
                ambulance_id: parseInt(formData.ambulance_id),
                referral_id: formData.referral_id ? parseInt(formData.referral_id) : null,
                pickup_location: formData.pickup_location,
                destination_location: formData.destination_location,
                crew_members: formData.crew_members,
                special_instructions: formData.special_instructions
            });

            toast.success('Ambulance dispatched successfully');
            // Reset form or redirect
            setFormData({
                ambulance_id: '',
                referral_id: '',
                pickup_location: null,
                destination_location: null,
                crew_members: [],
                special_instructions: '',
                urgency: 'routine'
            });
            setStep(1);
        } catch (error) {
            console.error('Failed to dispatch ambulance:', error);
            toast.error('Failed to dispatch ambulance');
        } finally {
            setLoading(false);
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'emergency': return 'bg-red-500';
            case 'urgent': return 'bg-orange-500';
            case 'semi_urgent': return 'bg-yellow-500';
            default: return 'bg-green-500';
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Step 1: Set Locations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="urgency">Urgency Level</Label>
                                <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="emergency">Emergency</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                        <SelectItem value="semi_urgent">Semi-Urgent</SelectItem>
                                        <SelectItem value="routine">Routine</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="referral_id">Referral ID (Optional)</Label>
                                <Input
                                    id="referral_id"
                                    value={formData.referral_id}
                                    onChange={(e) => setFormData(prev => ({ ...prev, referral_id: e.target.value }))}
                                    placeholder="Enter referral ID if applicable"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Pickup Location</Label>
                                    <div className="p-3 border rounded-lg bg-gray-50">
                                        {formData.pickup_location ? (
                                            <div>
                                                <p className="font-medium">{formData.pickup_location.address}</p>
                                                <p className="text-sm text-gray-500">
                                                    {formData.pickup_location.lat.toFixed(6)}, {formData.pickup_location.lng.toFixed(6)}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">Click on map to set pickup location</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label>Destination Location</Label>
                                    <div className="p-3 border rounded-lg bg-gray-50">
                                        {formData.destination_location ? (
                                            <div>
                                                <p className="font-medium">{formData.destination_location.address}</p>
                                                <p className="text-sm text-gray-500">
                                                    {formData.destination_location.lat.toFixed(6)}, {formData.destination_location.lng.toFixed(6)}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">Click on map to set destination</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <Button
                                    onClick={findOptimalAmbulance}
                                    disabled={!formData.pickup_location || loading}
                                    variant="outline"
                                >
                                    <Truck className="h-4 w-4 mr-2" />
                                    Find Optimal Ambulance
                                </Button>

                                <Button
                                    onClick={() => setStep(2)}
                                    disabled={!formData.pickup_location || !formData.destination_location}
                                >
                                    Next: Select Ambulance
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );

            case 2:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" />
                                Step 2: Select Ambulance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recommendedAmbulance && (
                                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">Recommended Ambulance</h4>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{recommendedAmbulance.vehicle_number}</p>
                                            <p className="text-sm text-gray-600">{recommendedAmbulance.facility.name}</p>
                                        </div>
                                        <Badge className="bg-blue-500">Optimal Choice</Badge>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                {availableAmbulances.map(ambulance => (
                                    <div
                                        key={ambulance.id}
                                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                            formData.ambulance_id === ambulance.id.toString()
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setFormData(prev => ({ ...prev, ambulance_id: ambulance.id.toString() }))}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">{ambulance.vehicle_number}</h4>
                                                <p className="text-sm text-gray-600">{ambulance.facility.name}</p>
                                                <p className="text-sm text-gray-500">{ambulance.type}</p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline">{ambulance.status}</Badge>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Fuel className="h-3 w-3" />
                                                    <span className="text-sm">{ambulance.fuel_level}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between mt-6">
                                <Button variant="outline" onClick={() => setStep(1)}>
                                    Back
                                </Button>
                                <Button
                                    onClick={() => {
                                        calculateRoutes();
                                        setStep(3);
                                    }}
                                    disabled={!formData.ambulance_id}
                                >
                                    Next: Calculate Route
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );

            case 3:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Route className="h-5 w-5" />
                                Step 3: Select Route
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {routeOptions.map(route => (
                                    <div
                                        key={route.route_index}
                                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                            selectedRoute?.route_index === route.route_index
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setSelectedRoute(route)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium flex items-center gap-2">
                                                    {route.summary}
                                                    {route.recommended && <Badge className="bg-green-500">Recommended</Badge>}
                                                </h4>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                    <span>{route.distance.text}</span>
                                                    <span>{route.duration.text}</span>
                                                    {route.duration_in_traffic && (
                                                        <span className="text-orange-600">
                                                            {route.duration_in_traffic.text} (with traffic)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm">
                                                    <div>Fuel: {route.fuel_estimate.liters}L</div>
                                                    <div>Cost: ${route.fuel_estimate.cost}</div>
                                                </div>
                                                <Badge 
                                                    variant="outline"
                                                    className={
                                                        route.traffic_conditions.condition === 'heavy' ? 'border-red-500 text-red-600' :
                                                        route.traffic_conditions.condition === 'moderate' ? 'border-yellow-500 text-yellow-600' :
                                                        'border-green-500 text-green-600'
                                                    }
                                                >
                                                    {route.traffic_conditions.condition} traffic
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between mt-6">
                                <Button variant="outline" onClick={() => setStep(2)}>
                                    Back
                                </Button>
                                <Button
                                    onClick={() => setStep(4)}
                                    disabled={!selectedRoute}
                                >
                                    Next: Confirm Dispatch
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );

            case 4:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                Step 4: Confirm Dispatch
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="special_instructions">Special Instructions</Label>
                                <Textarea
                                    id="special_instructions"
                                    value={formData.special_instructions}
                                    onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                                    placeholder="Enter any special instructions for the crew..."
                                    rows={3}
                                />
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3">Dispatch Summary</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Urgency:</span>
                                        <Badge className={getUrgencyColor(formData.urgency)}>
                                            {formData.urgency}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Ambulance:</span>
                                        <span>{availableAmbulances.find(a => a.id.toString() === formData.ambulance_id)?.vehicle_number}</span>
                                    </div>
                                    {selectedRoute && (
                                        <>
                                            <div className="flex justify-between">
                                                <span>Route:</span>
                                                <span>{selectedRoute.summary}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Distance:</span>
                                                <span>{selectedRoute.distance.text}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>ETA:</span>
                                                <span>{selectedRoute.duration.text}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(3)}>
                                    Back
                                </Button>
                                <Button
                                    onClick={handleDispatch}
                                    disabled={loading}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    {loading ? 'Dispatching...' : 'Dispatch Ambulance'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );

            default:
                return null;
        }
    };

    return (
        <AppLayout user={auth.user} title="Ambulance Dispatch">
            <Head title="Ambulance Dispatch" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Dispatch Form */}
                        <div>
                            {renderStepContent()}
                        </div>

                        {/* Real-time Map */}
                        <div>
                            <AmbulanceTrackingMap 
                                height="600px"
                                showControls={true}
                                autoRefresh={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
