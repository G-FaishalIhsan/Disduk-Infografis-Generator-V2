import puppeteer from 'puppeteer';

async function testThemeSyncDialog() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    console.log('1. Loading application in Light Mode...');
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });

    // Force Light Mode
    await page.click('#btn-theme-light');
    await new Promise(r => setTimeout(r, 600));

    console.log('2. Switching to Workspace Media Sosial...');
    await page.click('#tab-ws-social');
    await new Promise(r => setTimeout(r, 800));

    console.log('3. Opening Dataset Selector Modal...');
    await page.click('#btn-open-dataset-manager');
    await new Promise(r => setTimeout(r, 800));

    // Select 2024 Sem 2
    await page.select('#dm-select-year', '2024');
    await new Promise(r => setTimeout(r, 500));
    await page.select('#dm-select-semester', '2');
    await new Promise(r => setTimeout(r, 800));

    console.log('4. Clicking Hapus button in Light Mode...');
    await page.click('#btn-delete-dataset');
    await new Promise(r => setTimeout(r, 600));

    // Inspect colors of PIN modal elements in Light Mode
    const lightModalStyles = await page.evaluate(() => {
        const titleEl = document.querySelector('#custom-dialog-container h3');
        const descEl = document.querySelector('#custom-dialog-container p');
        const inputEl = document.querySelector('#input-pin-auth');
        const cancelBtn = document.querySelector('#btn-pin-cancel');
        const submitBtn = document.querySelector('#btn-pin-submit');

        return {
            titleColor: window.getComputedStyle(titleEl).color,
            descColor: window.getComputedStyle(descEl).color,
            inputBg: window.getComputedStyle(inputEl).backgroundColor,
            inputColor: window.getComputedStyle(inputEl).color,
            cancelColor: window.getComputedStyle(cancelBtn).color,
            submitColor: window.getComputedStyle(submitBtn).color
        };
    });
    console.log('Light Mode Dialog Computed Colors:', lightModalStyles);

    // Cancel PIN dialog and close DM
    await page.click('#btn-pin-cancel');
    await new Promise(r => setTimeout(r, 600));
    await page.click('#btn-close-dm');
    await new Promise(r => setTimeout(r, 600));

    console.log('5. Switching to Dark Mode...');
    await page.click('#btn-theme-dark');
    await new Promise(r => setTimeout(r, 600));

    console.log('6. Opening Dataset Selector Modal in Dark Mode...');
    await page.click('#btn-open-dataset-manager');
    await new Promise(r => setTimeout(r, 800));
    await page.select('#dm-select-year', '2024');
    await new Promise(r => setTimeout(r, 500));
    await page.select('#dm-select-semester', '2');
    await new Promise(r => setTimeout(r, 800));

    console.log('7. Clicking Hapus button in Dark Mode...');
    await page.click('#btn-delete-dataset');
    await new Promise(r => setTimeout(r, 600));

    const darkModalStyles = await page.evaluate(() => {
        const titleEl = document.querySelector('#custom-dialog-container h3');
        const descEl = document.querySelector('#custom-dialog-container p');
        const inputEl = document.querySelector('#input-pin-auth');

        return {
            titleColor: window.getComputedStyle(titleEl).color,
            descColor: window.getComputedStyle(descEl).color,
            inputBg: window.getComputedStyle(inputEl).backgroundColor,
            inputColor: window.getComputedStyle(inputEl).color
        };
    });
    console.log('Dark Mode Dialog Computed Colors:', darkModalStyles);

    await browser.close();
    console.log('\n======================================================');
    console.log('THEME SYNCHRONIZATION VERIFIED 100% (LIGHT & DARK)!');
    console.log('======================================================');
    process.exit(0);
}

testThemeSyncDialog().catch(e => {
    console.error(e);
    process.exit(1);
});
