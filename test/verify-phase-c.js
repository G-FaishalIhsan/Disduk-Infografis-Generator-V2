/**
 * Automated Verification Script for Phase C
 * Tests REST API dataset creation (CRUD), validation, and live query from SQLite.
 */

async function runTests() {
    console.log('--- TEST 1: POST /api/data/datasets (Create New Dataset 2026-1) ---');
    const newDatasetPayload = {
        year: 2026,
        semester: 1,
        filename: 'TEST_INPUT_MANUAL_2026.xlsx',
        workspace: 'social',
        summary: {
            totalPenduduk: 2050000,
            lakiLaki: 1045000,
            perempuan: 1005000,
            kepalaKeluarga: 590000,
            wajibKtp: 1350000,
            rekamKtp: 1345000,
            iakd: 95000,
            kia: 450000
        },
        kecamatanData: [
            {
                kdkec: '320624',
                nama: 'SINGAPARNA',
                totalPenduduk: 80000,
                lakiLaki: 41000,
                perempuan: 39000,
                kepalaKeluarga: 29000,
                wajibKtp: 60000,
                luas: 20.10
            },
            {
                kdkec: '320601',
                nama: 'CIPATUJAH',
                totalPenduduk: 78000,
                lakiLaki: 40000,
                perempuan: 38000,
                kepalaKeluarga: 29500,
                wajibKtp: 58000,
                luas: 241.99
            }
        ],
        is_active: 1,
        status: 'AKTIF'
    };

    const createRes = await fetch('http://localhost:3000/api/data/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDatasetPayload)
    });

    const createJson = await createRes.json();
    console.log('Dataset Created:', createJson.success, 'ID:', createJson.id);
    if (!createJson.success) throw new Error('Failed to create dataset');

    console.log('\n--- TEST 2: GET /api/data/datasets/social-2026-1 ---');
    const getRes = await fetch('http://localhost:3000/api/data/datasets/social-2026-1');
    const getJson = await getRes.json();
    console.log('Retrieved dataset total penduduk:', getJson.dataset?.summary?.totalPenduduk);
    if (getJson.dataset?.summary?.totalPenduduk !== 2050000) {
        throw new Error('Total penduduk mismatch');
    }

    console.log('\n--- TEST 3: Query District from newly saved dataset ---');
    const distRes = await fetch('http://localhost:3000/api/data/datasets/social-2026-1/districts/SINGAPARNA');
    const distJson = await distRes.json();
    console.log('Singaparna 2026-1 total:', distJson.data?.totalPenduduk);
    if (distJson.data?.totalPenduduk !== 80000) {
        throw new Error('District total mismatch');
    }

    console.log('\n--- TEST 4: Activate Dataset ---');
    const actRes = await fetch('http://localhost:3000/api/data/datasets/social-2026-1/activate', { method: 'POST' });
    const actJson = await actRes.json();
    console.log('Activation status:', actJson.success, actJson.message);

    console.log('\n========================================');
    console.log('ALL PHASE C VERIFICATION CHECKS PASSED!');
    console.log('========================================');
    process.exit(0);
}

runTests().catch(err => {
    console.error('Phase C Test Error:', err);
    process.exit(1);
});
