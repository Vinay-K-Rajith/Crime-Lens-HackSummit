# Crime Dashboard Application

## Overview

This is a comprehensive crime data visualization dashboard built with React, TypeScript, and Express.js. The application provides real-time crime statistics, analytics, and AI-powered insights for law enforcement and public safety organizations. It features an interactive dashboard with crime trend charts, district filtering, alert management, and data export capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system and dark mode theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts for data visualization and trend analysis

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful API endpoints for crime data operations
- **Development**: Hot module replacement via Vite integration
- **Storage**: In-memory storage implementation with interface for future database integration

### Data Storage Solutions
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Database**: PostgreSQL with Neon Database integration
- **Schema**: Comprehensive crime data model including users, categories, districts, incidents, alerts, and AI insights
- **Migrations**: Drizzle Kit for database schema management

### Component Architecture
- **Design System**: Consistent UI components with variant-based styling
- **Modularity**: Reusable components for charts, filters, cards, and panels
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Accessibility**: ARIA-compliant components with keyboard navigation

### Development Architecture
- **Monorepo Structure**: Shared schema and types between client and server
- **Path Aliases**: Clean import paths using TypeScript path mapping
- **Code Quality**: Strict TypeScript configuration with comprehensive type checking
- **Asset Management**: Optimized asset handling and font loading

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching

### UI and Styling
- **@radix-ui/***: Accessible UI primitives for complex components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library for consistent iconography

### Data Visualization
- **recharts**: React charting library for crime trend visualization
- **embla-carousel-react**: Carousel components for data presentation

### Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Enhanced error reporting in development

### Form and Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Runtime type validation and schema definition

### Session and Security
- **connect-pg-simple**: PostgreSQL session store
- **express-session**: Session management middleware

### Utilities
- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional CSS class composition
- **nanoid**: Unique ID generation