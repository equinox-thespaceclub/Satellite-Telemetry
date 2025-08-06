import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Satellite, Cog, Filter, SatelliteDish, Clock as ClockIcon } from "lucide-react";
import SatelliteMap from "@/components/satellite-map";
import TelemetryCard from "@/components/telemetry-card";
import OrbitalElements from "@/components/orbital-elements";
import SystemStatus from "@/components/system-status";
import AltitudeChart from "@/components/altitude-chart";
import VelocityChart from "@/components/velocity-chart";
import SatelliteList from "@/components/satellite-list";
import UpcomingPasses from "@/components/upcoming-passes";
import DataManagement from "@/components/data-management";
import NotificationSystem from "@/components/notification-system";
import { useWebSocket } from "@/hooks/use-websocket";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSatelliteId, setSelectedSatelliteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(60);

  // WebSocket connection for real-time updates - temporarily disabled
  // useWebSocket();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  };

  return (
    <div className="min-h-screen bg-space-900 text-space-100 font-inter">
      {/* Header */}
      <header className="bg-space-800 border-b border-space-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Satellite className="text-blue-400 text-2xl" />
            <h1 className="text-2xl font-bold text-white">Satellite Telemetry Dashboard</h1>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/20">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
              Live
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-space-700 rounded-lg px-3 py-2">
              <Clock className="w-4 h-4 text-space-400" />
              <span className="text-sm">{formatTime(currentTime)}</span>
            </div>
            <Button size="sm" variant="outline" className="bg-blue-600 hover:bg-blue-700 border-blue-600">
              <Cog className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Sidebar */}
        <aside className="w-80 bg-space-800 border-r border-space-700 overflow-y-auto">
          {/* Satellite Selection */}
          <div className="p-4 border-b border-space-700">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-400" />
              Satellite Selection
            </h3>
            <div className="space-y-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search satellites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-space-700 border-space-600 focus:border-blue-500 pl-10"
                />
                <Filter className="w-4 h-4 absolute left-3 top-2.5 text-space-400" />
              </div>
              <div className="flex flex-wrap gap-2">
                {['all', 'iss', 'weather', 'communication', 'military'].map((category) => (
                  <Button
                    key={category}
                    size="sm"
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className={`text-xs ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-space-700 hover:bg-space-600'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Satellites */}
          <div className="p-4 border-b border-space-700">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <SatelliteDish className="w-5 h-5 mr-2 text-green-400" />
              Active Satellites
            </h3>
            <SatelliteList
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              selectedSatelliteId={selectedSatelliteId}
              onSelectSatellite={setSelectedSatelliteId}
            />
          </div>

          {/* Upcoming Passes */}
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2 text-purple-400" />
              Upcoming Passes
            </h3>
            <UpcomingPasses selectedSatelliteId={selectedSatelliteId} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full grid grid-rows-2">
            {/* Map Section */}
            <div className="relative bg-space-800">
              <SatelliteMap
                selectedSatelliteId={selectedSatelliteId}
                autoRefresh={autoRefresh}
                refreshInterval={refreshInterval}
              />
            </div>

            {/* Data Visualization Section */}
            <div className="bg-space-900 border-t border-space-700 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                <TelemetryCard selectedSatelliteId={selectedSatelliteId} />
                <OrbitalElements selectedSatelliteId={selectedSatelliteId} />
                <SystemStatus
                  autoRefresh={autoRefresh}
                  onToggleAutoRefresh={setAutoRefresh}
                  refreshInterval={refreshInterval}
                  onRefreshIntervalChange={setRefreshInterval}
                />
              </div>

              {/* Charts Section */}
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AltitudeChart selectedSatelliteId={selectedSatelliteId} />
                  <VelocityChart selectedSatelliteId={selectedSatelliteId} />
                </div>
              </div>

              {/* Data Management Section */}
              <div className="px-6 pb-6">
                <DataManagement selectedSatelliteId={selectedSatelliteId} />
              </div>
            </div>
          </div>
        </main>
      </div>

      <NotificationSystem />
    </div>
  );
}
