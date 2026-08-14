import puppeteer from 'puppeteer';

async function testCustomDialogs() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    const consoleLogs = [];
    const pageErrors = [];

    page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', err => pageErrors.push(err.toString()));

    // Listen to native dialogs - FAIL if any native alert/confirm/prompt is triggered!
    page.on('dialog', async dialog => {
        console.error('FAIL: Native browser dialog was triggered:', dialog.type(), dialog.message());
        await dialog.dismiss();
        throw new Error(`Unexpected native browser dialog: ${dialog.type()} "${dialog.message()}"`);
    });

    console.log('1. Loading application at http://127.0.0.1:3000/...');
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });

    console.log('2. Switching to Workspace Media Sosial...');
    await page.click('#tab-ws-social');
    await new Promise(r => setTimeout(r, 1000));

    console.log('3. Opening Dataset Selector Modal...');
    await page.click('#btn-open-dataset-manager');
    await new Promise(r => setTimeout(r, 800));

    console.log('4. Selecting Inactive Dataset (2024 Sem 2)...');
    await page.select('#dm-select-year', '2024');
    await new Promise(r => setTimeout(r, 500));
    await page.select('#dm-select-semester', '2');
    await new Promise(r => setTimeout(r, 800));

    console.log('5. Clicking Hapus button...');
    await page.click('#btn-delete-dataset');
    await new Promise(r => setTimeout(r, 600));

    // Check custom PIN prompt modal in DOM
    const isPinModalVisible = await page.evaluate(() => {
        const modal = document.querySelector('#input-pin-auth');
        return !!modal;
    });
    console.log('Custom PIN Modal Rendered:', isPinModalVisible);
    if (!isPinModalVisible) throw new Error('Custom PIN modal not rendered in DOM');

    console.log('6. Testing Wrong PIN validation in Custom Modal...');
    await page.type('#input-pin-auth', 'wrongpin99');
    await page.click('#btn-pin-submit');
    await new Promise(r => setTimeout(r, 500));

    const isErrorVisible = await page.evaluate(() => {
        const err = document.querySelector('#pin-error-msg');
        return err && !err.classList.contains('hidden');
    });
    console.log('PIN Error Message Displayed:', isErrorVisible);
    if (!isErrorVisible) throw new Error('PIN error message did not display');

    console.log('7. Entering Correct PIN "disduk123" and Submitting...');
    await page.type('#input-pin-auth', 'disduk123');
    await page.click('#btn-pin-submit');
    await new Promise(r => setTimeout(r, 1500));

    // Check Success Alert Dialog
    const isSuccessAlertVisible = await page.evaluate(() => {
        const okBtn = document.querySelector('#btn-dialog-ok');
        const title = document.querySelector('#custom-dialog-container h3')?.textContent;
        return { okBtn: !!okBtn, title };
    });
    console.log('Custom Success Alert Dialog:', isSuccessAlertVisible);
    if (!isSuccessAlertVisible.okBtn) throw new Error('Custom success alert did not show');

    console.log('8. Dismissing Success Alert Dialog...');
    await page.click('#btn-dialog-ok');
    await new Promise(r => setTimeout(r, 800));

    console.log('\n--- CONSOLE LOGS ---');
    consoleLogs.forEach(l => console.log(l));

    console.log('\n--- PAGE ERRORS ---');
    pageErrors.forEach(e => console.error(e));

    if (pageErrors.length > 0) throw new Error('Page errors detected');

    console.log('\n======================================================');
    console.log('CUSTOM UI DIALOG & PIN MODAL FULLY VERIFIED 100%!');
    console.log('======================================================');

    await browser.close();
    process.exit(0);
}

testCustomDialogs().catch(e => {
    console.error('Test Failed:', e);
    process.exit(1);
});
