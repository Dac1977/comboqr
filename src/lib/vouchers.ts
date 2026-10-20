import { randomBytes } from "crypto";

export function generateToken() {
  return randomBytes(24).toString("base64url");
}

export function voucherUrl(token: string) {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return `${base}/scan/${token}`;
}
