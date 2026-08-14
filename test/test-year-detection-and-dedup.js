import { ExcelNormalizer } from '../src/excel/excelNormalizer.js';
import { DatasetManager } from '../src/excel/datasetManager.js';
import { DatasetRepository } from '../server/db/repositories/datasetRepository.js';

async function runTests() {
    console.log('--- 1. Testing Year & Semester Detection ---');
    
    const d1 = ExcelNormalizer.detectYearAndSemester('JUMDUK SEM 2 2027.xlsx');
    console.log('d1 (JUMDUK SEM 2 2027.xlsx):', d1);
    if (d1.year !== 2027 || d1.semester !== 2) throw new Error('d1 failed');

    const d2 = ExcelNormalizer.detectYearAndSemester('2027_semester_1.csv');
    console.log('d2 (2027_semester_1.csv):', d2);
    if (d2.year !== 2027 || d2.semester !== 1) throw new Error('d2 failed');

    const d3 = ExcelNormalizer.detectYearAndSemester('dataset_random.xlsx', [
        ['JUMLAH PENDUDUK KABUPATEN TASIKMALAYA'],
        ['BERDASARKAN DATA KONSOLIDASI BERSIH SEMESTER II TAHUN 2027']
    ]);
    console.log('d3 (Content Header 2027 Sem 2):', d3);
    if (d3.year !== 2027 || d3.semester !== 2) throw new Error('d3 failed');

    console.log('\n--- 2. Testing SQLite Overwrite / Anti-Penumpukan ---');
    
    const initialDatasets = DatasetRepository.listAll('social');
    const initialCount = initialDatasets.length;
    console.log('Initial Social Datasets Count:', initialCount);

    // Save 2027 Semester 2 (First time)
    const payload1 = {
        id: 'social-2027-2',
        workspace: 'social',
        year: 2027,
        semester: 2,
        filename: 'JUMDUK_SEM2_2027_v1.xlsx',
        summary: { totalPenduduk: 2000000, lakiLaki: 1010000, perempuan: 990000, kepalaKeluarga: 750000, wajibKtp: 1500000 },
        kecamatanData: [
            { id: 1, kdkec: '320601', nama: 'CIPATUJAH', totalPenduduk: 75000, lakiLaki: 38000, perempuan: 37000 }
        ]
    };
    DatasetRepository.saveCompleteDataset(payload1);

    const countAfterFirst = DatasetRepository.listAll('social').length;
    console.log('Count After 2027-2 First Insert:', countAfterFirst);

    // Save 2027 Semester 2 again (Overwrite with updated numbers)
    const payload2 = {
        id: 'social-2027-2',
        workspace: 'social',
        year: 2027,
        semester: 2,
        filename: 'JUMDUK_SEM2_2027_v2_updated.xlsx',
        summary: { totalPenduduk: 2010000, lakiLaki: 1015000, perempuan: 995000, kepalaKeluarga: 755000, wajibKtp: 1510000 },
        kecamatanData: [
            { id: 1, kdkec: '320601', nama: 'CIPATUJAH', totalPenduduk: 76000, lakiLaki: 38500, perempuan: 37500 }
        ]
    };
    DatasetRepository.saveCompleteDataset(payload2);

    const afterSecond = DatasetRepository.listAll('social');
    const countAfterSecond = afterSecond.length;
    console.log('Count After 2027-2 Second Insert (Should NOT increase):', countAfterSecond);
    if (countAfterSecond !== countAfterFirst) throw new Error('Duplicate dataset created!');

    const updatedRecord = DatasetRepository.getById('social-2027-2');
    console.log('Updated Record in SQLite:', {
        id: updatedRecord.id,
        year: updatedRecord.year,
        semester: updatedRecord.semester,
        filename: updatedRecord.filename,
        totalPopulation: updatedRecord.totalPopulation
    });
    if (updatedRecord.totalPopulation !== 2010000) throw new Error('Data not updated cleanly!');

    console.log('\n--- 3. Testing DatasetManager available years ---');
    const dm = new DatasetManager();
    // Simulate DB sync
    afterSecond.forEach(d => {
        dm.registry[`${d.year}-${d.semester}`] = {
            year: d.year,
            semester: d.semester,
            filename: d.filename
        };
    });
    const years = dm.getAvailableYears();
    console.log('Available Years in DatasetManager:', years);
    if (!years.includes(2027)) throw new Error('Year 2027 not found in available years!');

    console.log('\n======================================================');
    console.log('YEAR DETECTION & ANTI-PENUMPUKAN LOGIC PASSED 100%!');
    console.log('======================================================');
    process.exit(0);
}

runTests().catch(e => {
    console.error('Test Failed:', e);
    process.exit(1);
});
