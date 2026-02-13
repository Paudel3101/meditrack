# MediTrack API - Deployment Guide

Phase 1 deployment instructions for deploying MediTrack to production cloud hosting.

## Deployment Options

This guide covers deployment to the recommended platforms:
1. **Render** (Free tier available)
2. **Heroku** (Paid, but straightforward)
3. **AWS** (Scaling capability)
4. **DigitalOcean** (Good middle ground)

## Prerequisites

- Git repository pushed to GitHub
- Node.js application with package.json
- MySQL/MariaDB database (cloud-hosted)
- Environment variables prepared

## Option 1: Deploy to Render (Recommended for Phase 1)

### Step 1: Prepare Database on PlanetScale (MySQL)

1. Go to [PlanetScale](https://planetscale.com)
2. Sign up for free account
3. Create new database:
   - Name: `meditrack`
   - Region: Choose closest to you
4. Click "Connect" → "Node.js"
5. Copy connection string
6. Create new branch for schema changes:
   ```bash
   pscale branch create meditrack initialize-schema
   ```
7. Apply your schema from `database.sql`
8. Promote branch to main

### Step 2: Deploy to Render

1. Go to [Render](https://render.com)
2. Sign up with GitHub account
3. Click "New +" → "Web Service"
4. Select your GitHub repository
5. Configure:
   - **Name**: meditrack-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
6. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   DB_HOST=[PlanetScale host]
   DB_PORT=3306
   DB_USER=[PlanetScale username]
   DB_PASSWORD=[PlanetScale password]
   DB_NAME=meditrack
   JWT_SECRET=[Generate strong random string]
   JWT_EXPIRE=24h
   CORS_ORIGIN=https://[your-frontend-domain.com]
   ```
7. Click "Create Web Service"
8. Wait for deployment (5-10 minutes)
9. Test health endpoint: `https://meditrack-api.onrender.com/api/health`

## Option 2: Deploy to Heroku

### Step 1: Install Heroku CLI

```bash
# Windows
choco install heroku-cli

# macOS
brew tap heroku/brew && brew install heroku

# Linux
curl https://cli.heroku.com/install.sh | sh
```

### Step 2: Prepare for Deployment

1. Login to Heroku:
   ```bash
   heroku login
   ```

2. Create Procfile in project root:
   ```
   web: npm start
   ```

3. Ensure package.json has start script:
   ```json
   "start": "node server.js"
   ```

### Step 3: Create Heroku Application

```bash
heroku create meditrack-api
heroku git:remote -a meditrack-api
```

### Step 4: Set Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=[strong-random-string]
heroku config:set DB_HOST=[database-host]
heroku config:set DB_USER=[database-user]
heroku config:set DB_PASSWORD=[database-password]
heroku config:set DB_NAME=meditrack
heroku config:set CORS_ORIGIN=https://[frontend-domain]
```

### Step 5: Deploy

```bash
git push heroku p_phase_1:main
```

### Step 6: View Logs

```bash
heroku logs --tail
```

## Option 3: Deploy to AWS EC2

### Step 1: Launch EC2 Instance

1. Go to AWS Console
2. Create EC2 instance:
   - AMI: Ubuntu 22.04 LTS
   - Instance type: t2.micro (free tier)
   - Security group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (API)
3. Create/use key pair for SSH access

### Step 2: Connect and Setup

```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install -y git

# Clone repository
git clone https://github.com/yourusername/meditrack.git
cd meditrack/server

# Install dependencies
npm install
```

### Step 3: Setup Environment

```bash
# Create .env file
nano .env

# Add configuration
NODE_ENV=production
PORT=5000
DB_HOST=[RDS endpoint]
DB_USER=[RDS username]
DB_PASSWORD=[RDS password]
DB_NAME=meditrack
JWT_SECRET=[strong-random]
CORS_ORIGIN=https://[frontend-domain]
```

### Step 4: Setup PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application
pm2 start server.js --name "meditrack"

# Setup auto-restart on reboot
pm2 startup
pm2 save
```

### Step 5: Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create configuration
sudo nano /etc/nginx/sites-available/default
```

Replace content with:
```nginx
upstream meditrack_api {
    server localhost:5000;
}

server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://meditrack_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then:
```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 6: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## Database Setup for Cloud Deployment

### Using PlanetScale (MySQL)

1. Create PlanetScale account
2. Create database
3. Connect via `database.sql`:
   ```bash
   pscale connect meditrack --port 3306
   ```
4. Initialize schema:
   ```bash
   mysql -h127.0.0.1 < database.sql
   ```

### Using AWS RDS

1. Create RDS instance:
   - Engine: MySQL 8.0
   - Instance class: db.t3.micro (free tier eligible)
   - Storage: 20GB, not encrypted (free)
   - Public access: Yes
   - Security group: Allow inbound on port 3306
2. Get endpoint and credentials
3. Initialize database with `database.sql`

## Post-Deployment Verification

### Test Health Endpoint

```bash
curl https://your-deployed-api.com/api/health
```

### Expected Response

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-02-13T10:30:00.000Z"
}
```

### Test API Documentation

```
https://your-deployed-api.com/api-docs
```

Should load Swagger UI with all endpoints documented.

### Test Authentication

```bash
# Login
curl -X POST https://your-deployed-api.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@meditrack.com","password":"AdminPass123!"}'

# Response should include JWT token
```

## Monitoring and Maintenance

### View Logs

**Render:**
```
Dashboard → Service → Logs
```

**Heroku:**
```bash
heroku logs --tail
```

**AWS EC2:**
```bash
pm2 logs meditrack
tail -f /var/log/nginx/access.log
```

### Update Application

```bash
# Pull latest changes
git pull origin p_phase_1

# Reinstall dependencies if needed
npm install

# Restart application
heroku releases            # or
pm2 restart meditrack      # or
sudo systemctl restart nginx
```

## Environment Variable Checklist

- [ ] `NODE_ENV=production`
- [ ] `PORT=5000` (or appropriate port)
- [ ] `DB_HOST` (database host/endpoint)
- [ ] `DB_PORT=3306` (MySQL default)
- [ ] `DB_USER` (database username)
- [ ] `DB_PASSWORD` (database password)
- [ ] `DB_NAME=meditrack`
- [ ] `JWT_SECRET` (strong random string, min 32 chars)
- [ ] `JWT_EXPIRE=24h` (token expiration)
- [ ] `CORS_ORIGIN` (frontend domain URL)
- [ ] `API_URL` (public API URL for Swagger)

## Troubleshooting

### Database Connection Errors

```
Error: connect ECONNREFUSED
```

**Solution:**
- Verify DB_HOST, DB_USER, DB_PASSWORD in environment variables
- Check database security group/firewall rules
- Ensure database is running and accessible from your server

### JWT Secret Issues

```
JsonWebTokenError: invalid signature
```

**Solution:**
- Regenerate strong JWT_SECRET
- Update on deployed server
- Restart application
- Users will need to login again

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find process using port
lsof -i :5000  # Linux/macOS
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 [PID]
```

### CORS Issues

If frontend can't access API:
1. Verify CORS_ORIGIN matches frontend domain
2. Check if protocol is https (not http)
3. Restart application after changing CORS_ORIGIN

## Cost Estimates (2024)

| Platform | Free Tier | Paid | Notes |
|----------|-----------|------|-------|
| **Render** | Yes | $7+/month | Sleep after inactivity |
| **Heroku** | No (ended) | $7+/month | Easy deployment |
| **AWS** | Yes (1 year) | $5-50+/month | Pay per usage |
| **DigitalOcean** | No | $6+/month | Good value |
| **PlanetScale** | Yes | Free for most use | MySQL hosting |

## Going Live Checklist

- [ ] All endpoints tested in Swagger UI
- [ ] Postman collection runs without errors
- [ ] Database connection working
- [ ] Environment variables configured
- [ ] JWT authentication functional
- [ ] CORS properly configured
- [ ] SSL certificate installed (HTTPS)
- [ ] Health endpoint responds
- [ ] API documentation accessible
- [ ] Monitoring/logging setup
- [ ] Database backups configured
- [ ] Error tracking configured (optional)

## Support

For deployment issues:
1. Check platform-specific documentation
2. Review application logs
3. Verify environment variables
4. Test database connectivity
5. Check firewall/security rules

---

**Next Phase**: Phase 2 will build the frontend to consume these APIs
