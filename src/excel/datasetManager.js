/**
 * Dataset Manager Module (Phase A6 — SQLite Integration & Graceful Fallback)
 * Manages dataset metadata, synchronization with backend SQLite database (/api/data/*),
 * dynamic year scanning, and tracks lastUsedAt timestamps.
 * If backend is unavailable or offline, gracefully falls back to localStorage.
 */

import { DbService } from '../services/db-service.js';

const KECAMATAN_RATIOS = [
    { kdkec: "320601", nama: "CIPATUJAH", baseTotal: 74022 },
    { kdkec: "320602", nama: "KARANGNUNGGAL", baseTotal: 92454 },
    { kdkec: "320603", nama: "CIKALONG", baseTotal: 72077 },
    { kdkec: "320604", nama: "PANCATENGAH", baseTotal: 51918 },
    { kdkec: "320605", nama: "CIKATOMAS", baseTotal: 55683 },
    { kdkec: "320606", nama: "CIBALONG", baseTotal: 34791 },
    { kdkec: "320607", nama: "PARUNGPONTENG", baseTotal: 37746 },
    { kdkec: "320608", nama: "BANTARKALONG", baseTotal: 41519 },
    { kdkec: "320609", nama: "BOJONGASIH", baseTotal: 22431 },
    { kdkec: "320610", nama: "CULAMEGA", baseTotal: 26738 },
    { kdkec: "320611", nama: "PATARUMAN", baseTotal: 36754 },
    { kdkec: "320612", nama: "KARANGJAYA", baseTotal: 13087 },
    { kdkec: "320613", nama: "MANONJAYA", baseTotal: 64940 },
    { kdkec: "320614", nama: "CINEAM", baseTotal: 36596 },
    { kdkec: "320615", nama: "EKAPREDANA", baseTotal: 60431 },
    { kdkec: "320616", nama: "SALOPA", baseTotal: 52350 },
    { kdkec: "320617", nama: "JATINANGGUNG", baseTotal: 46647 },
    { kdkec: "320618", nama: "GUNUNGTANJUNG", baseTotal: 31243 },
    { kdkec: "320619", nama: "SUKARAJA", baseTotal: 52752 },
    { kdkec: "320620", nama: "TARAJU", baseTotal: 43595 },
    { kdkec: "320621", nama: "SALAWU", baseTotal: 64699 },
    { kdkec: "320622", nama: "MANGUNREJA", baseTotal: 42741 },
    { kdkec: "320623", nama: "SUKARAME", baseTotal: 41002 },
    { kdkec: "320624", nama: "SINGAPARNA", baseTotal: 76470 },
    { kdkec: "320625", nama: "SUKARATU", baseTotal: 50883 },
    { kdkec: "320626", nama: "CIGALONTANG", baseTotal: 81114 },
    { kdkec: "320627", nama: "LEUWIHSARI", baseTotal: 43392 },
    { kdkec: "320628", nama: "PADAKEMBANG", baseTotal: 41530 },
    { kdkec: "320629", nama: "SARIMUKTI", baseTotal: 35473 },
    { kdkec: "320630", nama: "SODONGHILIR", baseTotal: 70017 },
    { kdkec: "320631", nama: "SUKARATU", baseTotal: 54429 },
    { kdkec: "320632", nama: "CISAYONG", baseTotal: 64729 },
    { kdkec: "320633", nama: "SUKAHENING", baseTotal: 33961 },
    { kdkec: "320634", nama: "RAJAPOLAH", baseTotal: 52914 },
    { kdkec: "320635", nama: "JAMANIS", baseTotal: 41029 },
    { kdkec: "320636", nama: "CIAWI", baseTotal: 69478 },
    { kdkec: "320637", nama: "KADIPATEN", baseTotal: 41450 },
    { kdkec: "320638", nama: "PAGERAGEUNG", baseTotal: 63532 },
    { kdkec: "320639", nama: "SUKARESIK", baseTotal: 42731 }
];

