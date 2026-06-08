import { randomInt } from "node:crypto";

export function createOtp() {
  return randomInt(100000, 1000000).toString();
}

export function otpExpiry(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}
