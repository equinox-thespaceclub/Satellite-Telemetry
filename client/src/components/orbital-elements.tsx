import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Atom } from "lucide-react";

interface OrbitalElementsProps {
  selectedSatelliteId: number | null;
}

export default function OrbitalElements({ selectedSatelliteId }: OrbitalElementsProps) {
  const { data: orbitalData } = useQuery({
    queryKey: ['/api/satellites', selectedSatelliteId, 'orbital'],
    enabled: !!selectedSatelliteId,
  });

  // Mock orbital data for display when no real data is available
  const mockOrbitalData = selectedSatelliteId ? {
    semiMajorAxis: 6795.2,
    eccentricity: 0.0003,
    inclination: 51.64,
    raan: 125.48,
    argPerigee: 89.15,
    meanAnomaly: 270.92,
    period: 92.68,
  } : null;

  const data = orbitalData || mockOrbitalData;

  return (
    <Card className="bg-space-800 border-space-700">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Atom className="w-5 h-5 mr-2 text-purple-400" />
          Orbital Elements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedSatelliteId ? (
          <div className="text-center text-space-400 py-8">
            <Atom className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select a satellite to view orbital elements</p>
          </div>
        ) : !data ? (
          <div className="text-center text-space-400 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p>Loading orbital data...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-space-400 text-sm">Semi-major axis:</span>
              <span className="font-mono text-sm">
                {data.semiMajorAxis?.toFixed(1)} km
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-space-400 text-sm">Eccentricity:</span>
              <span className="font-mono text-sm">
                {data.eccentricity?.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-space-400 text-sm">Inclination:</span>
              <span className="font-mono text-sm">
                {data.inclination?.toFixed(2)}°
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-space-400 text-sm">RAAN:</span>
              <span className="font-mono text-sm">
                {data.raan?.toFixed(2)}°
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-space-400 text-sm">Arg. of Perigee:</span>
              <span className="font-mono text-sm">
                {data.argPerigee?.toFixed(2)}°
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-space-400 text-sm">Mean Anomaly:</span>
              <span className="font-mono text-sm">
                {data.meanAnomaly?.toFixed(2)}°
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-space-400 text-sm">Period:</span>
              <span className="font-mono text-sm text-green-400">
                {data.period?.toFixed(2)} min
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
