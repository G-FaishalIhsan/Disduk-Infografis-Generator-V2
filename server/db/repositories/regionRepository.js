/**
 * Region Repository Module (Phase A4)
 * Manages dataset_regions queries, returning structured objects matching DatasetManager contract.
 */

import { getDb } from '../connection.js';
import { DatasetRepository } from './datasetRepository.js';

export class RegionRepository {
    static getKabupaten(datasetId) {
        const db = getDb();
        const stmt = db.prepare(`
            SELECT region_code as code, region_name as name, payload_json
            FROM dataset_regions
            WHERE dataset_id = ? AND is_kabupaten = 1
            LIMIT 1
        `);
        const row = stmt.get(datasetId);
        if (!row) return null;
        return JSON.parse(row.payload_json);
    }

    static getDistrict(datasetId, districtCodeOrName) {
        const db = getDb();
        const cleanName = String(districtCodeOrName).toUpperCase().replace(/^KECAMATAN\s+/i, '').trim();
        const stmt = db.prepare(`
            SELECT region_code as code, region_name as name, payload_json
            FROM dataset_regions
            WHERE dataset_id = ? AND is_kabupaten = 0 AND (region_code = ? OR UPPER(region_name) = ?)
            LIMIT 1
        `);
        const row = stmt.get(datasetId, districtCodeOrName, cleanName);
        if (!row) return null;
        return JSON.parse(row.payload_json);
    }

    static listDistricts(datasetId) {
        const db = getDb();
        const stmt = db.prepare(`
            SELECT region_code as kdkec, region_name as nama, payload_json
            FROM dataset_regions
            WHERE dataset_id = ? AND is_kabupaten = 0
            ORDER BY region_code ASC
        `);
        return stmt.all(datasetId).map(r => {
            const p = JSON.parse(r.payload_json);
            return {
                kdkec: r.kdkec,
                nama: r.nama,
                totalPenduduk: p.totalPenduduk,
                lakiLaki: p.lakiLaki,
                perempuan: p.perempuan,
                wajibKtp: p.wajibKtp,
                rekamKtp: p.rekamKtp,
                kepalaKeluarga: p.kk || p.kepalaKeluarga,
                kkPria: p.kkPria,
                pekka: p.pekka,
                luas: p.luas,
                kepadatan: p.kepadatan,
                iakd: p.iakd,
                kia: p.kia,
                usiaMuda: p.usiaMuda,
                usiaProduktif: p.usiaProduktif,
                usiaLansia: p.usiaLansia,
                desaList: p.desaList || []
            };
        });
    }

    /**
     * Builds the complete dataset object (contract-compatible with DatasetManager.getDataset)
     */
    static getCompleteDataset(datasetId) {
        const datasetMeta = DatasetRepository.getById(datasetId);
        if (!datasetMeta) return null;

        const kabPayload = this.getKabupaten(datasetId);
        const kecamatanData = this.listDistricts(datasetId);

        const totalP = kabPayload?.totalPenduduk || datasetMeta.totalPopulation || 0;
        const laki = kabPayload?.lakiLaki || 0;
        const perempuan = kabPayload?.perempuan || 0;
        const kk = kabPayload?.kk || kabPayload?.kepalaKeluarga || 0;
        const ktp = kabPayload?.wajibKtp || 0;

        return {
            id: datasetMeta.id,
            metadata: {
                year: datasetMeta.year,
                semester: datasetMeta.semester,
                filename: datasetMeta.filename,
                uploadedAt: datasetMeta.uploadedAt,
                lastUsedAt: datasetMeta.lastUsedAt
            },
            year: datasetMeta.year,
            semester: datasetMeta.semester,
            filename: datasetMeta.filename,
            uploadedAt: datasetMeta.uploadedAt,
            lastUsedAt: datasetMeta.lastUsedAt,
            fileSize: 55000,
            isActive: datasetMeta.isActive ? 1 : 0,
            is_active: datasetMeta.isActive ? 1 : 0,
            status: datasetMeta.status,
            statusBadge: datasetMeta.statusBadge,
            statusBadgeClass: datasetMeta.statusBadgeClass,
            summary: {
                totalKecamatan: kecamatanData.length,
                totalDesa: 351,
                totalPenduduk: totalP,
                lakiLaki: laki,
                perempuan: perempuan,
                kepalaKeluarga: kk,
                kkPria: kabPayload?.kkPria || 0,
                pekka: kabPayload?.pekka || 0,
                wajibKtp: ktp,
                rekamKtp: kabPayload?.rekamKtp || 0,
                iakd: kabPayload?.iakd || 0,
                kia: kabPayload?.kia || 0
            },
            kecamatanData
        };
    }
}
