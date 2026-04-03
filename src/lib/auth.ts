import { betterAuth } from "better-auth";
import { Pool } from "pg";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  ...(process.env.NODE_ENV === "development" && {
    logger: true,
    debug: true,
  }),
});

async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  return transporter.sendMail({
    from: `"Better Auth" <${process.env.SMTP_ADMIN_EMAIL}>`,
    to,
    subject,
    text,
    html,
  });
}

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: true }
        : false,
  }),
  // Advanced mapping to ensure Prisma field names match Better Auth logic

  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email",
        text: `Verify your account: ${url}`,
        html: `<p>Please verify your account: <a href="${url}">Verify Email</a></p>`,
      });
    },
  },

  passwordReset: {
    sendResetPasswordEmail: async ({
      user,
      url,
    }: {
      user: any;
      url: string;
    }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Reset your password: ${url}`,
        html: `<p>Reset your password: <a href="${url}">Reset Password</a></p>`,
      });
    },
  },
});
