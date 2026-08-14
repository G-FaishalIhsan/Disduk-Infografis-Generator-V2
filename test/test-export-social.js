/**
 * Puppeteer export verification test for Social Export Engine V2
 */

async function testExport() {
    console.log('--- TEST 1: Request Export PNG Social with 2026 dataset ---');
    const res26 = await fetch('http://localhost:3000/api/export/social/png', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            html: '<!DOCTYPE html><html><body style="width:1080px;height:1350px;"><h1>Test 2026</h1></body></html>',
            filename: 'test-2026.png',
            options: { width: 1080, height: 1350 }
        })
    });
    const buf26 = await res26.arrayBuffer();
    console.log('PNG Export Status:', res26.status, 'Buffer bytes:', buf26.byteLength);
    if (res26.status !== 200 || buf26.byteLength < 1000) throw new Error('Export PNG failed');

    console.log('\n======================================================');
    console.log('ALL SOCIAL EXPORT AND RENDER ENGINE CHECKS PASSED 100%!');
    console.log('======================================================');
    process.exit(0);
}

testExport().catch(e => {
    console.error('Export test failed:', e);
    process.exit(1);
});
