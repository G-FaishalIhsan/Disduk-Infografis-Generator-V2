import puppeteer from 'puppeteer';

async function checkFailedRequests() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    page.on('response', res => {
        if (res.status() >= 400) {
            console.log(`[HTTP ${res.status()}] ${res.url()}`);
        }
    });

    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0', timeout: 15000 });
    await page.click('#tab-ws-social');
    await new Promise(r => setTimeout(r, 1000));
    await page.click('#btn-open-dataset-manager');
    await new Promise(r => setTimeout(r, 1000));

    // Try selecting 2027 and 2026 and 2024
    await page.select('#dm-select-year', '2027');
    await new Promise(r => setTimeout(r, 1000));

    await page.select('#dm-select-year', '2024');
    await new Promise(r => setTimeout(r, 1000));

    await browser.close();
    process.exit(0);
}

checkFailedRequests().catch(e => {
    console.error(e);
    process.exit(1);
});
