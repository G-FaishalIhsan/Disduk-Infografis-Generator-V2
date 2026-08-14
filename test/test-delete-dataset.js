import { DatasetRepository } from '../server/db/repositories/datasetRepository.js';
import { RegionRepository } from '../server/db/repositories/regionRepository.js';

async function testDelete() {
    console.log('--- 1. Setting Up Dummy Test Dataset (social-2029-1) ---');
    const payload = {
        id: 'social-2029-1',
        workspace: 'social',
        year: 2029,
        semester: 1,
        filename: 'TEST_TO_DELETE.xlsx',
        is_active: 0,
        status: 'TERSEDIA',
        summary: { totalPenduduk: 1500000, lakiLaki: 760000, perempuan: 740000, kepalaKeluarga: 500000, wajibKtp: 1100000 },
        kecamatanData: [
            { id: 1, kdkec: '320601', nama: 'CIPATUJAH', totalPenduduk: 50000, lakiLaki: 25000, perempuan: 25000 }
        ]
    };
    DatasetRepository.saveCompleteDataset(payload);

    const checkCreated = DatasetRepository.getById('social-2029-1');
    console.log('Created dataset:', checkCreated?.id);
    if (!checkCreated) throw new Error('Failed to create test dataset');

    const regionsCreated = RegionRepository.listDistricts('social-2029-1');
    console.log('Created region rows count:', regionsCreated.length);
    if (regionsCreated.length === 0) throw new Error('Regions not created');

    console.log('\n--- 2. Testing Deletion of Inactive Dataset ---');
    const deleteResult = DatasetRepository.delete('social-2029-1');
    console.log('Delete result:', deleteResult);
    if (!deleteResult) throw new Error('Delete returned false');

    const checkDeleted = DatasetRepository.getById('social-2029-1');
    console.log('Check after delete (should be null):', checkDeleted);
    if (checkDeleted !== null) throw new Error('Dataset still exists in datasets table');

    const regionsAfterDelete = RegionRepository.listDistricts('social-2029-1');
    console.log('Regions after delete (should be empty):', regionsAfterDelete.length);
    if (regionsAfterDelete.length !== 0) throw new Error('Cascade delete failed, regions still exist');

    console.log('\n--- 3. Testing Active Dataset Protection ---');
    DatasetRepository.setActive('social-2023-2', 'social');
    const active = DatasetRepository.getActive('social');
    console.log('Active dataset is:', active.id);
    let errorCaught = false;
    try {
        DatasetRepository.delete(active.id);
    } catch (err) {
        errorCaught = true;
        console.log('Successfully blocked active dataset deletion with message:', err.message);
    }
    if (!errorCaught) throw new Error('Active dataset was not protected from deletion!');

    console.log('\n======================================================');
    console.log('DATASET DELETION & ACTIVE GUARD TEST PASSED 100%!');
    console.log('======================================================');
    process.exit(0);
}

testDelete().catch(e => {
    console.error('Delete Test Failed:', e);
    process.exit(1);
});
