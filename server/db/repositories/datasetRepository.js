/**
 * Dataset Repository Module (Phase A4)
 * Handles CRUD, listing, activation, and timestamp updates for datasets.
 */

import { getDb } from '../connection.js';

export class DatasetRepository {
    static listAll(workspace = 'social') {
        const db = getDb();
        const stmt = db.prepare(`
            SELECT id, workspace, year, semester, source_filename as filename,
                   total_population as totalPopulation, is_active as isActive,
                   status, uploaded_at as uploadedAt, last_used_at as lastUsedAt, created_by as createdBy
            FROM datasets
            WHERE workspace = ?
            ORDER BY year DESC, semester DESC
        `);
        return stmt.all(workspace).map(d => ({
            ...d,
            statusBadge: d.status,
            statusBadgeClass: d.isActive ? 'v2-badge-active' : 'v2-badge-available'
        }));
    }

    static getById(id) {
        const db = getDb();
        const stmt = db.prepare(`
            SELECT id, workspace, year, semester, source_filename as filename,
                   total_population as totalPopulation, is_active as isActive,
                   status, uploaded_at as uploadedAt, last_used_at as lastUsedAt, created_by as createdBy
            FROM datasets
            WHERE id = ?
        `);
        const row = stmt.get(id);
        if (!row) return null;
        return {
            ...row,
            statusBadge: row.status,
            statusBadgeClass: row.isActive ? 'v2-badge-active' : 'v2-badge-available'
        };
    }

    static getActive(workspace = 'social') {
        const db = getDb();
        const stmt = db.prepare(`
            SELECT id, workspace, year, semester, source_filename as filename,
                   total_population as totalPopulation, is_active as isActive,
                   status, uploaded_at as uploadedAt, last_used_at as lastUsedAt, created_by as createdBy
            FROM datasets
            WHERE workspace = ? AND is_active = 1
            LIMIT 1
        `);
        return stmt.get(workspace) || null;
    }

    static setActive(id, workspace = 'social') {
        const db = getDb();
        const now = new Date().toISOString();

        return db.transaction(() => {
            // Deactivate all in same workspace
            db.prepare(`UPDATE datasets SET is_active = 0, status = 'TERSEDIA' WHERE workspace = ?`).run(workspace);
            
            // Activate selected
            const res = db.prepare(`
                UPDATE datasets
                SET is_active = 1, status = 'AKTIF', last_used_at = ?
                WHERE id = ?
            `).run(now, id);

            return res.changes > 0;
        })();
    }

    static create(datasetData) {
        const db = getDb();
        const now = new Date().toISOString();
        const stmt = db.prepare(`
            INSERT INTO datasets (
                id, workspace, year, semester, source_filename,
                total_population, is_active, status, uploaded_at, last_used_at, created_by
            ) VALUES (
                @id, @workspace, @year, @semester, @source_filename,
                @total_population, @is_active, @status, @uploaded_at, @last_used_at, @created_by
            )
        `);

        stmt.run({
            id: datasetData.id,
            workspace: datasetData.workspace || 'social',
            year: datasetData.year,
            semester: datasetData.semester,
            source_filename: datasetData.source_filename || datasetData.filename || '',
            total_population: datasetData.total_population || datasetData.totalPopulation || 0,
            is_active: datasetData.is_active ? 1 : 0,
            status: datasetData.status || (datasetData.is_active ? 'AKTIF' : 'TERSEDIA'),
            uploaded_at: datasetData.uploaded_at || now,
            last_used_at: datasetData.last_used_at || null,
            created_by: datasetData.created_by || 'User Upload'
        });

        return this.getById(datasetData.id);
    }

    static update(id, updateData) {
        const db = getDb();
        const fields = [];
        const params = { id };

        if (updateData.source_filename !== undefined) {
            fields.push('source_filename = @source_filename');
            params.source_filename = updateData.source_filename;
        }
        if (updateData.total_population !== undefined) {
            fields.push('total_population = @total_population');
            params.total_population = updateData.total_population;
        }
        if (updateData.status !== undefined) {
            fields.push('status = @status');
            params.status = updateData.status;
        }
        if (updateData.last_used_at !== undefined) {
            fields.push('last_used_at = @last_used_at');
            params.last_used_at = updateData.last_used_at;
        }

        if (fields.length === 0) return this.getById(id);

        const query = `UPDATE datasets SET ${fields.join(', ')} WHERE id = @id`;
        db.prepare(query).run(params);
        return this.getById(id);
    }

    static delete(id) {
        const db = getDb();
        const existing = this.getById(id);
        if (!existing) {
            throw new Error('Dataset tidak ditemukan.');
        }
        if (existing.isActive || existing.is_active || existing.status === 'AKTIF') {
            throw new Error('Dataset yang sedang AKTIF tidak dapat dihapus. Silakan aktifkan dataset lain terlebih dahulu.');
        }

        return db.transaction(() => {
            db.prepare('DELETE FROM dataset_regions WHERE dataset_id = ?').run(id);
            const res = db.prepare('DELETE FROM datasets WHERE id = ?').run(id);
            return res.changes > 0;
        })();
    }

