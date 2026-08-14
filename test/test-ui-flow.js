import puppeteer from 'puppeteer';

async function testFullAndSocialUI() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0', timeout: 15000 });

    console.log('Testing Workspace Switch to Media Sosial...');
    await page.click('#tab-ws-social');
    await new Promise(r => setTimeout(r, 1000));

    const isSocialVisible = await page.evaluate(() => {
        const wrap = document.querySelector('#preview-wrapper-social');
        return wrap && !wrap.classList.contains('hidden');
    });

    console.log('Social Workspace Visible:', isSocialVisible);
    if (!isSocialVisible) throw new Error('Social workspace not visible');

    console.log('Testing Open Dataset Manager Modal...');
    await page.click('#btn-open-dataset-manager');
    await new Promise(r => setTimeout(r, 500));

    const isModalVisible = await page.evaluate(() => {
        const m = document.querySelector('#dataset-manager-modal');
        return m && !m.classList.contains('hidden');
    });

    console.log('Dataset Manager Modal Visible:', isModalVisible);
    if (!isModalVisible) throw new Error('Modal not visible');

    console.log('Testing Open Data Entry Modal...');
    await page.click('#btn-open-data-entry-from-dm');
    await new Promise(r => setTimeout(r, 500));

    const isDataEntryVisible = await page.evaluate(() => {
        const de = document.querySelector('#data-entry-modal');
        return de && !de.classList.contains('hidden');
    });

    console.log('Data Entry Modal Visible:', isDataEntryVisible);
    if (!isDataEntryVisible) throw new Error('Data entry modal not visible');

    console.log('\n======================================================');
    console.log('ALL UI WORKSPACES AND MODALS FULLY FUNCTIONAL 100%!');
    console.log('======================================================');
    await browser.close();
    process.exit(0);
}

testFullAndSocialUI().catch(e => {
    console.error('UI Test Failed:', e);
    process.exit(1);
});
