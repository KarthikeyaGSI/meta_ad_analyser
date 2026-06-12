import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink, emailOTP } from "better-auth/plugins";
import { db } from "./db";
import * as schema from "./db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.account,
      verification: schema.verification,
    }
  }),
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (process.env.NODE_ENV !== "development" || process.env.EMAIL_USER) {
          try {
            await transporter.sendMail({
              from: `"Vero" <${process.env.EMAIL_USER}>`,
              to: email,
              subject: "Your Vero Login Code",
              html: `<h1>${otp}</h1><p>Enter this 6-digit code to log in. It expires in 10 minutes.</p>`,
            });
            console.log(`[OTP SENT]: ${otp} for ${email} via Nodemailer`);
          } catch (e: any) {
            console.error("Failed to send OTP via Nodemailer:", e.message);
            throw e;
          }
        } else {
          console.log(`[DEV OTP]: ${otp} for ${email}`);
        }
      },
      expiresIn: 600, // 10 minutes
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      onboardingCompleted: {
        type: "boolean",
        required: false,
        defaultValue: false,
      }
    }
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Create an organization for the new user
          const orgId = uuidv4();
          await db.insert(schema.organizations).values({
            id: orgId,
            name: `${user.name || 'User'}'s Organization`,
            slug: `org-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          });
          
          // Link the user to the new organization
          await db.update(schema.users)
            .set({ organizationId: orgId })
            .where(eq(schema.users.id, user.id));
        }
      }
    }
  }
});
