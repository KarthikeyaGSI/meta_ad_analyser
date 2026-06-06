import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export class EmailService {
  static async sendVerificationEmail(to: string, token: string) {
    await resend.emails.send({
      from: 'Vero <security@vero.com>',
      to,
      subject: 'Verify your Vero account',
      html: `<p>Click here to verify: <a href="https://app.vero.com/verify?token=${token}">Verify Account</a></p>`,
    });
  }

  static async sendExpiryNotice(to: string, daysLeft: number) {
    await resend.emails.send({
      from: 'Vero Billing <billing@vero.com>',
      to,
      subject: `Your license expires in ${daysLeft} days`,
      html: `<p>Please renew your license to avoid service interruption.</p>`,
    });
  }

  static async sendGracePeriodNotice(to: string) {
    await resend.emails.send({
      from: 'Vero Support <support@vero.com>',
      to,
      subject: 'License Expired - Grace Period Active',
      html: `<p>Your license has expired, but you are currently in a grace period. Please renew immediately to prevent account freezing.</p>`,
    });
  }
}
