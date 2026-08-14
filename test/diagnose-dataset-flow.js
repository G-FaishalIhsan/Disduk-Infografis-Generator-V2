import puppeteer from 'puppeteer';

async function diagnoseDatasetFlow() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    const consoleLogs = [];
    const pageErrors = [];

    page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', err => pageErrors.push(err.toString()));

    console.log('Navigating to http://127.0.0.1:3000/...');
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0', timeout: 15000 });

    console.log('\n--- Switching to Media Sosial ---');
    await page.click('#tab-ws-social');
    await new Promise(r => setTimeout(r, 1000));

    console.log('\n--- Opening Dataset Selector Modal ---');
    await page.click('#btn-open-dataset-manager');
    await new Promise(r => setTimeout(r, 1000));

    // Check available years in dropdown
    const years = await page.evaluate(() => {
        const sel = document.querySelector('#dm-select-year');
        return sel ? Array.from(sel.options).map(o => o.value) : [];
    });
    console.log('Years in Dropdown:', years);

    // Check currently displayed dataset in modal
    const modalData = await page.evaluate(() => {
        const yearSel = document.querySelector('#dm-select-year')?.value;
        const semSel = document.querySelector('#dm-select-semester')?.value;
        const useBtn = document.querySelector('#btn-use-dataset');
        const deleteBtn = document.querySelector('#btn-delete-dataset');
        const emptyState = document.querySelector('#dataset-manager-modal .fa-folder-open');
        return {
            selectedYear: yearSel,
            selectedSemester: semSel,
            hasUseBtn: !!useBtn,
            hasDeleteBtn: !!deleteBtn,
            isEmpty: !!emptyState
        };
    });
    console.log('Modal Current State:', modalData);

    console.log('\n--- Clicking "Gunakan Dataset" ---');
    if (modalData.hasUseBtn) {
        await page.click('#btn-use-dataset');
        await new Promise(r => setTimeout(r, 1500));
    }

    console.log('\n--- Checking Sidebar Active Dataset Info ---');
    const sidebarPeriod = await page.evaluate(() => {
        return document.querySelector('#sidebar-social-dataset-period')?.textContent || 'NOT FOUND';
    });
    console.log('Sidebar Dataset Period Text:', sidebarPeriod);

    console.log('\n--- CONSOLE LOGS ---');
    consoleLogs.forEach(l => console.log(l));

    console.log('\n--- PAGE ERRORS ---');
    pageErrors.forEach(e => console.error(e));

    await browser.close();
    process.exit(pageErrors.length > 0 ? 1 : 0);
}

diagnoseDatasetFlow().catch(e => {
    console.error('Diagnosis Failed:', e);
    process.exit(1);
});
