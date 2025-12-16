#!/bin/bash

###############################################################################
# Planted Application - Afrihost Deployment Build Script
# This script prepares your application for deployment to Afrihost
###############################################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print banner
echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║   🌱 Planted Application - Build for Afrihost       ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Step 1: Clean previous builds
echo -e "${BLUE}[1/6]${NC} Cleaning previous builds..."
rm -rf dist/
rm -rf server/dist/
echo -e "${GREEN}✓ Cleaned${NC}"
echo ""

# Step 2: Install root dependencies
echo -e "${BLUE}[2/6]${NC} Installing root dependencies..."
npm install
echo -e "${GREEN}✓ Root dependencies installed${NC}"
echo ""

# Step 3: Install server dependencies
echo -e "${BLUE}[3/6]${NC} Installing server dependencies..."
cd server
npm install
cd ..
echo -e "${GREEN}✓ Server dependencies installed${NC}"
echo ""

# Step 4: Build React frontend
echo -e "${BLUE}[4/6]${NC} Building React frontend..."
npm run build
echo -e "${GREEN}✓ Frontend built successfully${NC}"
echo ""

# Step 5: Verify build
echo -e "${BLUE}[5/6]${NC} Verifying build..."
if [ ! -d "dist" ]; then
    echo -e "${RED}✗ Error: dist/ directory not found!${NC}"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo -e "${RED}✗ Error: dist/index.html not found!${NC}"
    exit 1
fi

if [ ! -f "app.js" ]; then
    echo -e "${RED}✗ Error: app.js not found!${NC}"
    exit 1
fi

if [ ! -f "server/dist/index.js" ]; then
    echo -e "${RED}✗ Error: server/dist/index.js not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build verification passed${NC}"
echo ""

# Step 6: Display build summary
echo -e "${BLUE}[6/6]${NC} Build Summary:"
echo ""
echo "📦 Files ready for deployment:"
echo "   ✓ app.js (production server)"
echo "   ✓ dist/ (built React frontend)"
echo "   ✓ server/dist/ (compiled backend)"
echo "   ✓ package.json"
echo "   ✓ .htaccess"
echo ""

# Calculate sizes
DIST_SIZE=$(du -sh dist/ | cut -f1)
SERVER_SIZE=$(du -sh server/dist/ | cut -f1)

echo "📊 Build Statistics:"
echo "   Frontend size: $DIST_SIZE"
echo "   Backend size: $SERVER_SIZE"
echo ""

# Deployment checklist
echo -e "${YELLOW}📋 Pre-Deployment Checklist:${NC}"
echo ""
echo "Environment Variables to set in Afrihost:"
echo "   □ NODE_ENV=production"
echo "   □ ALLOWED_ORIGINS=https://your-domain.com"
echo "   □ FIREBASE_PROJECT_ID=your-project-id"
echo "   □ FIREBASE_CLIENT_EMAIL=your-service-account@..."
echo "   □ FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----..."
echo "   □ OPENAI_API_KEY=sk-..."
echo ""

echo "Afrihost Configuration:"
echo "   □ Application root: https://github.com/Koulz-Live/planted"
echo "   □ Application startup file: app.js"
echo "   □ Node.js version: 22.18.0 (or latest LTS)"
echo "   □ Application mode: Production"
echo ""

echo "Files to upload (if using FTP):"
echo "   □ app.js"
echo "   □ package.json"
echo "   □ package-lock.json"
echo "   □ .htaccess"
echo "   □ dist/ (entire folder)"
echo "   □ server/ (entire folder)"
echo ""

echo "Files to EXCLUDE:"
echo "   ✗ node_modules/ (will be installed on server)"
echo "   ✗ src/ (already built)"
echo "   ✗ .git/"
echo "   ✗ .env files"
echo ""

# Success message
echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║   ✅ Build Complete!                                 ║"
echo "║                                                       ║"
echo "║   Your application is ready for Afrihost            ║"
echo "║   deployment.                                        ║"
echo "║                                                       ║"
echo "║   Next Steps:                                        ║"
echo "║   1. Review AFRIHOST_DEPLOYMENT_GUIDE.md            ║"
echo "║   2. Set environment variables in Afrihost panel    ║"
echo "║   3. Upload files via Git or FTP                    ║"
echo "║   4. Start the application                          ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Optional: Create deployment archive
read -p "Create deployment archive (ZIP)? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo -e "${BLUE}Creating deployment archive...${NC}"
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    ARCHIVE_NAME="planted_deployment_${TIMESTAMP}.zip"
    
    zip -r "$ARCHIVE_NAME" \
        app.js \
        package.json \
        package-lock.json \
        .htaccess \
        dist/ \
        server/dist/ \
        server/package.json \
        server/package-lock.json \
        -x "*.DS_Store" \
        -x "*node_modules/*" \
        > /dev/null 2>&1
    
    ARCHIVE_SIZE=$(du -sh "$ARCHIVE_NAME" | cut -f1)
    
    echo -e "${GREEN}✓ Archive created: $ARCHIVE_NAME ($ARCHIVE_SIZE)${NC}"
    echo ""
    echo "You can upload this archive to your Afrihost server and extract it."
fi

echo ""
echo -e "${GREEN}🚀 Ready for deployment!${NC}"
echo ""
