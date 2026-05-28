import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    
    if (!accountId) {
      return NextResponse.json({ error: 'Missing accountId' }, { status: 400 });
    }

    // Connect to a headless browser and generate PDF
    // Note: In Vercel serverless, you need `@sparticuz/chromium` to bundle chromium properly, 
    // but for this prototype, we use local puppeteer which works in standard Node environments.
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
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
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="aetheris_report_${accountId}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
