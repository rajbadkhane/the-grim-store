import postgres from "postgres";
import { env } from "./env.js";

// Supabase pooler always requires SSL; local dev (127.0.0.1/localhost) does not
const isRemoteHost = env.sqlHost !== "127.0.0.1" && env.sqlHost !== "localhost";
const sslMode = env.nodeEnv === "production" || isRemoteHost ? "require" : false;

// PostgreSQL client for Supabase or direct PostgreSQL
export const sql = env.databaseUrl
  ? postgres(env.databaseUrl, { ssl: sslMode })
  : postgres({
      host: env.sqlHost,
      port: env.sqlPort,
      username: env.sqlUser,
      password: env.sqlPassword || "",
      database: env.sqlDatabase,
      ssl: sslMode
    });

const defaultAdminUsers = [
  {
    name: "Store Admin",
    email: "admin@thegrimstore.com",
    passwordHash: "$2b$12$eXPSdPgByrsAq0GvihhM4uLne18pffdGqhiwPUWvpaxPaJmumdhMq"
  },
  {
    name: "Store Manager",
    email: "manager@thegrimstore.com",
    passwordHash: "$2b$12$Y237N44hblD0awcegVNpTOrQddcjIOUWdLjURxg/ClpEy3lpOQjNe"
  },
  {
    name: "Store Operations",
    email: "ops@thegrimstore.com",
    passwordHash: "$2b$12$C2yePrKNh/Jq2J/Hp0Kjp.IfFNN6Mx7zJ9L8e5YORXeGAvn97qzHa"
  }
];

export async function connectDatabase() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log(`[db] PostgreSQL connected successfully`);
    await initializeSqlSchema();
  } catch (error) {
    console.error("[db] Database connection failed:", error);
    throw error;
  }
}

