// src/app/api/premium-request/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend only if an API key is provided
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  if (!resend) {
    return NextResponse.json({ error: 'Resend API key is not configured' }, { status: 500 });
  }
  try {
    const data = await request.json();
    const { organizationId, name, company, website, email, teamSize, requirements } = data;
    const emailBody = `
      <h2>Premium Access Request</h2>
      <p><strong>Organization ID:</strong> ${organizationId}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Website:</strong> ${website}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Team Size:</strong> ${teamSize}</p>
      <p><strong>Requirements:</strong><br/>${requirements.replace(/\n/g, '<br/>')}</p>
    `;
    await resend.emails.send({
      from: 'Premium Requests <no-reply@ad-analyser.com>',
      to: 'business.marketingko@gmail.com',
      subject: 'New Premium Access Request',
      html: emailBody,
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Premium request error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
  }
}
