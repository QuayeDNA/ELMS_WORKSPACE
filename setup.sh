#!/bin/bash

# ELMS Development Setup Script
# This script sets up the development environment for ELMS

set -e

echo "=========================================="
echo "🎓 ELMS Development Environment Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "\n${BLUE}==>${NC} ${1}"
}

print_success() {
    echo -e "${GREEN}✓${NC} ${1}"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} ${1}"
}

print_error() {
    echo -e "${RED}✗${NC} ${1}"
}

# Check if running on Windows
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    IS_WINDOWS=true
else
    IS_WINDOWS=false
fi

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
        
        # Check if version is >= 20
        if [[ ${NODE_VERSION:1:2} -ge 20 ]]; then
            print_success "Node.js version is compatible"
        else
            print_error "Node.js version must be 20 or higher. Please upgrade."
            exit 1
        fi
    else
        print_error "Node.js not found. Please install Node.js 20+ from https://nodejs.org/"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        print_error "npm not found. Please install npm."
        exit 1
    fi
    
    # Check Docker
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker found: $DOCKER_VERSION"
    else
        print_warning "Docker not found. You'll need Docker for database services."
        print_warning "Install Docker from https://docker.com/get-started"
    fi
    
    # Check Docker Compose
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
        print_success "Docker Compose found"
    else
        print_warning "Docker Compose not found. You'll need it for the full development setup."
    fi
    
    # Check Git
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        print_success "Git found: $GIT_VERSION"
    else
        print_error "Git not found. Please install Git."
        exit 1
    fi
}

# Setup environment files
setup_environment() {
    print_step "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
        print_success "Created backend/.env from template"
        print_warning "Please update backend/.env with your configuration"
    else
        print_warning "backend/.env already exists. Skipping..."
    fi
    
    # Desktop app environment (if needed)
    if [ ! -f "desktop-app/.env" ] && [ -f "desktop-app/.env.example" ]; then
        cp desktop-app/.env.example desktop-app/.env
        print_success "Created desktop-app/.env from template"
    fi
    
    # Mobile app environment (if needed)
    if [ ! -f "mobile-app/.env" ] && [ -f "mobile-app/.env.example" ]; then
        cp mobile-app/.env.example mobile-app/.env
        print_success "Created mobile-app/.env from template"
    fi
}

# Install backend dependencies
install_backend() {
    print_step "Installing backend dependencies..."
    
    cd backend
    npm install
    print_success "Backend dependencies installed"
    
    # Generate Prisma client
    print_step "Generating Prisma client..."
    npx prisma generate
    print_success "Prisma client generated"
    
    cd ..
}

# Install desktop app dependencies
install_desktop() {
    print_step "Installing desktop app dependencies..."
    
    cd desktop-app
    npm install
    print_success "Desktop app dependencies installed"
    cd ..
}

# Install mobile app dependencies
install_mobile() {
    print_step "Installing mobile app dependencies..."
    
    cd mobile-app
    npm install
    print_success "Mobile app dependencies installed"
    cd ..
}

# Setup database with Docker
setup_database() {
    print_step "Setting up database services with Docker..."
    
    if command -v docker &> /dev/null; then
        # Start database services
        docker-compose up -d postgres redis minio
        
        print_success "Database services started"
        print_warning "Waiting for services to be ready..."
        sleep 10
        
        # Run database migrations
        cd backend
        print_step "Running database migrations..."
        npx prisma migrate dev --name init
        print_success "Database migrations completed"
        
        # Seed database
        if [ -f "prisma/seed.ts" ]; then
            print_step "Seeding database..."
            npx prisma db seed
            print_success "Database seeded"
        fi
        
        cd ..
    else
        print_warning "Docker not available. You'll need to set up PostgreSQL and Redis manually."
        print_warning "Please update the DATABASE_URL and REDIS_URL in backend/.env"
    fi
}

# Create necessary directories
create_directories() {
    print_step "Creating necessary directories..."
    
    # Backend directories
    mkdir -p backend/logs
    mkdir -p backend/uploads
    mkdir -p backend/temp
    
    # Infrastructure directories
    mkdir -p infrastructure/ssl
    mkdir -p infrastructure/prometheus
    mkdir -p infrastructure/grafana/dashboards
    mkdir -p infrastructure/grafana/datasources
    
    print_success "Directories created"
}

# Setup development certificates (for HTTPS)
setup_certificates() {
    print_step "Setting up development certificates..."
    
    if [ ! -f "infrastructure/ssl/server.crt" ]; then
        # Create self-signed certificate for development
        openssl req -x509 -newkey rsa:4096 -keyout infrastructure/ssl/server.key -out infrastructure/ssl/server.crt -days 365 -nodes \
            -subj "/C=US/ST=State/L=City/O=Institution/OU=IT/CN=localhost"
        
        print_success "Development certificates created"
    else
        print_warning "Certificates already exist. Skipping..."
    fi
}

# Show next steps
show_next_steps() {
    echo -e "\n${GREEN}=========================================="
    echo "🎉 ELMS Development Setup Complete!"
    echo -e "==========================================${NC}\n"
    
    echo "Next steps:"
    echo ""
    echo "1. Update configuration files:"
    echo "   • backend/.env - Update database URLs, secrets, etc."
    echo ""
    echo "2. Start the development servers:"
    echo "   • Backend API:     cd backend && npm run dev"
    echo "   • Desktop App:     cd desktop-app && npm run dev"
    echo "   • Mobile App:      cd mobile-app && npm start"
    echo ""
    echo "3. Access the applications:"
    echo "   • API Health:      http://localhost:3000/api/health"
    echo "   • API Docs:        http://localhost:3000/api/docs"
    echo "   • Database Studio: cd backend && npm run db:studio"
    echo "   • Grafana:         http://localhost:3001 (admin/admin123)"
    echo "   • MinIO Console:   http://localhost:9001 (minioadmin/minioadmin123)"
    echo ""
    echo "4. For production deployment:"
    echo "   • Review infrastructure/deployment-guide.md"
    echo "   • Update environment variables for production"
    echo "   • Set up proper SSL certificates"
    echo ""
    echo -e "${BLUE}📚 Documentation:${NC} docs/README.md"
    echo -e "${BLUE}🐛 Issues:${NC} Check GitHub issues for troubleshooting"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    create_directories
    setup_environment
    setup_certificates
    install_backend
    install_desktop
    install_mobile
    setup_database
    show_next_steps
}

# Run the script
main "$@"
