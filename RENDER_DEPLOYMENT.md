# Render.com Deployment Guide - The Grim Store

## Overview
This guide covers deploying The Grim Store (client, admin, server) to Render.com with Supabase PostgreSQL database.

## Prerequisites
- Render.com account (https://render.com)
- GitHub repository (rajbadkhane/the-grim-store)
- Supabase project with PostgreSQL credentials
- Environment variables configured

## Step 1: Connect GitHub Repository
1. Log in to Render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select repository: `rajbadkhane/the-grim-store`
5. Click "Connect"

## Step 2: Configure Backend API (grim-store-api)

### Basic Settings
- **Name:** `grim-store-api`
- **Environment:** Node
- **Region:** Oregon (us-west)
- **Branch:** main
- **Build Command:** `npm --prefix server install && npm --prefix server run build`
- **Start Command:** `npm --prefix server run start`
- **Plan:** Free (or Starter for production)

### Environment Variables
Add these in Render dashboard (Settings → Environment):
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.<project-ref>.supabase.co:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=<your-supabase-db-password>
SQL_DATABASE=postgres
JWT_SECRET=<your-strong-secret-32-chars-min>
JWT_REFRESH_SECRET=<your-strong-secret-32-chars-min>
CLIENT_URL=https://client-psi-ashy.vercel.app
ADMIN_URL=https://admin-lac-eight-88.vercel.app
CORS_ORIGINS=https://grim-store-client.onrender.com,https://grim-store-admin.onrender.com,https://client-psi-ashy.vercel.app,https://admin-lac-eight-88.vercel.app
CLOUDINARY_NAME=<optional>
CLOUDINARY_API_KEY=<optional>
CLOUDINARY_SECRET=<optional>
RAZORPAY_KEY_ID=<optional>
RAZORPAY_KEY_SECRET=<optional>
NIMBUSPOST_EMAIL=<your-nimbuspost-api-user-email>
NIMBUSPOST_PASSWORD=<your-nimbuspost-api-user-password>
NIMBUSPOST_PICKUP_WAREHOUSE=The Grim Store
NIMBUSPOST_PICKUP_NAME=The Grim Store
NIMBUSPOST_PICKUP_ADDRESS=A-3 Maruti Vihar Colony, Infront Shri Ram Janki Sidh Hanuman Temple, Near SBI ATM, Ayodhya Bypass
NIMBUSPOST_PICKUP_ADDRESS_2=
NIMBUSPOST_PICKUP_CITY=Bhopal
NIMBUSPOST_PICKUP_STATE=Madhya Pradesh
NIMBUSPOST_PICKUP_PINCODE=462041
NIMBUSPOST_PICKUP_PHONE=7999079051
NIMBUSPOST_COURIER_ID=
NIMBUSPOST_AUTO_PICKUP=yes
EMAIL_USER=<optional>
EMAIL_PASS=<optional>
```

If Render cannot reach the direct Supabase database host, use the Supabase Session pooler connection string for `DATABASE_URL`.

### Deploy
- Click "Create Web Service"
- Wait for initial deployment (5-10 minutes)
- Backend URL will be shown (e.g., https://grim-store-api.onrender.com)

## Step 3: Configure Client Storefront

### Basic Settings
- **Name:** `grim-store-client`
- **Environment:** Node
- **Region:** Oregon
- **Branch:** main
- **Build Command:** `npm --prefix client install && npm --prefix client run build`
- **Start Command:** `npm --prefix client run start`

### Environment Variables
```
NEXT_PUBLIC_API_URL=https://grim-store-api.onrender.com/api/v1
NEXT_PUBLIC_SITE_URL=https://<your-client-url>.onrender.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=<your-razorpay-key-id>
```

### Deploy
- Create Web Service
- Note the URL for client

## Step 4: Configure Admin Dashboard

### Basic Settings
- **Name:** `grim-store-admin`
- **Environment:** Node
- **Region:** Oregon
- **Branch:** main
- **Build Command:** `npm --prefix admin install && npm --prefix admin run build`
- **Start Command:** `npm --prefix admin run start`

### Environment Variables
```
NEXT_PUBLIC_API_URL=https://grim-store-api.onrender.com/api/v1
```

### Deploy
- Create Web Service
- Note the URL for admin

## Step 5: Initialize Database

After backend is deployed, seed the database:
```bash
# SSH into backend via Render shell
npm --prefix server run seed
```

Or trigger via API if seed endpoint is available.

## Step 6: Update URLs in Code

Update your frontend .env files with deployed URLs:

**client/.env.local**
```
NEXT_PUBLIC_API_URL=https://grim-store-api.onrender.com/api/v1
NEXT_PUBLIC_SITE_URL=https://<client-domain>.onrender.com
```

**admin/.env.local**
```
NEXT_PUBLIC_API_URL=https://grim-store-api.onrender.com/api/v1
```

## Monitoring & Maintenance

### View Logs
- Go to each service in Render dashboard
- Click "Logs" tab to see real-time logs

### Restart Services
- Click service → "Manual Deploy" to rebuild
- Or use Render API

### Database Backups
- Access Supabase console for automatic backups
- Database backups available in Supabase dashboard

## Important Notes

⚠️ **Free Tier Limitations:**
- Services go to sleep after 15 minutes of inactivity
- Cold starts can take 30-60 seconds
- Bandwidth limited
- For production, upgrade to Starter or Standard plan

⚠️ **Security:**
1. Change JWT secrets in production
2. Never commit .env file to Git (already in .gitignore)
3. Use HTTPS everywhere
4. Validate all user input

⚠️ **Performance:**
- Consider caching strategies
- Implement database connection pooling
- Monitor response times in Logs

## Troubleshooting

### Backend won't start
```bash
# Check logs in Render dashboard
# Verify SUPABASE_URL format is correct
# Ensure all required env vars are set
```

### Database connection fails
```bash
# Verify Supabase credentials
# Check network access in Supabase dashboard
# Ensure SSL is properly configured (port 5432)
```

### Seed script fails
```bash
# Run manually in backend shell:
npm --prefix server run seed
```

### Frontend can't reach API
```bash
# Verify NEXT_PUBLIC_API_URL in frontend env
# Check CORS settings in backend
# Verify backend service is running
```

## Deployment Checklist

- [ ] GitHub repo connected to Render
- [ ] Backend service created with correct build/start commands
- [ ] All backend env vars set (especially JWT secrets)
- [ ] Database seeded with initial data
- [ ] Client service created with NEXT_PUBLIC_API_URL pointing to backend
- [ ] Admin service created with NEXT_PUBLIC_API_URL pointing to backend
- [ ] All services are running (green status)
- [ ] Frontend can successfully call backend endpoints
- [ ] Auth flow works (signup, login, logout)
- [ ] Products display on storefront
- [ ] Admin dashboard loads
- [ ] Payment integration tested (if enabled)

## Support

- Render Docs: https://render.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Supabase Docs: https://supabase.com/docs
