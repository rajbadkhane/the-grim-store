import dotenv from "dotenv";

dotenv.config();

// For Supabase, you need: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
// For local PostgreSQL, you need: SQL_HOST, SQL_PORT, SQL_USER, SQL_PASSWORD, SQL_DATABASE
const required = ["JWT_SECRET", "JWT_REFRESH_SECRET"] as const;

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`[env] ${key} is not set. Add it to server/.env before production use.`);
  }
}

// Extract Supabase connection details from URL if available
const extractSupabaseDb = (url: string) => {
  try {
    // Supabase DB URL format: https://project.supabase.co
    const projectId = url.replace("https://", "").split(".")[0];
    return {
      host: `db.${projectId}.supabase.co`,
      port: 5432,
      user: process.env.SUPABASE_DB_USER || "postgres",
      password: process.env.SUPABASE_DB_PASSWORD || ""
    };
  } catch {
    return null;
  }
};

const supabaseDb = process.env.SUPABASE_URL ? extractSupabaseDb(process.env.SUPABASE_URL) : null;

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  sqlHost: supabaseDb?.host || process.env.SQL_HOST || "127.0.0.1",
  sqlPort: supabaseDb?.port || Number(process.env.SQL_PORT ?? 5432),
  sqlUser: supabaseDb?.user || process.env.SQL_USER || "postgres",
  sqlPassword: supabaseDb?.password || process.env.SQL_PASSWORD || "",
  sqlDatabase: process.env.SQL_DATABASE ?? "postgres",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
  adminUrl: process.env.ADMIN_URL ?? "http://localhost:3001",
  corsOrigins: (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET ?? "dev_access_secret_change_me",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "dev_refresh_secret_change_me",
  emailUser: process.env.EMAIL_USER ?? "",
  emailPass: process.env.EMAIL_PASS ?? "",
  cloudinaryName: process.env.CLOUDINARY_NAME ?? "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? "",
  cloudinarySecret: process.env.CLOUDINARY_SECRET ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? "",
  razorpaySecret: process.env.RAZORPAY_SECRET ?? "",
  shiprocketEmail: process.env.SHIPROCKET_EMAIL ?? "",
  shiprocketPassword: process.env.SHIPROCKET_PASSWORD ?? ""
};
