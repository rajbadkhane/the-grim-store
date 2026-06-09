import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport/index.js";
import dns from "node:dns/promises";
import { env } from "../config/env.js";

async function resolveSmtpHost() {
  if (env.smtpHost !== "smtp.gmail.com") return env.smtpHost;
  try {
    const addresses = await dns.resolve4(env.smtpHost);
    return addresses[0] ?? env.smtpHost;
  } catch {
    return env.smtpHost;
  }
}

const mailOptions = async (): Promise<SMTPTransport.Options> => ({
  host: await resolveSmtpHost(),
  port: env.smtpPort,
  secure: env.smtpSecure,
  auth: env.emailUser && env.emailPass ? { user: env.emailUser, pass: env.emailPass } : undefined,
  tls: { servername: env.smtpHost },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000
});

let transporterPromise: Promise<nodemailer.Transporter> | null = null;

async function getTransporter() {
  transporterPromise ??= mailOptions().then((options) => nodemailer.createTransport(options));
  return transporterPromise;
}

async function sendMail(to: string, subject: string, html: string) {
  if (env.resendApiKey) {
    const from = env.emailFrom || (env.emailUser ? `"The Grim Store" <${env.emailUser}>` : "The Grim Store <onboarding@resend.dev>");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "the-grim-store-api"
      },
      body: JSON.stringify({ from, to, subject, html })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Email API failed: ${response.status} ${errorText}`);
    }
    return;
  }

  if (!env.emailUser || !env.emailPass) {
    console.log(`[email:dev] ${subject} -> ${to}\n${html}`);
    return;
  }
  const transporter = await getTransporter();
  await transporter.sendMail({ from: env.emailFrom || `"The Grim Store" <${env.emailUser}>`, to, subject, html });
}

export const emailService = {
  sendOtp(email: string, code: string, purpose: string) {
    return sendMail(
      email,
      "Your sign-in code",
      `<div style="font-family:Arial,sans-serif;background:#111;color:#fff;padding:24px;border-radius:14px"><h2>${code}</h2><p>This code expires in 10 minutes.</p></div>`
    );
  },
  sendWelcome(email: string, name: string) {
    return sendMail(email, "Welcome to The Grim Store", `<h2>Welcome ${name || "there"}</h2><p>Your account is ready.</p>`);
  },
  sendOrderConfirmation(email: string, orderId: string) {
    return sendMail(email, `Order confirmed ${orderId}`, `<h2>Order ${orderId} confirmed</h2><p>We will keep you posted.</p>`);
  },
  sendPasswordReset(email: string, code: string) {
    return sendMail(email, "Reset your password", `<h2>${code}</h2><p>This code expires in 10 minutes.</p>`);
  }
};
