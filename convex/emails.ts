import { action } from "./_generated/server";
import { v } from "convex/values";

export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    // In production, we'd use Resend:
    // import { Resend } from 'resend';
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ ... });

    console.log(`[Email Engine] Sending email to ${args.to}`);
    console.log(`Subject: ${args.subject}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true };
  },
});

export const sendPremiumRequestNotification = action({
  args: {
    orgName: v.string(),
    userEmail: v.string(),
    teamSize: v.string(),
  },
  handler: async (ctx, args) => {
    // Notify admins about new premium request
    console.log(`[Email Engine] New premium request from ${args.orgName} (${args.userEmail})`);
    
    // Send email to the user confirming receipt
    await ctx.runAction(
      // We would use an internal api reference here normally, but since we are in the same file
      // we just simulate
      null as any, // Placeholder 
      {}
    ).catch(() => {});
    
    return { success: true };
  },
});
