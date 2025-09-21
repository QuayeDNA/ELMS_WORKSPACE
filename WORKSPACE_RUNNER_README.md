# ELMS Workspace Runner

A comprehensive development environment manager for the **ELMS Examination Logistics Management System** that orchestrates multiple platforms with beautiful ASCII art and concurrent execution.

## Features

- **Beautiful Interface**: ASCII art banner, color-coded output, interactive menu
- **Concurrent Execution**: Run all services simultaneously with smart resource management
- **Multi-Platform Support**: Backend (Node.js), Frontend (React/Electron), Mobile (Expo)
- **Comprehensive Tooling**: Development servers, builds, testing, database tools

## Quick Start

1. Install dependencies: `npm run install:all`
2. Setup database: `npm run db:setup`
3. Start interactive runner: `npm start`

## Commands

### Interactive Mode

```bash
npm start              # Launch interactive menu
npm run runner         # Same as above
npm run help           # Show help information
```

### Development

```bash
npm run dev            # Start all services concurrently
npm run dev:backend    # Backend only
npm run dev:frontend   # Frontend only
npm run dev:mobile     # Mobile only
```

### Building & Testing

```bash
npm run build          # Build all platforms
npm run test           # Run tests and linting
npm run lint           # Lint all platforms
```

### Database

```bash
npm run db:setup       # Initialize database
npm run db:migrate     # Run migrations
npm run db:studio      # Open Prisma Studio
```

### Maintenance

```bash
npm run install:all    # Install all dependencies
npm run clean          # Clean build artifacts
```

## Platforms

- **Backend**: Node.js/Express with TypeScript, Prisma ORM
- **Frontend**: React 18 with Vite, Electron desktop app
- **Mobile**: React Native with Expo

## Configuration

Create `.env` files in each platform directory with appropriate environment variables.
