/**
 * Database Migration Runner (Phase A2)
 * Applies SQL migrations from server/db/migrations/ in sequential order.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname, 'migrations');

export function runMigrations() {
    const db = getDb();

    // Create migrations meta-table if not exists
    db.exec(`
        CREATE TABLE IF NOT EXISTS _migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT UNIQUE NOT NULL,
            applied_at TEXT NOT NULL
        )
    `);

    const applied = new Set(
        db.prepare('SELECT filename FROM _migrations').all().map(r => r.filename)
    );

    if (!fs.existsSync(migrationsDir)) {
        return;
    }

    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

    for (const file of files) {
        if (!applied.has(file)) {
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            db.transaction(() => {
                db.exec(sql);
                db.prepare('INSERT INTO _migrations (filename, applied_at) VALUES (?, ?)').run(
                    file,
                    new Date().toISOString()
                );
            })();
            console.log(`[DB Migration] Applied: ${file}`);
        }
    }
}

// Auto-run if executed directly via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    try {
        runMigrations();
        console.log('[DB Migration] All migrations executed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('[DB Migration Error]:', err.message);
        process.exit(1);
    }
}
