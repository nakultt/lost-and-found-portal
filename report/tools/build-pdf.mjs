// Renders report/report.html to report/Lost_and_Found_Portal_Report.pdf with headless Chrome.
// Fails if any page's content overflows its bordered frame, so nothing gets silently cut off.
import puppeteer from 'puppeteer-core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const REPORT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.goto(`file://${REPORT_DIR}/report.html`, { waitUntil: 'networkidle0' });

const overflows = await page.$$eval('.page .content', (els) =>
  els
    .map((el, i) => ({ page: i + 2, over: el.scrollHeight - el.clientHeight }))
    .filter((p) => p.over > 1)
);
if (overflows.length) {
  console.error('Content overflows its page:', overflows.map((p) => `page ${p.page} by ${p.over}px`).join(', '));
  await browser.close();
  process.exit(1);
}

const out = `${REPORT_DIR}/Lost_and_Found_Portal_Report.pdf`;
await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
await browser.close();
console.log(`PDF written to ${out}`);
