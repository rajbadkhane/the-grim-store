import mysql from "mysql2/promise";
import { env } from "./env.js";

export const pool = mysql.createPool({
  host: env.sqlHost,
  port: env.sqlPort,
  user: env.sqlUser,
  password: env.sqlPassword,
  database: env.sqlDatabase,
  connectionLimit: 12,
  namedPlaceholders: true,
  supportBigNumbers: true,
  decimalNumbers: true,
  timezone: "Z"
});

export async function connectDatabase() {
  const bootstrap = await mysql.createConnection({
    host: env.sqlHost,
    port: env.sqlPort,
    user: env.sqlUser,
    password: env.sqlPassword
  });
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${env.sqlDatabase}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await bootstrap.end();
  await initializeSqlSchema();
  console.log(`[db] SQL connected: ${env.sqlHost}:${env.sqlPort}/${env.sqlDatabase}`);
}

async function initializeSqlSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(160) DEFAULT '',
      email VARCHAR(190) NOT NULL UNIQUE,
      phone VARCHAR(32) DEFAULT '',
      role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
      avatar TEXT NULL,
      wishlist JSON NULL,
      cart JSON NULL,
      addresses JSON NULL,
      email_verified BOOLEAN NOT NULL DEFAULT FALSE,
      refresh_token TEXT NULL,
      password_hash TEXT NULL,
      is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
      last_login DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_users_role (role),
      INDEX idx_users_email (email)
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
