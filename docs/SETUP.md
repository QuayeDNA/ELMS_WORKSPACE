# ELMS Development Setup Guide

This guide will help you set up the complete ELMS (Exams Logistics Management System) development environment on your local machine.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js 20+** - [Download from nodejs.org](https://nodejs.org/)
- **npm 9+** (comes with Node.js)
- **Docker & Docker Compose** - [Download from docker.com](https://www.docker.com/get-started)
- **Git** - [Download from git-scm.com](https://git-scm.com/)

### Windows Users
- Use **PowerShell** or **Git Bash** for running commands
- Ensure Docker Desktop is running
- Consider using **WSL2** for better Docker performance

## Quick Setup

### 1. Automated Setup (Recommended)

Run the setup script to automatically configure everything:

```bash
# Make the script executable (Linux/Mac)
chmod +x setup.sh

# Run the setup script
./setup.sh
```

### 2. Manual Setup

If you prefer to set up manually or the script fails:

#### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install
npx prisma generate
cd ..

# Desktop App
cd desktop-app
npm install
cd ..

# Mobile App
cd mobile-app
npm install
cd ..
```

#### Step 2: Environment Configuration

```bash
# Copy environment templates
cp backend/.env.example backend/.env
```

Update `backend/.env` with your configuration:

```env
# Database (using Docker)
DATABASE_URL="postgresql://elms_user:password@localhost:5432/elms_dev"
REDIS_URL="redis://localhost:6379"

# Security (generate secure keys for production)
JWT_SECRET="your-super-secure-jwt-secret-key-here"
SESSION_SECRET="your-session-secret-key"

# Institution Settings
INSTITUTION_NAME="Your Institution Name"
INSTITUTION_CODE="INST"
INSTITUTION_DOMAIN="localhost"
```

#### Step 3: Start Database Services

```bash
# Start PostgreSQL, Redis, and MinIO
docker-compose up -d postgres redis minio

# Wait for services to start (about 30 seconds)
# Then run database migrations
cd backend
npx prisma migrate dev --name init
npx prisma db seed  # Optional: seed with sample data
cd ..
```

## Development Workflow

### Starting the Development Servers

Open multiple terminal windows/tabs:

**Terminal 1 - Backend API:**
```bash
cd backend
npm run dev
```
- API will be available at: http://localhost:3000
- API documentation: http://localhost:3000/api/docs
- Health check: http://localhost:3000/api/health

**Terminal 2 - Desktop Application:**
```bash
cd desktop-app
npm run dev
```
- Electron app will open automatically
- Hot reload enabled for development

**Terminal 3 - Mobile Application:**
```bash
cd mobile-app
npm start
```
- Expo development server will start
- Use Expo Go app to test on physical device
- Or use iOS Simulator / Android Emulator

### Additional Services

**Database Management:**
```bash
cd backend
npm run db:studio  # Opens Prisma Studio at http://localhost:5555
```

**Monitoring & Analytics:**
- Grafana: http://localhost:3001 (admin/admin123)
- Prometheus: http://localhost:9090
- MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)

## Project Structure

```
ELMS_WORKSPACE/
├── backend/                 # Node.js API server
│   ├── src/                # Source code
│   ├── prisma/             # Database schema & migrations
│   ├── logs/               # Application logs
│   └── uploads/            # File uploads
├── desktop-app/            # Electron desktop application
│   ├── src/               # React source code
│   └── assets/            # Desktop app assets
├── mobile-app/             # React Native mobile app
│   ├── src/               # Mobile app source code
│   └── assets/            # Mobile app assets
├── infrastructure/         # Docker, Nginx, monitoring configs
│   ├── nginx/             # Reverse proxy configuration
│   ├── prometheus/        # Monitoring configuration
│   └── grafana/           # Dashboard configuration
├── docs/                  # Documentation
├── docker-compose.yml     # Development services
└── setup.sh              # Automated setup script
```

## Common Commands

### Backend Development
```bash
cd backend

# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run test            # Run tests
npm run lint            # Run linter

# Database
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with sample data
npm run db:studio       # Open Prisma Studio
npm run db:generate     # Generate Prisma client
```

### Desktop App Development
```bash
cd desktop-app

# Development
npm run dev             # Start development mode
npm run build          # Build for production
npm run package        # Package as executable
npm run make           # Create installer packages
```

### Mobile App Development
```bash
cd mobile-app

# Development
npm start              # Start Expo development server
npm run android        # Start Android development
npm run ios           # Start iOS development
npm run web           # Start web development

# Building
npm run build:android  # Build Android APK
npm run build:ios     # Build iOS app
```

### Docker Services
```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d postgres redis

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Reset database (WARNING: This will delete all data)
docker-compose down -v
docker-compose up -d postgres
cd backend && npx prisma migrate reset
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   - Backend (3000), Desktop (3001), Mobile (19006), Database (5432)
   - Stop other services or change ports in configuration

2. **Database connection errors:**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres
   
   # Restart database service
   docker-compose restart postgres
   ```

3. **Prisma client errors:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

4. **Node modules issues:**
   ```bash
   # Clear node modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

5. **Mobile app not connecting to API:**
   - Update API base URL in mobile app configuration
   - Ensure your computer and mobile device are on the same network
   - Use your computer's IP address instead of localhost

### Windows-Specific Issues

1. **Docker not starting:**
   - Ensure Docker Desktop is running
   - Enable WSL2 integration
   - Check Hyper-V is enabled

2. **Script execution policy:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Line ending issues:**
   ```bash
   git config core.autocrlf true
   ```

## Production Deployment

For production deployment instructions, see:
- [Network Security Deployment Guide](../infrastructure/deployment-guide.md)
- [Docker Production Setup](../infrastructure/docker-production.yml)
- [Kubernetes Deployment](../infrastructure/k8s/)

## Getting Help

- **Documentation:** Check the `docs/` directory
- **API Reference:** http://localhost:3000/api/docs (when backend is running)
- **Issues:** Create an issue in the project repository
- **Community:** Join the ELMS community discussions

## Next Steps

1. **Explore the codebase:** Start with `backend/src/server.ts` and `desktop-app/src/main.ts`
2. **Read the API documentation:** Available at http://localhost:3000/api/docs
3. **Check the database schema:** Located in `backend/prisma/schema.prisma`
4. **Test the applications:** Use the sample data created by the seed script
5. **Customize for your institution:** Update configuration files and branding

Happy coding! 🎓
