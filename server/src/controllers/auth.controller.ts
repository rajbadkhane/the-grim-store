import { cookieOptions } from "../constants/http.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { issueOtp, resetPassword, verifyOtpAndLogin, loginOrCreateSocialUser, registerWithPassword, loginWithPasswordService, loginAdminWithPasswordService } from "../services/auth.service.js";
import { ApiError } from "../utils/ApiError.js";
import { getUserById, publicUser, saveUserState } from "../lib/sql.js";
import { env } from "../config/env.js";

async function verifyGoogleCredential(idToken: string) {
  if (!idToken) throw new ApiError(400, "Google ID token is required");
  if (!env.googleClientId) throw new ApiError(500, "Google login is not configured");

  const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!googleRes.ok) throw new ApiError(401, "Invalid Google token");

  const payload = await googleRes.json() as Record<string, string>;

  if (payload.aud !== env.googleClientId) {
    throw new ApiError(401, "Google token audience mismatch");
  }
  if (!["accounts.google.com", "https://accounts.google.com"].includes(payload.iss ?? "")) {
    throw new ApiError(401, "Invalid Google token issuer");
  }
  if (!payload.email) throw new ApiError(400, "Google account has no email");
  if (payload.email_verified !== "true") throw new ApiError(400, "Google email is not verified");

  return {
    email: payload.email,
    name: payload.name || payload.given_name || "",
    avatar: payload.picture || ""
  };
}

function setSessionCookies(res: any, accessToken: string, refreshToken: string) {
  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.cookie("grim_auth_status", "true", { ...cookieOptions, httpOnly: false });
}

function safeClientRedirect(rawRedirect: unknown) {
  const fallback = "/account";
  const redirect = typeof rawRedirect === "string" ? rawRedirect : fallback;
  const safePath = redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : fallback;
  return `${env.clientUrl.replace(/\/$/, "")}${safePath}`;
}

export const requestOtp = asyncHandler(async (req, res) => {
  const { email, purpose } = req.body;
  const result = await issueOtp(email, purpose);
  res.json({ success: true, message: "Code sent", ...result });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code, purpose, name, phone } = req.body;
  if (purpose === "reset") throw new ApiError(400, "Use password reset to verify this code");
  const { user, accessToken, refreshToken } = await verifyOtpAndLogin(email, code, purpose, name, phone);
  setSessionCookies(res, accessToken, refreshToken);
  res.json({ success: true, user: publicUser(user) });
});

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await loginAdminWithPasswordService(email, password);
  setSessionCookies(res, accessToken, refreshToken);
  res.json({ success: true, user: publicUser(user) });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) throw new ApiError(401, "Refresh token required");
  const payload = verifyRefreshToken<{ id: string }>(token);
  const user = await getUserById(payload.id);
  if (!user || user.refreshToken !== token) throw new ApiError(401, "Invalid refresh token");
  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const nextRefresh = signRefreshToken({ id: user.id, role: user.role });
  user.refreshToken = nextRefresh;
  await saveUserState(user);
  setSessionCookies(res, accessToken, nextRefresh);
  res.json({ success: true });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user!) });
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.refreshToken = "";
    await saveUserState(req.user);
  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.clearCookie("grim_auth_status");
  res.json({ success: true, message: "Logged out" });
});

export const forgotPassword = requestOtp;

export const resetPasswordController = asyncHandler(async (req, res) => {
  const { email, code, password } = req.body;
  await resetPassword(email, code, password);
  res.json({ success: true, message: "Password reset complete" });
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  const { email, name, avatar } = await verifyGoogleCredential(idToken);
  const { user, accessToken, refreshToken } = await loginOrCreateSocialUser(email, name, avatar);
  setSessionCookies(res, accessToken, refreshToken);
  res.json({ success: true, user: publicUser(user) });
});

export const googleRedirect = asyncHandler(async (req, res) => {
  const credential = req.body?.credential;
  const bodyCsrf = req.body?.g_csrf_token;
  const cookieCsrf = req.cookies?.g_csrf_token;

  if (!cookieCsrf || !bodyCsrf || cookieCsrf !== bodyCsrf) {
    throw new ApiError(400, "Invalid Google sign-in request");
  }

  const { email, name, avatar } = await verifyGoogleCredential(credential);
  const { accessToken, refreshToken } = await loginOrCreateSocialUser(email, name, avatar);
  setSessionCookies(res, accessToken, refreshToken);
  res.redirect(303, safeClientRedirect(req.body?.state));
});

export const register = asyncHandler(async (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!email || !password || !name || !phone) throw new ApiError(400, "All fields are required");
  const { user, accessToken, refreshToken } = await registerWithPassword(email, password, name, phone);
  setSessionCookies(res, accessToken, refreshToken);
  res.json({ success: true, user: publicUser(user) });
});

export const loginWithPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required");
  const { user, accessToken, refreshToken } = await loginWithPasswordService(email, password);
  setSessionCookies(res, accessToken, refreshToken);
  res.json({ success: true, user: publicUser(user) });
});