    static saveCompleteDataset(payload) {
        const db = getDb();
        const now = new Date().toISOString();
        const year = parseInt(payload.year, 10);
        const semester = parseInt(payload.semester, 10);
        const workspace = payload.workspace || 'social';
        const id = payload.id || `${workspace}-${year}-${semester}`;
        const filename = payload.filename || payload.source_filename || `DATASET_SEM_${semester}_${year}.xlsx`;
        const totalP = payload.summary?.totalPenduduk || payload.total_population || 0;

        return db.transaction(() => {
            const insertDataset = db.prepare(`
                INSERT OR REPLACE INTO datasets (
                    id, workspace, year, semester, source_filename,
                    total_population, is_active, status, uploaded_at, last_used_at, created_by
                ) VALUES (
                    @id, @workspace, @year, @semester, @source_filename,
                    @total_population, @is_active, @status, @uploaded_at, @last_used_at, @created_by
                )
            `);

            insertDataset.run({
                id,
                workspace,
                year,
                semester,
                source_filename: filename,
                total_population: totalP,
                is_active: payload.is_active ? 1 : 0,
                status: payload.status || (payload.is_active ? 'AKTIF' : 'TERSEDIA'),
                uploaded_at: payload.uploaded_at || now,
                last_used_at: payload.last_used_at || now,
                created_by: payload.created_by || 'Operator Form Input'
            });

            db.prepare('DELETE FROM dataset_regions WHERE dataset_id = ?').run(id);

            const insertRegion = db.prepare(`
                INSERT INTO dataset_regions (
                    dataset_id, region_code, region_name, is_kabupaten, payload_json
                ) VALUES (?, ?, ?, ?, ?)
            `);

            // Kabupaten payload
            if (payload.kabupatenPayload) {
                insertRegion.run(id, '320600', 'KABUPATEN TASIKMALAYA', 1, JSON.stringify(payload.kabupatenPayload));
            } else if (payload.summary) {
                const kabObj = {
                    tahun: year,
                    semester: semester,
                    kabupaten: 'INFORMASI KEPENDUDUKAN KABUPATEN TASIKMALAYA',
                    kecamatan: 'KABUPATEN TASIKMALAYA',
                    totalPenduduk: payload.summary.totalPenduduk,
                    lakiLaki: payload.summary.lakiLaki,
                    perempuan: payload.summary.perempuan,
                    kk: payload.summary.kepalaKeluarga,
                    kepalaKeluarga: payload.summary.kepalaKeluarga,
                    kkPria: payload.summary.kkPria || Math.round(payload.summary.kepalaKeluarga * 0.77),
                    pekka: payload.summary.pekka || Math.round(payload.summary.kepalaKeluarga * 0.23),
                    wajibKtp: payload.summary.wajibKtp,
                    rekamKtp: payload.summary.rekamKtp || Math.round(payload.summary.wajibKtp * 0.995),
                    aktaLahir: payload.summary.aktaLahir || Math.round(totalP * 0.22),
                    aktaNikah: payload.summary.aktaNikah || Math.round(totalP * 0.18),
                    iakd: payload.summary.iakd || Math.round(totalP * 0.05),
                    kia: payload.summary.kia || Math.round(totalP * 0.22),
                    usiaMuda: Math.round(totalP * 0.18),
                    usiaProduktif: Math.round(totalP * 0.68),
                    usiaLansia: Math.round(totalP * 0.14),
                    luas: 2708,
                    kepadatan: Math.round(totalP / 2708)
                };
                insertRegion.run(id, '320600', 'KABUPATEN TASIKMALAYA', 1, JSON.stringify(kabObj));
            }

            // 39 Kecamatan records
            if (Array.isArray(payload.kecamatanData)) {
                for (const k of payload.kecamatanData) {
                    const pTotal = k.totalPenduduk || (k.lakiLaki + k.perempuan);
                    const kObj = {
                        tahun: year,
                        semester: semester,
                        kdkec: k.kdkec,
                        nama: k.nama,
                        kabupaten: `INFORMASI KEPENDUDUKAN KECAMATAN ${k.nama}`,
                        kecamatan: `KECAMATAN ${k.nama}`,
                        totalPenduduk: pTotal,
                        lakiLaki: k.lakiLaki,
                        perempuan: k.perempuan,
                        kk: k.kepalaKeluarga || k.kk,
                        kepalaKeluarga: k.kepalaKeluarga || k.kk,
                        kkPria: k.kkPria || Math.round((k.kepalaKeluarga || k.kk || 0) * 0.77),
                        pekka: k.pekka || Math.round((k.kepalaKeluarga || k.kk || 0) * 0.23),
                        wajibKtp: k.wajibKtp,
                        rekamKtp: k.rekamKtp || Math.round((k.wajibKtp || 0) * 0.995),
                        aktaLahir: Math.round(pTotal * 0.22),
                        aktaNikah: Math.round(pTotal * 0.18),
                        iakd: Math.round(pTotal * 0.05),
                        kia: Math.round(pTotal * 0.22),
                        usiaMuda: Math.round(pTotal * 0.18),
                        usiaProduktif: Math.round(pTotal * 0.68),
                        usiaLansia: Math.round(pTotal * 0.14),
                        luas: k.luas || 45,
                        kepadatan: Math.round(pTotal / (k.luas || 45)),
                        desaList: k.desaList || []
                    };
                    insertRegion.run(id, k.kdkec || null, k.nama, 0, JSON.stringify(kObj));
                }
            }

            return id;
        })();
    }
}
