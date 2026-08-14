// app/api/brand-guidelines/pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { Browser } from 'puppeteer-core';
import { getBrowser } from '@/lib/pdf/getBrowser';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  let browser: Browser | undefined;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });
    await page.goto(`${req.nextUrl.origin}/brand-guidelines/print`, {
      waitUntil: 'networkidle0',
    });
    await page.evaluateHandle('document.fonts.ready');

    const pdf = await page.pdf({
      width: '1600px',
      height: '900px',
      printBackground: true,
    });

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="workiom-brand-guidelines.pdf"',
      },
    });
  } catch (error) {
    console.error('GET /api/brand-guidelines/pdf error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to generate PDF' },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close();
  }
}
