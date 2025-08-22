# 🎓 ELMS - Exams Logistics Management System

A comprehensive, modern examination management platform designed for educational institutions. Built with cutting-edge technologies to provide seamless coordination between administrators, faculty officers, invigilators, script handlers, and students.

![ELMS Banner](docs/assets/elms-banner.png)

## 🌟 Key Features

- **📊 Real-time Dashboard** - Live monitoring of exams, scripts, and incidents
- **📱 Cross-platform Apps** - Desktop, mobile, and web applications
- **🔍 Script Tracking** - QR code-based script lifecycle management
- **🚨 Incident Management** - Comprehensive incident reporting and resolution
- **👥 User Management** - Role-based access control with multiple user types
- **📈 Analytics & Reporting** - Detailed insights and performance metrics
- **🔒 Network Security** - IP-based access control and enterprise-grade security
- **🌐 Offline Support** - Mobile apps work offline with sync capabilities

## 🏗️ System Architecture

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Frontend Apps     │    │     Backend API     │    │    Data Storage     │
├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤
│ • React Desktop     │    │ • Node.js/Express   │    │ • PostgreSQL        │
│ • React Native     │◄───┤ • GraphQL/REST APIs │◄───┤ • Redis Cache       │
│ • Progressive Web  │    │ • Socket.IO         │    │ • File Storage      │
│ • Admin Dashboard  │    │ • Microservices     │    │ • Search Engine     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## 💻 Technology Stack

### Backend
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js with GraphQL (Apollo Server)
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Cache**: Redis 7+ for sessions and real-time data
- **Real-time**: Socket.IO for live updates
- **Authentication**: JWT with multi-factor support
- **File Storage**: AWS S3 compatible (MinIO for local)

