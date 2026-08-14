/**
 * Export Log Repository Module (Phase A4)
 * Records export events in export_logs table.
 */

import { getDb } from '../connection.js';

export class ExportLogRepository {
    static log({ dataset_id, region_name, template_id, format }) {
        const db = getDb();
        const stmt = db.prepare(`
            INSERT INTO export_logs (dataset_id, region_name, template_id, format, exported_at)
            VALUES (?, ?, ?, ?, ?)
        `);
        const res = stmt.run(
            dataset_id || null,
            region_name || 'KABUPATEN TASIKMALAYA',
            template_id || 'template-1',
            format || 'png',
            new Date().toISOString()
        );
        return res.lastInsertRowid;
    }

    static getRecent(limit = 20) {
        const db = getDb();
        return db.prepare(`SELECT * FROM export_logs ORDER BY id DESC LIMIT ?`).all(limit);
    }
}
