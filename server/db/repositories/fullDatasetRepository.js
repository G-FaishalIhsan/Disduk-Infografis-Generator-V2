/**
 * Full Dataset Repository Module (Phase B2)
 * Manages queries for Full Workspace demographic data (nested population-schema.js format).
 */

import { getDb } from '../connection.js';
import { DatasetRepository } from './datasetRepository.js';

export class FullDatasetRepository {
    static getActiveDatasetId() {
        const active = DatasetRepository.getActive('full');
        return active ? active.id : 'full-2025-2';
    }

    static getKabupaten(datasetId = null) {
        const targetId = datasetId || this.getActiveDatasetId();
        const db = getDb();
        const stmt = db.prepare(`
            SELECT payload_json
            FROM dataset_regions
            WHERE dataset_id = ? AND is_kabupaten = 1
            LIMIT 1
        `);
        const row = stmt.get(targetId);
        if (!row) return null;
        return JSON.parse(row.payload_json);
    }

    static getDistrict(districtNameOrCode, datasetId = null) {
        const targetId = datasetId || this.getActiveDatasetId();
        const db = getDb();
        const cleanName = String(districtNameOrCode).toUpperCase().replace(/^KECAMATAN\s+/i, '').trim();
        const stmt = db.prepare(`
            SELECT payload_json
            FROM dataset_regions
            WHERE dataset_id = ? AND is_kabupaten = 0 AND (region_code = ? OR UPPER(region_name) = ?)
            LIMIT 1
        `);
        const row = stmt.get(targetId, districtNameOrCode, cleanName);
        if (!row) return null;
        return JSON.parse(row.payload_json);
    }

    static listDistricts(datasetId = null) {
        const targetId = datasetId || this.getActiveDatasetId();
        const db = getDb();
        const stmt = db.prepare(`
            SELECT region_name as name, region_code as code
            FROM dataset_regions
            WHERE dataset_id = ? AND is_kabupaten = 0
            ORDER BY region_name ASC
        `);
        return stmt.all(targetId);
    }
}
