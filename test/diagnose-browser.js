import puppeteer from 'puppeteer';

async function checkBrowserErrors() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    const consoleLogs = [];
    const pageErrors = [];

    page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', err => pageErrors.push(err.toString()));

    console.log('Navigating to http://127.0.0.1:3000/...');
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded', timeout: 15000 });

    await new Promise(r => setTimeout(r, 2000));

    console.log('\n--- CONSOLE LOGS ---');
    consoleLogs.forEach(l => console.log(l));

    console.log('\n--- PAGE ERRORS ---');
    pageErrors.forEach(e => console.error(e));

    const sidebarContent = await page.evaluate(() => document.querySelector('#sidebar-container')?.innerHTML?.length || 0);
    console.log('\nSidebar innerHTML length:', sidebarContent);

    await browser.close();
    process.exit(0);
}

checkBrowserErrors().catch(e => {
    console.error('Diagnosis failed:', e);
    process.exit(1);
});
