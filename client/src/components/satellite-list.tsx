import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";

interface SatelliteListProps {
  searchQuery: string;
  selectedCategory: string;
  selectedSatelliteId: number | null;
  onSelectSatellite: (id: number) => void;
}

export default function SatelliteList({
  searchQuery,
  selectedCategory,
  selectedSatelliteId,
  onSelectSatellite,
}: SatelliteListProps) {
  const { data: satellites, isLoading } = useQuery({
    queryKey: ['/api/satellites'],
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-space-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!satellites || satellites.length === 0) {
    return (
      <div className="text-center text-space-400 py-8">
        <p>No satellites available</p>
      </div>
    );
  }

  const filteredSatellites = satellites.filter((satellite: any) => {
    const matchesSearch = satellite.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           satellite.category?.toLowerCase().includes(selectedCategory) ||
                           satellite.name.toLowerCase().includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'visible': return 'bg-green-400';
      case 'eclipse': return 'bg-yellow-400';
      case 'hidden': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (satellite: any) => {
    // Mock status based on satellite type for demo
    if (satellite.name.includes('ISS')) return 'Visible';
    if (satellite.name.includes('NOAA')) return 'Eclipse';
    if (satellite.name.includes('HUBBLE')) return 'Hidden';
    return 'Active';
  };

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {filteredSatellites.map((satellite: any) => (
        <Card
          key={satellite.id}
          className={`p-3 cursor-pointer transition-colors border ${
            selectedSatelliteId === satellite.id
              ? 'bg-blue-600/20 border-blue-500'
              : 'bg-space-700 border-space-600 hover:bg-space-600'
          }`}
          onClick={() => onSelectSatellite(satellite.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(getStatusText(satellite))}`}></div>
              <div>
                <p className="font-medium text-sm text-white">{satellite.name}</p>
                <p className="text-xs text-space-400">NORAD: {satellite.noradId}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-space-400">
                {satellite.category || 'Unknown'}
              </p>
              <p className={`text-xs ${
                getStatusText(satellite) === 'Visible' ? 'text-green-400' :
                getStatusText(satellite) === 'Eclipse' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {getStatusText(satellite)}
              </p>
            </div>
          </div>
        </Card>
      ))}
      
      {filteredSatellites.length === 0 && (
        <div className="text-center text-space-400 py-4">
          <p>No satellites match your search criteria</p>
        </div>
      )}
    </div>
  );
}
