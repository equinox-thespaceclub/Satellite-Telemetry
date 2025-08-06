import { 
  users, satellites, telemetryData, satellitePasses, orbitalElements,
  type User, type InsertUser, type Satellite, type InsertSatellite,
  type TelemetryData, type InsertTelemetryData, type SatellitePass, 
  type InsertSatellitePass, type OrbitalElements, type InsertOrbitalElements
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Satellite methods
  getAllSatellites(): Promise<Satellite[]>;
  getSatellite(id: number): Promise<Satellite | undefined>;
  getSatelliteByNoradId(noradId: number): Promise<Satellite | undefined>;
  createSatellite(satellite: InsertSatellite): Promise<Satellite>;
  updateSatellite(id: number, satellite: Partial<InsertSatellite>): Promise<Satellite | undefined>;
  
  // Telemetry methods
  getLatestTelemetry(satelliteId: number): Promise<TelemetryData | undefined>;
  getTelemetryHistory(satelliteId: number, hours?: number): Promise<TelemetryData[]>;
  createTelemetryData(data: InsertTelemetryData): Promise<TelemetryData>;
  
  // Pass prediction methods
  getUpcomingPasses(satelliteId?: number, hours?: number): Promise<SatellitePass[]>;
  createSatellitePass(pass: InsertSatellitePass): Promise<SatellitePass>;
  
  // Orbital elements methods
  getLatestOrbitalElements(satelliteId: number): Promise<OrbitalElements | undefined>;
  createOrbitalElements(elements: InsertOrbitalElements): Promise<OrbitalElements>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private satellites: Map<number, Satellite>;
  private telemetryData: Map<number, TelemetryData>;
  private satellitePasses: Map<number, SatellitePass>;
  private orbitalElements: Map<number, OrbitalElements>;
  private currentUserId: number;
  private currentSatelliteId: number;
  private currentTelemetryId: number;
  private currentPassId: number;
  private currentOrbitalId: number;

  constructor() {
    this.users = new Map();
    this.satellites = new Map();
    this.telemetryData = new Map();
    this.satellitePasses = new Map();
    this.orbitalElements = new Map();
    this.currentUserId = 1;
    this.currentSatelliteId = 1;
    this.currentTelemetryId = 1;
    this.currentPassId = 1;
    this.currentOrbitalId = 1;
    
    this.initializeDefaultSatellites();
  }

  private initializeDefaultSatellites() {
    const defaultSatellites = [
      { noradId: 25544, name: "ISS (ZARYA)", category: "Space Station", country: "ISS", isActive: true, launchDate: "1998-11-20" },
      { noradId: 28654, name: "NOAA-18", category: "Weather", country: "US", isActive: true, launchDate: "2005-05-20" },
      { noradId: 20580, name: "HUBBLE SPACE TELESCOPE", category: "Space Telescope", country: "US", isActive: true, launchDate: "1990-04-24" },
      { noradId: 43013, name: "STARLINK-1007", category: "Communication", country: "US", isActive: true, launchDate: "2019-11-11" },
      { noradId: 39084, name: "WORLDVIEW-2", category: "Earth Resources", country: "US", isActive: true, launchDate: "2009-10-08" },
    ];

    defaultSatellites.forEach(sat => {
      const satellite: Satellite = { ...sat, id: this.currentSatelliteId++ };
      this.satellites.set(satellite.id, satellite);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllSatellites(): Promise<Satellite[]> {
    return Array.from(this.satellites.values()).filter(sat => sat.isActive);
  }

  async getSatellite(id: number): Promise<Satellite | undefined> {
    return this.satellites.get(id);
  }

  async getSatelliteByNoradId(noradId: number): Promise<Satellite | undefined> {
    return Array.from(this.satellites.values()).find(sat => sat.noradId === noradId);
  }

  async createSatellite(insertSatellite: InsertSatellite): Promise<Satellite> {
    const id = this.currentSatelliteId++;
    const satellite: Satellite = { 
      id,
      noradId: insertSatellite.noradId,
      name: insertSatellite.name,
      category: insertSatellite.category || null,
      launchDate: insertSatellite.launchDate || null,
      country: insertSatellite.country || null,
      isActive: insertSatellite.isActive ?? true
    };
    this.satellites.set(id, satellite);
    return satellite;
  }

  async updateSatellite(id: number, updates: Partial<InsertSatellite>): Promise<Satellite | undefined> {
    const satellite = this.satellites.get(id);
    if (!satellite) return undefined;
    
    const updated = { ...satellite, ...updates };
    this.satellites.set(id, updated);
    return updated;
  }

  async getLatestTelemetry(satelliteId: number): Promise<TelemetryData | undefined> {
    const telemetryList = Array.from(this.telemetryData.values())
      .filter(data => data.satelliteId === satelliteId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return telemetryList[0];
  }

  async getTelemetryHistory(satelliteId: number, hours: number = 24): Promise<TelemetryData[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return Array.from(this.telemetryData.values())
      .filter(data => 
        data.satelliteId === satelliteId && 
        new Date(data.timestamp) >= cutoff
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createTelemetryData(insertData: InsertTelemetryData): Promise<TelemetryData> {
    const id = this.currentTelemetryId++;
    const data: TelemetryData = { 
      id,
      satelliteId: insertData.satelliteId || null,
      timestamp: insertData.timestamp,
      latitude: insertData.latitude,
      longitude: insertData.longitude,
      altitude: insertData.altitude,
      azimuth: insertData.azimuth || null,
      declination: insertData.declination || null,
      rightAscension: insertData.rightAscension || null,
      velocity: insertData.velocity || null,
      visibility: insertData.visibility || null
    };
    this.telemetryData.set(id, data);
    return data;
  }

  async getUpcomingPasses(satelliteId?: number, hours: number = 24): Promise<SatellitePass[]> {
    const now = new Date();
    const future = new Date(now.getTime() + hours * 60 * 60 * 1000);
    
    return Array.from(this.satellitePasses.values())
      .filter(pass => {
        const passTime = new Date(pass.startTime);
        const matchesSatellite = !satelliteId || pass.satelliteId === satelliteId;
        const inTimeRange = passTime >= now && passTime <= future;
        return matchesSatellite && inTimeRange;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  async createSatellitePass(insertPass: InsertSatellitePass): Promise<SatellitePass> {
    const id = this.currentPassId++;
    const pass: SatellitePass = { 
      id,
      satelliteId: insertPass.satelliteId || null,
      startTime: insertPass.startTime,
      endTime: insertPass.endTime,
      maxElevation: insertPass.maxElevation,
      direction: insertPass.direction || null,
      magnitude: insertPass.magnitude || null
    };
    this.satellitePasses.set(id, pass);
    return pass;
  }

  async getLatestOrbitalElements(satelliteId: number): Promise<OrbitalElements | undefined> {
    const elements = Array.from(this.orbitalElements.values())
      .filter(elem => elem.satelliteId === satelliteId)
      .sort((a, b) => new Date(b.epoch).getTime() - new Date(a.epoch).getTime());
    
    return elements[0];
  }

  async createOrbitalElements(insertElements: InsertOrbitalElements): Promise<OrbitalElements> {
    const id = this.currentOrbitalId++;
    const elements: OrbitalElements = { 
      id,
      satelliteId: insertElements.satelliteId || null,
      epoch: insertElements.epoch,
      meanMotion: insertElements.meanMotion,
      eccentricity: insertElements.eccentricity,
      inclination: insertElements.inclination,
      raan: insertElements.raan,
      argPerigee: insertElements.argPerigee,
      meanAnomaly: insertElements.meanAnomaly,
      bstarDrag: insertElements.bstarDrag || null,
      period: insertElements.period || null
    };
    this.orbitalElements.set(id, elements);
    return elements;
  }
}

export const storage = new MemStorage();
