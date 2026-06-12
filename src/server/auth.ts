import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink, emailOTP } from "better-auth/plugins";
import { db } from "./db";
import * as schema from "./db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "missing");

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
        if (process.env.NODE_ENV !== "development" || process.env.RESEND_API_KEY) {
          try {
            const result = await resend.emails.send({
              from: "Vero <onboarding@resend.dev>", // default test domain
              to: email,
              subject: "Your Vero Login Code",
              html: `<h1>${otp}</h1><p>Enter this 6-digit code to log in. It expires in 10 minutes.</p>`,
            });
            if (result.error) {
               console.error("Resend API Error:", result.error);
               throw new Error(result.error.message);
            }
            console.log(`[OTP SENT]: ${otp} for ${email}`);
          } catch (e: any) {
            console.error("Failed to send OTP:", e.message);
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
