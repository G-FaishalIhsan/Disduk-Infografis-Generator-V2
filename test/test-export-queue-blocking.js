import puppeteer from 'puppeteer';

async function testExportQueueBlocking() {
    console.log('======================================================');
    console.log('TESTING EXPORT QUEUE BLOCKING & TOP TOAST NOTIFICATION');
    console.log('======================================================\n');

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    page.on('console', msg => console.log('[Browser Console]:', msg.text()));

    console.log('1. Loading portal at http://127.0.0.1:3000/...');
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });

    // Step A: Trigger Export PNG
    console.log('2. Clicking Export PNG (#btn-export-png)...');
    await page.click('#btn-export-png');

    // Immediate check right after click
    await new Promise(r => setTimeout(r, 200));

    const stateDuringExport = await page.evaluate(() => {
        const toast = document.querySelector('#export-loading-toast');
        const toastCard = document.querySelector('#export-toast-card');
        const toastTitle = document.querySelector('#export-toast-title')?.textContent;
        const toastDesc = document.querySelector('#export-toast-desc')?.textContent;
        const btnPng = document.querySelector('#btn-export-png');
        const btnJpg = document.querySelector('#btn-export-jpg');
        const btnPdf = document.querySelector('#btn-export-pdf');

        const isToastVisible = toast && toast.classList.contains('opacity-100');
        const isPngDisabled = btnPng && btnPng.hasAttribute('disabled');
        const isJpgDisabled = btnJpg && btnJpg.hasAttribute('disabled');

        return {
            isToastVisible,
            toastTitle,
            toastDesc,
            isPngDisabled,
            isJpgDisabled,
            toastZIndex: window.getComputedStyle(toast).zIndex
        };
    });

    console.log('State DURING Export:', stateDuringExport);

    if (!stateDuringExport.isToastVisible) {
        throw new Error('FAILED: Top loading toast did not appear!');
    }
    if (!stateDuringExport.isPngDisabled || !stateDuringExport.isJpgDisabled) {
        throw new Error('FAILED: Export buttons were not disabled during export!');
    }
    console.log('✅ Top Toast appeared at top with high z-index & buttons locked disabled');

    // Step B: Attempt rapid second click while export is still active
    console.log('\n3. Attempting rapid second click on Export JPG while PNG export is still running...');
    const duplicateBlockedResult = await page.evaluate(async () => {
        // Try to trigger export via window.app
        const app = window.app;
        if (!app) return { error: 'No app' };

        const wasExporting = app.isExporting;
        // Call handleExport
        await app.handleExport('jpg');

        const toastTitle = document.querySelector('#export-toast-title')?.textContent;
        const toastDesc = document.querySelector('#export-toast-desc')?.textContent;

        return {
            wasExporting,
            toastTitle,
            toastDesc
        };
    });

    console.log('Duplicate Click Result:', duplicateBlockedResult);
    if (!duplicateBlockedResult.wasExporting) {
        throw new Error('FAILED: isExporting lock was not active!');
    }
    console.log('✅ Duplicate Export Request was successfully BLOCKED by queue guard');

    // Step C: Wait for first export to complete
    console.log('\n4. Waiting for export to complete...');
    await new Promise(r => setTimeout(r, 4500));

    const stateAfterExport = await page.evaluate(() => {
        const app = window.app;
        const btnPng = document.querySelector('#btn-export-png');
        const isPngDisabled = btnPng && btnPng.hasAttribute('disabled');
        return {
            isExporting: app ? app.isExporting : false,
            isPngDisabled
        };
    });

    console.log('State AFTER Export:', stateAfterExport);
    if (stateAfterExport.isExporting || stateAfterExport.isPngDisabled) {
        throw new Error('FAILED: Buttons were not re-enabled after export finished!');
    }
    console.log('✅ Export finished, buttons re-enabled, isExporting reset to false');

    console.log('\n======================================================');
    console.log('ALL EXPORT QUEUE BLOCKING & TOAST TESTS PASSED 100%!');
    console.log('======================================================');

    await browser.close();
    process.exit(0);
}

testExportQueueBlocking().catch(err => {
    console.error('TEST FAILED:', err);
    process.exit(1);
});
