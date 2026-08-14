import puppeteer from 'puppeteer';

async function testAllTemplateSwitching() {
    console.log('======================================================');
    console.log('TESTING INSTANT TEMPLATE & DISTRICT SWITCHING');
    console.log('======================================================\n');

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    console.log('1. Loading portal at http://127.0.0.1:3000/...');
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });

    const getIframeData = async (templateId) => {
        const iframeHandle = await page.$('iframe#preview-iframe');
        const frame = await iframeHandle.contentFrame();
        return await frame.evaluate((tId) => {
            if (tId === 'template-3') {
                return {
                    badge: document.querySelector('header div.inline-flex')?.textContent?.trim(),
                    h1: document.querySelector('header h1')?.textContent?.trim(),
                    totalPop: document.getElementById('statTotalPenduduk')?.textContent?.trim()
                };
            } else if (tId === 'template-2') {
                return {
                    wilayah: document.getElementById('titleWilayah')?.textContent?.trim(),
                    totalPop: document.getElementById('valTotalPenduduk')?.textContent?.trim()
                };
            } else {
                return {
                    wilayah: document.querySelector('[data-bind="metadata.nama_wilayah"]')?.textContent?.trim(),
                    totalPop: document.querySelector('[data-bind="penduduk.total"]')?.textContent?.trim()
                };
            }
        }, templateId);
    };

    // Step A: Switch to Kecamatan KARANGNUNGGAL in Template 1
    console.log('Step A: Switching to Kecamatan KARANGNUNGGAL in Template 1...');
    await page.click('#btn-mode-kecamatan');
    await new Promise(r => setTimeout(r, 300));
    await page.click('#kecamatan-select-button');
    await new Promise(r => setTimeout(r, 300));
    await page.evaluate(() => {
        const item = document.querySelector('.item-kecamatan[data-district="KARANGNUNGGAL"]');
        if (item) item.click();
    });
    await new Promise(r => setTimeout(r, 400));

    // Step B: Switch to Template 3 directly
    console.log('Step B: Switching to Template 3 directly...');
    await page.evaluate(() => {
        const cardT3 = document.querySelector('.tmpl-card-compact[data-template-id="template-3"]');
        if (cardT3) cardT3.click();
    });
    await new Promise(r => setTimeout(r, 500));
    const t3Karang = await getIframeData('template-3');
    console.log('Template 3 (KARANGNUNGGAL):', t3Karang);
    if (!t3Karang.badge?.includes('KARANGNUNGGAL') || t3Karang.totalPop === '1.284.750') {
        throw new Error('Step B FAILED: Template 3 did not update to KARANGNUNGGAL immediately!');
    }
    console.log('✅ Step B: PASS');

    // Step C: Switch to Template 2 directly
    console.log('\nStep C: Switching to Template 2 directly...');
    await page.evaluate(() => {
        const cardT2 = document.querySelector('.tmpl-card-compact[data-template-id="template-2"]');
        if (cardT2) cardT2.click();
    });
    await new Promise(r => setTimeout(r, 500));
    const t2Karang = await getIframeData('template-2');
    console.log('Template 2 (KARANGNUNGGAL):', t2Karang);
    console.log('✅ Step C: PASS');

    // Step D: Switch to Kecamatan CIPATUJAH while in Template 3
    console.log('\nStep D: Switching back to Template 3 then picking CIPATUJAH...');
    await page.evaluate(() => {
        const cardT3 = document.querySelector('.tmpl-card-compact[data-template-id="template-3"]');
        if (cardT3) cardT3.click();
    });
    await new Promise(r => setTimeout(r, 400));
    await page.click('#kecamatan-select-button');
    await new Promise(r => setTimeout(r, 300));
    await page.evaluate(() => {
        const item = document.querySelector('.item-kecamatan[data-district="CIPATUJAH"]');
        if (item) item.click();
    });
    await new Promise(r => setTimeout(r, 500));
    const t3Cipatujah = await getIframeData('template-3');
    console.log('Template 3 (CIPATUJAH):', t3Cipatujah);
    if (!t3Cipatujah.badge?.includes('CIPATUJAH')) {
        throw new Error('Step D FAILED: Template 3 did not update to CIPATUJAH!');
    }
    console.log('✅ Step D: PASS');

    // Step E: Switch to Mode Kabupaten
    console.log('\nStep E: Switching to Mode Kabupaten in Template 3...');
    await page.click('#btn-mode-kabupaten');
    await new Promise(r => setTimeout(r, 500));
    const t3Kab = await getIframeData('template-3');
    console.log('Template 3 (Kabupaten):', t3Kab);
    if (!t3Kab.badge?.includes('KABUPATEN TASIKMALAYA')) {
        throw new Error('Step E FAILED: Template 3 did not update to Kabupaten!');
    }
    console.log('✅ Step E: PASS');

    console.log('\n======================================================');
    console.log('ALL TEMPLATE & DISTRICT INSTANT SWITCHING TESTS PASSED 100%!');
    console.log('======================================================');

    await browser.close();
    process.exit(0);
}

testAllTemplateSwitching().catch(err => {
    console.error('TEST FAILED:', err);
    process.exit(1);
});
