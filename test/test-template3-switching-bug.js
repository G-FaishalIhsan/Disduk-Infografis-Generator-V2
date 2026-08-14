import puppeteer from 'puppeteer';

async function testTemplate3SwitchingBug() {
    console.log('--- REPRODUCING TEMPLATE 3 SWITCHING BUG ---');
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    page.on('console', msg => console.log('[Browser Console]:', msg.text()));

    console.log('1. Navigating to http://127.0.0.1:3000/...');
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });

    console.log('2. Switching mode to Kecamatan...');
    await page.click('#btn-mode-kecamatan');
    await new Promise(r => setTimeout(r, 600));

    console.log('3. Selecting District: SINGAPARNA...');
    // Trigger district change
    await page.evaluate(() => {
        const item = document.querySelector('.kec-item[data-value="SINGAPARNA"]');
        if (item) item.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Verify Template 1 has SINGAPARNA data
    const t1IframeHandle = await page.$('iframe#preview-iframe');
    const t1Doc = await t1IframeHandle.contentFrame();
    const t1Title = await t1Doc.evaluate(() => {
        return document.querySelector('header h1')?.textContent || document.querySelector('[data-bind="metadata.nama_wilayah"]')?.textContent;
    });
    console.log('Template 1 Title/Wilayah on screen:', t1Title);

    console.log('4. Switching template to Template 3 (Compact)...');
    // Click Template 3 Card in Full Workspace
    await page.evaluate(() => {
        const cardT3 = document.querySelector('.tmpl-card-compact[data-template-id="template-3"]');
        if (cardT3) cardT3.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Inspect Template 3 displayed data immediately after switch
    const t3Doc = await t1IframeHandle.contentFrame();
    const t3Data = await t3Doc.evaluate(() => {
        const headerBadge = document.querySelector('header div.inline-flex')?.textContent?.trim();
        const headerH1 = document.querySelector('header h1')?.textContent?.trim();
        const totalPop = document.getElementById('statTotalPenduduk')?.textContent?.trim();
        return { headerBadge, headerH1, totalPop };
    });

    console.log('Immediate Template 3 Data displayed:', t3Data);

    if (t3Data.headerBadge === 'KABUPATEN TASIKMALAYA' || t3Data.totalPop === '1.284.750') {
        console.error('⚠️ BUG REPRODUCED: Template 3 shows default Kabupaten data instead of SINGAPARNA!');
    } else {
        console.log('✅ Template 3 shows correct Kecamatan data:', t3Data);
    }

    await browser.close();
}

testTemplate3SwitchingBug().catch(console.error);
