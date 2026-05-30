import chromium from '@sparticuz/chromium';
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import puppeteerCore from 'puppeteer-core';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    
    if (!accountId) {
      return NextResponse.json({ error: 'Missing accountId' }, { status: 400 });
    }

    const isProduction = process.env.NODE_ENV === 'production';
    let browser;
    
    if (isProduction) {
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: { width: 1280, height: 800 },
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } else {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    
    const page = await browser.newPage();
    
    // Set viewport to a standard desktop size for dashboard rendering
    await page.setViewport({ width: 1280, height: 800 });
    
    // In a real application, you would pass an auth token to render the page,
    // or render a dedicated server-side view without auth gates.
    // We are simulating the print view of the analytics dashboard.
    const targetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/analytics?view=print`;
    
    await page.goto(targetUrl, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    });
    
    await browser.close();

    // Return the PDF buffer to the client
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="vero_report_${accountId}.pdf"`,
      },
    });

  } catch (error: unknown) {
    const e = error as Error;
    console.error('Export Error:', e);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
