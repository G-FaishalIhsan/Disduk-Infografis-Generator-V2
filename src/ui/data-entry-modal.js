/**
 * Data Entry & Management UI Modal (Phase C — SQLite CRUD Form)
 * Fully Theme-Adaptive (Light ☀ / Dark 🌙 Mode Synchronized)
 * Provides comprehensive form for manual population input, quick Excel .xlsx import,
 * 39-Kecamatan editable spreadsheet table with live sum validation, PIN protection,
 * and direct persistence to backend SQLite database (/api/data/datasets).
 */

import { DbService } from '../services/db-service.js';
import { ExcelNormalizer } from '../excel/excelNormalizer.js';
import { DialogModal } from './dialog-modal.js';

const ADMIN_PIN = 'disduk123';

const DISTRICT_LIST = [
    { kdkec: "320601", nama: "CIPATUJAH", luas: 241.99 },
    { kdkec: "320602", nama: "KARANGNUNGGAL", luas: 153.26 },
    { kdkec: "320603", nama: "CIKALONG", luas: 247.38 },
    { kdkec: "320604", nama: "PANCATENGAH", luas: 204.56 },
    { kdkec: "320605", nama: "CIKATOMAS", luas: 124.63 },
    { kdkec: "320606", nama: "CIBALONG", luas: 137.45 },
    { kdkec: "320607", nama: "PARUNGPONTENG", luas: 48.96 },
    { kdkec: "320608", nama: "BANTARKALONG", luas: 52.33 },
    { kdkec: "320609", nama: "BOJONGASIH", luas: 30.12 },
    { kdkec: "320610", nama: "CULAMEGA", luas: 67.45 },
    { kdkec: "320611", nama: "BOJONGGAMBIR", luas: 89.24 },
    { kdkec: "320612", nama: "SODONGHILIR", luas: 102.35 },
    { kdkec: "320613", nama: "TARAJU", luas: 56.78 },
    { kdkec: "320614", nama: "SALAWU", luas: 78.45 },
    { kdkec: "320615", nama: "PUSPAHIANG", luas: 45.67 },
    { kdkec: "320616", nama: "TANJUNGJAYA", luas: 49.12 },
    { kdkec: "320617", nama: "SUKARAJA", luas: 58.34 },
    { kdkec: "320618", nama: "SALOPA", luas: 110.23 },
    { kdkec: "320619", nama: "JATIWARAS", luas: 75.89 },
    { kdkec: "320620", nama: "CINEAM", luas: 82.45 },
    { kdkec: "320621", nama: "KARANGJAYA", luas: 48.90 },
    { kdkec: "320622", nama: "MANONJAYA", luas: 45.12 },
    { kdkec: "320623", nama: "GUNUNGTANJUNG", luas: 42.10 },
    { kdkec: "320624", nama: "SINGAPARNA", luas: 20.10 },
    { kdkec: "320625", nama: "MANGUNREJA", luas: 32.45 },
    { kdkec: "320626", nama: "SUKARAME", luas: 28.90 },
    { kdkec: "320627", nama: "CIGALONTANG", luas: 120.45 },
    { kdkec: "320628", nama: "LEUWISARI", luas: 30.12 },
    { kdkec: "320629", nama: "PADAKEMBANG", luas: 27.89 },
    { kdkec: "320630", nama: "SARIWANGI", luas: 45.12 },
    { kdkec: "320631", nama: "SUKARATU", luas: 56.45 },
    { kdkec: "320632", nama: "CISAYONG", luas: 52.34 },
    { kdkec: "320633", nama: "SUKAHENING", luas: 32.10 },
    { kdkec: "320634", nama: "RAJAPOLAH", luas: 24.12 },
    { kdkec: "320635", nama: "JAMANIS", luas: 21.45 },
    { kdkec: "320636", nama: "CIAWI", luas: 48.90 },
    { kdkec: "320637", nama: "KADIPATEN", luas: 42.10 },
    { kdkec: "320638", nama: "PAGERAGEUNG", luas: 72.45 },
    { kdkec: "320639", nama: "SUKARESIK", luas: 31.23 }
];

export class DataEntryModal {
    constructor(options = {}) {
        this.onSaved = options.onSaved || (() => {});
        this.isOpen = false;
        this.districtRows = DISTRICT_LIST.map(d => ({
            kdkec: d.kdkec,
            nama: d.nama,
            lakiLaki: 0,
            perempuan: 0,
            totalPenduduk: 0,
            wajibKtp: 0,
            kepalaKeluarga: 0,
            luas: d.luas
        }));
        this.init();
    }

    init() {
        this.renderModal();
    }

    show() {
        this.isOpen = true;
        this.renderModal();
        const modal = document.querySelector('#data-entry-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.remove('opacity-0');
            modal.classList.add('opacity-100');
        }
    }

    hide() {
        this.isOpen = false;
        const modal = document.querySelector('#data-entry-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.add('opacity-0');
            modal.classList.remove('opacity-100');
        }
    }

