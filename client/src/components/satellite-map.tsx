import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Route, Circle, Globe } from "lucide-react";

interface SatelliteMapProps {
  selectedSatelliteId: number | null;
  autoRefresh: boolean;
  refreshInterval: number;
}

export default function SatelliteMap({ 
  selectedSatelliteId, 
  autoRefresh, 
  refreshInterval 
}: SatelliteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<number, any>>(new Map());
  const [showOrbits, setShowOrbits] = useState(true);
  const [showFootprints, setShowFootprints] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);

  // Fetch satellites data
  const { data: satellites } = useQuery({
    queryKey: ['/api/satellites'],
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
  });

  // Fetch live data for selected satellite
  const { data: liveData } = useQuery({
    queryKey: ['/api/satellites', selectedSatelliteId, 'live'],
    enabled: !!selectedSatelliteId,
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
  });

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const L = (window as any).L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      worldCopyJump: true,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update satellite markers
  useEffect(() => {
    if (!mapInstanceRef.current || !satellites) return;

    const L = (window as any).L;
    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current.clear();

    // Add satellite markers
    satellites.forEach((satellite: any) => {
      const isSelected = satellite.id === selectedSatelliteId;
      const color = isSelected ? '#3B82F6' : getStatusColor(satellite.status);
      
      const marker = L.circleMarker([satellite.latitude || 0, satellite.longitude || 0], {
        radius: isSelected ? 8 : 6,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
        className: 'satellite-marker'
      }).addTo(map);

      // Add popup with satellite info
      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold">${satellite.name}</h3>
          <p>NORAD: ${satellite.noradId}</p>
          <p>Altitude: ${satellite.altitude || 'N/A'} km</p>
          <p>Status: ${satellite.status || 'Unknown'}</p>
        </div>
      `);

      markersRef.current.set(satellite.id, marker);
    });

    // Center on selected satellite
    if (selectedSatelliteId && liveData?.positions?.[0]) {
      const position = liveData.positions[0];
      map.setView([position.satlatitude, position.satlongitude], 4);
    }
  }, [satellites, selectedSatelliteId, liveData]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'visible': return '#10B981';
      case 'eclipse': return '#F59E0B';
      case 'hidden': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map Controls */}
      <Card className="absolute top-4 left-4 z-10 bg-space-800/90 backdrop-blur-sm border-space-700 p-3">
        <h4 className="font-semibold text-sm mb-2 text-white">Map Controls</h4>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={showOrbits ? "default" : "outline"}
            onClick={() => setShowOrbits(!showOrbits)}
            className="text-xs bg-blue-600 hover:bg-blue-700"
          >
            <Route className="w-3 h-3 mr-1" />
            Orbits
          </Button>
          <Button
            size="sm"
            variant={showFootprints ? "default" : "outline"}
            onClick={() => setShowFootprints(!showFootprints)}
            className="text-xs bg-purple-600 hover:bg-purple-700"
          >
            <Circle className="w-3 h-3 mr-1" />
            Footprints
          </Button>
          <Button
            size="sm"
            variant={is3DMode ? "default" : "outline"}
            onClick={() => setIs3DMode(!is3DMode)}
            className="text-xs bg-green-600 hover:bg-green-700"
          >
            <Globe className="w-3 h-3 mr-1" />
            3D
          </Button>
        </div>
      </Card>

      {/* Loading Overlay */}
      {!satellites && (
        <div className="absolute inset-0 bg-space-800/50 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-space-300">Loading satellite data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
