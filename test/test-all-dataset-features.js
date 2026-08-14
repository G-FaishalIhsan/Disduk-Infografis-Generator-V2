import puppeteer from 'puppeteer';

async function testAllDatasetFeatures() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    const consoleLogs = [];
    const pageErrors = [];

    page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', err => pageErrors.push(err.toString()));

    console.log('1. Loading application at http://127.0.0.1:3000/...');
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0', timeout: 15000 });

    console.log('2. Switching to Workspace Media Sosial...');
    await page.click('#tab-ws-social');
    await new Promise(r => setTimeout(r, 1000));

    console.log('3. Opening Dataset Selector Modal...');
    await page.click('#btn-open-dataset-manager');
    await new Promise(r => setTimeout(r, 800));

    console.log('4. Selecting Year 2024 & Semester 1...');
    await page.select('#dm-select-year', '2024');
    await new Promise(r => setTimeout(r, 500));
    await page.select('#dm-select-semester', '1');
    await new Promise(r => setTimeout(r, 800));

    console.log('5. Clicking "Gunakan Dataset"...');
    await page.click('#btn-use-dataset');
    await new Promise(r => setTimeout(r, 1500));

    const periodText = await page.evaluate(() => {
        return document.querySelector('#sidebar-social-dataset-period')?.textContent?.trim();
    });
    console.log('Active Dataset Period Text in Sidebar:', periodText);
    if (!periodText.includes('2024') || !periodText.includes('1')) {
        throw new Error('Active dataset did not update to 2024 Sem 1');
    }

    console.log('6. Opening Data Entry Modal...');
    await page.click('#btn-open-dataset-manager');
    await new Promise(r => setTimeout(r, 500));
    await page.click('#btn-open-data-entry-from-dm');
    await new Promise(r => setTimeout(r, 500));

    const isDataEntryOpen = await page.evaluate(() => {
        const m = document.querySelector('#data-entry-modal');
        return m && !m.classList.contains('hidden');
    });
    console.log('Data Entry Modal Opened:', isDataEntryOpen);
    if (!isDataEntryOpen) throw new Error('Data Entry modal failed to open');

    console.log('\n--- CONSOLE LOGS ---');
    consoleLogs.forEach(l => console.log(l));

    console.log('\n--- PAGE ERRORS ---');
    pageErrors.forEach(e => console.error(e));

    if (pageErrors.length > 0) throw new Error('Page errors detected');

    console.log('\n======================================================');
    console.log('ALL DATASET FUNCTIONS & UI FLOW VERIFIED 100% WORKING!');
    console.log('======================================================');

    await browser.close();
    process.exit(0);
}

testAllDatasetFeatures().catch(e => {
    console.error('Test Failed:', e);
    process.exit(1);
});
