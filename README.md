# The Grim Store

Enterprise-grade premium ecommerce platform with three independent TypeScript apps:

- `client` - Next.js 15 customer storefront on port `3000`
- `admin` - independent Next.js 15 admin dashboard on port `3001`
- `server` - Express + XAMPP MySQL/MariaDB REST API on port `5000`

## Core Features

- Email OTP signup/login, resend OTP, refresh-token sessions, logout, forgot/reset password architecture
- SQL primary database on XAMPP MySQL/MariaDB with tables for users, addresses, products, categories, subcategories, orders, coupons, reviews, OTPs, and CMS pages
- HTTP-only cookie JWT auth, Helmet, rate limiting, sanitization, validation, protected routes, admin guard
- Cart, wishlist, multi-address management, checkout, COD and Razorpay-ready payment service, webhook-ready verification utility
- Verified-buyer review/rating system with duplicate prevention, moderation hook, helpful/report actions, rating distribution recalculation
- Cloudinary-ready upload middleware and Supabase event architecture for future realtime notifications/analytics
- Premium black/red responsive storefront with hero, PLP, PDP, cart, checkout, account, reviews UI, sticky header, mega menu, mobile nav, animations
- Independent responsive admin with collapsible sidebar, dashboard analytics, charts, products, orders, users, coupons, categories, CMS settings
- SEO foundations: metadata, canonical URLs, robots, sitemap, Product JSON-LD, semantic HTML, ISR-ready product pages, optimized `next/image`

## Setup

Copy env files:

```bash
cp .env.example server/.env
cp client/.env.example client/.env.local
cp admin/.env.example admin/.env.local
```

Install dependencies:

```bash
npm install
npm --prefix server install
npm --prefix client install
npm --prefix admin install
```

Start XAMPP MySQL from the XAMPP control panel. The API will automatically create the `premium_ecommerce` database and tables.

Seed demo data:

```bash
npm --prefix server run seed
```

Run everything:

```bash
npm run dev
```

URLs:

- Storefront: `http://localhost:3000`
- Admin: `http://localhost:3001`
- API health: `http://localhost:5000/api/v1/health`

## XAMPP Local Testing

XAMPP Apache is configured as a reverse proxy front door:

- Storefront: `http://grim.local` -> `http://127.0.0.1:3000`
- Admin: `http://admin.grim.local` -> `http://127.0.0.1:3001`
- API: `http://api.grim.local` -> `http://127.0.0.1:5000`

Run PowerShell as Administrator once:

```powershell
.\scripts\setup-xampp-hosts.ps1
```

Then start the local XAMPP testing stack:

```powershell
.\scripts\start-local-xampp-stack.ps1
```

XAMPP provides the SQL database and Apache reverse proxy for this project. Keep XAMPP MySQL running locally, then start the API with:

```bash
npm --prefix server run dev
```

## API Surface

- `POST /api/v1/auth/request-otp`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `GET /api/v1/products`
- `GET /api/v1/products/:slug`
- `POST /api/v1/users/cart`
- `POST /api/v1/users/addresses`
- `POST /api/v1/orders/checkout`
- `POST /api/v1/orders/verify-payment`
- `GET /api/v1/reviews/product/:productId`
- `POST /api/v1/reviews`
- `GET /api/v1/admin/dashboard`

## Deployment Notes

- Storefront/admin are Vercel-ready Next.js apps.
- API is ready for VPS, Railway, or Render. Use `npm --prefix server run build && npm --prefix server start`.
- SQL defaults to XAMPP MariaDB/MySQL at `127.0.0.1:3306`, database `premium_ecommerce`, user `root`, blank password.
- Add production secrets for JWT, email, Cloudinary, Supabase, and Razorpay before launch.
