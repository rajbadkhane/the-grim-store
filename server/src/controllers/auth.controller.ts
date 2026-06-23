import { cookieOptions } from "../constants/http.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { issueOtp, resetPassword, verifyOtpAndLogin, loginOrCreateSocialUser, registerWithPassword, loginWithPasswordService } from "../services/auth.service.js";
import { ApiError } from "../utils/ApiError.js";
import { getUserById, publicUser, saveUserState } from "../lib/sql.js";
import { env } from "../config/env.js";

export const requestOtp = asyncHandler(async (req, res) => {
  const { email, purpose } = req.body;
  const result = await issueOtp(email, purpose);
  res.json({ success: true, message: "Code sent", ...result });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code, purpose, name, phone } = req.body;
  if (purpose === "reset") throw new ApiError(400, "Use password reset to verify this code");
  const { user, accessToken, refreshToken } = await verifyOtpAndLogin(email, code, purpose, name, phone);
  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, cookieOptions);
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
  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", nextRefresh, cookieOptions);
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
  if (!idToken) throw new ApiError(400, "Google ID token is required");
  if (!env.googleClientId) throw new ApiError(500, "Google login is not configured");

  // Verify the ID token with Google's tokeninfo endpoint
  const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!googleRes.ok) throw new ApiError(401, "Invalid Google token");

  const payload = await googleRes.json() as Record<string, string>;

  if (payload.aud !== env.googleClientId) {
    throw new ApiError(401, "Google token audience mismatch");
  }
  if (!["accounts.google.com", "https://accounts.google.com"].includes(payload.iss ?? "")) {
    throw new ApiError(401, "Invalid Google token issuer");
  }

  const email = payload.email;
  const name = payload.name || payload.given_name || "";
  const avatar = payload.picture || "";

  if (!email) throw new ApiError(400, "Google account has no email");
  if (payload.email_verified !== "true") throw new ApiError(400, "Google email is not verified");

  const { user, accessToken, refreshToken } = await loginOrCreateSocialUser(email, name, avatar);
  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.json({ success: true, user: publicUser(user) });
});

export const register = asyncHandler(async (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!email || !password || !name || !phone) throw new ApiError(400, "All fields are required");
  const { user, accessToken, refreshToken } = await registerWithPassword(email, password, name, phone);
  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.json({ success: true, user: publicUser(user) });
});

export const loginWithPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required");
  const { user, accessToken, refreshToken } = await loginWithPasswordService(email, password);
  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.json({ success: true, user: publicUser(user) });
});
