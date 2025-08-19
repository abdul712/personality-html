# Coolify Deployment Guide for PersonalitySpark

## ✅ SSL Status: WORKING
- Cloudflare SSL is now properly configured
- HTTPS is serving correctly through Cloudflare
- Site needs to be deployed to Coolify to fix 404 errors

## Quick Deployment Steps

### 1. Access Coolify Dashboard
Log into your Coolify server dashboard

### 2. Create/Update Application

#### Option A: Docker Deployment (Recommended)
1. **Application Type**: Docker
2. **Source**: GitHub
3. **Repository**: https://github.com/abdul712/personality-html.git
4. **Branch**: main
5. **Dockerfile**: `Dockerfile.coolify`
6. **Port**: 80

#### Option B: Static Site Deployment
1. **Application Type**: Static
2. **Source**: GitHub  
3. **Repository**: https://github.com/abdul712/personality-html.git
4. **Branch**: main
5. **Base Directory**: /
6. **Publish Directory**: /

### 3. Configure Environment Variables
```
NODE_ENV=production
PORT=80
```

### 4. Configure Domains
Add these domains:
- personalityspark.com
- www.personalityspark.com

**IMPORTANT SSL Settings:**
- ❌ **DISABLE** "Force HTTPS" 
- ❌ **DISABLE** "Generate SSL Certificate"
- ❌ **DISABLE** "SSL/TLS Termination"

(Cloudflare handles all SSL - Coolify should accept HTTP only)

### 5. Configure Network Settings
If your Coolify has network/proxy settings:
- Set to accept HTTP traffic on port 80
- Allow connections from Cloudflare IPs
- Do NOT enable SSL termination

### 6. Deploy
1. Click "Deploy" or "Redeploy"
2. Wait for deployment to complete
3. Check deployment logs for any errors

## Verification Steps

After deployment, verify these URLs work:

```bash
# Main site
curl -I https://personalityspark.com
# Should return HTTP 200

# Ads.txt file
curl https://personalityspark.com/ads.txt
# Should show Journey's configuration

# Blog section
curl -I https://personalityspark.com/blog/
# Should return HTTP 200
```

## Troubleshooting

### If Still Getting 404 Errors:

1. **Check Coolify Deployment Logs**
   - Look for build/deployment errors
   - Verify files are being copied correctly

2. **Verify Nginx is Starting**
   - Check if nginx.conf is being loaded
   - Look for port binding issues

3. **Check Domain Configuration in Coolify**
   - Ensure domains are properly configured
   - Check if app is listening on port 80

4. **Test Direct Server Access** (if possible)
   ```bash
   curl http://[your-coolify-server-ip]:80
   ```

### Common Issues & Solutions:

| Issue | Solution |
|-------|----------|
| SSL Certificate Error | Cloudflare SSL is set to "Flexible" ✅ Already fixed |
| 404 Not Found | Deploy the application to Coolify |
| Mixed Content Warning | All resources should use relative URLs |
| Coolify forces HTTPS | Disable SSL/HTTPS in Coolify settings |
| Journey can't verify | Wait for deployment, then check ads.txt |

## Files Updated for Cloudflare + Coolify:

1. **nginx.conf** - Added Cloudflare IP restoration and Flexible SSL support
2. **Dockerfile.coolify** - Optimized Docker image for Coolify
3. **coolify.yaml** - Coolify-specific configuration
4. **deploy-coolify.sh** - Deployment helper script

## Current Status:
- ✅ SSL/HTTPS working via Cloudflare
- ✅ Configuration files updated
- ✅ Code pushed to GitHub
- ⏳ Awaiting deployment to Coolify server
- ⏳ Journey verification pending after deployment

## Next Steps:
1. Deploy to Coolify using the steps above
2. Verify site loads correctly
3. Confirm Journey can access ads.txt
4. Monitor for any errors

## Support Resources:
- Coolify Docs: https://coolify.io/docs
- Cloudflare SSL: https://developers.cloudflare.com/ssl/
- Journey Support: support@journeymv.com