// Drives the running app with headless Chrome and saves report screenshots.
// Prerequisites: MongoDB running, `npm run seed` + `npm start` in backend/, `npm run dev` in frontend/.
// Re-run `npm run seed` before each capture: this script creates and resolves a post.
import puppeteer from 'puppeteer-core';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const APP = 'http://localhost:5173';
const API = 'http://localhost:5050/api';
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../screenshots');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = (page, name, opts = {}) => page.screenshot({ path: `${OUT}/${name}.png`, ...opts });
const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1.5 });

// 1. Listing page
await page.goto(APP, { waitUntil: 'networkidle0' });
await page.waitForSelector('.post-card');
await shot(page, '01-listing');

// 2. Filter by category
await page.click('button.chip::-p-text(Electronics)');
await sleep(800);
await shot(page, '02-category-filter');

// 3. Keyword search
await page.click('button.chip::-p-text(All)');
await page.type('.search-input', 'library');
await sleep(900);
await shot(page, '03-search');

// 4. Empty form submitted -> validation errors
// Tall viewport so the whole form fits without scrolling (fullPage mis-draws the sticky header).
await page.setViewport({ width: 1280, height: 1070, deviceScaleFactor: 1.5 });
await page.goto(`${APP}/#report`, { waitUntil: 'networkidle0' });
await page.reload({ waitUntil: 'networkidle0' });
await page.click('button[type=submit]');
await sleep(300);
await shot(page, '04-form-validation');

// 5. Filled form
await page.reload({ waitUntil: 'networkidle0' });
await page.click('label.toggle-option:has(input[value=found])');
await page.type('input[name=title]', 'Silver Titan wristwatch');
await page.select('select[name=category]', 'accessories');
await page.type('input[name=location]', 'Library reading room');
await page.type('textarea[name=description]', 'Analog watch with a metal strap, found on a reading table near the window.');
await page.type('input[name=contactName]', 'Nakul T');
await page.type('input[name=contactEmail]', 'nakul@college.edu');
await page.type('input[name=contactPhone]', '9876501234');
await shot(page, '05-form-filled');

// 6. Submit -> new post appears at top of listing with toast
await page.click('button[type=submit]');
await page.waitForSelector('.toast');
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1.5 });
await sleep(700);
await shot(page, '06-post-created');

// 7. Mark the new post resolved, then view resolved posts
await sleep(3000); // let the toast disappear
await page.click('.post-card:first-child button::-p-text(Mark resolved)');
await sleep(800);
await page.select('.filter-row select:nth-child(2)', 'resolved');
await sleep(800);
await shot(page, '07-resolved');

// 8. Mobile layout
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await page.goto(APP, { waitUntil: 'networkidle0' });
await page.waitForSelector('.post-card');
await shot(page, '08-mobile');

// 9. Raw API response, pretty-printed
const apiUrl = `${API}/posts?category=electronics&limit=2`;
const json = await (await fetch(apiUrl)).json();
await page.setViewport({ width: 900, height: 700, deviceScaleFactor: 1.5 });
await page.setContent(`
  <body style="margin:0;font:13px Menlo,monospace;background:#fff">
    <div style="background:#f1f3f4;padding:10px 14px;border-bottom:1px solid #ddd;color:#333">
      <b style="color:#188038">GET</b> ${apiUrl} &nbsp; <span style="color:#188038">200 OK</span>
    </div>
    <pre style="margin:0;padding:14px;line-height:1.45">${escapeHtml(JSON.stringify(json, null, 2))}</pre>
  </body>`);
await shot(page, '09-api-response', { fullPage: true });

// 10. Data stored in MongoDB (real mongosh output)
const mongoCmd = `db.posts.find({ category: "accessories" }, { title: 1, type: 1, location: 1, status: 1, createdAt: 1 })`;
const mongoOut = execFileSync('mongosh', ['--quiet', 'lost_and_found', '--eval', mongoCmd], { encoding: 'utf8' });
await page.setContent(`
  <body style="margin:0;font:13px Menlo,monospace;background:#1e1e1e;color:#d4d4d4">
    <pre style="margin:0;padding:16px;line-height:1.45"><span style="color:#6a9955">lost_and_found&gt;</span> ${escapeHtml(mongoCmd)}\n${escapeHtml(mongoOut)}</pre>
  </body>`);
await page.setViewport({ width: 1000, height: 200, deviceScaleFactor: 1.5 });
await shot(page, '10-mongodb', { fullPage: true });

await browser.close();
console.log(`Screenshots saved to ${OUT}`);
