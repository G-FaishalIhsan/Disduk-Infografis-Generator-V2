import puppeteer from 'puppeteer';

async function testDataEntryPopupFix() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    console.log('1. Loading application...');
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });

    console.log('2. Switching to Workspace Media Sosial...');
    await page.click('#tab-ws-social');
    await new Promise(r => setTimeout(r, 800));

    console.log('3. Opening Dataset Selector Modal...');
    await page.click('#btn-open-dataset-manager');
    await new Promise(r => setTimeout(r, 600));

    console.log('4. Opening Data Entry Modal...');
    await page.click('#btn-open-data-entry-from-dm');
    await new Promise(r => setTimeout(r, 600));

    console.log('5. Clicking "Simpan ke Database SQLite" without typing PIN...');
    await page.click('#btn-submit-data-entry');
    await new Promise(r => setTimeout(r, 600));

    // Verify custom alert is at the VERY FRONT and clickable
    const isFrontPopup = await page.evaluate(() => {
        const container = document.querySelector('#custom-dialog-container');
        const okBtn = document.querySelector('#btn-dialog-ok');
        const allAlerts = document.querySelectorAll('#custom-dialog-container .relative');
        const zIndex = window.getComputedStyle(container).zIndex;
        return {
            hasOkBtn: !!okBtn,
            alertCount: allAlerts.length,
            zIndex: parseInt(zIndex, 10)
        };
    });
    console.log('Popup Visibility & Z-Index Check:', isFrontPopup);
    if (!isFrontPopup.hasOkBtn || isFrontPopup.alertCount !== 1 || isFrontPopup.zIndex < 10000) {
        throw new Error('Popup is either behind modal or multiple popups spawned!');
    }

    console.log('6. Clicking "Mengerti" on front popup...');
    await page.click('#btn-dialog-ok');
    await new Promise(r => setTimeout(r, 600));

    const isClosed = await page.evaluate(() => {
        return document.querySelectorAll('#custom-dialog-container .relative').length === 0;
    });
    console.log('Popup cleanly dismissed:', isClosed);
    if (!isClosed) throw new Error('Popup did not dismiss');

    console.log('\n======================================================');
    console.log('POPUP Z-INDEX & MULTIPLE TRIGGER FIX VERIFIED 100%!');
    console.log('======================================================');

    await browser.close();
    process.exit(0);
}

testDataEntryPopupFix().catch(e => {
    console.error('Test Failed:', e);
    process.exit(1);
});
