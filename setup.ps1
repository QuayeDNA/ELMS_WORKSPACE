# ELMS Development Setup Script for Windows PowerShell
# This script sets up the development environment for ELMS on Windows

param(
    [switch]$SkipDocker,
    [switch]$SkipMobile,
    [switch]$Help
)

# Colors for output
$RED = "Red"
$GREEN = "Green"
$YELLOW = "Yellow"
$BLUE = "Blue"

function Write-Step {
    param($Message)
    Write-Host "`n==> $Message" -ForegroundColor $BLUE
}

function Write-Success {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor $GREEN
}

function Write-Warning {
    param($Message)
    Write-Host "⚠ $Message" -ForegroundColor $YELLOW
}

function Write-Error {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor $RED
}

function Show-Help {
    Write-Host @"
ELMS Development Setup Script for Windows

USAGE:
    .\setup.ps1 [OPTIONS]

OPTIONS:
    -SkipDocker    Skip Docker setup (useful if Docker is not available)
    -SkipMobile    Skip mobile app setup
    -Help          Show this help message

EXAMPLES:
    .\setup.ps1                    # Full setup
    .\setup.ps1 -SkipDocker       # Setup without Docker
    .\setup.ps1 -SkipMobile       # Setup without mobile app
"@
}

function Test-Prerequisites {
    Write-Step "Checking prerequisites..."
    
    $allGood = $true
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js found: $nodeVersion"
        
        $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
        if ($versionNumber -ge 20) {
            Write-Success "Node.js version is compatible"
        } else {
            Write-Error "Node.js version must be 20 or higher. Please upgrade."
            $allGood = $false
        }
    } catch {
        Write-Error "Node.js not found. Please install Node.js 20+ from https://nodejs.org/"
        $allGood = $false
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Success "npm found: $npmVersion"
    } catch {
        Write-Error "npm not found. Please install npm."
        $allGood = $false
    }
    
    # Check Docker (if not skipping)
    if (-not $SkipDocker) {
        try {
            $dockerVersion = docker --version
            Write-Success "Docker found: $dockerVersion"
        } catch {
            Write-Warning "Docker not found. You'll need Docker for database services."
            Write-Warning "Install Docker Desktop from https://docker.com/get-started"
            Write-Warning "Or use -SkipDocker flag to skip Docker setup"
        }
        
        try {
            docker compose version | Out-Null
            Write-Success "Docker Compose found"
        } catch {
            try {
                docker-compose --version | Out-Null
                Write-Success "Docker Compose found (legacy)"
            } catch {
                Write-Warning "Docker Compose not found. You'll need it for the full development setup."
            }
        }
    }
    
    # Check Git
    try {
        $gitVersion = git --version
        Write-Success "Git found: $gitVersion"
    } catch {
        Write-Error "Git not found. Please install Git."
        $allGood = $false
    }
    
    if (-not $allGood) {
        Write-Error "Prerequisites check failed. Please install missing software and try again."
        exit 1
    }
}

function Set-Environment {
    Write-Step "Setting up environment files..."
    
    # Backend environment
    if (-not (Test-Path "backend\.env")) {
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Success "Created backend\.env from template"
        Write-Warning "Please update backend\.env with your configuration"
    } else {
        Write-Warning "backend\.env already exists. Skipping..."
    }
    
    # Desktop app environment (if exists)
    if ((Test-Path "desktop-app\.env.example") -and (-not (Test-Path "desktop-app\.env"))) {
        Copy-Item "desktop-app\.env.example" "desktop-app\.env"
        Write-Success "Created desktop-app\.env from template"
    }
    
    # Mobile app environment (if exists and not skipping mobile)
    if (-not $SkipMobile -and (Test-Path "mobile-app\.env.example") -and (-not (Test-Path "mobile-app\.env"))) {
        Copy-Item "mobile-app\.env.example" "mobile-app\.env"
        Write-Success "Created mobile-app\.env from template"
    }
}

function Install-Backend {
    Write-Step "Installing backend dependencies..."
    
    Set-Location "backend"
    
    try {
        npm install
        Write-Success "Backend dependencies installed"
        
        Write-Step "Generating Prisma client..."
        npx prisma generate
        Write-Success "Prisma client generated"
    } catch {
        Write-Error "Failed to install backend dependencies"
        Set-Location ".."
        exit 1
    }
    
    Set-Location ".."
}

function Install-Desktop {
    Write-Step "Installing desktop app dependencies..."
    
    Set-Location "desktop-app"
    
    try {
        npm install
        Write-Success "Desktop app dependencies installed"
    } catch {
        Write-Error "Failed to install desktop app dependencies"
        Set-Location ".."
        exit 1
    }
    
    Set-Location ".."
}

function Install-Mobile {
    if ($SkipMobile) {
        Write-Warning "Skipping mobile app setup as requested"
        return
    }
    
    Write-Step "Installing mobile app dependencies..."
    
    Set-Location "mobile-app"
    
    try {
        npm install
        Write-Success "Mobile app dependencies installed"
    } catch {
        Write-Error "Failed to install mobile app dependencies"
        Set-Location ".."
        exit 1
    }
    
    Set-Location ".."
}

