export interface SatellitePosition {
  latitude: number;
  longitude: number;
  altitude: number;
  timestamp: Date;
}

export interface OrbitalElements {
  semiMajorAxis: number;
  eccentricity: number;
  inclination: number;
  raan: number;
  argPerigee: number;
  meanAnomaly: number;
  period: number;
}

export const EARTH_RADIUS_KM = 6371;

export function calculateDistance(pos1: SatellitePosition, pos2: SatellitePosition): number {
  const lat1Rad = (pos1.latitude * Math.PI) / 180;
  const lat2Rad = (pos2.latitude * Math.PI) / 180;
  const deltaLat = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
  const deltaLon = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
           Math.cos(lat1Rad) * Math.cos(lat2Rad) *
           Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function calculateVelocity(pos1: SatellitePosition, pos2: SatellitePosition): number {
  const distance = calculateDistance(pos1, pos2);
  const timeDiff = (pos2.timestamp.getTime() - pos1.timestamp.getTime()) / 1000; // seconds
  return (distance / timeDiff) * 3600; // km/h
}

export function predictNextPass(orbital: OrbitalElements, observerLat: number, observerLon: number): Date {
  // Simplified pass prediction - in a real implementation, this would use complex orbital mechanics
  const orbitalPeriod = orbital.period || 90; // minutes
  const currentTime = new Date();
  const nextPassTime = new Date(currentTime.getTime() + orbitalPeriod * 60 * 1000);
  return nextPassTime;
}

export function calculateElevation(satLat: number, satLon: number, satAlt: number, obsLat: number, obsLon: number): number {
  // Simplified elevation calculation
  const distance = calculateDistance(
    { latitude: satLat, longitude: satLon, altitude: satAlt, timestamp: new Date() },
    { latitude: obsLat, longitude: obsLon, altitude: 0, timestamp: new Date() }
  );
  
  const elevation = Math.atan2(satAlt, distance) * (180 / Math.PI);
  return Math.max(0, elevation);
}

export function formatCoordinate(coord: number, type: 'lat' | 'lon'): string {
  const abs = Math.abs(coord);
  const degrees = Math.floor(abs);
  const minutes = Math.floor((abs - degrees) * 60);
  const seconds = ((abs - degrees - minutes / 60) * 3600).toFixed(1);
  
  const direction = type === 'lat' 
    ? (coord >= 0 ? 'N' : 'S')
    : (coord >= 0 ? 'E' : 'W');
  
  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

export function isVisiblePass(elevation: number, minElevation: number = 10): boolean {
  return elevation >= minElevation;
}

export function getSatelliteStatus(visibility: string, elevation: number): 'visible' | 'eclipse' | 'hidden' {
  if (visibility === 'eclipse') return 'eclipse';
  if (elevation < 10) return 'hidden';
  return 'visible';
}
