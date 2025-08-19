#!/bin/bash

# Coolify Deployment Script for PersonalitySpark
# This script helps deploy the site to Coolify with proper Cloudflare configuration

echo "🚀 Deploying PersonalitySpark to Coolify..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COOLIFY_URL=${COOLIFY_URL:-"http://your-coolify-server.com"}
PROJECT_NAME="personality-spark"
DOMAIN="personalityspark.com"

echo -e "${YELLOW}📋 Pre-deployment checklist:${NC}"
echo "1. Ensure Cloudflare SSL is set to 'Flexible'"
echo "2. Ensure DNS records are proxied (orange cloud)"
echo "3. Ensure Coolify server is accessible"
echo ""

# Step 1: Commit and push changes
echo -e "${GREEN}Step 1: Committing changes...${NC}"
git add .
git commit -m "Update Coolify configuration for Cloudflare Flexible SSL"
git push origin main

# Step 2: Instructions for Coolify UI
echo ""
echo -e "${YELLOW}Step 2: Configure in Coolify UI:${NC}"
echo "1. Log into Coolify at: $COOLIFY_URL"
echo "2. Create/Update Application:"
echo "   - Name: $PROJECT_NAME"
echo "   - Type: Static Site or Docker"
echo "   - Repository: Your GitHub repo URL"
echo "   - Branch: main"
echo ""

# Step 3: Environment configuration
echo -e "${YELLOW}Step 3: Environment Variables in Coolify:${NC}"
echo "Add these environment variables in Coolify:"
echo "   NODE_ENV=production"
echo "   PORT=80"
echo ""

# Step 4: Domain configuration
echo -e "${YELLOW}Step 4: Domain Configuration in Coolify:${NC}"
echo "1. Add domains:"
echo "   - $DOMAIN"
echo "   - www.$DOMAIN"
echo "2. IMPORTANT: Disable 'Force HTTPS' in Coolify"
echo "3. IMPORTANT: Disable 'Generate SSL Certificate' in Coolify"
echo "   (Cloudflare handles SSL)"
echo ""

# Step 5: Build configuration
echo -e "${YELLOW}Step 5: Build Configuration:${NC}"
echo "If using Docker build:"
echo "   - Dockerfile: Dockerfile.coolify"
echo "   - Build Args: None needed"
echo "If using static site:"
echo "   - Base Directory: /"
echo "   - Publish Directory: /"
echo ""

# Step 6: Post-deployment verification
echo -e "${YELLOW}Step 6: Post-Deployment Verification:${NC}"
echo "After deployment, verify:"
echo "1. Check site loads: https://$DOMAIN"
echo "2. Check ads.txt: https://$DOMAIN/ads.txt"
echo "3. Check SSL certificate shows Cloudflare"
echo "4. Journey can access the site"
echo ""

# Test current site status
echo -e "${GREEN}Testing current site status...${NC}"
echo -n "HTTP Response: "
curl -I -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" || echo "Failed"
echo ""

echo -e "${GREEN}Testing ads.txt accessibility...${NC}"
echo -n "ads.txt Response: "
curl -s "https://$DOMAIN/ads.txt" | head -1 || echo "Failed"
echo ""

echo -e "${GREEN}✅ Deployment script complete!${NC}"
echo -e "${YELLOW}Follow the manual steps above in Coolify UI to complete deployment.${NC}"