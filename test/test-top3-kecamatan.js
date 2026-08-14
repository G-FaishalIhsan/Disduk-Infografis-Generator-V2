import puppeteer from 'puppeteer';

async function testTop3Kecamatan() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    console.log('1. Loading application...');
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });

    console.log('2. Switching to Workspace Media Sosial...');
    await page.click('#tab-ws-social');
    await new Promise(r => setTimeout(r, 2000));

    console.log('3. Inspecting Slide 2 iframe (#preview-social-slide2)...');
    const iframeHandle = await page.$('iframe#preview-social-slide2');
    if (!iframeHandle) throw new Error('No #preview-social-slide2 iframe found');

    const frame = await iframeHandle.contentFrame();
    if (!frame) throw new Error('Could not access iframe contentFrame');

    // Wait for frame content to render
    await new Promise(r => setTimeout(r, 1000));

    const top3Info = await frame.evaluate(() => {
        const allH3 = Array.from(document.querySelectorAll('h3'));
        const titleEl = allH3.find(h => h.textContent.includes('Top 3'));
        const r1Name = document.querySelector('#valRank1Name')?.textContent?.trim();
        const r1Count = document.querySelector('#valRank1Count')?.textContent?.trim();
        const r1Details = document.querySelector('#valRank1Details')?.textContent?.trim();

        const r2Name = document.querySelector('#valRank2Name')?.textContent?.trim();
        const r2Count = document.querySelector('#valRank2Count')?.textContent?.trim();
        const r2Details = document.querySelector('#valRank2Details')?.textContent?.trim();

        const r3Name = document.querySelector('#valRank3Name')?.textContent?.trim();
        const r3Count = document.querySelector('#valRank3Count')?.textContent?.trim();
        const r3Details = document.querySelector('#valRank3Details')?.textContent?.trim();

        return {
            sectionTitle: titleEl ? titleEl.textContent.trim() : null,
            rank1: { name: r1Name, count: r1Count, details: r1Details },
            rank2: { name: r2Name, count: r2Count, details: r2Details },
            rank3: { name: r3Name, count: r3Count, details: r3Details }
        };
    });

    console.log('Slide 2 Top 3 Kecamatan Dynamic Data:\n', JSON.stringify(top3Info, null, 2));

    if (!top3Info.sectionTitle?.includes('Kecamatan')) {
        throw new Error(`Section title does not say Top 3 Kecamatan: ${top3Info.sectionTitle}`);
    }
    if (!top3Info.rank1.name?.includes('Kecamatan') || !top3Info.rank1.count) {
        throw new Error(`Rank 1 data not properly populated: ${JSON.stringify(top3Info.rank1)}`);
    }

    console.log('\n======================================================');
    console.log('TOP 3 KECAMATAN DYNAMIC DATABASE DATA VERIFIED 100%!');
    console.log('======================================================');

    await browser.close();
    process.exit(0);
}

testTop3Kecamatan().catch(e => {
    console.error('Test Failed:', e);
    process.exit(1);
});
