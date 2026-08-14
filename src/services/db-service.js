/**
 * Database Service Module (Phase A6)
 * Client-side API fetcher to /api/data/* endpoints with timeout and graceful fallback support.
 */

const API_BASE = 'http://localhost:3000/api/data';
const TIMEOUT_MS = 2500;

async function fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return res;
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

export class DbService {
    /**
     * Checks if SQLite Backend API is reachable
     * @returns {Promise<boolean>}
     */
    static async isAvailable() {
        try {
            const res = await fetchWithTimeout(`${API_BASE}/datasets?workspace=social`);
            return res.ok;
        } catch {
            return false;
        }
    }

    /**
     * Fetches all datasets from SQLite database
     * @param {string} workspace 
     * @returns {Promise<Array|null>}
     */
    static async getDatasets(workspace = 'social') {
        try {
            const res = await fetchWithTimeout(`${API_BASE}/datasets?workspace=${encodeURIComponent(workspace)}`);
            if (!res.ok) return null;
            const json = await res.json();
            return json.success ? json.datasets : null;
        } catch (err) {
            console.warn('[DbService] Fetch datasets failed, falling back to local storage:', err.message);
            return null;
        }
    }

    /**
     * Fetches complete active dataset
     * @param {string} workspace 
     * @returns {Promise<Object|null>}
     */
    static async getActiveDataset(workspace = 'social') {
        try {
            const res = await fetchWithTimeout(`${API_BASE}/datasets/active?workspace=${encodeURIComponent(workspace)}`);
            if (!res.ok) return null;
            const json = await res.json();
            return json.success ? json.dataset : null;
        } catch (err) {
            console.warn('[DbService] Fetch active dataset failed:', err.message);
            return null;
        }
    }

    /**
     * Fetches single complete dataset by ID (e.g. 'social-2025-2' or '2025-2')
     * @param {string} id 
     * @returns {Promise<Object|null>}
     */
    static async getDatasetById(id) {
        try {
            const slug = String(id).startsWith('social-') ? id : `social-${id}`;
            const res = await fetchWithTimeout(`${API_BASE}/datasets/${encodeURIComponent(slug)}`);
            if (!res.ok) return null;
            const json = await res.json();
            return json.success ? json.dataset : null;
        } catch (err) {
            console.warn(`[DbService] Fetch dataset ${id} failed:`, err.message);
            return null;
        }
    }

    /**
     * Sets active dataset on backend SQLite DB
     * @param {string} id 
     * @returns {Promise<Object|null>}
     */
    static async setActiveDataset(id) {
        try {
            const slug = String(id).startsWith('social-') ? id : `social-${id}`;
            const res = await fetchWithTimeout(`${API_BASE}/datasets/${encodeURIComponent(slug)}/activate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) return null;
            const json = await res.json();
            return json.success ? json.dataset : null;
        } catch (err) {
            console.warn(`[DbService] Activate dataset ${id} failed:`, err.message);
            return null;
        }
    }

    /**
     * Creates or updates complete dataset on backend SQLite DB
     * @param {Object} payload 
     * @returns {Promise<Object|null>}
     */
    static async createDataset(payload) {
        try {
            const res = await fetchWithTimeout(`${API_BASE}/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) return null;
            const json = await res.json();
            return json.success ? json.dataset : null;
        } catch (err) {
            console.warn('[DbService] Create dataset failed:', err.message);
            return null;
        }
    }

    /**
     * Deletes dataset by ID
     * @param {string} id 
     * @returns {Promise<boolean>}
     */
    static async deleteDataset(id) {
        try {
            const res = await fetchWithTimeout(`${API_BASE}/datasets/${encodeURIComponent(id)}`, {
                method: 'DELETE'
            });
            if (!res.ok) return false;
            const json = await res.json();
            return Boolean(json.success);
        } catch (err) {
            console.warn(`[DbService] Delete dataset ${id} failed:`, err.message);
            return false;
        }
    }

    // ===================================================================
    // FULL WORKSPACE (V1) METHODS
    // ===================================================================

    /**
     * Fetches Full Workspace Kabupaten demographic data from SQLite
     */
    static async getFullKabupaten() {
        try {
            const res = await fetchWithTimeout(`${API_BASE}/full/kabupaten`);
            if (!res.ok) return null;
            const json = await res.json();
            return json.success ? json.data : null;
        } catch (err) {
            console.warn('[DbService] Fetch full kabupaten failed:', err.message);
            return null;
        }
    }

    /**
     * Fetches Full Workspace District demographic data from SQLite
     */
    static async getFullDistrict(districtName) {
        try {
            const res = await fetchWithTimeout(`${API_BASE}/full/districts/${encodeURIComponent(districtName)}`);
            if (!res.ok) return null;
            const json = await res.json();
            return json.success ? json.data : null;
        } catch (err) {
            console.warn(`[DbService] Fetch full district ${districtName} failed:`, err.message);
            return null;
        }
    }

    /**
     * Fetches Full Workspace districts list
     */
    static async getFullDistrictsList() {
        try {
            const res = await fetchWithTimeout(`${API_BASE}/full/districts`);
            if (!res.ok) return null;
            const json = await res.json();
            return json.success ? json.districts : null;
        } catch (err) {
            console.warn('[DbService] Fetch full districts list failed:', err.message);
            return null;
        }
    }

    /**
     * Logs export activity to SQLite audit log
     */
    static async logExport(logData) {
        try {
            await fetchWithTimeout(`${API_BASE}/export-log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logData)
            });
        } catch {
            // Silently ignore log errors
        }
    }
}
