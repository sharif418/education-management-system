# EduPro - Education Management System

## Overview

EduPro is a comprehensive education management system designed for single-tenant deployment (one institution per instance). Built with a Vite + React frontend and Express backend, it provides role-based access control for educational institutions including schools, madrasas, and colleges. The system supports multi-language functionality (English, Bengali, Arabic) and follows a template-based deployment strategy where each institution gets a customized copy deployed from Replit to VPS servers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **Vite** as the build tool and development server, configured for React with TypeScript
- **React 18+** with hooks-based component architecture
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query (React Query)** for server state management, caching, and data fetching

**UI & Styling**
- **Tailwind CSS** for utility-first styling with custom design system
- **Shadcn/ui** components (Radix UI primitives) following Material Design 3 principles
- **New York** style variant for component aesthetics
- Custom color system supporting light/dark modes with HSL color values
- Typography using Inter (UI), Poppins (Display), and Noto Sans (Arabic/Bengali)

**State Management Pattern**
- Server state managed via React Query with infinite stale time
- Form state handled by React Hook Form with Zod schema validation
- Authentication state derived from `/api/auth/user` endpoint query
- No global client state management library (Redux/Zustand) - relies on React Query cache

**Component Organization**
- Page components in `client/src/pages/`
- Reusable UI components in `client/src/components/`
- Shadcn components in `client/src/components/ui/`
- Custom hooks in `client/src/hooks/`

### Backend Architecture

**Server Framework**
- **Express.js** running on Node.js with TypeScript
- Session-based authentication using `express-session`
- PostgreSQL session store via `connect-pg-simple`
- Custom logging middleware for API request tracking

**Authentication System**
- **Replit Auth** (OAuth/OIDC) as the primary authentication provider
- OpenID Connect client implementation using `openid-client` library
- Passport.js strategy for auth flow integration
- User profile syncing: Replit profile → local database
- Role-based access control with 7 roles: SuperAdmin, Admin, Teacher, Student, Guardian, Accountant, Hostel Manager
- Session cookies with 1-week TTL, httpOnly and secure flags

**API Design**
- RESTful endpoints under `/api` prefix
- `isAuthenticated` middleware protecting all routes except auth endpoints
- Request/response pattern: Express handlers → Storage layer → Database
- Error handling with status code propagation (401 for unauthorized, 500 for server errors)

**Development Mode Features**
- Vite middleware integration for HMR in development
- Replit-specific plugins (cartographer, dev banner, runtime error overlay)
- HTML template transformation with Vite for React hydration

### Data Layer

**Database**
- **PostgreSQL** as the primary database (configured for Neon serverless via WebSocket)
- **Drizzle ORM** for type-safe database operations
- Schema-first approach with TypeScript types generated from schema

**Schema Organization** (`shared/schema.ts`)
- Sessions table for authentication state persistence
- Users table with role, profile data, and Replit OAuth fields
- Academic structure: Institutions → Academic Sessions → Classes → Sections → Subjects
- Operational data: Enrollments, Attendance, Notifications
- All tables use UUID primary keys (`gen_random_uuid()`)
- Timestamps (`createdAt`, `updatedAt`) on most entities

**Storage Abstraction**
- `IStorage` interface in `server/storage.ts` defining all data operations
- Separation of concerns: routes → storage interface → database
- Methods for CRUD operations on all entities
- Special methods like `getCurrentAcademicSession()`, `setCurrentAcademicSession()`

**Validation**
- Zod schemas derived from Drizzle tables via `drizzle-zod`
- Insert schemas validate incoming data on both client and server
- Form validation using `@hookform/resolvers` with Zod

### External Dependencies

**Authentication & Authorization**
- **Replit Auth** (OAuth/OIDC provider) - Primary authentication mechanism
- Environment variables required: `REPL_ID`, `ISSUER_URL`, `SESSION_SECRET`, `REPLIT_DOMAINS`

**Database**
- **Neon Serverless PostgreSQL** - Configured via `@neondatabase/serverless`
- WebSocket connection support (`ws` package for Node.js compatibility)
- Connection string via `DATABASE_URL` environment variable
- Drizzle Kit for migrations (`drizzle.config.ts`)

**UI Component Library**
- **Radix UI** - Headless accessible components (@radix-ui/* packages)
- Complete suite: Dialog, Dropdown, Select, Toast, Tooltip, Accordion, etc.

**Third-Party Services**
- Google Fonts API for web fonts (Inter, Poppins, Noto Sans families)
- Font loading optimized with preconnect hints

**Build & Development Tools**
- **esbuild** for server-side bundling in production
- **tsx** for TypeScript execution in development
- **Replit Vite plugins** for development experience (cartographer, dev-banner, runtime-error-modal)

**Session Storage**
- `connect-pg-simple` - PostgreSQL session store for express-session
- Automatic session table management in database