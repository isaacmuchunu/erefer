import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    MapPin, 
    Navigation, 
    Clock, 
    Fuel, 
    Users, 
    AlertTriangle,
    RefreshCw,
    Maximize2,
    Filter
} from 'lucide-react';
import axios from 'axios';

interface AmbulanceLocation {
    id: number;
    vehicle_number: string;
    status: 'available' | 'dispatched' | 'maintenance' | 'out_of_service';
    current_location: {
        lat: number;
        lng: number;
        timestamp: string;
        accuracy?: number;
        speed?: number;
        heading?: number;
    } | null;
    facility: {
        id: number;
        name: string;
    };
    current_dispatch?: {
        id: number;
        dispatch_number: string;
        status: string;
        eta_pickup?: string;
        eta_destination?: string;
        pickup_location?: { lat: number; lng: number; address?: string };
        destination_location?: { lat: number; lng: number; address?: string };
    };
    route_progress?: {
        total_distance_km: number;
        completed_distance_km: number;
        progress_percentage: number;
        updated_at: string;
    };
    fuel_level?: number;
}

interface AmbulanceTrackingMapProps {
    facilityId?: number;
    height?: string;
    showControls?: boolean;
    autoRefresh?: boolean;
    refreshInterval?: number;
}

export const AmbulanceTrackingMap: React.FC<AmbulanceTrackingMapProps> = ({
    facilityId,
    height = '600px',
    showControls = true,
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
}) => {
    const [ambulances, setAmbulances] = useState<AmbulanceLocation[]>([]);
    const [selectedAmbulance, setSelectedAmbulance] = useState<AmbulanceLocation | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);
    const mapRef = useRef<HTMLDivElement>(null);
    const refreshIntervalRef = useRef<NodeJS.Timeout>();

    // Initialize map (placeholder for actual map implementation)
    useEffect(() => {
        // This would initialize Google Maps, Mapbox, or another mapping service
        initializeMap();
        
        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, []);

    // Auto-refresh ambulance data
    useEffect(() => {
        if (autoRefresh) {
            refreshIntervalRef.current = setInterval(() => {
                fetchAmbulanceData();
            }, refreshInterval);
        }

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [autoRefresh, refreshInterval, facilityId, statusFilter]);

    // Initial data fetch
    useEffect(() => {
        fetchAmbulanceData();
    }, [facilityId, statusFilter]);

    const initializeMap = () => {
        // Placeholder for map initialization
        // In a real implementation, this would set up Google Maps, Mapbox, etc.
        console.log('Map initialized');
    };

    const fetchAmbulanceData = async () => {
        try {
            setLoading(true);
            const params: any = {};
            
            if (facilityId) {
                params.facility_id = facilityId;
            }
            
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }

            const response = await axios.get('/api/v1/ambulances/tracking-data', { params });
            setAmbulances(response.data.ambulances);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Failed to fetch ambulance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'available': return 'bg-green-500';
            case 'dispatched': return 'bg-blue-500';
            case 'maintenance': return 'bg-yellow-500';
            case 'out_of_service': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = (status: string): string => {
        switch (status) {
            case 'available': return 'Available';
            case 'dispatched': return 'Dispatched';
            case 'maintenance': return 'Maintenance';
            case 'out_of_service': return 'Out of Service';
            default: return 'Unknown';
        }
    };

    const formatTime = (dateString: string): string => {
        return new Date(dateString).toLocaleTimeString();
    };

    const formatDistance = (km: number): string => {
        return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const filteredAmbulances = ambulances.filter(ambulance => {
        if (statusFilter === 'all') return true;
        return ambulance.status === statusFilter;
    });

    return (
        <Card className={`${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Ambulance Tracking
                        <Badge variant="outline" className="ml-2">
                            {filteredAmbulances.length} vehicles
                        </Badge>
                    </CardTitle>
                    
                    {showControls && (
                        <div className="flex items-center gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="dispatched">Dispatched</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="out_of_service">Out of Service</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchAmbulanceData}
                                disabled={loading}
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                            
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleFullscreen}
                            >
                                <Maximize2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
                
                <div className="text-sm text-gray-500">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                </div>
            </CardHeader>
            
            <CardContent className="p-0">
                <div className="flex">
                    {/* Map Container */}
                    <div 
                        ref={mapRef}
                        className="flex-1 bg-gray-100 relative"
                        style={{ height }}
                    >
                        {/* Placeholder for actual map */}
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>Map will be rendered here</p>
                                <p className="text-sm">Google Maps / Mapbox integration required</p>
                            </div>
                        </div>
                        
                        {/* Ambulance markers would be rendered here */}
                        {filteredAmbulances.map(ambulance => (
                            ambulance.current_location && (
                                <div
                                    key={ambulance.id}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                                    style={{
                                        left: `${Math.random() * 80 + 10}%`, // Placeholder positioning
                                        top: `${Math.random() * 80 + 10}%`,
                                    }}
                                    onClick={() => setSelectedAmbulance(ambulance)}
                                >
                                    <div className={`w-4 h-4 rounded-full ${getStatusColor(ambulance.status)} border-2 border-white shadow-lg`} />
                                </div>
                            )
                        ))}
                    </div>
                    
                    {/* Ambulance List Sidebar */}
                    <div className="w-80 border-l bg-white overflow-y-auto" style={{ height }}>
                        <div className="p-4 border-b">
                            <h3 className="font-semibold">Active Ambulances</h3>
                        </div>
                        
                        <div className="space-y-2 p-2">
                            {filteredAmbulances.map(ambulance => (
                                <div
                                    key={ambulance.id}
                                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                        selectedAmbulance?.id === ambulance.id 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => setSelectedAmbulance(ambulance)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">{ambulance.vehicle_number}</span>
                                        <Badge 
                                            variant="outline" 
                                            className={`${getStatusColor(ambulance.status)} text-white border-0`}
                                        >
                                            {getStatusText(ambulance.status)}
                                        </Badge>
                                    </div>
                                    
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {ambulance.facility.name}
                                        </div>
                                        
                                        {ambulance.current_location && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatTime(ambulance.current_location.timestamp)}
                                            </div>
                                        )}
                                        
                                        {ambulance.fuel_level && (
                                            <div className="flex items-center gap-1">
                                                <Fuel className="h-3 w-3" />
                                                {ambulance.fuel_level}%
                                                {ambulance.fuel_level < 25 && (
                                                    <AlertTriangle className="h-3 w-3 text-red-500" />
                                                )}
                                            </div>
                                        )}
                                        
                                        {ambulance.current_dispatch && (
                                            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                                                <div className="font-medium">
                                                    {ambulance.current_dispatch.dispatch_number}
                                                </div>
                                                <div>Status: {ambulance.current_dispatch.status}</div>
                                                {ambulance.route_progress && (
                                                    <div className="mt-1">
                                                        <div className="flex justify-between">
                                                            <span>Progress:</span>
                                                            <span>{ambulance.route_progress.progress_percentage}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                                            <div 
                                                                className="bg-blue-500 h-1 rounded-full"
                                                                style={{ width: `${ambulance.route_progress.progress_percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            
                            {filteredAmbulances.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No ambulances found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
