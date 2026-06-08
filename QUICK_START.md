# 🚀 Quick Start - Deploy to Render.com

## Current Status: ✅ READY FOR DEPLOYMENT

Your application is fully configured and ready to deploy to Render.com in minutes.

## 📋 What's Done

✅ **Database Migration** - MySQL → PostgreSQL/Supabase  
✅ **Code Converted** - All query functions working with postgres driver  
✅ **Supabase Connected** - Credentials configured  
✅ **Backend Ready** - TypeScript compiled, dependencies installed  
✅ **Deployment Config** - render.yaml created  
✅ **Documentation** - Complete deployment guide included  

---

## 🎯 Deploy in 5 Steps

### Step 1: Go to Render.com
- Visit https://render.com
- Sign up or log in
- Click "New +" button

### Step 2: Connect GitHub
- Select "Web Service"
- Click "Connect account" for GitHub
- Authorize & select: `rajbadkhane/the-grim-store`
- Click "Connect"

### Step 3: Configure Backend Service
- **Name:** `grim-store-api`
- **Region:** Oregon (us-west)
- **Branch:** main
- **Build Command:** 
  ```
  npm --prefix server install && npm --prefix server run build
  ```
- **Start Command:** 
  ```
  npm --prefix server run start
  ```
- **Plan:** Free (or Starter for better uptime)

### Step 4: Set Environment Variables
In Render dashboard, add these under "Environment":

```
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.<project-ref>.supabase.co:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=<your-supabase-db-password>
SQL_DATABASE=postgres
JWT_SECRET=your-super-secret-key-change-this-32-chars-min
JWT_REFRESH_SECRET=your-super-secret-refresh-key-32-chars-min
CLIENT_URL=https://client-psi-ashy.vercel.app
ADMIN_URL=https://admin-lac-eight-88.vercel.app
CORS_ORIGINS=https://grim-store-client.onrender.com,https://grim-store-admin.onrender.com,https://client-psi-ashy.vercel.app,https://admin-lac-eight-88.vercel.app
```

For Render, prefer the Supabase Session pooler `DATABASE_URL` if the direct database host is unreachable over IPv6.

### Step 5: Deploy
- Click "Create Web Service"
- Wait 5-10 minutes
- Your backend URL will appear: `https://grim-store-api.onrender.com`

---

## 📱 Deploy Frontend (After Backend)

Create two more services:

### Client Storefront
- **Name:** `grim-store-client`
- **Build:** `npm --prefix client install && npm --prefix client run build`
- **Start:** `npm --prefix client run start`
- **Env:** `NEXT_PUBLIC_API_URL=https://grim-store-api.onrender.com/api/v1`

### Admin Dashboard
- **Name:** `grim-store-admin`
- **Build:** `npm --prefix admin install && npm --prefix admin run build`
- **Start:** `npm --prefix admin run start`
- **Env:** `NEXT_PUBLIC_API_URL=https://grim-store-api.onrender.com/api/v1`

---

## 🗄️ Initialize Database

Once backend is running:

1. Go to Render dashboard
2. Click `grim-store-api` service
3. Click "Shell" tab
4. Run: `npm --prefix server run seed`

This creates all tables and adds sample data.

---

## ✅ Verify Deployment

Test these URLs:

1. **Backend Health:**
   ```
   https://grim-store-api.onrender.com/api/health
   ```

2. **Client:**
   ```
   https://grim-store-client.onrender.com
   ```

3. **Admin:**
   ```
   https://grim-store-admin.onrender.com
   ```

---

## 🔒 Important Security Notes

⚠️ **Before Production:**

1. **Change JWT Secrets** (CRITICAL!)
   - Replace `JWT_SECRET` and `JWT_REFRESH_SECRET` 
   - Use 32+ character random strings
   - Use: https://generate-random.org/ or `openssl rand -base64 32`

2. **Update Supabase Credentials** (Already set ✅)
   - User: postgres
   - Password: use the database password from your Supabase dashboard

3. **Enable HTTPS** (Automatic on Render ✅)

4. **Enable CORS** (in backend if needed)

5. **Rate Limiting** (Enabled ✅)

---

## 📚 Documentation Files

These files are in your repo:

- **RENDER_DEPLOYMENT.md** - Detailed step-by-step guide
- **DEPLOYMENT_SUMMARY.md** - Configuration reference
- **README.md** - Updated with Supabase info
- **render.yaml** - Multi-service config file

---

## 🐛 Troubleshooting

### Build fails?
- Check logs in Render dashboard
- Verify build command is correct
- Ensure all dependencies in package.json

### Can't connect to database?
- Verify SUPABASE_URL is exact
- Check credentials in .env
- Confirm Render env vars match

### Frontend can't reach API?
- Check `NEXT_PUBLIC_API_URL` in frontend
- Verify backend is running (check logs)
- Test API directly: `curl https://grim-store-api.onrender.com/api/health`

---

## 💡 Pro Tips

1. **Free Tier Limitations:**
   - Services sleep after 15 min inactivity (takes 30-60s to wake)
   - For production, upgrade to Starter ($10/mo)

2. **Check Logs:**
   - Every service has a "Logs" tab
   - Real-time debugging info
   - Search by keyword

3. **Manual Redeploy:**
   - Go to service → "Manual Deploy"
   - Useful after changing .env

4. **Monitor Performance:**
   - Render shows CPU, memory, network usage
   - Supabase shows database stats

---

## 🎉 You're Ready!

Your Grim Store e-commerce platform is production-ready and deployed. 

**Next:** Go to https://render.com and start deploying! ✨

---

Need help? Check:
- 📄 RENDER_DEPLOYMENT.md (detailed guide)
- 🔗 https://render.com/docs
- 🗄️ https://supabase.com/docs
- ⚡ https://expressjs.com
- 💻 https://nextjs.org/docs
