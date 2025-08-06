import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertTelemetrySchema, insertSatelliteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  // Temporarily disable WebSocket to avoid conflicts
  // const wss = new WebSocketServer({ server: httpServer });

  // Broadcast telemetry updates to all connected WebSocket clients
  function broadcastTelemetryUpdate(data: any) {
    // Temporarily disabled
    // wss.clients.forEach(client => {
    //   if (client.readyState === 1) { // WebSocket.OPEN
    //     client.send(JSON.stringify({ type: 'telemetry_update', data }));
    //   }
    // });
  }

  // WebSocket connection handling - disabled
  // wss.on('connection', (ws) => {
  //   console.log('WebSocket client connected');
    
  //   ws.on('close', () => {
  //     console.log('WebSocket client disconnected');
  //   });
  // });

  // Get all satellites
  app.get("/api/satellites", async (req, res) => {
    try {
      const satellites = await storage.getAllSatellites();
      res.json(satellites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch satellites" });
    }
  });

  // Get specific satellite
  app.get("/api/satellites/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const satellite = await storage.getSatellite(id);
      if (!satellite) {
        return res.status(404).json({ error: "Satellite not found" });
      }
      res.json(satellite);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch satellite" });
    }
  });

  // Add new satellite
  app.post("/api/satellites", async (req, res) => {
    try {
      const satelliteData = insertSatelliteSchema.parse(req.body);
      const satellite = await storage.createSatellite(satelliteData);
      res.status(201).json(satellite);
    } catch (error) {
      res.status(400).json({ error: "Invalid satellite data" });
    }
  });

  // Get satellite telemetry
  app.get("/api/satellites/:id/telemetry", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hours = parseInt(req.query.hours as string) || 24;
      
      const latest = await storage.getLatestTelemetry(id);
      const history = await storage.getTelemetryHistory(id, hours);
      
      res.json({ latest, history });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch telemetry data" });
    }
  });

  // Add telemetry data
  app.post("/api/satellites/:id/telemetry", async (req, res) => {
    try {
      const satelliteId = parseInt(req.params.id);
      const telemetryData = insertTelemetrySchema.parse({
        ...req.body,
        satelliteId,
        timestamp: new Date()
      });
      
      const data = await storage.createTelemetryData(telemetryData);
      broadcastTelemetryUpdate(data);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ error: "Invalid telemetry data" });
    }
  });

  // Get orbital elements
  app.get("/api/satellites/:id/orbital", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const elements = await storage.getLatestOrbitalElements(id);
      if (!elements) {
        return res.status(404).json({ error: "No orbital elements found" });
      }
      res.json(elements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orbital elements" });
    }
  });

  // Get upcoming passes
  app.get("/api/passes", async (req, res) => {
    try {
      const satelliteId = req.query.satelliteId ? parseInt(req.query.satelliteId as string) : undefined;
      const hours = parseInt(req.query.hours as string) || 24;
      
      const passes = await storage.getUpcomingPasses(satelliteId, hours);
      res.json(passes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch passes" });
    }
  });

  // Fetch live data from N2YO API
  app.get("/api/satellites/:id/live", async (req, res) => {
    try {
      const satelliteId = parseInt(req.params.id);
      const satellite = await storage.getSatellite(satelliteId);
      
      if (!satellite) {
        return res.status(404).json({ error: "Satellite not found" });
      }

      const apiKey = process.env.N2YO_API_KEY || process.env.SATELLITE_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "N2YO API key not configured" });
      }

      // Observer coordinates (default to ISS visibility from London)
      const observerLat = req.query.lat || "51.5074";
      const observerLng = req.query.lng || "-0.1278";
      const observerAlt = req.query.alt || "0";

      const response = await fetch(
        `https://api.n2yo.com/rest/v1/satellite/positions/${satellite.noradId}/${observerLat}/${observerLng}/${observerAlt}/1/&apiKey=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`N2YO API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.positions && data.positions.length > 0) {
        const position = data.positions[0];
        
        // Store telemetry data
        const telemetryData = {
          satelliteId,
          timestamp: new Date(),
          latitude: position.satlatitude,
          longitude: position.satlongitude,
          altitude: position.sataltitude,
          azimuth: position.azimuth,
          declination: position.dec,
          rightAscension: position.ra,
          velocity: data.info?.velocity,
          visibility: position.eclipsed ? "eclipse" : "visible"
        };

        const storedData = await storage.createTelemetryData(telemetryData);
        broadcastTelemetryUpdate(storedData);
        
        res.json({ ...data, telemetryData: storedData });
      } else {
        res.status(404).json({ error: "No position data available" });
      }
    } catch (error) {
      console.error("Live data fetch error:", error);
      res.status(500).json({ error: "Failed to fetch live satellite data" });
    }
  });

  // Process CSV upload
  app.post("/api/telemetry/upload", async (req, res) => {
    try {
      const { csvData, satelliteId } = req.body;
      
      if (!csvData || !satelliteId) {
        return res.status(400).json({ error: "CSV data and satellite ID required" });
      }

      const lines = csvData.split('\n').filter((line: string) => line.trim());
      const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
      
      const requiredHeaders = ['timestamp', 'latitude', 'longitude', 'altitude'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        return res.status(400).json({ 
          error: `Missing required headers: ${missingHeaders.join(', ')}` 
        });
      }

      const processedData = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v: string) => v.trim());
        const row: any = {};
        
        headers.forEach((header: string, index: number) => {
          row[header] = values[index];
        });

        try {
          const telemetryData = {
            satelliteId: parseInt(satelliteId),
            timestamp: new Date(row.timestamp),
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
            altitude: parseFloat(row.altitude),
            azimuth: row.azimuth ? parseFloat(row.azimuth) : null,
            declination: row.declination ? parseFloat(row.declination) : null,
            rightAscension: row.right_ascension ? parseFloat(row.right_ascension) : null,
            velocity: row.velocity ? parseFloat(row.velocity) : null,
            visibility: row.visibility || null
          };

          const data = await storage.createTelemetryData(telemetryData);
          processedData.push(data);
        } catch (error) {
          console.warn(`Skipping invalid row ${i}:`, error);
        }
      }

      res.json({ 
        message: `Successfully processed ${processedData.length} records`,
        processedCount: processedData.length,
        totalRows: lines.length - 1
      });
    } catch (error) {
      console.error("CSV upload error:", error);
      res.status(500).json({ error: "Failed to process CSV data" });
    }
  });

  // Export telemetry data
  app.get("/api/satellites/:id/export", async (req, res) => {
    try {
      const satelliteId = parseInt(req.params.id);
      const format = req.query.format || 'csv';
      const hours = parseInt(req.query.hours as string) || 24;
      
      const telemetryData = await storage.getTelemetryHistory(satelliteId, hours);
      const satellite = await storage.getSatellite(satelliteId);
      
      if (format === 'csv') {
        const headers = 'timestamp,latitude,longitude,altitude,azimuth,declination,velocity,visibility\n';
        const csv = telemetryData.map(data => 
          `${data.timestamp},${data.latitude},${data.longitude},${data.altitude},${data.azimuth || ''},${data.declination || ''},${data.velocity || ''},${data.visibility || ''}`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${satellite?.name || 'satellite'}_telemetry.csv"`);
        res.send(headers + csv);
      } else {
        res.json({
          satellite,
          telemetryData,
          exportTime: new Date().toISOString(),
          dataPoints: telemetryData.length
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  return httpServer;
}
