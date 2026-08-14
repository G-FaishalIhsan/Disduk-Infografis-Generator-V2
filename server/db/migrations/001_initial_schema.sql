-- ===================================================================
-- Migration 001: Initial Schema for Disdukcapil Infografis Generator
-- Phase A2: Datasets, Dataset Regions (with payload JSON), and Export Logs
-- ===================================================================

CREATE TABLE IF NOT EXISTS datasets (
    id TEXT PRIMARY KEY,
    workspace TEXT NOT NULL DEFAULT 'social',
    year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    source_filename TEXT,
    total_population INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 0,
    status TEXT DEFAULT 'TERSEDIA',
    uploaded_at TEXT,
    last_used_at TEXT,
    created_by TEXT
);

CREATE TABLE IF NOT EXISTS dataset_regions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dataset_id TEXT NOT NULL,
    region_code TEXT,
    region_name TEXT NOT NULL,
    is_kabupaten INTEGER NOT NULL DEFAULT 0,
    payload_json TEXT NOT NULL,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS export_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dataset_id TEXT,
    region_name TEXT,
    template_id TEXT,
    format TEXT,
    exported_at TEXT
);

-- Indexes for high-performance lookups
CREATE INDEX IF NOT EXISTS idx_datasets_workspace_active ON datasets(workspace, is_active);
CREATE INDEX IF NOT EXISTS idx_dataset_regions_query ON dataset_regions(dataset_id, is_kabupaten, region_code);
CREATE INDEX IF NOT EXISTS idx_dataset_regions_name ON dataset_regions(dataset_id, region_name);
