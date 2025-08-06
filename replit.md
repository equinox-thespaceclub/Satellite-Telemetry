# Advanced Satellite Telemetry Dashboard

## Overview

This is a sophisticated satellite tracking dashboard built with a modern full-stack architecture. The application provides real-time satellite tracking, telemetry visualization, orbital predictions, and multi-satellite monitoring capabilities. It's designed as a comprehensive space monitoring platform with an interactive map interface, real-time data updates, and advanced analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend, backend, and shared components:

- **Frontend**: React with TypeScript, built using Vite
- **Backend**: Express.js server with WebSocket support
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with Radix UI components
- **Real-time Communication**: WebSockets for live telemetry updates
- **Maps**: Leaflet.js for satellite tracking visualization
- **Charts**: Chart.js for telemetry data visualization

## Key Components

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Vite** as the build tool for fast development and optimized production builds
- **shadcn/ui** component library based on Radix UI primitives
- **TanStack Query** for server state management and caching
- **Wouter** for lightweight client-side routing
- **Tailwind CSS** for utility-first styling

### Backend Architecture
- **Express.js** server handling REST API endpoints
- **WebSocket Server** for real-time telemetry broadcasts
- **In-memory storage** with interface for future database integration
- **Modular route handling** with comprehensive satellite and telemetry endpoints

### Database Schema
The application uses Drizzle ORM with PostgreSQL and defines several core entities:
- **Users**: Authentication and user management
- **Satellites**: Satellite catalog with NORAD IDs and metadata
- **Telemetry Data**: Real-time position, velocity, and status data
- **Satellite Passes**: Predicted visibility windows
- **Orbital Elements**: Keplerian orbital parameters for predictions

### UI Components
- **Interactive Map**: Leaflet-based world map with satellite tracking
- **Telemetry Dashboard**: Real-time data display with charts
- **Satellite List**: Filterable catalog with search capabilities
- **Data Management**: CSV import/export functionality
- **Notification System**: Real-time alerts for satellite events
- **System Status**: API health monitoring and configuration

## Data Flow

1. **Real-time Updates**: WebSocket connections broadcast telemetry updates from server to all connected clients
2. **API Communication**: REST endpoints handle CRUD operations for satellites, telemetry, and orbital data
3. **State Management**: TanStack Query manages server state with automatic caching and invalidation
4. **Data Processing**: Server processes telemetry data and triggers WebSocket broadcasts for real-time updates
5. **UI Updates**: React components automatically re-render when underlying data changes

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for Neon database
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **@tanstack/react-query**: Server state management
- **ws**: WebSocket implementation for real-time communication
- **express**: Web framework for API endpoints

### UI Libraries
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **leaflet**: Interactive mapping library
- **chart.js**: Data visualization library

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety and enhanced development experience
- **drizzle-kit**: Database migrations and schema management
- **@replit/vite-plugin-runtime-error-modal**: Development error handling

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

### Build Process
- **Development**: `npm run dev` starts both Vite dev server and Express backend
- **Production**: `npm run build` creates optimized frontend build and bundles backend
- **Database**: `npm run db:push` applies schema changes to PostgreSQL

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment setting (development/production)
- **REPL_ID**: Replit-specific configuration for development tools

### File Structure
- **client/**: Frontend React application
- **server/**: Backend Express application with routes and storage
- **shared/**: Common TypeScript types and database schema
- **dist/**: Production build output

The application uses a monorepo structure with clear separation of concerns, making it easy to develop, test, and deploy. The WebSocket integration provides real-time updates, while the modular component architecture makes the codebase maintainable and extensible.