function generateFallbackDatasetPayload(year, semester, totalP, filename, uploadedAt, lastUsedAt, statusBadge) {
    const laki = Math.round(totalP * 0.5092);
    const perempuan = totalP - laki;
    const kk = Math.round(totalP / 3.4);
    const ktp = Math.round(totalP * 0.7469);

    const kecamatanData = KECAMATAN_RATIOS.map(k => {
        const ratio = k.baseTotal / 1973411;
        const pTotal = Math.round(totalP * ratio);
        const pLaki = Math.round(pTotal * 0.5092);
        const pPerempuan = pTotal - pLaki;
        const pKk = Math.round(pTotal / 3.4);
        const pKtp = Math.round(pTotal * 0.7469);

        return {
            kdkec: k.kdkec,
            nama: k.nama,
            lakiLaki: pLaki,
            perempuan: pPerempuan,
            totalPenduduk: pTotal,
            wajibKtp: pKtp,
            kepalaKeluarga: pKk
        };
    });

    return {
        metadata: {
            year,
            semester,
            filename,
            uploadedAt,
            lastUsedAt
        },
        year,
        semester,
        filename,
        uploadedAt,
        lastUsedAt,
        fileSize: 55000,
        statusBadge,
        statusBadgeClass: statusBadge === 'AKTIF' ? 'v2-badge-active' : 'v2-badge-available',
        summary: {
            totalKecamatan: 39,
            totalDesa: 351,
            totalPenduduk: totalP,
            lakiLaki: laki,
            perempuan: perempuan,
            kepalaKeluarga: kk,
            wajibKtp: ktp
        },
        kecamatanData
    };
}

export class DatasetManager {
    constructor() {
        this.storageKey = 'disduk_v2_scalable_datasets';
        this.registry = {};
        this.isDbConnected = false;
        this.init();
    }

    init() {
        this.loadRegistry();
        this.seedFolderStructure();
        this.syncWithDatabase().catch(err => {
            console.warn('[DatasetManager] Background DB sync note:', err.message);
        });
    }

    /**
     * Seeds initial fallback datasets
     */
    seedFolderStructure() {
        const defaults = {
            '2025-2': generateFallbackDatasetPayload(2025, 2, 1947448, 'JUMDUK SEM 2 TAHUN 2025.xlsx', new Date(2026, 6, 26).toISOString(), new Date(2026, 6, 27).toISOString(), 'AKTIF'),
            '2025-1': generateFallbackDatasetPayload(2025, 1, 1947448, 'JUMDUK SEM 1 TAHUN 2025.xlsx', new Date(2026, 5, 30).toISOString(), null, 'TERSEDIA'),
            '2024-2': generateFallbackDatasetPayload(2024, 2, 1947448, 'JUMDUK SEM 2 2024.xlsx', new Date(2025, 11, 31).toISOString(), null, 'TERSEDIA'),
            '2024-1': generateFallbackDatasetPayload(2024, 1, 1947448, 'JUMDUK SEM 1 2024.xlsx', new Date(2025, 5, 30).toISOString(), null, 'TERSEDIA'),
            '2023-2': generateFallbackDatasetPayload(2023, 2, 1947448, 'JUMDUK SEM 2 2023.xlsx', new Date(2024, 11, 31).toISOString(), null, 'TERSEDIA'),
            '2023-1': generateFallbackDatasetPayload(2023, 1, 1947448, 'JUMDUK SEM 1 2023.xlsx', new Date(2024, 5, 30).toISOString(), null, 'TERSEDIA')
        };

        Object.keys(defaults).forEach(key => {
            if (!this.registry[key] || !this.registry[key].summary || !this.registry[key].summary.lakiLaki) {
                this.registry[key] = defaults[key];
            }
        });

        this.saveRegistry();
    }

    /**
     * Asynchronously syncs registry with SQLite database
     */
    async syncWithDatabase() {
        try {
            const datasetsList = await DbService.getDatasets('social');
            if (datasetsList && Array.isArray(datasetsList) && datasetsList.length > 0) {
                this.isDbConnected = true;
                const updatedRegistry = {};
                for (const d of datasetsList) {
                    const key = `${d.year}-${d.semester}`;
                    const fullData = await DbService.getDatasetById(d.id);
                    const isActive = Boolean(d.isActive || d.is_active || d.status === 'AKTIF');
                    if (fullData) {
                        updatedRegistry[key] = {
                            ...fullData,
                            year: Number(d.year),
                            semester: Number(d.semester),
                            isActive: isActive ? 1 : 0,
                            is_active: isActive ? 1 : 0,
                            status: isActive ? 'AKTIF' : 'TERSEDIA',
                            statusBadge: isActive ? 'AKTIF' : 'TERSEDIA',
                            statusBadgeClass: isActive ? 'v2-badge-active' : 'v2-badge-available'
                        };
                    } else {
                        updatedRegistry[key] = {
                            year: Number(d.year),
                            semester: Number(d.semester),
                            filename: d.filename || d.source_filename,
                            summary: { totalPenduduk: d.totalPopulation || 0 },
                            status: isActive ? 'AKTIF' : 'TERSEDIA',
                            statusBadge: isActive ? 'AKTIF' : 'TERSEDIA',
                            statusBadgeClass: isActive ? 'v2-badge-active' : 'v2-badge-available',
                            isActive: isActive ? 1 : 0,
                            is_active: isActive ? 1 : 0
                        };
                    }
                }
                this.registry = updatedRegistry;
                this.saveRegistry();
            }
        } catch (err) {
            console.warn('[DatasetManager] syncWithDatabase fallback:', err.message);
        }
    }

