import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";

interface UpcomingPassesProps {
  selectedSatelliteId: number | null;
}

export default function UpcomingPasses({ selectedSatelliteId }: UpcomingPassesProps) {
  const { data: passes } = useQuery({
    queryKey: ['/api/passes', { satelliteId: selectedSatelliteId }],
  });

  // Mock pass data for demonstration
  const mockPasses = [
    {
      id: 1,
      satelliteId: 1,
      satellite: { name: 'ISS (ZARYA)' },
      startTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000 + 6 * 60 * 1000),
      maxElevation: 78,
      direction: 'SW to NE'
    },
    {
      id: 2,
      satelliteId: 2,
      satellite: { name: 'NOAA-19' },
      startTime: new Date(Date.now() + 4.2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 4.2 * 60 * 60 * 1000 + 8 * 60 * 1000),
      maxElevation: 45,
      direction: 'N to S'
    }
  ];

  const displayPasses = passes || mockPasses;

  const formatTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `in ${hours}h ${minutes}m`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getDuration = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-3">
      {displayPasses.slice(0, 3).map((pass: any) => (
        <Card key={pass.id} className="p-3 bg-space-700 border-space-600">
          <div className="flex justify-between items-start mb-2">
            <span className="font-medium text-sm text-white">
              {pass.satellite?.name || 'Unknown Satellite'}
            </span>
            <span className="text-xs text-purple-400">
              {formatTimeUntil(new Date(pass.startTime))}
            </span>
          </div>
          <div className="text-xs text-space-400 space-y-1">
            <div className="flex justify-between">
              <span>Rise:</span>
              <span>{formatTime(new Date(pass.startTime))}</span>
            </div>
            <div className="flex justify-between">
              <span>Max Elevation:</span>
              <span>{pass.maxElevation}°</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span>{getDuration(new Date(pass.startTime), new Date(pass.endTime))}</span>
            </div>
          </div>
        </Card>
      ))}
      
      {displayPasses.length === 0 && (
        <div className="text-center text-space-400 py-4">
          <p>No upcoming passes</p>
        </div>
      )}
    </div>
  );
}