### Frontend
- **Desktop**: Electron + React + TypeScript
- **Mobile**: React Native + Expo SDK
- **UI Framework**: Modern component libraries (shadcn/ui, React Native Paper)
- **State Management**: Zustand (Desktop), Redux Toolkit (Mobile)
- **Styling**: Tailwind CSS with responsive design

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx with SSL termination
- **Monitoring**: Prometheus + Grafana
- **CI/CD**: GitHub Actions
- **Security**: Network-level restrictions, SSL/TLS encryption

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **Docker** - [Download](https://docker.com/get-started)
- **Git** - [Download](https://git-scm.com/)

### Automated Setup

#### Windows (PowerShell)
```powershell
# Clone the repository
git clone <repository-url>
cd ELMS_WORKSPACE

# Run setup script
.\setup.ps1
```

#### Linux/macOS (Bash)
```bash
# Clone the repository
git clone <repository-url>
cd ELMS_WORKSPACE

# Make script executable and run
chmod +x setup.sh
./setup.sh
```

### Manual Setup

1. **Install Dependencies**
   ```bash
   # Backend
   cd backend && npm install && npx prisma generate
   
   # Desktop App
   cd ../desktop-app && npm install
   
   # Mobile App  
   cd ../mobile-app && npm install
   ```

2. **Setup Environment**
   ```bash
   cp backend/.env.example backend/.env
   # Update backend/.env with your configuration
   ```

3. **Start Services**
   ```bash
   # Start database services
   docker-compose up -d postgres redis minio
   
   # Run migrations
   cd backend && npx prisma migrate dev --name init
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend API
   cd backend && npm run dev
   
   # Terminal 2 - Desktop App
   cd desktop-app && npm run dev
   
   # Terminal 3 - Mobile App
   cd mobile-app && npm start
   ```

## 📁 Project Structure

```
ELMS_WORKSPACE/
├── 📁 backend/                  # Node.js API server
│   ├── 📁 src/                 # Source code
│   │   ├── 📁 controllers/     # Route controllers
│   │   ├── 📁 services/        # Business logic
│   │   ├── 📁 middleware/      # Express middleware
│   │   ├── 📁 models/          # Data models
│   │   └── 📁 utils/           # Utility functions
│   ├── 📁 prisma/              # Database schema & migrations
│   └── 📄 package.json         # Dependencies & scripts
├── 📁 desktop-app/             # Electron desktop application
│   ├── 📁 src/                 # React source code
│   │   ├── 📁 components/      # Reusable components
│   │   ├── 📁 pages/           # Application pages
│   │   ├── 📁 hooks/           # Custom React hooks
│   │   └── 📁 utils/           # Utility functions
│   └── 📄 package.json         # Dependencies & scripts
├── 📁 mobile-app/              # React Native mobile app
│   ├── 📁 src/                 # Mobile app source code
│   │   ├── 📁 screens/         # Application screens
│   │   ├── 📁 components/      # Reusable components
│   │   ├── 📁 navigation/      # Navigation configuration
│   │   └── 📁 services/        # API services
│   └── 📄 package.json         # Dependencies & scripts
├── 📁 infrastructure/          # DevOps & deployment configs
│   ├── 📁 nginx/               # Reverse proxy configuration
│   ├── 📁 prometheus/          # Monitoring configuration
│   └── 📁 k8s/                 # Kubernetes manifests
├── 📁 docs/                    # Documentation
│   ├── 📄 SETUP.md             # Development setup guide
│   ├── 📄 API.md               # API documentation
│   └── 📄 DEPLOYMENT.md        # Deployment guide
├── 📄 docker-compose.yml       # Development services
├── 📄 setup.sh                 # Linux/Mac setup script
├── 📄 setup.ps1                # Windows setup script
└── 📄 README.md                # This file
```

## 🔧 Development

### Available Scripts

#### Backend (`cd backend`)
```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run test            # Run tests
npm run lint            # Run linter
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with sample data
npm run db:studio       # Open Prisma Studio
```

#### Desktop App (`cd desktop-app`)
```bash
npm run dev             # Start development mode
npm run build          # Build for production
npm run package        # Package as executable
npm run make           # Create installer packages
npm run test           # Run tests
```

#### Mobile App (`cd mobile-app`)
```bash
npm start              # Start Expo development server
npm run android        # Start Android development
npm run ios           # Start iOS development
npm run web           # Start web development
npm run build:android  # Build Android APK
npm run build:ios     # Build iOS app
```

### Development URLs

When all services are running:

- **API Server**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **API Health Check**: http://localhost:3000/api/health
- **Database Studio**: http://localhost:5555 (run `npm run db:studio`)
- **Grafana Dashboard**: http://localhost:3001 (admin/admin123)
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin123)

## 👥 User Roles

| Role | Description | Access Level |
|------|-------------|-------------|
| **Super Admin** | System administrator | Full system access |
| **Admin** | Institution administrator | Institution-wide access |
| **Faculty Officer** | Faculty-level management | Faculty-specific access |
| **Exam Coordinator** | Exam planning & coordination | Exam management access |
| **Invigilator** | Exam supervision | Exam monitoring access |
| **Script Handler** | Script movement tracking | Script handling access |
| **Lecturer** | Course instructor | Course-specific access |
| **Student** | Exam participant | Personal exam info access |

## 🔒 Security Features

- **Network-level Security**: IP whitelist and network segmentation
- **Authentication**: Multi-factor authentication with JWT tokens
- **Authorization**: Role-based access control with granular permissions
- **Data Encryption**: AES-256 encryption at rest, TLS 1.3 in transit
- **Audit Logging**: Comprehensive activity tracking and monitoring
- **Session Management**: Secure session handling with Redis
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: API throttling and DDoS protection

## 📊 Core Modules

### 1. Examination Management
- Exam scheduling and timetable generation
- Venue and resource allocation
- Student registration and attendance tracking
- Special requirements handling

### 2. Script Tracking
- QR code generation and scanning
- Real-time script location tracking
- Batch management for efficient handling
- Movement history and audit trails

### 3. Incident Management
- Real-time incident reporting
- Evidence collection and management
- Workflow automation and escalation
- Resolution tracking and analytics

### 4. User Management
- Role-based access control
- Multi-factor authentication
- Device management and security
- Activity monitoring and audit logs

### 5. Analytics & Reporting
- Real-time dashboards and metrics
- Customizable reports and exports
- Performance analytics and insights
- Trend analysis and predictions

## 🌐 Deployment Options

### Development
- Local development with Docker Compose
- Hot reload and debugging capabilities
- Sample data and test environments

### Staging
- Docker containers with orchestration
- CI/CD pipeline integration
- Performance testing and monitoring

### Production
- Kubernetes deployment with scaling
- Network security and access controls
- High availability and disaster recovery
- Comprehensive monitoring and alerting

## 📚 Documentation

- **[Setup Guide](docs/SETUP.md)** - Development environment setup
- **[API Documentation](docs/API.md)** - REST and GraphQL API reference
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[User Manual](docs/USER_MANUAL.md)** - End-user documentation
- **[Architecture Guide](docs/ARCHITECTURE.md)** - System architecture details
- **[Security Guide](docs/SECURITY.md)** - Security implementation details

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **📖 Documentation**: Check the `docs/` directory
- **🐛 Issues**: [Create an issue](../../issues) for bug reports
- **💬 Discussions**: [Join discussions](../../discussions) for questions
- **📧 Email**: support@elms-system.com
- **🌐 Website**: https://elms-system.com

## 🙏 Acknowledgments

- Built for educational institutions worldwide
- Inspired by modern examination management needs
- Powered by open-source technologies
- Designed with security and accessibility in mind

---

**Made with ❤️ for Educational Excellence**

*Transform your examination management with ELMS - where technology meets education.*