    renderModal() {
        let modalEl = document.querySelector('#data-entry-modal');
        if (!modalEl) {
            modalEl = document.createElement('div');
            modalEl.id = 'data-entry-modal';
            modalEl.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-200 hidden opacity-0';
            document.body.appendChild(modalEl);
        }

        const nextYear = new Date().getFullYear();

        modalEl.innerHTML = `
            <div class="relative w-full max-w-4xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden font-sans transition-all"
                 style="background-color: var(--color-bg-surface); border-color: var(--color-border-strong); color: var(--color-text-main);">
                
                <!-- MODAL HEADER -->
                <div class="px-6 py-4 border-b flex items-center justify-between"
                     style="border-color: var(--color-border-subtle); background-color: var(--color-bg-surface-elevated);">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-extrabold text-base shadow-sm">
                            <i class="fa-solid fa-database text-lg"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-extrabold tracking-wide uppercase leading-tight" style="color: var(--color-text-main);">
                                Input & Kelola Dataset Kependudukan (SQLite)
                            </h3>
                            <p class="text-[11px] font-medium leading-tight mt-0.5" style="color: var(--color-text-muted);">
                                Tambah atau perbarui dataset demografi Kabupaten Tasikmalaya
                            </p>
                        </div>
                    </div>
                    <button id="btn-close-data-entry" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition">
                        <i class="fa-solid fa-xmark text-base"></i>
                    </button>
                </div>

                <!-- MODAL BODY -->
                <div class="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
                    
                    <!-- 1. METADATA SECTION -->
                    <div class="p-4 rounded-xl border space-y-3 shadow-sm"
                         style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle);">
                        <div class="flex items-center justify-between">
                            <h4 class="text-xs font-extrabold text-emerald-500 flex items-center gap-2 uppercase tracking-wider">
                                <i class="fa-solid fa-sliders"></i> 1. Periode & Metadata Dataset
                            </h4>
                            <span class="text-[10px] px-2 py-0.5 rounded font-mono font-bold border"
                                  style="background-color: var(--color-bg-surface); border-color: var(--color-border-subtle); color: var(--color-text-muted);">
                                SQLite DB Target
                            </span>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label class="block text-[11px] font-bold mb-1" style="color: var(--color-text-muted);">Tahun Dataset</label>
                                <input type="number" id="input-dataset-year" value="${nextYear}" min="2020" max="2035"
                                       class="w-full border rounded-lg px-3 py-2 font-bold focus:border-emerald-500 focus:outline-none"
                                       style="background-color: var(--color-bg-surface); border-color: var(--color-border-subtle); color: var(--color-text-main);" />
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold mb-1" style="color: var(--color-text-muted);">Semester</label>
                                <select id="input-dataset-semester"
                                        class="w-full border rounded-lg px-3 py-2 font-bold focus:border-emerald-500 focus:outline-none"
                                        style="background-color: var(--color-bg-surface); border-color: var(--color-border-subtle); color: var(--color-text-main);">
                                    <option value="1">Semester 1 (Januari - Juni)</option>
                                    <option value="2" selected>Semester 2 (Juli - Desember)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold mb-1" style="color: var(--color-text-muted);">Nama Sumber / File</label>
                                <input type="text" id="input-dataset-filename" placeholder="e.g. JUMDUK_SEM2_2026.xlsx"
                                       class="w-full border rounded-lg px-3 py-2 font-medium focus:border-emerald-500 focus:outline-none"
                                       style="background-color: var(--color-bg-surface); border-color: var(--color-border-subtle); color: var(--color-text-main);" />
                            </div>
                        </div>

                        <!-- DUPLICATE PERIOD WARNING BANNER -->
                        <div id="duplicate-dataset-warning" class="hidden p-3 rounded-xl border text-xs font-semibold mt-2"></div>
                    </div>

                    <!-- 2. QUICK AUTO-FILL OPTION (EXCEL / CSV) -->
                    <div class="p-4 rounded-xl border space-y-3 shadow-sm"
                         style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle);">
                        <div class="flex items-center justify-between">
                            <h4 class="text-xs font-extrabold text-indigo-500 flex items-center gap-2 uppercase tracking-wider">
                                <i class="fa-solid fa-file-import"></i> 2. Auto-Fill dari File Excel (.xlsx, .xls) atau CSV (.csv)
                            </h4>
                            <span class="text-[10px] px-2 py-0.5 rounded font-bold border"
                                  style="background-color: var(--color-bg-surface); border-color: var(--color-border-subtle); color: var(--color-text-muted);">
                                Parsing Otomatis
                            </span>
                        </div>

                        <!-- PETUNJUK PENTING SEBELUM MENGGUNAKAN AUTO-FILL -->
                        <div class="p-3.5 rounded-xl border flex items-start gap-3"
                             style="background-color: rgba(234, 179, 8, 0.1); border-color: rgba(234, 179, 8, 0.35);">
                            <i class="fa-solid fa-triangle-exclamation text-amber-500 text-base mt-0.5 shrink-0"></i>
                            <div class="space-y-1.5 text-xs">
                                <span class="font-extrabold text-amber-500 block uppercase tracking-wide">
                                    ⚠️ Petunjuk Penting Sebelum Menggunakan Auto-Fill:
                                </span>
                                <div class="leading-relaxed" style="color: var(--color-text-main);">
                                    <p class="mb-1">
                                        • <strong>Format File:</strong> Mendukung file <strong>Excel (.xlsx, .xls)</strong> dan <strong>CSV (.csv)</strong>.
                                    </p>
                                    <p class="mb-1">
                                        • <strong>Kesesuaian Kode & Nama Wilayah:</strong> Pastikan <strong>Kode Kecamatan</strong> (contoh: <code class="font-mono bg-black/20 px-1 py-0.5 rounded">320601</code> s/d <code class="font-mono bg-black/20 px-1 py-0.5 rounded">320639</code>) atau <strong>Nama Kecamatan</strong> (contoh: <code class="font-mono bg-black/20 px-1 py-0.5 rounded">SINGAPARNA</code>, <code class="font-mono bg-black/20 px-1 py-0.5 rounded">CIPATUJAH</code>, dsb.) <strong>persis sama</strong> dengan format standar data sebelumnya.
                                    </p>
                                    <p class="mb-1 text-rose-400 font-bold">
                                        • Perhatian: Jika Kode atau Nama Kecamatan berbeda / salah ketik / tidak terdaftar, maka baris data tersebut TIDAK AKAN TERISI ke dalam tabel form.
                                    </p>
                                    <p>
                                        • Gunakan tombol <strong>"Unduh Format Template CSV"</strong> di samping sebagai acuan struktur kolom dan kode wilayah yang valid.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- ACTION CONTROLS & DOWNLOAD TEMPLATE -->
                        <div class="flex flex-wrap items-center gap-3 pt-1">
                            <input type="file" id="input-excel-file-quick" accept=".xlsx,.xls,.csv" class="hidden" />
                            <label for="input-excel-file-quick" class="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-2 transition shadow-sm text-xs">
                                <i class="fa-solid fa-file-arrow-up"></i> Upload Excel / CSV (.xlsx, .csv)
                            </label>
                            
                            <button type="button" id="btn-download-csv-template" class="px-3.5 py-2 border rounded-lg font-bold flex items-center gap-2 transition text-xs hover:opacity-90 shadow-sm"
                                    style="background-color: var(--color-bg-surface); border-color: var(--color-border-subtle); color: var(--color-text-main);">
                                <i class="fa-solid fa-file-csv text-emerald-500 text-sm"></i> Unduh Format Template CSV
                            </button>

                            <span id="quick-excel-filename" class="font-medium italic text-xs" style="color: var(--color-text-muted);">Belum ada file dipilih</span>
                        </div>

                        <!-- FEEDBACK BANNER -->
                        <div id="quick-upload-feedback" class="hidden p-3 rounded-lg border text-xs font-semibold"></div>
                    </div>

                    <!-- 3. KABUPATEN AGGREGATE SUMMARY -->
                    <div class="p-4 rounded-xl border space-y-4 shadow-sm"
                         style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle);">
                        <div class="flex items-center justify-between">
                            <h4 class="text-xs font-extrabold text-amber-500 flex items-center gap-2 uppercase tracking-wider">
                                <i class="fa-solid fa-building-columns"></i> 3. Data Agregat Kabupaten
                            </h4>
                            <button id="btn-calc-from-districts" class="text-[10px] bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 px-2.5 py-1 rounded font-bold transition flex items-center gap-1 border border-amber-500/30">
                                <i class="fa-solid fa-calculator"></i> Hitung Otomatis dari 39 Kecamatan
                            </button>
                        </div>

                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                                <label class="block text-[10px] font-bold mb-1" style="color: var(--color-text-muted);">Total Penduduk</label>
                                <input type="number" id="kab-total" value="2026081"
                                       class="w-full border rounded px-2.5 py-1.5 font-bold focus:border-amber-500 focus:outline-none font-mono"
                                       style="background-color: var(--color-bg-surface); border-color: var(--color-border-subtle); color: var(--color-text-main);" />
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold mb-1" style="color: var(--color-text-muted);">Laki-laki</label>
                                <input type="number" id="kab-laki" value="1024500"
                                       class="w-full border rounded px-2.5 py-1.5 font-bold focus:border-amber-500 focus:outline-none font-mono"
                                       style="background-color: var(--color-bg-surface); border-color: var(--color-border-subtle); color: var(--color-text-main);" />
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold mb-1" style="color: var(--color-text-muted);">Perempuan</label>
                                <input type="number" id="kab-perempuan" value="1001581"
                                       class="w-full border rounded px-2.5 py-1.5 font-bold focus:border-amber-500 focus:outline-none font-mono"
                                       style="background-color: var(--color-bg-surface); border-color: var(--color-border-subtle); color: var(--color-text-main);" />
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold mb-1" style="color: var(--color-text-muted);">Kepala Keluarga (KK)</label>
                                <input type="number" id="kab-kk" value="580120"
                                       class="w-full border rounded px-2.5 py-1.5 font-bold focus:border-amber-500 focus:outline-none font-mono"
                                       style="background-color: var(--color-bg-surface); border-color: var(--color-border-subtle); color: var(--color-text-main);" />
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold mb-1" style="color: var(--color-text-muted);">Wajib KTP</label>
                                <input type="number" id="kab-ktp" value="1320400"
                                       class="w-full border rounded px-2.5 py-1.5 font-bold focus:border-amber-500 focus:outline-none font-mono"
                                       style="background-color: var(--color-bg-surface); border-color: var(--color-border-subtle); color: var(--color-text-main);" />
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold mb-1" style="color: var(--color-text-muted);">Rekam KTP</label>
                                <input type="number" id="kab-rekam-ktp" value="1315000"
                                       class="w-full border rounded px-2.5 py-1.5 font-bold focus:border-amber-500 focus:outline-none font-mono"
                                       style="background-color: var(--color-bg-surface); border-color: var(--color-border-subtle); color: var(--color-text-main);" />
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold mb-1" style="color: var(--color-text-muted);">IKD (Identitas Digital)</label>
                                <input type="number" id="kab-iakd" value="85000"
                                       class="w-full border rounded px-2.5 py-1.5 font-bold focus:border-amber-500 focus:outline-none font-mono"
                                       style="background-color: var(--color-bg-surface); border-color: var(--color-border-subtle); color: var(--color-text-main);" />
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold mb-1" style="color: var(--color-text-muted);">KIA (Identitas Anak)</label>
                                <input type="number" id="kab-kia" value="420000"
                                       class="w-full border rounded px-2.5 py-1.5 font-bold focus:border-amber-500 focus:outline-none font-mono"
                                       style="background-color: var(--color-bg-surface); border-color: var(--color-border-subtle); color: var(--color-text-main);" />
                            </div>
                        </div>
                    </div>

                    <!-- 4. 39-KECAMATAN TABLE (EDITABLE PREVIEW) -->
                    <div class="p-4 rounded-xl border space-y-3 shadow-sm"
                         style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle);">
                        <div class="flex items-center justify-between">
                            <h4 class="text-xs font-extrabold text-cyan-500 flex items-center gap-2 uppercase tracking-wider">
                                <i class="fa-solid fa-table-list"></i> 4. Rincian 39 Kecamatan
                            </h4>
                            <span class="text-[11px]" style="color: var(--color-text-muted);">Total 39 Kecamatan</span>
                        </div>

                        <div class="max-h-60 overflow-y-auto border rounded-lg"
                             style="border-color: var(--color-border-subtle); background-color: var(--color-bg-surface);">
                            <table class="w-full text-left text-[11px]">
                                <thead class="sticky top-0 font-extrabold uppercase text-[9px] tracking-wider border-b"
                                       style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle); color: var(--color-text-muted);">
                                    <tr>
                                        <th class="p-2">Kode</th>
                                        <th class="p-2">Kecamatan</th>
                                        <th class="p-2 text-right">Laki-Laki</th>
                                        <th class="p-2 text-right">Perempuan</th>
                                        <th class="p-2 text-right">Total Penduduk</th>
                                        <th class="p-2 text-right">Wajib KTP</th>
                                        <th class="p-2 text-right">KK</th>
                                    </tr>
                                </thead>
                                <tbody id="tbody-districts" class="divide-y font-mono"
                                       style="border-color: var(--color-border-subtle); color: var(--color-text-main);">
                                    ${this.districtRows.map((d, idx) => `
                                        <tr class="hover:opacity-80 transition" style="border-color: var(--color-border-subtle);">
                                            <td class="p-2 font-sans" style="color: var(--color-text-muted);">${d.kdkec}</td>
                                            <td class="p-2 font-bold font-sans" style="color: var(--color-text-main);">${d.nama}</td>
                                            <td class="p-2 text-right">
                                                <input type="number" data-idx="${idx}" data-field="lakiLaki" value="${d.lakiLaki}"
                                                       class="kec-input w-20 border rounded px-1.5 py-0.5 text-right font-mono"
                                                       style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle); color: var(--color-text-main);" />
                                            </td>
                                            <td class="p-2 text-right">
                                                <input type="number" data-idx="${idx}" data-field="perempuan" value="${d.perempuan}"
                                                       class="kec-input w-20 border rounded px-1.5 py-0.5 text-right font-mono"
                                                       style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle); color: var(--color-text-main);" />
                                            </td>
                                            <td class="p-2 text-right">
                                                <input type="number" data-idx="${idx}" data-field="totalPenduduk" value="${d.totalPenduduk}"
                                                       class="kec-input w-20 border rounded px-1.5 py-0.5 text-right text-emerald-500 font-bold font-mono"
                                                       style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle);" />
                                            </td>
                                            <td class="p-2 text-right">
                                                <input type="number" data-idx="${idx}" data-field="wajibKtp" value="${d.wajibKtp}"
                                                       class="kec-input w-20 border rounded px-1.5 py-0.5 text-right font-mono"
                                                       style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle); color: var(--color-text-main);" />
                                            </td>
                                            <td class="p-2 text-right">
                                                <input type="number" data-idx="${idx}" data-field="kepalaKeluarga" value="${d.kepalaKeluarga}"
                                                       class="kec-input w-20 border rounded px-1.5 py-0.5 text-right font-mono"
                                                       style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle); color: var(--color-text-main);" />
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 5. PIN PROTECTION & SUBMIT -->
                    <div class="p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm"
                         style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle);">
                        <div class="flex items-center gap-3 w-full md:w-auto">
                            <i class="fa-solid fa-lock text-emerald-500 text-lg"></i>
                            <div>
                                <label class="block text-[10px] font-bold" style="color: var(--color-text-muted);">PIN Otorisasi Operator:</label>
                                <input type="password" id="input-admin-pin" placeholder="PIN (disduk123)"
                                       class="border rounded px-3 py-1.5 font-mono focus:border-emerald-500 focus:outline-none text-xs w-44"
                                       style="background-color: var(--color-bg-surface); border-color: var(--color-border-subtle); color: var(--color-text-main);" />
                            </div>
                        </div>

                        <div class="flex items-center gap-2 w-full md:w-auto justify-end">
                            <button id="btn-cancel-data-entry" class="v2-btn v2-btn-outline text-xs px-4 py-2">
                                Batal
                            </button>
                            <button id="btn-submit-data-entry" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-sm text-xs">
                                <i class="fa-solid fa-floppy-disk"></i> Simpan ke Database SQLite
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        `;

        this.bindModalEvents();
    }

    bindModalEvents() {
        const modalEl = document.querySelector('#data-entry-modal');
        if (!modalEl) return;

        const closeBtn = modalEl.querySelector('#btn-close-data-entry');
        const cancelBtn = modalEl.querySelector('#btn-cancel-data-entry');
        const submitBtn = modalEl.querySelector('#btn-submit-data-entry');
        const fileInput = modalEl.querySelector('#input-excel-file-quick');
        const downloadCsvBtn = modalEl.querySelector('#btn-download-csv-template');
        const calcBtn = modalEl.querySelector('#btn-calc-from-districts');
        const feedbackEl = modalEl.querySelector('#quick-upload-feedback');
        const yearInput = modalEl.querySelector('#input-dataset-year');
        const semInput = modalEl.querySelector('#input-dataset-semester');
        const dupWarningEl = modalEl.querySelector('#duplicate-dataset-warning');

        if (closeBtn) closeBtn.onclick = () => this.hide();
        if (cancelBtn) cancelBtn.onclick = () => this.hide();

        // 0. Live Duplicate Dataset Checking
        const checkDuplicateDataset = async () => {
            if (!dupWarningEl) return null;
            const yr = parseInt(yearInput?.value, 10);
            const sem = parseInt(semInput?.value, 10);
            if (!yr || !sem) {
                dupWarningEl.classList.add('hidden');
                return null;
            }

            try {
                const existing = await DbService.getDatasetById(`social-${yr}-${sem}`);
                if (existing) {
                    dupWarningEl.className = 'p-3.5 rounded-xl border text-xs font-semibold mt-3 flex items-start gap-3 transition-all';
                    dupWarningEl.style.backgroundColor = 'rgba(245, 158, 11, 0.12)';
                    dupWarningEl.style.borderColor = 'rgba(245, 158, 11, 0.4)';
                    dupWarningEl.style.color = '#fbbf24';
                    dupWarningEl.innerHTML = `
                        <i class="fa-solid fa-triangle-exclamation text-base mt-0.5 text-amber-400 shrink-0"></i>
                        <div class="space-y-1">
                            <span class="font-extrabold uppercase tracking-wide block text-amber-400">
                                ⚠️ Perhatian: Dataset Periode Ini Sudah Terdaftar di Database
                            </span>
                            <p class="leading-relaxed" style="color: var(--color-text-main);">
                                Dataset untuk <strong>Tahun ${yr} Semester ${sem}</strong> sudah ada di SQLite (File: <em>${existing.filename || existing.source_filename || 'Tersimpan'}</em>).<br>
                                <span class="text-amber-300 font-bold">• Solusi Anti-Penumpukan:</span> Jika Anda menyimpan form ini, sistem akan <strong>memperbarui (UPDATE / OVERWRITE)</strong> data periode tersebut secara aman tanpa menimbulkan data ganda di daftar dataset.
                            </p>
                        </div>
                    `;
                    dupWarningEl.classList.remove('hidden');
                    return existing;
                } else {
                    dupWarningEl.classList.add('hidden');
                    return null;
                }
            } catch (e) {
                dupWarningEl.classList.add('hidden');
                return null;
            }
        };

        if (yearInput) yearInput.oninput = () => checkDuplicateDataset();
        if (semInput) semInput.onchange = () => checkDuplicateDataset();

        setTimeout(() => checkDuplicateDataset(), 200);

        // 1. Download CSV Template Handler (Format Resmi Disdukcapil Tasikmalaya)
        if (downloadCsvBtn) {
            downloadCsvBtn.onclick = () => {
                const headers = ['KDKEC', 'NAMA_KEC', 'JUMDUK_LAKI', 'JUMDUK_PEREMPUAN', 'JUMDUK_TOTAL', 'WAJIB_KTP_LAKI', 'WAJIB_KTP_PEREMPUAN', 'WAJIB_KTP_TOTAL', 'KK_LAKI', 'KK_PEREMPUAN', 'KK_TOTAL'];
                const csvRows = [headers.join(',')];

                DISTRICT_LIST.forEach(d => {
                    csvRows.push([
                        `"${d.kdkec}"`,
                        `"${d.nama}"`,
                        0, 0, 0, 0, 0, 0, 0, 0, 0
                    ].join(','));
                });

                const csvContent = '\uFEFF' + csvRows.join('\r\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Template_Disdukcapil_JUMDUK_39_Kecamatan.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            };
        }

        // 2. Auto-Fill Upload Handler (Excel .xlsx / .xls & CSV .csv)
        if (fileInput) {
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const nameLabel = modalEl.querySelector('#quick-excel-filename');
                if (nameLabel) nameLabel.textContent = file.name;

                const filenameInput = modalEl.querySelector('#input-dataset-filename');
                if (filenameInput && !filenameInput.value) {
                    filenameInput.value = file.name;
                }

                if (feedbackEl) {
                    feedbackEl.className = 'p-3 rounded-lg border text-xs font-semibold';
                    feedbackEl.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                    feedbackEl.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                    feedbackEl.style.color = '#60a5fa';
                    feedbackEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Memproses file dan mendeteksi tahun, semester & wilayah...';
                    feedbackEl.classList.remove('hidden');
                }

                try {
                    let year = parseInt(yearInput?.value, 10) || 2026;
                    let semester = parseInt(semInput?.value, 10) || 1;

                    let normalized = null;
                    let rows2D = [];

                    if (window.XLSX) {
                        const buffer = await file.arrayBuffer();
                        const isCsv = file.name.toLowerCase().endsWith('.csv');
                        const wb = isCsv
                            ? window.XLSX.read(new TextDecoder('utf-8').decode(buffer), { type: 'string' })
                            : window.XLSX.read(new Uint8Array(buffer), { type: 'array' });
                        
                        const sheetName = wb.Sheets['KECAMATAN'] ? 'KECAMATAN' : wb.SheetNames[0];
                        const firstSheet = wb.Sheets[sheetName];
                        rows2D = window.XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                    } else if (file.name.toLowerCase().endsWith('.csv')) {
                        const text = await file.text();
                        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
                        rows2D = lines.map(l => l.split(',').map(c => c.replace(/["\r]/g, '').trim()));
                    }

                    // Auto-detect Year & Semester from file name and contents
                    const detected = ExcelNormalizer.detectYearAndSemester(file.name, rows2D);
                    if (detected.year && yearInput) {
                        year = detected.year;
                        yearInput.value = detected.year;
                    }
                    if (detected.semester && semInput) {
                        semester = detected.semester;
                        semInput.value = detected.semester;
                    }

                    normalized = ExcelNormalizer.normalize2DArray(rows2D, { year, semester, filename: file.name });
                    await checkDuplicateDataset();

                    if (normalized && normalized.metadata) {
                        if (normalized.metadata.year && yearInput) {
                            yearInput.value = normalized.metadata.year;
                        }
                        if (normalized.metadata.semester && semInput) {
                            semInput.value = normalized.metadata.semester;
                        }
                    }

                    if (normalized) {
                        let matchedCount = 0;
                        const unmatchedRows = [];

                        if (Array.isArray(normalized.kecamatanData) && normalized.kecamatanData.length > 0) {
                            normalized.kecamatanData.forEach(k => {
                                const cleanKName = (k.nama || '').toUpperCase().replace(/^KECAMATAN\s+/i, '').replace(/[^A-Z0-9]/g, '');
                                const cleanKKode = String(k.kdkec || '').replace(/[^0-9]/g, '');

                                const match = this.districtRows.find(d => {
                                    const dKode = String(d.kdkec || '').replace(/[^0-9]/g, '');
                                    const dName = d.nama.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                    if (cleanKKode && (dKode === cleanKKode || dKode.endsWith(cleanKKode))) {
                                        return true;
                                    }
                                    if (cleanKName && (dName === cleanKName || cleanKName.includes(dName) || dName.includes(cleanKName))) {
                                        return true;
                                    }
                                    return false;
                                });

                                if (match) {
                                    matchedCount++;
                                    match.lakiLaki = k.lakiLaki || 0;
                                    match.perempuan = k.perempuan || 0;
                                    match.totalPenduduk = k.totalPenduduk || (k.lakiLaki + k.perempuan);
                                    match.wajibKtp = k.wajibKtp || 0;
                                    match.kepalaKeluarga = k.kepalaKeluarga || 0;
                                    match.rekamKtp = k.rekamKtp || 0;
                                    match.iakd = k.iakd || 0;
                                    match.kia = k.kia || 0;
                                } else if (k.nama || k.kdkec) {
                                    unmatchedRows.push(k.nama || k.kdkec);
                                }
                            });
                        }

                        // Auto sum aggregated totals
                        let sumTotal = 0, sumL = 0, sumP = 0, sumKK = 0, sumKtp = 0, sumRekam = 0, sumIakd = 0, sumKia = 0;
                        this.districtRows.forEach(d => {
                            sumTotal += Number(d.totalPenduduk) || 0;
                            sumL += Number(d.lakiLaki) || 0;
                            sumP += Number(d.perempuan) || 0;
                            sumKK += Number(d.kepalaKeluarga) || 0;
                            sumKtp += Number(d.wajibKtp) || 0;
                            sumRekam += Number(d.rekamKtp) || 0;
                            sumIakd += Number(d.iakd) || 0;
                            sumKia += Number(d.kia) || 0;
                        });

                        const kabTotal = modalEl.querySelector('#kab-total');
                        const kabLaki = modalEl.querySelector('#kab-laki');
                        const kabPerempuan = modalEl.querySelector('#kab-perempuan');
                        const kabKk = modalEl.querySelector('#kab-kk');
                        const kabKtp = modalEl.querySelector('#kab-ktp');
                        const kabRekam = modalEl.querySelector('#kab-rekam-ktp');
                        const kabIakd = modalEl.querySelector('#kab-iakd');
                        const kabKia = modalEl.querySelector('#kab-kia');

                        if (kabTotal) kabTotal.value = sumTotal || normalized.summary.totalPenduduk || 0;
                        if (kabLaki) kabLaki.value = sumL || normalized.summary.lakiLaki || 0;
                        if (kabPerempuan) kabPerempuan.value = sumP || normalized.summary.perempuan || 0;
                        if (kabKk) kabKk.value = sumKK || normalized.summary.kepalaKeluarga || 0;
                        if (kabKtp) kabKtp.value = sumKtp || normalized.summary.wajibKtp || 0;
                        if (kabRekam) kabRekam.value = sumRekam || normalized.summary.rekamKtp || Math.round(sumKtp * 0.995);
                        if (kabIakd) kabIakd.value = sumIakd || normalized.summary.iakd || Math.round(sumTotal * 0.05);
                        if (kabKia) kabKia.value = sumKia || normalized.summary.kia || Math.round(sumTotal * 0.22);

                        this.renderDistrictTable();

                        if (feedbackEl) {
                            if (matchedCount === 39) {
                                feedbackEl.style.backgroundColor = 'rgba(16, 185, 129, 0.12)';
                                feedbackEl.style.borderColor = 'rgba(16, 185, 129, 0.35)';
                                feedbackEl.style.color = '#34d399';
                                feedbackEl.innerHTML = `<i class="fa-solid fa-circle-check mr-1.5 text-sm"></i> <strong>Sukses Penuh:</strong> Seluruh <strong>39/39 Kecamatan</strong> berhasil dicocokkan dan diisi otomatis dari file <em>${file.name}</em>.`;
                            } else if (matchedCount > 0) {
                                feedbackEl.style.backgroundColor = 'rgba(245, 158, 11, 0.12)';
                                feedbackEl.style.borderColor = 'rgba(245, 158, 11, 0.35)';
                                feedbackEl.style.color = '#fbbf24';
                                feedbackEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1.5 text-sm"></i> <strong>Sebagian Cocok:</strong> Berhasil mengisi <strong>${matchedCount} dari 39 Kecamatan</strong>.<br><span class="text-[11px] opacity-90">${39 - matchedCount} kecamatan tidak terisi karena Kode/Nama pada file tidak sama persis dengan standar (${unmatchedRows.slice(0, 5).join(', ')}${unmatchedRows.length > 5 ? '...' : ''}).</span>`;
                            } else {
                                feedbackEl.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
                                feedbackEl.style.borderColor = 'rgba(239, 68, 68, 0.35)';
                                feedbackEl.style.color = '#f87171';
                                feedbackEl.innerHTML = `<i class="fa-solid fa-circle-xmark mr-1.5 text-sm"></i> <strong>Gagal Mencocokkan:</strong> Tidak ada baris yang cocok dengan 39 kecamatan standar. Pastikan kolom Kode Kecamatan atau Nama Kecamatan sesuai format template.`;
                            }
                            feedbackEl.classList.remove('hidden');
                        }
                    }
                } catch (err) {
                    if (feedbackEl) {
                        feedbackEl.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
                        feedbackEl.style.borderColor = 'rgba(239, 68, 68, 0.35)';
                        feedbackEl.style.color = '#f87171';
                        feedbackEl.innerHTML = `<i class="fa-solid fa-circle-xmark mr-1.5"></i> Gagal memproses file: ${err.message}`;
                        feedbackEl.classList.remove('hidden');
                    }
                }
            };
        }

        // Calculate sum from 39 kecamatan
        if (calcBtn) {
            calcBtn.onclick = () => {
                let sumTotal = 0, sumL = 0, sumP = 0, sumKK = 0, sumKtp = 0;
                this.districtRows.forEach(d => {
                    sumTotal += Number(d.totalPenduduk) || 0;
                    sumL += Number(d.lakiLaki) || 0;
                    sumP += Number(d.perempuan) || 0;
                    sumKK += Number(d.kepalaKeluarga) || 0;
                    sumKtp += Number(d.wajibKtp) || 0;
                });
                modalEl.querySelector('#kab-total').value = sumTotal;
                modalEl.querySelector('#kab-laki').value = sumL;
                modalEl.querySelector('#kab-perempuan').value = sumP;
                modalEl.querySelector('#kab-kk').value = sumKK;
                modalEl.querySelector('#kab-ktp').value = sumKtp;
            };
        }

        // District table inputs live update
        modalEl.querySelectorAll('.kec-input').forEach(input => {
            input.oninput = (e) => {
                const idx = parseInt(e.target.dataset.idx, 10);
                const field = e.target.dataset.field;
                const val = parseInt(e.target.value, 10) || 0;
                if (this.districtRows[idx]) {
                    this.districtRows[idx][field] = val;
                    if (field === 'lakiLaki' || field === 'perempuan') {
                        const row = this.districtRows[idx];
                        row.totalPenduduk = (row.lakiLaki || 0) + (row.perempuan || 0);
                        const totInput = modalEl.querySelector(`.kec-input[data-idx="${idx}"][data-field="totalPenduduk"]`);
                        if (totInput) totInput.value = row.totalPenduduk;
                    }
                }
            };
        });

        // Submit form
        if (submitBtn) {
            submitBtn.onclick = async () => {
                if (this.isSubmitting) return;
                this.isSubmitting = true;

                try {
                    const pinInput = modalEl.querySelector('#input-admin-pin');
                    const pin = (pinInput?.value || '').trim();
                    if (pin !== ADMIN_PIN) {
                        await DialogModal.alert({
                            title: 'PIN Otorisasi Salah',
                            message: 'PIN Otorisasi Operator yang Anda masukkan tidak sesuai.\n(Default PIN Operator: disduk123)',
                            type: 'error'
                        });
                        if (pinInput) {
                            pinInput.focus();
                            pinInput.select();
                        }
                        return;
                    }

                    const year = parseInt(modalEl.querySelector('#input-dataset-year')?.value, 10) || 2026;
                    const semester = parseInt(modalEl.querySelector('#input-dataset-semester')?.value, 10) || 1;
                    const filename = (modalEl.querySelector('#input-dataset-filename')?.value || '').trim() || `DATASET_SEM_${semester}_${year}.xlsx`;

                    // Check duplicate & confirm overwrite
                    try {
                        const existing = await DbService.getDatasetById(`social-${year}-${semester}`);
                        if (existing) {
                            const ok = await DialogModal.confirm({
                                title: 'Konfirmasi Timpa Dataset',
                                message: `Dataset untuk Tahun ${year} Semester ${semester} SUDAH ADA di database SQLite.\n\nApakah Anda yakin ingin MEMPERBARUI (OVERWRITE) dataset ini dengan data baru agar tidak terjadi penumpukan?`,
                                type: 'warning',
                                confirmText: 'Ya, Timpa & Simpan',
                                cancelText: 'Batal',
                                details: [
                                    { label: 'Periode', value: `Tahun ${year} Semester ${semester}` },
                                    { label: 'File Lama', value: existing.filename || existing.source_filename || 'Tersimpan' },
                                    { label: 'File Baru', value: filename }
                                ]
                            });
                            if (!ok) return;
                        }
                    } catch (e) {
                        console.warn('Check duplicate error:', e);
                    }

                    const summary = {
                        totalPenduduk: parseInt(modalEl.querySelector('#kab-total')?.value, 10) || 0,
                        lakiLaki: parseInt(modalEl.querySelector('#kab-laki')?.value, 10) || 0,
                        perempuan: parseInt(modalEl.querySelector('#kab-perempuan')?.value, 10) || 0,
                        kepalaKeluarga: parseInt(modalEl.querySelector('#kab-kk')?.value, 10) || 0,
                        wajibKtp: parseInt(modalEl.querySelector('#kab-ktp')?.value, 10) || 0,
                        rekamKtp: parseInt(modalEl.querySelector('#kab-rekam-ktp')?.value, 10) || 0,
                        iakd: parseInt(modalEl.querySelector('#kab-iakd')?.value, 10) || 0,
                        kia: parseInt(modalEl.querySelector('#kab-kia')?.value, 10) || 0
                    };

                    const payload = {
                        id: `social-${year}-${semester}`,
                        workspace: 'social',
                        year,
                        semester,
                        filename,
                        summary,
                        kecamatanData: this.districtRows,
                        is_active: 1,
                        status: 'AKTIF'
                    };

                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan ke Database...';

                    try {
                        const result = await DbService.createDataset(payload);
                        if (result) {
                            await DialogModal.alert({
                                title: 'Berhasil Disimpan',
                                message: `Dataset Tahun ${year} Semester ${semester} berhasil disimpan ke database SQLite dan langsung diaktifkan pada infografis live!`,
                                type: 'success',
                                confirmText: 'Selesai'
                            });
                            this.hide();
                            this.onSaved(result);
                        } else {
                            await DialogModal.alert({
                                title: 'Gagal Menyimpan',
                                message: 'Gagal menyimpan dataset ke database SQLite. Periksa koneksi backend server.',
                                type: 'error'
                            });
                        }
                    } catch (err) {
                        await DialogModal.alert({
                            title: 'Error Penyimpanan',
                            message: 'Terjadi kendala saat menyimpan dataset: ' + err.message,
                            type: 'error'
                        });
                    } finally {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan ke Database SQLite';
                    }
                } finally {
                    this.isSubmitting = false;
                }
            };
        }
    }

    renderDistrictTable() {
        const tbody = document.querySelector('#tbody-districts');
        if (!tbody) return;
        tbody.innerHTML = this.districtRows.map((d, idx) => `
            <tr class="hover:opacity-80 transition" style="border-color: var(--color-border-subtle);">
                <td class="p-2 font-sans" style="color: var(--color-text-muted);">${d.kdkec}</td>
                <td class="p-2 font-bold font-sans" style="color: var(--color-text-main);">${d.nama}</td>
                <td class="p-2 text-right">
                    <input type="number" data-idx="${idx}" data-field="lakiLaki" value="${d.lakiLaki}"
                           class="kec-input w-20 border rounded px-1.5 py-0.5 text-right font-mono"
                           style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle); color: var(--color-text-main);" />
                </td>
                <td class="p-2 text-right">
                    <input type="number" data-idx="${idx}" data-field="perempuan" value="${d.perempuan}"
                           class="kec-input w-20 border rounded px-1.5 py-0.5 text-right font-mono"
                           style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle); color: var(--color-text-main);" />
                </td>
                <td class="p-2 text-right">
                    <input type="number" data-idx="${idx}" data-field="totalPenduduk" value="${d.totalPenduduk}"
                           class="kec-input w-20 border rounded px-1.5 py-0.5 text-right text-emerald-500 font-bold font-mono"
                           style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle);" />
                </td>
                <td class="p-2 text-right">
                    <input type="number" data-idx="${idx}" data-field="wajibKtp" value="${d.wajibKtp}"
                           class="kec-input w-20 border rounded px-1.5 py-0.5 text-right font-mono"
                           style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle); color: var(--color-text-main);" />
                </td>
                <td class="p-2 text-right">
                    <input type="number" data-idx="${idx}" data-field="kepalaKeluarga" value="${d.kepalaKeluarga}"
                           class="kec-input w-20 border rounded px-1.5 py-0.5 text-right font-mono"
                           style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle); color: var(--color-text-main);" />
                </td>
            </tr>
        `).join('');

        this.bindModalEvents();
    }
}
