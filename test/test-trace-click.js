import puppeteer from 'puppeteer';

async function testTraceDatasetClick() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    page.on('console', msg => console.log(`[Browser Console]: ${msg.text()}`));
    page.on('pageerror', err => console.error(`[Browser PageError]:`, err));

    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });
    await page.click('#tab-ws-social');
    await new Promise(r => setTimeout(r, 1000));

    await page.click('#btn-open-dataset-manager');
    await new Promise(r => setTimeout(r, 800));

    console.log('Selecting Year 2024...');
    await page.select('#dm-select-year', '2024');
    await new Promise(r => setTimeout(r, 800));

    console.log('Selecting Semester 1...');
    await page.select('#dm-select-semester', '1');
    await new Promise(r => setTimeout(r, 800));

    const stateBeforeClick = await page.evaluate(() => {
        const yr = document.querySelector('#dm-select-year')?.value;
        const sem = document.querySelector('#dm-select-semester')?.value;
        return { yr, sem };
    });
    console.log('State in modal before click:', stateBeforeClick);

    console.log('Clicking Gunakan Dataset...');
    await page.click('#btn-use-dataset');
    await new Promise(r => setTimeout(r, 1500));

    const finalSidebarState = await page.evaluate(() => {
        const text = document.querySelector('#sidebar-social-dataset-period')?.textContent;
        const logs = Array.from(document.querySelectorAll('#sidebar-log-container span')).map(s => s.textContent);
        return { text, logs };
    });
    console.log('Final Sidebar State:', finalSidebarState);

    await browser.close();
    process.exit(0);
}

testTraceDatasetClick().catch(e => {
    console.error(e);
    process.exit(1);
});
