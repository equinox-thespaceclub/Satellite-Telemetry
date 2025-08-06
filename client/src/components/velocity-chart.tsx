import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge } from "lucide-react";

interface VelocityChartProps {
  selectedSatelliteId: number | null;
}

export default function VelocityChart({ selectedSatelliteId }: VelocityChartProps) {
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
    const velocities = history.map((data: any) => data.velocity || 0);

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Velocity (km/h)',
          data: velocities,
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
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

  const currentVelocity = telemetryData?.latest?.velocity;

  return (
    <Card className="bg-space-800 border-space-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-lg">
            <Gauge className="w-5 h-5 mr-2 text-yellow-400" />
            Velocity Profile
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-space-400">Current:</span>
            <span className="font-mono text-sm text-yellow-400">
              {currentVelocity ? `${currentVelocity.toFixed(0)} km/h` : 'N/A'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!selectedSatelliteId ? (
          <div className="h-[300px] flex items-center justify-center text-space-400">
            <div className="text-center">
              <Gauge className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a satellite to view velocity data</p>
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
