import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport/index.js";
import { env } from "../config/env.js";

const mailOptions = {
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpSecure,
  family: 4,
  auth: env.emailUser && env.emailPass ? { user: env.emailUser, pass: env.emailPass } : undefined,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000
} as SMTPTransport.Options & { family: 4 };

const transporter = nodemailer.createTransport(mailOptions);

async function sendMail(to: string, subject: string, html: string) {
  if (!env.emailUser || !env.emailPass) {
    console.log(`[email:dev] ${subject} -> ${to}\n${html}`);
    return;
  }
  await transporter.sendMail({ from: `"The Grim Store" <${env.emailUser}>`, to, subject, html });
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
