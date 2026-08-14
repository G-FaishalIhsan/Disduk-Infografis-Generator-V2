import puppeteer from 'puppeteer';

async function testStatusReset() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    console.log('1. Loading application at http://127.0.0.1:3000/...');
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });

    console.log('2. Switching to Workspace Media Sosial...');
    await page.click('#tab-ws-social');
    await new Promise(r => setTimeout(r, 1000));

    console.log('3. Opening Dataset Selector Modal...');
    await page.click('#btn-open-dataset-manager');
    await new Promise(r => setTimeout(r, 800));

    // Activate 2024 Semester 1
    console.log('4. Activating Dataset 2024 Sem 1...');
    await page.select('#dm-select-year', '2024');
    await new Promise(r => setTimeout(r, 500));
    await page.select('#dm-select-semester', '1');
    await new Promise(r => setTimeout(r, 800));
    await page.click('#btn-use-dataset');
    await new Promise(r => setTimeout(r, 1500));

    console.log('5. Reopening Dataset Selector Modal to inspect 2025 Sem 2 and 2026 Sem 1...');
    await page.click('#btn-open-dataset-manager');
    await new Promise(r => setTimeout(r, 800));

    // Inspect 2025 Sem 2 (should be TERSEDIA and Hapus button enabled)
    await page.select('#dm-select-year', '2025');
    await new Promise(r => setTimeout(r, 500));
    await page.select('#dm-select-semester', '2');
    await new Promise(r => setTimeout(r, 800));

    const state2025Sem2 = await page.evaluate(() => {
        const badge = document.querySelector('#dm-dataset-card-container .v2-badge')?.textContent?.trim();
        const deleteDisabled = document.querySelector('#btn-delete-dataset')?.classList?.contains('opacity-40');
        return { badge, deleteDisabled };
    });
    console.log('Dataset 2025 Sem 2 State (should be TERSEDIA & delete enabled):', state2025Sem2);
    if (state2025Sem2.badge !== 'TERSEDIA' || state2025Sem2.deleteDisabled) {
        throw new Error('2025 Sem 2 is still marked AKTIF or delete button is disabled!');
    }

    // Inspect 2024 Sem 1 (should be AKTIF and Hapus button disabled)
    await page.select('#dm-select-year', '2024');
    await new Promise(r => setTimeout(r, 500));
    await page.select('#dm-select-semester', '1');
    await new Promise(r => setTimeout(r, 800));

    const state2024Sem1 = await page.evaluate(() => {
        const badge = document.querySelector('#dm-dataset-card-container .v2-badge')?.textContent?.trim();
        const deleteDisabled = document.querySelector('#btn-delete-dataset')?.classList?.contains('opacity-40');
        return { badge, deleteDisabled };
    });
    console.log('Dataset 2024 Sem 1 State (should be AKTIF & delete disabled):', state2024Sem1);
    if (state2024Sem1.badge !== 'AKTIF' || !state2024Sem1.deleteDisabled) {
        throw new Error('2024 Sem 1 is not marked AKTIF or delete button is enabled!');
    }

    console.log('\n======================================================');
    console.log('DYNAMIC STATUS & ACTIVE GUARD RESET VERIFIED 100%!');
    console.log('======================================================');

    await browser.close();
    process.exit(0);
}

testStatusReset().catch(e => {
    console.error(e);
    process.exit(1);
});
