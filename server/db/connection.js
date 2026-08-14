/**
 * SQLite Database Connection Module (Phase A1)
 * Singleton instance of better-sqlite3 with WAL mode and Foreign Keys enabled.
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const dbDir = path.join(projectRoot, 'database');
const dbPath = path.join(dbDir, 'app_database.sqlite');

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

let dbInstance = null;

export function getDb() {
    if (!dbInstance) {
        dbInstance = new Database(dbPath);
        // Optimize for performance and integrity
        dbInstance.pragma('journal_mode = WAL');
        dbInstance.pragma('foreign_keys = ON');
    }
    return dbInstance;
}

export function closeDb() {
    if (dbInstance && dbInstance.open) {
        dbInstance.close();
        dbInstance = null;
    }
}

export default getDb;
