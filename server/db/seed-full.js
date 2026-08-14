/**
 * Full Workspace Seeder Module (Phase B1)
 * Populates authentic Full Workspace demographic data (Kabupaten + 39 Kecamatan)
 * matching PdfParser & normalizePopulationData nested schema.
 */

import { getDb } from './connection.js';
import { PdfParser } from '../../src/parsers/pdf-parser.js';

export function seedFullWorkspace() {
    const db = getDb();
    const parser = new PdfParser();

    console.log('[DB Seeder Full] Seeding Full Workspace baseline data...');

    const datasetId = 'full-2025-2';
    const kabData = parser.getKabupatenData();
    const districtList = parser.getDistrictList();

    const insertDataset = db.prepare(`
        INSERT OR REPLACE INTO datasets (
            id, workspace, year, semester, source_filename,
            total_population, is_active, status, uploaded_at, last_used_at, created_by
        ) VALUES (
            @id, @workspace, @year, @semester, @source_filename,
            @total_population, @is_active, @status, @uploaded_at, @last_used_at, @created_by
        )
    `);

    const deleteRegions = db.prepare(`DELETE FROM dataset_regions WHERE dataset_id = ?`);
    const insertRegion = db.prepare(`
        INSERT INTO dataset_regions (
            dataset_id, region_code, region_name, is_kabupaten, payload_json
        ) VALUES (
            ?, ?, ?, ?, ?
        )
    `);

    db.transaction(() => {
        // Insert dataset header
        insertDataset.run({
            id: datasetId,
            workspace: 'full',
            year: 2025,
            semester: 2,
            source_filename: 'FINAL BUKU PROFIL PERKEMBANGAN KEPENDUDUKAN TASIKMALAYA 2025.pdf',
            total_population: kabData.penduduk?.total || 2026081,
            is_active: 1,
            status: 'AKTIF',
            uploaded_at: new Date().toISOString(),
            last_used_at: new Date().toISOString(),
            created_by: 'PDF Baseline Seeder'
        });

        deleteRegions.run(datasetId);

        // Insert Kabupaten record
        insertRegion.run(
            datasetId,
            '320600',
            'KABUPATEN TASIKMALAYA',
            1,
            JSON.stringify(kabData)
        );

        // Insert 39 Kecamatan records
        for (const distName of districtList) {
            const distData = parser.getDistrictData(distName);
            insertRegion.run(
                datasetId,
                distData.metadata?.kode_wilayah || null,
                distName,
                0,
                JSON.stringify(distData)
            );
        }
    })();

    console.log(`[DB Seeder Full] Seeded ${datasetId} with Kabupaten + ${districtList.length} Kecamatan records.`);
}

// Auto-run if executed via CLI
if (process.argv[1].endsWith('seed-full.js')) {
    try {
        seedFullWorkspace();
        process.exit(0);
    } catch (err) {
        console.error('[DB Seeder Full Error]:', err);
        process.exit(1);
    }
}
