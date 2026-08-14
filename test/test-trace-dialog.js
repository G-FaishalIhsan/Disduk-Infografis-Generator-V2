import puppeteer from 'puppeteer';

async function testTrace() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    page.on('console', msg => console.log(`[Browser Console]: ${msg.text()}`));
    page.on('pageerror', err => console.error(`[Browser PageError]:`, err));

    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });
    await page.click('#tab-ws-social');
    await new Promise(r => setTimeout(r, 1000));

    await page.click('#btn-open-dataset-manager');
    await new Promise(r => setTimeout(r, 800));

    await page.select('#dm-select-year', '2024');
    await new Promise(r => setTimeout(r, 800));
    await page.select('#dm-select-semester', '2');
    await new Promise(r => setTimeout(r, 800));

    const info = await page.evaluate(() => {
        const btn = document.querySelector('#btn-delete-dataset');
        const badge = document.querySelector('#dm-dataset-card-container .v2-badge')?.textContent;
        return { btnClass: btn?.className, badge, hasBtn: !!btn };
    });
    console.log('Dataset Info:', info);

    await page.click('#btn-delete-dataset');
    await new Promise(r => setTimeout(r, 800));

    const domInfo = await page.evaluate(() => {
        const dialog = document.querySelector('#custom-dialog-container');
        return {
            hasDialogContainer: !!dialog,
            innerHtml: dialog?.innerHTML
        };
    });
    console.log('Dialog DOM Info:', domInfo);

    await browser.close();
    process.exit(0);
}

testTrace().catch(e => {
    console.error(e);
    process.exit(1);
});
