import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Database, Upload, Download, FileText, FileCode, FileX } from "lucide-react";

interface DataManagementProps {
  selectedSatelliteId: number | null;
}

export default function DataManagement({ selectedSatelliteId }: DataManagementProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, satelliteId }: { file: File; satelliteId: number }) => {
      const text = await file.text();
      return apiRequest('POST', '/api/telemetry/upload', {
        csvData: text,
        satelliteId: satelliteId,
      });
    },
    onSuccess: (response) => {
      const data = response as any;
      toast({
        title: "Upload Successful",
        description: `Processed ${data.processedCount} records`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/satellites'] });
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const exportMutation = useMutation({
    mutationFn: async ({ satelliteId, format }: { satelliteId: number; format: string }) => {
      const response = await fetch(`/api/satellites/${satelliteId}/export?format=${format}&hours=24`);
      if (!response.ok) throw new Error('Export failed');
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `satellite_${satelliteId}_telemetry.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `satellite_${satelliteId}_data.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    },
    onSuccess: () => {
      toast({
        title: "Export Successful",
        description: "Data has been downloaded",
      });
    },
    onError: (error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive",
      });
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !selectedSatelliteId) return;
    uploadMutation.mutate({ file: selectedFile, satelliteId: selectedSatelliteId });
  };

  const handleExport = (format: string) => {
    if (!selectedSatelliteId) {
      toast({
        title: "No Satellite Selected",
        description: "Please select a satellite to export data",
        variant: "destructive",
      });
      return;
    }
    exportMutation.mutate({ satelliteId: selectedSatelliteId, format });
  };

  return (
    <Card className="bg-space-800 border-space-700">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Database className="w-5 h-5 mr-2 text-indigo-400" />
          Data Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CSV Upload */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center">
              <Upload className="w-4 h-4 mr-2 text-blue-400" />
              Historical Data Upload
            </h4>
            <div className="border-2 border-dashed border-space-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <FileX className="w-12 h-12 text-space-400 mx-auto mb-3" />
              <p className="text-sm text-space-400 mb-3">
                {selectedFile ? `Selected: ${selectedFile.name}` : 'Drop CSV files here or click to browse'}
              </p>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csvUpload"
              />
              <Button
                onClick={() => document.getElementById('csvUpload')?.click()}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!selectedSatelliteId}
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Files
              </Button>
              {selectedFile && (
                <Button
                  onClick={handleUpload}
                  size="sm"
                  className="ml-2 bg-green-600 hover:bg-green-700"
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
                </Button>
              )}
            </div>
            <div className="text-xs text-space-400">
              <p>Supported format: CSV with timestamp, lat, lon, alt columns</p>
              <p>Max file size: 10MB</p>
            </div>
          </div>

          {/* Data Export */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center">
              <Download className="w-4 h-4 mr-2 text-green-400" />
              Export Options
            </h4>
            <div className="space-y-3">
              <Button
                onClick={() => handleExport('csv')}
                className="w-full p-3 bg-space-700 hover:bg-space-600 transition-colors justify-start"
                variant="ghost"
                disabled={!selectedSatelliteId || exportMutation.isPending}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-green-400" />
                    <div className="text-left">
                      <p className="font-medium text-sm">Export as CSV</p>
                      <p className="text-xs text-space-400">Current session telemetry data</p>
                    </div>
                  </div>
                  <div className="text-space-400">→</div>
                </div>
              </Button>
              
              <Button
                onClick={() => handleExport('json')}
                className="w-full p-3 bg-space-700 hover:bg-space-600 transition-colors justify-start"
                variant="ghost"
                disabled={!selectedSatelliteId || exportMutation.isPending}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <FileCode className="w-5 h-5 text-blue-400" />
                    <div className="text-left">
                      <p className="font-medium text-sm">Export as JSON</p>
                      <p className="text-xs text-space-400">Complete data with metadata</p>
                    </div>
                  </div>
                  <div className="text-space-400">→</div>
                </div>
              </Button>
              
              <Button
                className="w-full p-3 bg-space-700 hover:bg-space-600 transition-colors justify-start"
                variant="ghost"
                disabled
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-red-400" />
                    <div className="text-left">
                      <p className="font-medium text-sm">Generate Report</p>
                      <p className="text-xs text-space-400">PDF summary with charts (Coming Soon)</p>
                    </div>
                  </div>
                  <div className="text-space-400">→</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
