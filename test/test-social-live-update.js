/**
 * Verification test for Social Workspace SQLite Live Dataset Integration
 */
import { DataBinderV2 } from '../src/engine/data-binder-v2.js';

async function run() {
    console.log('--- TEST 1: Fetch 2024 Sem 1 from SQLite ---');
    const res24 = await fetch('http://localhost:3000/api/data/datasets/social-2024-1');
    const json24 = await res24.json();
    const data24 = DataBinderV2.buildTemplateDataObject(json24.dataset, 'KABUPATEN');
    console.log('2024 Sem 1 Data:', {
        tahun: data24.tahun,
        semester: data24.semester,
        totalPenduduk: data24.totalPenduduk,
        lakiLaki: data24.lakiLaki,
        perempuan: data24.perempuan
    });

    console.log('\n--- TEST 2: Fetch 2026 Sem 1 from SQLite (Newly Created Dataset) ---');
    const res26 = await fetch('http://localhost:3000/api/data/datasets/social-2026-1');
    const json26 = await res26.json();
    const data26 = DataBinderV2.buildTemplateDataObject(json26.dataset, 'KABUPATEN');
    console.log('2026 Sem 1 Data:', {
        tahun: data26.tahun,
        semester: data26.semester,
        totalPenduduk: data26.totalPenduduk,
        lakiLaki: data26.lakiLaki,
        perempuan: data26.perempuan
    });

    if (data24.tahun !== 2024 || data24.semester !== 1) throw new Error('2024 data mismatch');
    if (data26.tahun !== 2026 || data26.totalPenduduk !== 2050000) throw new Error('2026 data mismatch');

    console.log('\n======================================================');
    console.log('ALL SOCIAL WORKSPACE SQLITE DATA CHECKS PASSED 100%!');
    console.log('======================================================');
    process.exit(0);
}

run().catch(err => {
    console.error('Test Failed:', err);
    process.exit(1);
});