function Set-Database {
    if ($SkipDocker) {
        Write-Warning "Skipping Docker setup as requested"
        Write-Warning "You'll need to set up PostgreSQL and Redis manually"
        Write-Warning "Please update the DATABASE_URL and REDIS_URL in backend\.env"
        return
    }
    
    Write-Step "Setting up database services with Docker..."
    
    try {
        # Check if Docker is running
        docker info | Out-Null
        
        # Start database services
        docker compose up -d postgres redis minio
        
        Write-Success "Database services started"
        Write-Warning "Waiting for services to be ready..."
        Start-Sleep -Seconds 15
        
        # Run database migrations
        Set-Location "backend"
        
        Write-Step "Running database migrations..."
        npx prisma migrate dev --name init
        Write-Success "Database migrations completed"
        
        # Seed database if seed file exists
        if (Test-Path "prisma\seed.ts") {
            Write-Step "Seeding database..."
            npx prisma db seed
            Write-Success "Database seeded"
        }
        
        Set-Location ".."
    } catch {
        Write-Error "Failed to set up database services"
        Write-Warning "Make sure Docker Desktop is running and try again"
        Write-Warning "Or use -SkipDocker flag to skip Docker setup"
    }
}

function New-Directories {
    Write-Step "Creating necessary directories..."
    
    # Backend directories
    New-Item -ItemType Directory -Force -Path "backend\logs" | Out-Null
    New-Item -ItemType Directory -Force -Path "backend\uploads" | Out-Null
    New-Item -ItemType Directory -Force -Path "backend\temp" | Out-Null
    
    # Infrastructure directories
    New-Item -ItemType Directory -Force -Path "infrastructure\ssl" | Out-Null
    New-Item -ItemType Directory -Force -Path "infrastructure\prometheus" | Out-Null
    New-Item -ItemType Directory -Force -Path "infrastructure\grafana\dashboards" | Out-Null
    New-Item -ItemType Directory -Force -Path "infrastructure\grafana\datasources" | Out-Null
    
    Write-Success "Directories created"
}

function Set-Certificates {
    Write-Step "Setting up development certificates..."
    
    if (-not (Test-Path "infrastructure\ssl\server.crt")) {
        try {
            # Create self-signed certificate for development
            $subject = "/C=US/ST=State/L=City/O=Institution/OU=IT/CN=localhost"
            
            & openssl req -x509 -newkey rsa:4096 -keyout infrastructure\ssl\server.key -out infrastructure\ssl\server.crt -days 365 -nodes -subj $subject
            
            Write-Success "Development certificates created"
        } catch {
            Write-Warning "OpenSSL not found. Skipping certificate generation."
            Write-Warning "You can install OpenSSL or use the certificates from the production setup."
        }
    } else {
        Write-Warning "Certificates already exist. Skipping..."
    }
}

function Show-NextSteps {
    Write-Host "`n==========================================" -ForegroundColor $GREEN
    Write-Host "🎉 ELMS Development Setup Complete!" -ForegroundColor $GREEN
    Write-Host "==========================================" -ForegroundColor $GREEN
    
    Write-Host "`nNext steps:"
    Write-Host ""
    Write-Host "1. Update configuration files:"
    Write-Host "   • backend\.env - Update database URLs, secrets, etc."
    Write-Host ""
    Write-Host "2. Start the development servers:"
    Write-Host "   • Backend API:     cd backend && npm run dev"
    Write-Host "   • Desktop App:     cd desktop-app && npm run dev"
    if (-not $SkipMobile) {
        Write-Host "   • Mobile App:      cd mobile-app && npm start"
    }
    Write-Host ""
    Write-Host "3. Access the applications:"
    Write-Host "   • API Health:      http://localhost:3000/api/health"
    Write-Host "   • API Docs:        http://localhost:3000/api/docs"
    Write-Host "   • Database Studio: cd backend && npm run db:studio"
    if (-not $SkipDocker) {
        Write-Host "   • Grafana:         http://localhost:3001 (admin/admin123)"
        Write-Host "   • MinIO Console:   http://localhost:9001 (minioadmin/minioadmin123)"
    }
    Write-Host ""
    Write-Host "4. For production deployment:"
    Write-Host "   • Review infrastructure\deployment-guide.md"
    Write-Host "   • Update environment variables for production"
    Write-Host "   • Set up proper SSL certificates"
    Write-Host ""
    Write-Host "📚 Documentation: docs\README.md" -ForegroundColor $BLUE
    Write-Host "🐛 Issues: Check GitHub issues for troubleshooting" -ForegroundColor $BLUE
    Write-Host ""
}

# Main execution
function Main {
    if ($Help) {
        Show-Help
        return
    }
    
    Write-Host "==========================================" -ForegroundColor $BLUE
    Write-Host "🎓 ELMS Development Environment Setup" -ForegroundColor $BLUE
    Write-Host "==========================================" -ForegroundColor $BLUE
    
    Test-Prerequisites
    New-Directories
    Set-Environment
    Set-Certificates
    Install-Backend
    Install-Desktop
    Install-Mobile
    Set-Database
    Show-NextSteps
}

# Run the script
Main
