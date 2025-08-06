import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge } from "lucide-react";

interface TelemetryCardProps {
  selectedSatelliteId: number | null;
}

export default function TelemetryCard({ selectedSatelliteId }: TelemetryCardProps) {
  const { data: satellite } = useQuery({
    queryKey: ['/api/satellites', selectedSatelliteId],
    enabled: !!selectedSatelliteId,
  });

  const { data: telemetryData } = useQuery({
    queryKey: ['/api/satellites', selectedSatelliteId, 'telemetry'],
    enabled: !!selectedSatelliteId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const latest = telemetryData?.latest;

  return (
    <Card className="bg-space-800 border-space-700">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Gauge className="w-5 h-5 mr-2 text-blue-400" />
          Current Telemetry
          {satellite && (
            <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/20">
              {satellite.name}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedSatelliteId ? (
          <div className="text-center text-space-400 py-8">
            <Gauge className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select a satellite to view telemetry data</p>
          </div>
        ) : !latest ? (
          <div className="text-center text-space-400 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p>Loading telemetry data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-space-400 text-sm">Latitude:</span>
                <span className="font-mono text-sm">
                  {latest.latitude ? `${latest.latitude.toFixed(4)}°` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-space-400 text-sm">Longitude:</span>
                <span className="font-mono text-sm">
                  {latest.longitude ? `${latest.longitude.toFixed(4)}°` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-space-400 text-sm">Altitude:</span>
                <span className="font-mono text-sm text-blue-400">
                  {latest.altitude ? `${latest.altitude.toFixed(2)} km` : 'N/A'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-space-400 text-sm">Azimuth:</span>
                <span className="font-mono text-sm">
                  {latest.azimuth ? `${latest.azimuth.toFixed(2)}°` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-space-400 text-sm">Declination:</span>
                <span className="font-mono text-sm">
                  {latest.declination ? `${latest.declination.toFixed(3)}°` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-space-400 text-sm">Velocity:</span>
                <span className="font-mono text-sm text-green-400">
                  {latest.velocity ? `${latest.velocity.toFixed(0)} km/h` : 'N/A'}
                </span>
              </div>
            </div>
            <div className="col-span-2 mt-4 pt-4 border-t border-space-700">
              <div className="flex justify-between items-center">
                <span className="text-space-400 text-sm">Last Update:</span>
                <span className="font-mono text-xs">
                  {new Date(latest.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
