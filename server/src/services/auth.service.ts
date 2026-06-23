import bcrypt from "bcryptjs";
import { createOtp, otpExpiry } from "../utils/otp.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { emailService } from "./email.service.js";
import { ApiError } from "../utils/ApiError.js";
import { execute, getUserByEmail, id, mapUser, row, saveUserState } from "../lib/sql.js";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function issueOtp(email: string, purpose: "signup" | "login" | "reset") {
  const normalizedEmail = normalizeEmail(email);
  if (purpose === "reset") {
    const user = await getUserByEmail(normalizedEmail);
    if (!user) return { sent: true };
  }

  const code = createOtp();
  const codeHash = await bcrypt.hash(code, 10);
  await execute("DELETE FROM otps WHERE email = :email AND purpose = :purpose", { email: normalizedEmail, purpose });
  await execute("INSERT INTO otps (id, email, code_hash, purpose, expires_at) VALUES (:id, :email, :codeHash, :purpose, :expiresAt)", {
    id: id(),
    email: normalizedEmail,
    codeHash,
    purpose,
    expiresAt: otpExpiry()
  });
  if (purpose === "reset") await emailService.sendPasswordReset(normalizedEmail, code);
  else await emailService.sendOtp(normalizedEmail, code, purpose);
  return { sent: true };
}

async function verifyOtpRecord(email: string, code: string, purpose: "signup" | "login" | "reset") {
  const record = await row("SELECT * FROM otps WHERE email = :email AND purpose = :purpose ORDER BY created_at DESC LIMIT 1", { email, purpose });
  if (!record || new Date(record.expires_at).getTime() < Date.now()) throw new ApiError(400, "Code expired or invalid");
  if (record.attempts >= 5) throw new ApiError(429, "Too many attempts");

  const ok = await bcrypt.compare(code, record.code_hash);
  if (!ok) {
    await execute("UPDATE otps SET attempts = attempts + 1 WHERE id = :id", { id: record.id });
    throw new ApiError(400, "Invalid code");
  }

  return record;
}

export async function verifyOtpAndLogin(email: string, code: string, purpose: "signup" | "login", name?: string, phone?: string) {
  const normalizedEmail = normalizeEmail(email);
  const record = await verifyOtpRecord(normalizedEmail, code, purpose);

  let user = await getUserByEmail(normalizedEmail);
  if (!user) {
    const userId = id();
    await execute(
      `INSERT INTO users (id, email, name, phone, email_verified, wishlist, cart, addresses)
       VALUES (:id, :email, :name, :phone, TRUE, JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY())`,
      { id: userId, email: normalizedEmail, name: name ?? "", phone: phone ?? "" }
    );
    user = mapUser(await row("SELECT * FROM users WHERE id = :userId", { userId }))!;
    await emailService.sendWelcome(normalizedEmail, name ?? "");
  } else if (phone && !user.phone) {
    user.phone = phone;
  }
  if (user.isBlocked) throw new ApiError(403, "This account is blocked");

  user.emailVerified = true;
  user.lastLogin = new Date();
  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id, role: user.role });
  user.refreshToken = refreshToken;
  await saveUserState(user);
  await execute("DELETE FROM otps WHERE id = :id", { id: record.id });

  return { user, accessToken, refreshToken };
}

export async function resetPassword(email: string, code: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const user = await getUserByEmail(normalizedEmail);
  if (!user) throw new ApiError(400, "Code expired or invalid");
  const record = await verifyOtpRecord(normalizedEmail, code, "reset");
  const passwordHash = await bcrypt.hash(password, 12);
  await execute("UPDATE users SET password_hash = :passwordHash WHERE email = :email", { email: normalizedEmail, passwordHash });
  await execute("DELETE FROM otps WHERE id = :id", { id: record.id });
}

export async function loginOrCreateSocialUser(email: string, name: string, avatar?: string) {
  const normalizedEmail = normalizeEmail(email);
  let user = await getUserByEmail(normalizedEmail);
  
  if (!user) {
    const userId = id();
    await execute(
      `INSERT INTO users (id, email, name, phone, email_verified, wishlist, cart, addresses, avatar)
       VALUES (:id, :email, :name, '', TRUE, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, :avatar)`,
      { id: userId, email: normalizedEmail, name: name ?? "", avatar: avatar ?? "" }
    );
    user = mapUser(await row("SELECT * FROM users WHERE id = :userId", { userId }))!;
    await emailService.sendWelcome(normalizedEmail, name ?? "");
  } else {
    if (name && !user.name) {
      user.name = name;
    }
    if (avatar && !user.avatar) {
      user.avatar = avatar;
    }
  }

  if (user.isBlocked) throw new ApiError(403, "This account is blocked");

  user.emailVerified = true;
  user.lastLogin = new Date();
  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id, role: user.role });
  user.refreshToken = refreshToken;
  await saveUserState(user);

  return { user, accessToken, refreshToken };
}

export async function registerWithPassword(email: string, password: string, name: string, phone: string) {
  const normalizedEmail = normalizeEmail(email);
  let user = await getUserByEmail(normalizedEmail);
  if (user) throw new ApiError(400, "User already exists with this email");

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = id();
  await execute(
    `INSERT INTO users (id, email, name, phone, email_verified, password_hash, wishlist, cart, addresses)
     VALUES (:id, :email, :name, :phone, TRUE, :passwordHash, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)`,
    { id: userId, email: normalizedEmail, name, phone, passwordHash }
  );

  const createdUser = mapUser(await row("SELECT * FROM users WHERE id = :userId", { userId }))!;
  await emailService.sendWelcome(normalizedEmail, name);

  const accessToken = signAccessToken({ id: createdUser.id, role: createdUser.role });
  const refreshToken = signRefreshToken({ id: createdUser.id, role: createdUser.role });
  createdUser.refreshToken = refreshToken;
  await saveUserState(createdUser);

  return { user: createdUser, accessToken, refreshToken };
}

export async function loginWithPasswordService(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const user = await getUserByEmail(normalizedEmail);
  if (!user) throw new ApiError(400, "Invalid email or password");
  if (!user.passwordHash) {
    throw new ApiError(400, "Password is not set for this account. Please log in using OTP first, and set a password in your profile page.");
  }

  const isOk = await bcrypt.compare(password, user.passwordHash);
  if (!isOk) throw new ApiError(400, "Invalid email or password");

  if (user.isBlocked) throw new ApiError(403, "This account is blocked");

  user.lastLogin = new Date();
  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id, role: user.role });
  user.refreshToken = refreshToken;
  await saveUserState(user);

  return { user, accessToken, refreshToken };
}

export async function loginAdminWithPasswordService(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const user = await getUserByEmail(normalizedEmail);
  if (!user || user.role !== "admin" || !user.passwordHash) {
    throw new ApiError(400, "Invalid admin email or password");
  }

  const isOk = await bcrypt.compare(password, user.passwordHash);
  if (!isOk) throw new ApiError(400, "Invalid admin email or password");
  if (user.isBlocked) throw new ApiError(403, "This account is blocked");

  user.emailVerified = true;
  user.lastLogin = new Date();
  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id, role: user.role });
  user.refreshToken = refreshToken;
  await saveUserState(user);

  return { user, accessToken, refreshToken };
}
