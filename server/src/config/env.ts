import dotenv from "dotenv";

dotenv.config();

const required = ["SQL_DATABASE", "JWT_SECRET", "JWT_REFRESH_SECRET"] as const;

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`[env] ${key} is not set. Add it to server/.env before production use.`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  sqlHost: process.env.SQL_HOST ?? "127.0.0.1",
  sqlPort: Number(process.env.SQL_PORT ?? 3306),
  sqlUser: process.env.SQL_USER ?? "root",
  sqlPassword: process.env.SQL_PASSWORD ?? "",
  sqlDatabase: process.env.SQL_DATABASE ?? "premium_ecommerce",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
  adminUrl: process.env.ADMIN_URL ?? "http://localhost:3001",
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
