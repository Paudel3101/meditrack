# FreeFDB MySQL & Render Deployment Guide

## Overview
The MediTrack application is deployed on **Render** with database hosted on **FreeFDB.tech**.
- **Server:** https://meditrack-145r.onrender.com (Render)
- **Database:** FreeFDB.tech MySQL (sql.freedb.tech)

This guide covers setup, configuration, and deployment.

## Configuration

### Environment Variables
Add these to your `.env` file:

```env
DB_HOST=sql.freedb.tech
DB_USER=your_freedb_username
DB_PASSWORD=your_freedb_password
DB_NAME=meditrack_db
DB_PORT=3306
```

## Setup Instructions

### 1. Create Free MySQL Database on FreeFDB

1. **Sign up at [FreeFDB.tech](https://freedb.tech)**
   - Go to https://freedb.tech
   - Create an account

2. **Create Database**
   - Click "Create New Database"
   - Enter database name: `meditrack_db`
   - Choose a prefix (e.g., `meditrack_`)
   - FreeFDB will generate your credentials

3. **Get Credentials**
   - You'll receive:
     - **Host:** `sql.freedb.tech`
     - **User:** Your FreeFDB username
     - **Password:** Your FreeFDB password
     - **Database:** `freedb_meditrack_db` (or with your prefix)
     - **Port:** `3306`

### 2. Update Application Configuration

1. **Update .env file** with your FreeFDB credentials:
   ```env
   DB_HOST=sql.freedb.tech
   DB_USER=your_freedb_username
   DB_PASSWORD=your_freedb_password
   DB_NAME=your_freedb_database
   DB_PORT=3306
   NODE_ENV=production
   CORS_ORIGIN=https://your-render-app.onrender.com,http://localhost:3000
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize Database Schema**
   ```bash
   npm run db:init
   ```

4. **Start Server Locally**
   ```bash
   npm start
   ```

## 3. Deploy to Render

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Configure FreeFDB and Render deployment"
   git push origin main
   ```

2. **Create Render Web Service**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`

3. **Add Environment Variables in Render Dashboard**
   - Go to your service settings
   - Add under "Environment":
     ```
     DB_HOST=sql.freedb.tech
     DB_USER=freedb_professor
     DB_PASSWORD=TVttf8HkMmq?WHP
     DB_NAME=freedb_meditrack_db
     DB_PORT=3306
     NODE_ENV=production
     JWT_SECRET=your-secret-key
     CORS_ORIGIN=https://your-render-app.onrender.com,http://localhost:3000
     ```

4. **Deploy**
   - Render auto-deploys on git push
   - Or manually click "Deploy" button
   - View logs to confirm successful deployment

## Database Operations

### Query Examples

```javascript
const db = require('./src/utils/db');

// Query
const patients = await db.query('SELECT * FROM patients WHERE status = ?', ['active']);

// Query One
const patient = await db.queryOne('SELECT * FROM patients WHERE id = ?', [1]);

// Insert
const result = await db.insert(
  'INSERT INTO patients (name, email) VALUES (?, ?)',
  ['John Doe', 'john@example.com']
);

// Update
const updated = await db.update(
  'UPDATE patients SET status = ? WHERE id = ?',
  ['inactive', 1]
);

// Delete
const deleted = await db.delete(
  'DELETE FROM patients WHERE id = ?',
  [1]
);
```

## Features

- **Free hosting** - No credit card required
- **Remote access** - Access from anywhere
- **Connection pooling** - Max 10 simultaneous connections
- **Automatic failover** - Built-in redundancy
- **Web-based management** - phpMyAdmin included

## Database Connection Details

- **Host:** `sql.freedb.tech`
- **Port:** `3306` (MySQL default)
- **Max connections:** 10
- **Connection timeout:** 10 seconds
- **Idle timeout:** No limit

## Accessing Database via phpMyAdmin

1. Go to [FreeFDB Dashboard](https://freedb.tech)
2. Select your database
3. Click "Manage"
4. Use phpMyAdmin to view/manage tables and data

## Troubleshooting

### Connection Errors
```bash
# Test MySQL connection
mysql -h sql.freedb.tech -u your_username -p your_database
```

### Check Credentials
- Verify username and password in .env file
- Ensure database name matches
- Check host is `sql.freedb.tech`

### Database Files to Initialize
- [database.sql](database.sql) - Table schema
- [insert_data.sql](insert_data.sql) - Sample data

Run initialization:
```bash
npm run db:init
```

## Current Deployment Status

- **Server URL:** https://meditrack-145r.onrender.com
- **Database Host:** sql.freedb.tech
- **Status:** ✅ Deployed and Running

## Access Your Application

1. **Web Interface:** https://meditrack-145r.onrender.com
2. **API Endpoints:** https://meditrack-145r.onrender.com/api/...
3. **Login Credentials:**
   - Email: admin@meditrack.com
   - Password: Password123!

## Monitoring & Logs

**View Render Logs:**
- Go to https://dashboard.render.com
- Select your service
- Click "Logs" tab
- Real-time application logs

**Database Access:**
- FreeFDB Dashboard: https://freedb.tech
- phpMyAdmin: Available in FreeFDB dashboard

## Support

- [Render Documentation](https://render.com/docs)
- [FreeFDB Documentation](https://freedb.tech/docs)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [mysql2 Package](https://github.com/sidorares/node-mysql2)
