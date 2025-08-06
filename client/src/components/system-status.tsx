import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart } from "lucide-react";

interface SystemStatusProps {
  autoRefresh: boolean;
  onToggleAutoRefresh: (enabled: boolean) => void;
  refreshInterval: number;
  onRefreshIntervalChange: (interval: number) => void;
}

export default function SystemStatus({
  autoRefresh,
  onToggleAutoRefresh,
  refreshInterval,
  onRefreshIntervalChange,
}: SystemStatusProps) {
  return (
    <Card className="bg-space-800 border-space-700">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Heart className="w-5 h-5 mr-2 text-red-400" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-space-400 text-sm">N2YO API:</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400 text-sm font-medium">Online</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-space-400 text-sm">Rate Limit:</span>
          <span className="text-sm">847/1000</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-space-400 text-sm">Data Quality:</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400 text-sm font-medium">Excellent</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-space-400 text-sm">Auto-refresh:</span>
          <Switch
            checked={autoRefresh}
            onCheckedChange={onToggleAutoRefresh}
          />
        </div>
        
        <div className="pt-3 border-t border-space-700">
          <div className="flex justify-between items-center">
            <span className="text-space-400 text-sm">Refresh Interval:</span>
            <Select
              value={refreshInterval.toString()}
              onValueChange={(value) => onRefreshIntervalChange(parseInt(value))}
            >
              <SelectTrigger className="w-20 bg-space-700 border-space-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30s</SelectItem>
                <SelectItem value="60">60s</SelectItem>
                <SelectItem value="120">2m</SelectItem>
                <SelectItem value="300">5m</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