    loadRegistry() {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const raw = window.localStorage.getItem(this.storageKey);
                if (raw) {
                    this.registry = JSON.parse(raw);
                }
            }
        } catch (e) {
            console.warn('Gagal membaca dataset registry:', e);
            this.registry = {};
        }
    }

    saveRegistry() {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(this.storageKey, JSON.stringify(this.registry));
            }
        } catch (e) {
            console.warn('Gagal menyimpan dataset registry:', e);
        }
    }

    /**
     * Dynamically returns all unique dataset years present in storage/registry/SQLite
     * @returns {Array<number>} Sorted years descending e.g. [2027, 2026, 2025, 2024, 2023]
     */
    getAvailableYears() {
        const yearsSet = new Set();
        Object.values(this.registry).forEach(item => {
            const yr = Number(item.year || item.metadata?.year);
            if (yr && !isNaN(yr)) yearsSet.add(yr);
        });
        if (yearsSet.size === 0) {
            return [2027, 2026, 2025, 2024, 2023];
        }
        return Array.from(yearsSet).sort((a, b) => b - a);
    }

    /**
     * Retrieves dataset metadata & auto-summary for a specific Year and Semester.
     * @param {number} year 
     * @param {number} semester 
     * @returns {Object|null}
     */
    getDataset(year, semester) {
        const key = `${year}-${semester}`;
        return this.registry[key] || null;
    }

    /**
     * Asynchronously retrieves dataset from memory registry or SQLite DB
     */
    async getDatasetAsync(year, semester) {
        const key = `${year}-${semester}`;
        if (this.registry[key] && this.registry[key].summary) {
            return this.registry[key];
        }
        const slug = `social-${year}-${semester}`;
        const dbData = await DbService.getDatasetById(slug);
        if (dbData) {
            this.registry[key] = dbData;
            this.saveRegistry();
            return dbData;
        }
        return this.getDataset(year, semester);
    }

    /**
     * Marks a dataset as active/used, updating all other datasets to 'TERSEDIA'.
     * @param {number} year 
     * @param {number} semester 
     */
    markAsUsed(year, semester) {
        const targetKey = `${year}-${semester}`;
        const now = new Date().toISOString();

        Object.keys(this.registry).forEach(key => {
            const isTarget = (key === targetKey);
            if (this.registry[key]) {
                this.registry[key].isActive = isTarget;
                this.registry[key].is_active = isTarget ? 1 : 0;
                this.registry[key].status = isTarget ? 'AKTIF' : 'TERSEDIA';
                this.registry[key].statusBadge = isTarget ? 'AKTIF' : 'TERSEDIA';
                this.registry[key].statusBadgeClass = isTarget ? 'v2-badge-active' : 'v2-badge-available';
                if (isTarget) {
                    this.registry[key].lastUsedAt = now;
                }
            }
        });

        this.saveRegistry();
        // Asynchronously sync with SQLite DB
        DbService.setActiveDataset(targetKey).catch(() => {});
    }

    /**
     * Registers a new dataset payload into registry and saves to localStorage.
     * @param {Object} payload 
     * @returns {boolean} True if successfully registered
     */
    registerDataset(payload) {
        if (!payload || !payload.year || !payload.semester) {
            console.warn('[DatasetManager] Invalid payload: year and semester are required.');
            return false;
        }
        const key = `${payload.year}-${payload.semester}`;
        this.registry[key] = payload;
        this.saveRegistry();
        return true;
    }
}
