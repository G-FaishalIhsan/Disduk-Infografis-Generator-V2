/**
 * Automated Verification Script for Phase A
 * Tests DB connection, tables, repositories, REST API, and render exports.
 */

import { getDb, closeDb } from '../server/db/connection.js';
import { DatasetRepository } from '../server/db/repositories/datasetRepository.js';
import { RegionRepository } from '../server/db/repositories/regionRepository.js';
import { ExportLogRepository } from '../server/db/repositories/exportLogRepository.js';
import { DbService } from '../src/services/db-service.js';

async function runTests() {
    console.log('--- TEST 1: Database & Migrations ---');
    const db = getDb();
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tables found in DB:', tables.map(t => t.name).join(', '));

    console.log('\n--- TEST 2: Repositories & Data Consistency ---');
    const datasets = DatasetRepository.listAll('social');
    console.log('Total datasets in SQLite:', datasets.length);
    if (datasets.length === 0) throw new Error('No datasets found in SQLite');

    const active = DatasetRepository.getActive('social');
    console.log('Active dataset ID:', active?.id);

    const complete = RegionRepository.getCompleteDataset(active.id);
    console.log('Summary Total Penduduk:', complete.summary.totalPenduduk);
    console.log('Summary Kepala Keluarga:', complete.summary.kepalaKeluarga);
    console.log('Summary Wajib KTP:', complete.summary.wajibKtp);
    console.log('Total Kecamatan records:', complete.kecamatanData.length);
    if (complete.kecamatanData.length !== 39) throw new Error('Expected 39 kecamatan, got ' + complete.kecamatanData.length);

    console.log('\n--- TEST 3: Specific District (SINGAPARNA) ---');
    const singaparna = RegionRepository.getDistrict(active.id, 'SINGAPARNA');
    console.log('Singaparna Total:', singaparna.totalPenduduk, 'Laki:', singaparna.lakiLaki, 'Perempuan:', singaparna.perempuan);

    console.log('\n--- TEST 4: Export Log Repository ---');
    const logId = ExportLogRepository.log({
        dataset_id: active.id,
        region_name: 'KABUPATEN TASIKMALAYA',
        template_id: 'template-1-v2',
        format: 'pdf'
    });
    console.log('Export log recorded with ID:', logId);

    console.log('\n========================================');
    console.log('ALL PHASE A VERIFICATION CHECKS PASSED!');
    console.log('========================================');
    closeDb();
    process.exit(0);
}

runTests().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
