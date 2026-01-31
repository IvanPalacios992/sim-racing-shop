# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SimRacing Shop is an e-commerce platform for customizable sim racing hardware with an interactive 3D viewer. Monorepo with Next.js frontend and .NET 10 backend.

## Development Commands

### Infrastructure (Docker)
```bash
docker-compose up -d              # Start PostgreSQL, Redis, pgAdmin, Seq
docker-compose down -v            # Stop and remove volumes
```

### Frontend (Next.js 16 - in frontend/)
```bash
npm run dev                       # Development server → localhost:3000
npm run build                     # Production build
npm run lint                      # ESLint
npm run test                      # Vitest unit tests
npm run test:e2e                  # Playwright E2E tests
npm run type-check                # TypeScript checking
```

### Backend (.NET 10 - in backend/)
```bash
dotnet run --project src/SimRacingShop.API    # Run API → localhost:5000
dotnet watch run --project src/SimRacingShop.API  # Run with hot reload
dotnet build                                   # Build solution
dotnet test                                    # Run all tests
dotnet ef migrations add <Name> --project src/SimRacingShop.Infrastructure --startup-project src/SimRacingShop.API
dotnet ef database update --project src/SimRacingShop.Infrastructure --startup-project src/SimRacingShop.API
```

## Architecture

### Backend (Clean Architecture)
- **SimRacingShop.API**: Controllers, middleware, Program.cs configuration
- **SimRacingShop.Core**: Domain entities (User, Product, Order), DTOs, settings
- **SimRacingShop.Infrastructure**: EF Core DbContext, repositories, external services

### Frontend (Next.js App Router)
- **src/app/**: Routes and pages (no Pages Router)
- **src/components/**: Reusable React components
- **src/lib/**: Utilities, API clients, configurations
- **src/stores/**: Zustand state management

### Key Technologies
- **Frontend**: React 19, Tailwind CSS 4, React Three Fiber (3D), Zustand, next-intl (i18n)
- **Backend**: ASP.NET Identity + JWT auth, EF Core + PostgreSQL, Serilog logging
- **Testing**: Vitest + Playwright (frontend), xUnit + Testcontainers (backend)

## Development URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Swagger: http://localhost:5000/swagger
- pgAdmin: http://localhost:5433
- Seq (logs): http://localhost:5341

## Database
- PostgreSQL 16: localhost:5432 (user: postgres, password: postgres, db: simracing)
- Redis 7: localhost:6379

## Git Workflow
- **main**: Production (protected)
- **develop**: Staging/integration
- **feature/***: Feature branches (from develop)
- **Commits**: Conventional format - `feat(scope): description`, `fix(scope): description`

## Configuration
- Backend: `appsettings.Development.json` (copy from `appsettings.example.json`)
- Frontend: `.env.local` (copy from `.env.example`)

### Required Environment Variables (Backend)

**Admin Seed** - Initial admin user (required on first run, error if not set and no admin exists):
| Variable | Description |
|----------|-------------|
| `AdminSeed__Email` | Admin user email |
| `AdminSeed__Password` | Admin user password (min 8 chars, uppercase, lowercase, digit) |
| `AdminSeed__FirstName` | Admin first name (optional, default: "Admin") |
| `AdminSeed__LastName` | Admin last name (optional, default: "SimRacing") |
