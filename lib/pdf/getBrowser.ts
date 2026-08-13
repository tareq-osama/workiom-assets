// lib/pdf/getBrowser.ts
import type { Browser } from 'puppeteer-core';

export async function getBrowser(): Promise<Browser> {
  if (process.env.VERCEL) {
    const chromium = (await import('@sparticuz/chromium')).default;
    const { launch } = await import('puppeteer-core');
    return launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const { launch } = await import('puppeteer');
  // puppeteer's Browser type is structurally identical to puppeteer-core's —
  // it's built on top of puppeteer-core — but the packages ship separate
  // type declarations, so callers on this branch need an explicit cast.
  return launch({ headless: true }) as unknown as Promise<Browser>;
}
