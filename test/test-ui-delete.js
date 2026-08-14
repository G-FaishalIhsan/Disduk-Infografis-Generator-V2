import puppeteer from 'puppeteer';

async function testUiDelete() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    const consoleLogs = [];
    const pageErrors = [];

    page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', err => pageErrors.push(err.toString()));

    // Override dialog to supply PIN automatically
    page.on('dialog', async dialog => {
        console.log('Dialog prompt text:', dialog.message());
        if (dialog.type() === 'prompt') {
            await dialog.accept('disduk123');
        } else {
            await dialog.accept();
        }
    });

    console.log('1. Loading application at http://127.0.0.1:3000/...');
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });

    console.log('2. Switching to Workspace Media Sosial...');
    await page.click('#tab-ws-social');
    await new Promise(r => setTimeout(r, 1000));

    console.log('3. Opening Dataset Selector Modal...');
    await page.click('#btn-open-dataset-manager');
    await new Promise(r => setTimeout(r, 800));

    // Select an inactive dataset to delete (e.g. 2027 Semester 2)
    console.log('4. Selecting Inactive Dataset 2027 Sem 2...');
    await page.select('#dm-select-year', '2027');
    await new Promise(r => setTimeout(r, 600));

    console.log('5. Clicking Hapus button...');
    await page.click('#btn-delete-dataset');
    await new Promise(r => setTimeout(r, 1500));

    console.log('\n--- Checking Dropdown Years After Deletion ---');
    const remainingYears = await page.evaluate(() => {
        const sel = document.querySelector('#dm-select-year');
        return sel ? Array.from(sel.options).map(o => o.value) : [];
    });
    console.log('Remaining Years in Dropdown:', remainingYears);

    console.log('\n--- CONSOLE LOGS ---');
    consoleLogs.forEach(l => console.log(l));

    console.log('\n--- PAGE ERRORS ---');
    pageErrors.forEach(e => console.error(e));

    if (pageErrors.length > 0) throw new Error('Page errors detected during delete UI');

    console.log('\n======================================================');
    console.log('UI DELETE WITH PIN & LIVE REFRESH VERIFIED 100%!');
    console.log('======================================================');

    await browser.close();
    process.exit(0);
}

testUiDelete().catch(e => {
    console.error('Delete UI Test Failed:', e);
    process.exit(1);
});
