import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

interface AltitudeChartProps {
  selectedSatelliteId: number | null;
}

export default function AltitudeChart({ selectedSatelliteId }: AltitudeChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  const { data: telemetryData } = useQuery({
    queryKey: ['/api/satellites', selectedSatelliteId, 'telemetry'],
    enabled: !!selectedSatelliteId,
  });

  useEffect(() => {
    if (!chartRef.current || !telemetryData?.history) return;

    const Chart = (window as any).Chart;
    if (!Chart) return;

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const history = telemetryData.history.slice(-20); // Last 20 data points
    const labels = history.map((data: any) => 
      new Date(data.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    );
    const altitudes = history.map((data: any) => data.altitude);

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Altitude (km)',
          data: altitudes,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            display: false 
          }
        },
        scales: {
          x: { 
            grid: { 
              color: '#334155' 
            },
            ticks: {
              color: '#94a3b8'
            }
          },
          y: { 
            grid: { 
              color: '#334155' 
            },
            ticks: {
              color: '#94a3b8'
            }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [telemetryData]);

  return (
    <Card className="bg-space-800 border-space-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-lg">
            <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
            Altitude Tracking
          </CardTitle>
          <div className="flex space-x-2">
            <Button size="sm" variant="default" className="text-xs bg-blue-600">
              1H
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              6H
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              24H
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!selectedSatelliteId ? (
          <div className="h-[300px] flex items-center justify-center text-space-400">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a satellite to view altitude data</p>
            </div>
          </div>
        ) : (
          <div className="h-[300px] relative">
            <canvas ref={chartRef} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
