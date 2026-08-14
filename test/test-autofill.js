/**
 * Test script to verify CSV and Excel Auto-Fill matching
 */
import { ExcelNormalizer } from '../src/excel/excelNormalizer.js';

async function testAutoFill() {
    console.log('--- TEST 1: CSV Auto-Fill Parsing & Matching ---');
    const sampleCsvRows = [
        { KODE_KEC: '320601', KECAMATAN: 'CIPATUJAH', LAKI_LAKI: 35000, PEREMPUAN: 34000, KEPALA_KELUARGA: 21000, WAJIB_KTP: 52000 },
        { KODE_KEC: '320624', KECAMATAN: 'SINGAPARNA', LAKI_LAKI: 41000, PEREMPUAN: 40000, KEPALA_KELUARGA: 26000, WAJIB_KTP: 60000 },
        { KODE_KEC: '999999', KECAMATAN: 'KECAMATAN_TIDAK_DIKENAL', LAKI_LAKI: 1000, PEREMPUAN: 1000 }
    ];

    const normalized = ExcelNormalizer.normalizeRows(sampleCsvRows, { year: 2026, semester: 2, filename: 'sample.csv' });
    console.log('Parsed Kecamatan Count:', normalized.kecamatanData.length);
    console.log('Total Penduduk:', normalized.summary.totalPenduduk);
    console.log('Kecamatan 1:', normalized.kecamatanData[0]);

    if (normalized.kecamatanData.length !== 3) throw new Error('Expected 3 rows');
    if (normalized.kecamatanData[0].totalPenduduk !== 69000) throw new Error('Expected 69000');
    if (normalized.kecamatanData[0].kdkec !== '320601') throw new Error('Expected 320601');

    console.log('\n======================================================');
    console.log('AUTO-FILL CSV & EXCEL NORMALIZATION TEST PASSED 100%!');
    console.log('======================================================');
    process.exit(0);
}

testAutoFill().catch(e => {
    console.error('Test error:', e);
    process.exit(1);
});
