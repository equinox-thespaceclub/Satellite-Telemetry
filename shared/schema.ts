import { pgTable, text, serial, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const satellites = pgTable("satellites", {
  id: serial("id").primaryKey(),
  noradId: integer("norad_id").notNull().unique(),
  name: text("name").notNull(),
  category: text("category"),
  launchDate: text("launch_date"),
  country: text("country"),
  isActive: boolean("is_active").default(true),
});

export const telemetryData = pgTable("telemetry_data", {
  id: serial("id").primaryKey(),
  satelliteId: integer("satellite_id").references(() => satellites.id),
  timestamp: timestamp("timestamp").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  altitude: real("altitude").notNull(),
  azimuth: real("azimuth"),
  declination: real("declination"),
  rightAscension: real("right_ascension"),
  velocity: real("velocity"),
  visibility: text("visibility"),
});

export const satellitePasses = pgTable("satellite_passes", {
  id: serial("id").primaryKey(),
  satelliteId: integer("satellite_id").references(() => satellites.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  maxElevation: real("max_elevation").notNull(),
  direction: text("direction"),
  magnitude: real("magnitude"),
});

export const orbitalElements = pgTable("orbital_elements", {
  id: serial("id").primaryKey(),
  satelliteId: integer("satellite_id").references(() => satellites.id),
  epoch: timestamp("epoch").notNull(),
  meanMotion: real("mean_motion").notNull(),
  eccentricity: real("eccentricity").notNull(),
  inclination: real("inclination").notNull(),
  raan: real("raan").notNull(),
  argPerigee: real("arg_perigee").notNull(),
  meanAnomaly: real("mean_anomaly").notNull(),
  bstarDrag: real("bstar_drag"),
  period: real("period"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSatelliteSchema = createInsertSchema(satellites).omit({
  id: true,
});

export const insertTelemetrySchema = createInsertSchema(telemetryData).omit({
  id: true,
});

export const insertPassSchema = createInsertSchema(satellitePasses).omit({
  id: true,
});

export const insertOrbitalElementsSchema = createInsertSchema(orbitalElements).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Satellite = typeof satellites.$inferSelect;
export type InsertSatellite = z.infer<typeof insertSatelliteSchema>;
export type TelemetryData = typeof telemetryData.$inferSelect;
export type InsertTelemetryData = z.infer<typeof insertTelemetrySchema>;
export type SatellitePass = typeof satellitePasses.$inferSelect;
export type InsertSatellitePass = z.infer<typeof insertPassSchema>;
export type OrbitalElements = typeof orbitalElements.$inferSelect;
export type InsertOrbitalElements = z.infer<typeof insertOrbitalElementsSchema>;
