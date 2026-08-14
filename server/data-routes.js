/**
 * Data Routes Module (Phase A5)
 * Additive REST endpoints with prefix /api/data/ for SQLite datasets and regions.
 */

import express from 'express';
import { DatasetRepository } from './db/repositories/datasetRepository.js';
import { RegionRepository } from './db/repositories/regionRepository.js';
import { FullDatasetRepository } from './db/repositories/fullDatasetRepository.js';
import { ExportLogRepository } from './db/repositories/exportLogRepository.js';

export const dataRouter = express.Router();

// ===================================================================
// FULL WORKSPACE (V1) DEMOGRAPHIC ENDPOINTS
// ===================================================================

// Get Full Workspace Kabupaten demographic data
dataRouter.get('/full/kabupaten', (req, res) => {
    try {
        const datasetId = req.query.datasetId || null;
        const kabData = FullDatasetRepository.getKabupaten(datasetId);
        if (!kabData) return res.status(404).json({ success: false, error: 'Kabupaten data not found' });
        res.json({ success: true, data: kabData });
    } catch (err) {
        console.error('[API /api/data/full/kabupaten Error]:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// List Full Workspace districts
dataRouter.get('/full/districts', (req, res) => {
    try {
        const datasetId = req.query.datasetId || null;
        const list = FullDatasetRepository.listDistricts(datasetId);
        res.json({ success: true, districts: list });
    } catch (err) {
        console.error('[API /api/data/full/districts Error]:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get Full Workspace specific district data
dataRouter.get('/full/districts/:district', (req, res) => {
    try {
        const datasetId = req.query.datasetId || null;
        const distData = FullDatasetRepository.getDistrict(req.params.district, datasetId);
        if (!distData) return res.status(404).json({ success: false, error: 'District not found' });
        res.json({ success: true, data: distData });
    } catch (err) {
        console.error(`[API /api/data/full/districts/${req.params.district} Error]:`, err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ===================================================================
// SOCIAL WORKSPACE (V2) DATASET ENDPOINTS
// ===================================================================

// 1. List all datasets in workspace
dataRouter.get('/datasets', (req, res) => {
    try {
        const workspace = req.query.workspace || 'social';
        const datasets = DatasetRepository.listAll(workspace);
        res.json({ success: true, datasets });
    } catch (err) {
        console.error('[API /api/data/datasets Error]:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. Get active dataset
dataRouter.get('/datasets/active', (req, res) => {
    try {
        const workspace = req.query.workspace || 'social';
        const activeMeta = DatasetRepository.getActive(workspace);
        if (!activeMeta) {
            return res.status(404).json({ success: false, error: 'No active dataset found' });
        }
        const fullDataset = RegionRepository.getCompleteDataset(activeMeta.id);
        res.json({ success: true, dataset: fullDataset });
    } catch (err) {
        console.error('[API /api/data/datasets/active Error]:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 3. Get single complete dataset by ID (includes summary and 39 kecamatan)
dataRouter.get('/datasets/:id', (req, res) => {
    try {
        const dataset = RegionRepository.getCompleteDataset(req.params.id);
        if (!dataset) {
            return res.status(404).json({ success: false, error: 'Dataset not found' });
        }
        res.json({ success: true, dataset });
    } catch (err) {
        console.error(`[API /api/data/datasets/${req.params.id} Error]:`, err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 4. Activate a dataset by ID
dataRouter.post('/datasets/:id/activate', (req, res) => {
    try {
        const workspace = req.query.workspace || 'social';
        const ok = DatasetRepository.setActive(req.params.id, workspace);
        if (!ok) {
            return res.status(404).json({ success: false, error: 'Failed to activate dataset' });
        }
        const fullDataset = RegionRepository.getCompleteDataset(req.params.id);
        res.json({ success: true, message: 'Dataset activated successfully', dataset: fullDataset });
    } catch (err) {
        console.error(`[API /api/data/datasets/${req.params.id}/activate Error]:`, err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 5. Query single district
dataRouter.get('/datasets/:id/districts/:district', (req, res) => {
    try {
        const districtData = RegionRepository.getDistrict(req.params.id, req.params.district);
        if (!districtData) {
            return res.status(404).json({ success: false, error: 'District not found' });
        }
        res.json({ success: true, data: districtData });
    } catch (err) {
        console.error(`[API /api/data/datasets/:id/districts/:district Error]:`, err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 6. Create / Save Dataset from Form / Excel
dataRouter.post('/datasets', (req, res) => {
    try {
        const payload = req.body;
        if (!payload || !payload.year || !payload.semester) {
            return res.status(400).json({ success: false, error: 'Year and semester are required.' });
        }
        const savedId = DatasetRepository.saveCompleteDataset(payload);
        const completeDataset = RegionRepository.getCompleteDataset(savedId);
        res.json({ success: true, message: 'Dataset saved successfully', id: savedId, dataset: completeDataset });
    } catch (err) {
        console.error('[API POST /api/data/datasets Error]:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 7. Delete Dataset by ID
dataRouter.delete('/datasets/:id', (req, res) => {
    try {
        const ok = DatasetRepository.delete(req.params.id);
        if (!ok) {
            return res.status(404).json({ success: false, error: 'Dataset not found or delete failed' });
        }
        res.json({ success: true, message: 'Dataset deleted successfully' });
    } catch (err) {
        console.error(`[API DELETE /api/data/datasets/${req.params.id} Error]:`, err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 8. Log export event
dataRouter.post('/export-log', (req, res) => {
    try {
        const { dataset_id, region_name, template_id, format } = req.body;
        const id = ExportLogRepository.log({ dataset_id, region_name, template_id, format });
        res.json({ success: true, logId: id });
    } catch (err) {
        console.error('[API /api/data/export-log Error]:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});
