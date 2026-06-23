import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport/index.js";
import dns from "node:dns/promises";
import sgMail from "@sendgrid/mail";
import { Client as SendGridClient } from "@sendgrid/client";
import type { MailDataRequired, ResponseError } from "@sendgrid/mail";
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
let sendGridConfigured = false;

async function getTransporter() {
  transporterPromise ??= mailOptions().then((options) => nodemailer.createTransport(options));
  return transporterPromise;
}

function textFromHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getFromAddress() {
  return env.emailFrom || (env.emailUser ? `"The Grim Store" <${env.emailUser}>` : "The Grim Store <no-reply@thegrimstore.com>");
}

function configureSendGrid() {
  if (sendGridConfigured) return;

  const client = new SendGridClient();
  if (env.sendgridDataResidency.toLowerCase() === "eu") {
    client.setDataResidency("eu");
  }
  client.setApiKey(env.sendgridApiKey);
  sgMail.setClient(client);
  sgMail.setTimeout(10000);
  sendGridConfigured = true;
}

async function sendWithSendGrid(to: string, subject: string, html: string) {
  configureSendGrid();
  const message: MailDataRequired = {
    to,
    from: getFromAddress(),
    subject,
    text: textFromHtml(html),
    html
  };

  try {
    await sgMail.send(message);
  } catch (error) {
    const responseError = error as ResponseError;
    const details = responseError.response?.body ? JSON.stringify(responseError.response.body) : responseError.message;
    throw new Error(`SendGrid email failed: ${details}`);
  }
}

async function sendMail(to: string, subject: string, html: string) {
  if (env.sendgridApiKey) {
    await sendWithSendGrid(to, subject, html);
    return;
  }

  if (!env.emailUser || !env.emailPass) {
    console.log(`[email:dev] ${subject} -> ${to}\n${html}`);
    return;
  }
  const transporter = await getTransporter();
  await transporter.sendMail({ from: getFromAddress(), to, subject, html });
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
