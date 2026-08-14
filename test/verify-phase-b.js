/**
 * Automated Verification Script for Phase B
 * Tests Full Workspace DB integration, PdfParser sync, and Puppeteer export rendering (Templates 1, 2, 3).
 */

import { FullDatasetRepository } from '../server/db/repositories/fullDatasetRepository.js';
import { PdfParser } from '../src/parsers/pdf-parser.js';

async function runTests() {
    console.log('--- TEST 1: FullDatasetRepository Checks ---');
    const kabDb = FullDatasetRepository.getKabupaten();
    if (!kabDb || !kabDb.penduduk || !kabDb.penduduk.total) {
        throw new Error('Kabupaten data invalid or missing from SQLite');
    }
    console.log('Kabupaten from SQLite:', kabDb.metadata?.nama_wilayah, 'Total:', kabDb.penduduk?.total);

    const distDb = FullDatasetRepository.getDistrict('SINGAPARNA');
    if (!distDb || !distDb.penduduk) {
        throw new Error('Singaparna district data missing from SQLite');
    }
    console.log('Singaparna from SQLite:', distDb.metadata?.nama_wilayah, 'Total:', distDb.penduduk?.total);

    console.log('\n--- TEST 2: PdfParser Integration & Graceful Fallback ---');
    const parser = new PdfParser();
    const kabData = parser.getKabupatenData();
    console.log('Parser getKabupatenData():', kabData.metadata?.nama_wilayah, 'Total:', kabData.penduduk?.total);

    const singaparnaData = parser.getDistrictData('SINGAPARNA');
    console.log('Parser getDistrictData(SINGAPARNA):', singaparnaData.metadata?.nama_wilayah, 'Total:', singaparnaData.penduduk?.total);

    console.log('\n--- TEST 3: Full Workspace Render & Export (Template 1 PNG) ---');
    const t1Res = await fetch('http://localhost:3000/api/export/png', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            templateId: 'template-1',
            data: kabData,
            filename: 'test_t1_export.png'
        })
    });
    if (!t1Res.ok) throw new Error('Template 1 PNG export failed: ' + t1Res.statusText);
    const t1Buf = await t1Res.arrayBuffer();
    console.log('Template 1 PNG Export Size (bytes):', t1Buf.byteLength);

    console.log('\n--- TEST 4: Full Workspace Render & Export (Template 2 PDF) ---');
    const t2Res = await fetch('http://localhost:3000/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            templateId: 'template-2',
            data: kabData,
            filename: 'test_t2_export.pdf'
        })
    });
    if (!t2Res.ok) throw new Error('Template 2 PDF export failed: ' + t2Res.statusText);
    const t2Buf = await t2Res.arrayBuffer();
    console.log('Template 2 PDF Export Size (bytes):', t2Buf.byteLength);

    console.log('\n--- TEST 5: Full Workspace Render & Export (Template 3 JPG) ---');
    const t3Res = await fetch('http://localhost:3000/api/export/jpg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            templateId: 'template-3',
            data: singaparnaData,
            filename: 'test_t3_export.jpg'
        })
    });
    if (!t3Res.ok) throw new Error('Template 3 JPG export failed: ' + t3Res.statusText);
    const t3Buf = await t3Res.arrayBuffer();
    console.log('Template 3 JPG Export Size (bytes):', t3Buf.byteLength);

    console.log('\n========================================');
    console.log('ALL PHASE B VERIFICATION CHECKS PASSED!');
    console.log('========================================');
    process.exit(0);
}

runTests().catch(err => {
    console.error('Phase B Test Error:', err);
    process.exit(1);
});
