import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  map: {
    user: "users",
    session: "sessions",
    account: "accounts",
    verification: "verifications",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  baseURL: process.env.BETTER_AUTH_URL,

  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: { email: string };
      url: string;
    }) => {
      await transporter.sendMail({
        from: '"Better Auth" <no-reply@pitron-halomot.org>',
        to: user.email,
        subject: "Verify your email",
        html: `
          <h1>Verify your account</h1>
          <a href="${url}">Click here to verify</a>
        `,
      });
    },
  },

  passwordReset: {
    sendResetPasswordEmail: async ({
      user,
      url,
    }: {
      user: { email: string };
      url: string;
    }) => {
      await transporter.sendMail({
        from: '"Better Auth" <no-reply@pitron-halomot.org>',
        to: user.email,
        subject: "Reset your password",
        html: `
          <h1>Reset Password</h1>
          <a href="${url}">Reset your password</a>
        `,
      });
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
});
