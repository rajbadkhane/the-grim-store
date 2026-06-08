import postgres from "postgres";
import { env } from "./env.js";

// PostgreSQL client for Supabase or direct PostgreSQL
export const sql = postgres({
  host: env.supabaseUrl ? env.supabaseUrl.replace("https://", "").split(".")[0] + ".db.supabase.co" : env.sqlHost,
  port: env.sqlPort,
  username: env.sqlUser,
  password: env.sqlPassword || "",
  database: env.sqlDatabase,
  ssl: env.nodeEnv === "production" ? "require" : false
});

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
        order_db_id UUID NOT NULL REFERENCES orders(id),
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

    await sql`CREATE UNIQUE INDEX IF NOT EXISTS uniq_review ON reviews(user_id, product_id, order_db_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating)`;

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

    console.log("[db] Schema initialized successfully");
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      console.log("[db] Tables already exist");
    } else {
      console.error("[db] Schema initialization error:", error);
    }
  }
}
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS otps (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(190) NOT NULL,
      code_hash TEXT NOT NULL,
      purpose ENUM('signup','login','reset') NOT NULL,
      expires_at DATETIME NOT NULL,
      attempts INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_otps_email_purpose (email, purpose),
      INDEX idx_otps_expires (expires_at)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      slug VARCHAR(190) NOT NULL UNIQUE,
      image TEXT NULL,
      banner TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS subcategories (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      slug VARCHAR(190) NOT NULL,
      category_id VARCHAR(36) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_subcategory (slug, category_id),
      INDEX idx_subcategories_category (category_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(190) NOT NULL UNIQUE,
      description TEXT NOT NULL,
      short_description TEXT NULL,
      brand VARCHAR(160) NOT NULL,
      category_id VARCHAR(36) NOT NULL,
      subcategory_id VARCHAR(36) NULL,
      gender ENUM('men','women','unisex','kids') NOT NULL DEFAULT 'unisex',
      tags JSON NULL,
      price DECIMAL(10,2) NOT NULL,
      sale_price DECIMAL(10,2) NOT NULL,
      discount_percentage INT NOT NULL DEFAULT 0,
      stock INT NOT NULL DEFAULT 0,
      sku VARCHAR(120) NOT NULL UNIQUE,
      colors JSON NULL,
      sizes JSON NULL,
      images JSON NULL,
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      trending BOOLEAN NOT NULL DEFAULT FALSE,
      bestseller BOOLEAN NOT NULL DEFAULT FALSE,
      rating_average DECIMAL(3,2) NOT NULL DEFAULT 0,
      rating_count INT NOT NULL DEFAULT 0,
      rating_distribution JSON NULL,
      seo_title TEXT NULL,
      seo_description TEXT NULL,
      meta_keywords JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FULLTEXT KEY ft_products (title, brand, description),
      INDEX idx_products_category (category_id),
      INDEX idx_products_brand (brand),
      INDEX idx_products_gender (gender),
      INDEX idx_products_flags (featured, trending, bestseller)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(36) PRIMARY KEY,
      order_id VARCHAR(80) NOT NULL UNIQUE,
      user_id VARCHAR(36) NOT NULL,
      products JSON NOT NULL,
      payment_info JSON NULL,
      shipping_address JSON NOT NULL,
      order_status ENUM('placed','confirmed','packed','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'placed',
      tracking_status VARCHAR(255) DEFAULT 'Order placed',
      total_amount DECIMAL(10,2) NOT NULL,
      shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
      discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      delivery_date DATETIME NULL,
      payment_status ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_orders_user (user_id),
      INDEX idx_orders_status (order_status),
      INDEX idx_orders_payment (payment_status)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id VARCHAR(36) PRIMARY KEY,
      code VARCHAR(80) NOT NULL UNIQUE,
      discount_type ENUM('percentage','flat') NOT NULL,
      value DECIMAL(10,2) NOT NULL,
      expiry_date DATETIME NOT NULL,
      minimum_purchase DECIMAL(10,2) NOT NULL DEFAULT 0,
      usage_limit INT NOT NULL DEFAULT 100,
      used_count INT NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      product_id VARCHAR(36) NOT NULL,
      order_db_id VARCHAR(36) NOT NULL,
      user_name VARCHAR(160) NOT NULL,
      user_avatar TEXT NULL,
      rating INT NOT NULL,
      title VARCHAR(140) NOT NULL,
      comment TEXT NOT NULL,
      images JSON NULL,
      verified_purchase BOOLEAN NOT NULL DEFAULT TRUE,
      helpful_count INT NOT NULL DEFAULT 0,
      helpful_users JSON NULL,
      reported BOOLEAN NOT NULL DEFAULT FALSE,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_review (user_id, product_id, order_db_id),
      INDEX idx_reviews_product (product_id),
      INDEX idx_reviews_rating (rating)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pages (
      id VARCHAR(36) PRIMARY KEY,
      slug VARCHAR(190) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      body LONGTEXT NOT NULL,
      seo_title TEXT NULL,
      seo_description TEXT NULL,
      published BOOLEAN NOT NULL DEFAULT TRUE,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await ensureColumn("products", "variants", "JSON NULL");
  await ensureColumn("products", "summary", "JSON NULL");
  await ensureColumn("products", "description_html", "LONGTEXT NULL");
  await ensureColumn("products", "care_instructions", "JSON NULL");
  await ensureColumn("products", "size_chart", "JSON NULL");
  await ensureColumn("products", "delivery_info", "JSON NULL");
  await ensureColumn("products", "return_policy", "TEXT NULL");
}

async function ensureColumn(table: string, column: string, definition: string) {
  const [existing] = await pool.query<any[]>(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = :schema AND TABLE_NAME = :table AND COLUMN_NAME = :column`,
    { schema: env.sqlDatabase, table, column }
  );

  if (existing.length === 0) {
    await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  }
}
