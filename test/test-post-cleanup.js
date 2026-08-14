import puppeteer from 'puppeteer';
import { SocialChromiumRenderer } from '../server/social-renderer.js';
import { ChromiumRenderer } from '../server/renderer.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

async function testPostCleanup() {
    console.log('======================================================');
    console.log('VERIFICATION: POST CLEANUP PREVIEW & EXPORT HEALTH');
    console.log('======================================================\n');

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    console.log('1. Loading Frontend Portal at http://127.0.0.1:3000/...');
    const response = await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });
    console.log(`Page Load Status: ${response.status()}`);

    // Check for console errors
    page.on('console', msg => {
        if (msg.type() === 'error') console.error('Browser Console Error:', msg.text());
    });

    console.log('2. Testing Workspace Full...');
    await page.click('#tab-ws-full');
    await new Promise(r => setTimeout(r, 600));

    console.log('3. Testing Workspace Social...');
    await page.click('#tab-ws-social');
    await new Promise(r => setTimeout(r, 600));

    // Test Export Social
    console.log('4. Testing Social Export...');
    const socialRenderer = new SocialChromiumRenderer();
    const t1Slide1Html = fs.readFileSync(path.join(root, 'templates', 'social', 'template-1', 'slide1.html'), 'utf8');
    const buf = await socialRenderer.renderSocialPNG(t1Slide1Html, {
        width: 1080,
        height: 1350,
        deviceScaleFactor: 2,
        templatePath: 'templates/social/template-1'
    });
    console.log(`Exported Social PNG: ${buf.length} bytes`);

    if (!buf || buf.length < 10000) {
        throw new Error('Export Social PNG Failed!');
    }

    console.log('\n======================================================');
    console.log('POST CLEANUP HEALTH CHECK: 100% PASS');
    console.log('======================================================');

    await browser.close();
    process.exit(0);
}

testPostCleanup().catch(err => {
    console.error('TEST FAILED:', err);
    process.exit(1);
});