async function initializeSqlSchema() {
  try {
    // Enable UUID extension
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    
    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(160) DEFAULT '',
        email VARCHAR(190) NOT NULL UNIQUE,
        phone VARCHAR(32) DEFAULT '',
        role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
        avatar TEXT,
        wishlist JSONB DEFAULT '[]'::jsonb,
        cart JSONB DEFAULT '[]'::jsonb,
        addresses JSONB DEFAULT '[]'::jsonb,
        email_verified BOOLEAN NOT NULL DEFAULT FALSE,
        refresh_token TEXT,
        password_hash TEXT,
        is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;

    await sql`
      CREATE TABLE IF NOT EXISTS otps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(190) NOT NULL,
        code_hash TEXT NOT NULL,
        purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('signup', 'login', 'reset')),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        attempts INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_otps_email_purpose ON otps(email, purpose)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_otps_expires ON otps(expires_at)`;

    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(160) NOT NULL,
        slug VARCHAR(190) NOT NULL UNIQUE,
        image TEXT,
        banner TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS subcategories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(160) NOT NULL,
        slug VARCHAR(190) NOT NULL,
        category_id UUID NOT NULL REFERENCES categories(id),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`CREATE UNIQUE INDEX IF NOT EXISTS uniq_subcategory ON subcategories(slug, category_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id)`;

    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(190) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        short_description TEXT,
        brand VARCHAR(160) NOT NULL,
        category_id UUID NOT NULL REFERENCES categories(id),
        subcategory_id UUID REFERENCES subcategories(id),
        gender VARCHAR(20) NOT NULL DEFAULT 'unisex' CHECK (gender IN ('men', 'women', 'unisex', 'kids')),
        tags JSONB DEFAULT '[]'::jsonb,
        price NUMERIC(10,2) NOT NULL,
        sale_price NUMERIC(10,2) NOT NULL,
        discount_percentage INT NOT NULL DEFAULT 0,
        stock INT NOT NULL DEFAULT 0,
        sku VARCHAR(120) NOT NULL UNIQUE,
        colors JSONB DEFAULT '[]'::jsonb,
        sizes JSONB DEFAULT '[]'::jsonb,
        images JSONB DEFAULT '[]'::jsonb,
        featured BOOLEAN NOT NULL DEFAULT FALSE,
        trending BOOLEAN NOT NULL DEFAULT FALSE,
        bestseller BOOLEAN NOT NULL DEFAULT FALSE,
        rating_average NUMERIC(3,2) NOT NULL DEFAULT 0,
        rating_count INT NOT NULL DEFAULT 0,
        rating_distribution JSONB DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0}'::jsonb,
        seo_title TEXT,
        seo_description TEXT,
        meta_keywords JSONB DEFAULT '[]'::jsonb,
        variants JSONB DEFAULT '[]'::jsonb,
        summary JSONB DEFAULT '[]'::jsonb,
        description_html TEXT,
        care_instructions JSONB DEFAULT '[]'::jsonb,
        size_chart JSONB DEFAULT '[]'::jsonb,
        delivery_info JSONB DEFAULT '{}'::jsonb,
        return_policy TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_flags ON products(featured, trending, bestseller)`;

    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id VARCHAR(80) NOT NULL UNIQUE,
        user_id UUID NOT NULL REFERENCES users(id),
        products JSONB NOT NULL,
        payment_info JSONB,
        shipping_address JSONB NOT NULL,
        order_status VARCHAR(30) NOT NULL DEFAULT 'placed' CHECK (order_status IN ('placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded')),
        tracking_status VARCHAR(255) DEFAULT 'Order placed',
        total_amount NUMERIC(10,2) NOT NULL,
        shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
        discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
        delivery_date TIMESTAMP WITH TIME ZONE,
        payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment_status)`;

    await sql`
      CREATE TABLE IF NOT EXISTS coupons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(80) NOT NULL UNIQUE,
        discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
        value NUMERIC(10,2) NOT NULL,
        expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
        minimum_purchase NUMERIC(10,2) NOT NULL DEFAULT 0,
        usage_limit INT NOT NULL DEFAULT 100,
        used_count INT NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        product_id UUID NOT NULL REFERENCES products(id),
        order_db_id UUID REFERENCES orders(id),
        user_name VARCHAR(160) NOT NULL,
        user_avatar TEXT,
        rating INT NOT NULL,
        title VARCHAR(140) NOT NULL,
        comment TEXT NOT NULL,
        images JSONB DEFAULT '[]'::jsonb,
        verified_purchase BOOLEAN NOT NULL DEFAULT TRUE,
        helpful_count INT NOT NULL DEFAULT 0,
        helpful_users JSONB DEFAULT '[]'::jsonb,
        reported BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`ALTER TABLE reviews ALTER COLUMN order_db_id DROP NOT NULL`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS uniq_review ON reviews(user_id, product_id, order_db_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(description, '')))`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_sale_price ON products(sale_price)`;

    await sql`
      CREATE TABLE IF NOT EXISTS pages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(190) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        seo_title TEXT,
        seo_description TEXT,
        published BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS seller_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_name VARCHAR(180) NOT NULL,
        owner_name VARCHAR(160) NOT NULL,
        email VARCHAR(190) NOT NULL,
        phone VARCHAR(32) NOT NULL,
        city VARCHAR(120) NOT NULL,
        pincode VARCHAR(16) NOT NULL,
        category VARCHAR(160) NOT NULL,
        product_count VARCHAR(80) DEFAULT '',
        monthly_sales VARCHAR(120) DEFAULT '',
        gst_number VARCHAR(80) DEFAULT '',
        website TEXT DEFAULT '',
        message TEXT DEFAULT '',
        status VARCHAR(24) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
        admin_note TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_seller_requests_status ON seller_requests(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_seller_requests_created ON seller_requests(created_at DESC)`;

    await ensureDefaultAdminUsers();

    console.log("[db] Schema initialized successfully");
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      console.log("[db] Tables already exist");
    } else {
      console.error("[db] Schema initialization error:", error);
    }
  }
}

async function ensureDefaultAdminUsers() {
  for (const admin of defaultAdminUsers) {
    await sql`
      INSERT INTO users (name, email, role, email_verified, password_hash, wishlist, cart, addresses)
      VALUES (${admin.name}, ${admin.email}, 'admin', TRUE, ${admin.passwordHash}, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        role = 'admin',
        email_verified = TRUE,
        password_hash = EXCLUDED.password_hash,
        is_blocked = FALSE,
        updated_at = CURRENT_TIMESTAMP
    `;
  }
}
