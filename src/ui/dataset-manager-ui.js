/**
 * Dataset Selector UI Module (Phase 4 Final Update — Scalable Dataset Manager V2)
 * Clean, modern Government App UI for selecting existing semester datasets (Dynamic Years & Semesters).
 * Features auto-summary statistics (Kecamatan, Desa, Penduduk), metadata (Size, UploadedAt, LastUsedAt),
 * dynamic status badges, empty states, and dynamic year options.
 */
import { DatasetManager } from '../excel/datasetManager.js';
import { DbService } from '../services/db-service.js';
import { DialogModal } from './dialog-modal.js';

export class DatasetManagerUI {
    constructor(options = {}) {
        this.datasetManager = new DatasetManager();
        this.onDatasetSelect = options.onDatasetSelect || (() => {});
        this.onOpenDataEntry = options.onOpenDataEntry || (() => {});
        this.isOpen = false;
        this.showInfoModal = false;

        this.selectedYear = 2025;
        this.selectedSemester = 2;
        this.engineStatus = 'Dataset Engine Ready'; // 'Dataset Engine Ready' | 'Processing Dataset...' | 'Dataset Invalid'

        this.init();
    }

    init() {
        this.renderModal();
    }

    async show() {
        await this.datasetManager.syncWithDatabase();
        this.renderModal();
        this.toggleModal(true);
    }

    hide() {
        this.toggleModal(false);
    }

    /**
     * Formats bytes into readable KB
     */
    formatFileSize(bytes) {
        if (!bytes) return '55 KB';
        return `${Math.round(bytes / 1024)} KB`;
    }

    /**
     * Formats numbers into Indonesian dot separator (e.g. 1.850.240)
     */
    formatNumber(num) {
        if (!num) return '0';
        return num.toLocaleString('id-ID');
    }

    /**
     * Formats ISO date to Indonesian date string (e.g. 26 Juli 2026)
     */
    formatDate(isoString) {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    renderModal() {
        let modalEl = document.querySelector('#dataset-manager-modal');
        if (!modalEl) {
            modalEl = document.createElement('div');
            modalEl.id = 'dataset-manager-modal';
            document.body.appendChild(modalEl);
        }

        const yearsList = this.datasetManager.getAvailableYears();
        if (this.selectedYear && !yearsList.includes(Number(this.selectedYear))) {
            yearsList.unshift(Number(this.selectedYear));
        }
        const availableYears = Array.from(new Set(yearsList)).sort((a, b) => b - a);
        const dataset = this.datasetManager.getDataset(this.selectedYear, this.selectedSemester);

        modalEl.className = `fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-250 ${this.isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none hidden'}`;
        modalEl.innerHTML = `
            <!-- Backdrop -->
            <div id="dm-backdrop" class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"></div>

            <!-- Dataset Selector Window -->
            <div class="relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all transform scale-100"
                 style="background-color: var(--color-bg-surface); border-color: var(--color-border-strong); color: var(--color-text-main);">
                
                <!-- HEADER -->
                <div class="px-6 py-5 border-b flex items-center justify-between" style="border-color: var(--color-border-subtle); background-color: var(--color-bg-surface-elevated);">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-extrabold text-base shadow-sm">
                            <i class="fa-solid fa-file-excel"></i>
                        </div>
                        <div>
                            <h2 class="text-sm font-extrabold uppercase tracking-wide leading-tight" style="color: var(--color-text-main);">PILIH DATASET INFOGRAFIS</h2>
                            <p class="text-[11px] font-medium leading-tight mt-0.5" style="color: var(--color-text-muted);">Pilih tahun dan semester data kependudukan untuk membuat infografis V2</p>
                        </div>
                    </div>
                    <button id="btn-close-dm" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition">
                        <i class="fa-solid fa-xmark text-sm"></i>
                    </button>
                </div>

                <!-- BODY -->
                <div class="p-6 space-y-5">
                    
                    <!-- MAIN DYNAMIC FILTERS (SECTION B) -->
                    <div class="flex items-center justify-between gap-3">
                        <div class="flex-1 grid grid-cols-2 gap-3 p-3 rounded-xl border" style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle);">
                            <div>
                                <label class="block text-[10px] font-extrabold uppercase tracking-wider mb-1" style="color: var(--color-text-muted);">Tahun Data</label>
                                <select id="dm-select-year" class="v2-select font-bold text-xs w-full">
                                    ${availableYears.map(y => `<option value="${y}" ${this.selectedYear === y ? 'selected' : ''}>${y}</option>`).join('')}
                                </select>
                            </div>

                            <div>
                                <label class="block text-[10px] font-extrabold uppercase tracking-wider mb-1" style="color: var(--color-text-muted);">Semester Data</label>
                                <select id="dm-select-semester" class="v2-select font-bold text-xs w-full">
                                    <option value="1" ${this.selectedSemester === 1 ? 'selected' : ''}>Semester 1</option>
                                    <option value="2" ${this.selectedSemester === 2 ? 'selected' : ''}>Semester 2</option>
                                </select>
                            </div>
                        </div>

                        <button id="btn-open-data-entry-from-dm" class="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition flex flex-col items-center justify-center gap-1 shadow-sm flex-shrink-0 active:scale-95" title="Input & Kelola Dataset Baru">
                            <i class="fa-solid fa-file-circle-plus text-base"></i>
                            <span class="text-[10px] tracking-wide">+ Input Baru</span>
                        </button>
                    </div>

                    <!-- DATASET CARD & DETAILS (SECTION C) -->
                    <div id="dm-dataset-card-container">
                        ${(() => {
                            if (!dataset) {
                                return `
                                    <!-- EMPTY STATE -->
                                    <div class="p-6 rounded-2xl border text-center space-y-3" style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle);">
                                        <div class="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-base">
                                            <i class="fa-solid fa-folder-open"></i>
                                        </div>
                                        <div>
                                            <h4 class="text-xs font-extrabold" style="color: var(--color-text-main);">Belum ada dataset untuk periode ini.</h4>
                                            <p class="text-[11px] mt-1" style="color: var(--color-text-muted);">Belum ada data JUMDUK untuk Tahun ${this.selectedYear} Semester ${this.selectedSemester}.</p>
                                        </div>
                                        <div class="pt-2">
                                            <button id="btn-add-new-dataset-placeholder" class="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition inline-flex items-center justify-center gap-1.5">
                                                <i class="fa-solid fa-cloud-arrow-up"></i> Upload Dataset
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }

                            // Dynamic check: Is this dataset genuinely the active one?
                            const activeEntry = Object.values(this.datasetManager.registry).find(d => (d.isActive === 1 || d.isActive === true || d.is_active === 1 || d.status === 'AKTIF'));
                            const isDatasetActive = activeEntry 
                                ? (Number(activeEntry.year) === Number(dataset.year) && Number(activeEntry.semester) === Number(dataset.semester))
                                : Boolean(dataset.isActive === 1 || dataset.isActive === true || dataset.is_active === 1 || dataset.status === 'AKTIF');
                            
                            const badgeText = isDatasetActive ? 'AKTIF' : 'TERSEDIA';
                            const badgeClass = isDatasetActive ? 'v2-badge-active' : 'v2-badge-available';

                            return `
                                <div class="p-5 rounded-2xl border space-y-4 shadow-sm" style="background-color: var(--color-bg-surface-elevated); border-color: var(--color-border-subtle);">
                                    
                                    <!-- CARD HEADER: Status Badge & File Name -->
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-2 min-w-0 pr-2">
                                            <i class="fa-solid fa-file-excel text-emerald-500 text-lg flex-shrink-0"></i>
                                            <span class="text-xs font-extrabold truncate" style="color: var(--color-text-main);" title="${dataset.filename}">${dataset.filename}</span>
                                        </div>
                                        <span class="v2-badge ${badgeClass} flex-shrink-0">${badgeText}</span>
                                    </div>

                                    <!-- FILE METADATA GRID -->
                                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] p-3 rounded-xl border" style="background-color: var(--color-bg-surface); border-color: var(--color-border-subtle);">
                                        <div>
                                            <span class="block font-semibold" style="color: var(--color-text-muted);">Ukuran</span>
                                            <span class="font-extrabold" style="color: var(--color-text-main);">${this.formatFileSize(dataset.fileSize || dataset.sizeBytes)}</span>
                                        </div>
                                        <div>
                                            <span class="block font-semibold" style="color: var(--color-text-muted);">Periode</span>
                                            <span class="font-extrabold text-emerald-500">Sem ${dataset.semester} ${dataset.year}</span>
                                        </div>
                                        <div>
                                            <span class="block font-semibold" style="color: var(--color-text-muted);">Tanggal Upload</span>
                                            <span class="font-extrabold" style="color: var(--color-text-main);">${this.formatDate(dataset.uploadedAt)}</span>
                                        </div>
                                        <div>
                                            <span class="block font-semibold" style="color: var(--color-text-muted);">Terakhir Digunakan</span>
                                            <span class="font-extrabold" style="color: var(--color-text-main);">${dataset.lastUsedAt ? this.formatDate(dataset.lastUsedAt) : 'Belum Pernah'}</span>
                                        </div>
                                    </div>

                                    <!-- DATASET SUMMARY STATISTICS -->
                                    <div class="grid grid-cols-3 gap-2 p-3 rounded-xl border text-[11px] font-bold text-center"
                                         style="background-color: var(--color-bg-surface); border-color: var(--color-border-subtle);">
                                        <div class="flex items-center gap-1.5" style="color: var(--color-text-main);">
                                            <i class="fa-solid fa-city text-emerald-500"></i>
                                            <span>${dataset.summary ? dataset.summary.totalKecamatan : 39} Kecamatan</span>
                                        </div>
                                        <div class="flex items-center gap-1.5" style="color: var(--color-text-main);">
                                            <i class="fa-solid fa-map-location-dot text-indigo-500"></i>
                                            <span>${dataset.summary ? dataset.summary.totalDesa : 351} Desa</span>
                                        </div>
                                        <div class="flex items-center gap-1.5 text-emerald-500">
                                            <i class="fa-solid fa-users"></i>
                                            <span>${this.formatNumber(dataset.summary ? dataset.summary.totalPenduduk : 2026081)} Penduduk</span>
                                        </div>
                                    </div>

                                    <!-- MAIN ACTION BUTTONS -->
                                    <div class="pt-1 flex items-center gap-2">
                                        <button id="btn-use-dataset" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md active:scale-95">
                                            <i class="fa-solid fa-circle-play text-amber-300"></i> Gunakan Dataset
                                        </button>
                                        <button id="btn-delete-dataset" type="button" class="px-3.5 py-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition shadow-sm ${isDatasetActive ? 'opacity-40 cursor-not-allowed text-slate-500 border-slate-700 bg-slate-800/40' : 'text-rose-400 border-rose-500/40 hover:bg-rose-500/10 hover:border-rose-500 active:scale-95'}" title="${isDatasetActive ? 'Dataset sedang aktif digunakan' : 'Hapus dataset ini dari database'}">
                                            <i class="fa-solid fa-trash-can"></i> Hapus
                                        </button>
                                    </div>

                                </div>
                            `;
                        })()}
                    </div>

                        <!-- SECONDARY BUTTON: "Upload Dataset Baru" -->
                        ${dataset ? `
                            <div class="pt-3 text-center">
                                <button id="btn-add-new-dataset-placeholder" class="text-[11px] font-bold text-slate-400 hover:text-emerald-500 transition flex items-center justify-center gap-1.5 mx-auto py-1 px-3 rounded-lg border border-dashed border-slate-700 hover:border-emerald-500">
                                    <i class="fa-solid fa-cloud-arrow-up text-[10px]"></i> Upload Dataset Baru
                                </button>
                            </div>
                        ` : ''}
                    </div>

                </div>

                <!-- DYNAMIC FOOTER INDICATOR -->
                <div class="px-6 py-3.5 border-t flex items-center justify-between text-[11px] font-semibold" style="border-color: var(--color-border-subtle); background-color: var(--color-bg-surface-elevated); color: var(--color-text-muted);">
                    <div class="flex items-center gap-1.5 text-emerald-500 font-bold">
                        <i class="fa-solid fa-circle-nodes"></i> <span id="dm-engine-status-text">${this.engineStatus}</span>
                    </div>
                    <button id="btn-close-dm-footer" class="v2-btn v2-btn-outline text-[10px]">Tutup</button>
                </div>

                <!-- PLACEHOLDER INFO OVERLAY -->
                ${this.showInfoModal ? `
                    <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 text-center animate-fade-in">
                        <div class="p-6 rounded-2xl border shadow-2xl max-w-sm space-y-4" style="background-color: var(--color-bg-surface); border-color: var(--color-border-strong); color: var(--color-text-main);">
                            <div class="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto text-xl">
                                <i class="fa-solid fa-cloud-arrow-up"></i>
                            </div>
                            <div class="space-y-1.5">
                                <h3 class="text-xs font-extrabold uppercase tracking-wide" style="color: var(--color-text-main);">Info Upload Dataset</h3>
                                <p class="text-[11px] font-medium leading-relaxed" style="color: var(--color-text-muted);">
                                    Upload Dataset Excel akan tersedia pada Phase Dataset Engine.
                                </p>
                            </div>
                            <button id="btn-close-info-overlay" class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition">
                                Mengerti
                            </button>
                        </div>
                    </div>
                ` : ''}

            </div>
        `;

        this.attachModalEvents();
    }

    attachModalEvents() {
        const modalEl = document.querySelector('#dataset-manager-modal');
        if (!modalEl) return;

        const btnClose = modalEl.querySelector('#btn-close-dm');
        const btnCloseFooter = modalEl.querySelector('#btn-close-dm-footer');
        const backdrop = modalEl.querySelector('#dm-backdrop');

        const hide = () => {
            this.showInfoModal = false;
            this.toggleModal(false);
        };

        if (btnClose) btnClose.addEventListener('click', hide);
        if (btnCloseFooter) btnCloseFooter.addEventListener('click', hide);
        if (backdrop) backdrop.addEventListener('click', hide);

        const yearSelect = modalEl.querySelector('#dm-select-year');
        const semesterSelect = modalEl.querySelector('#dm-select-semester');
        
        if (yearSelect) {
            yearSelect.addEventListener('change', async (e) => {
                this.selectedYear = Number(e.target.value);
                await this.datasetManager.getDatasetAsync(this.selectedYear, this.selectedSemester);
                this.renderModal();
            });
        }
        if (semesterSelect) {
            semesterSelect.addEventListener('change', async (e) => {
                this.selectedSemester = Number(e.target.value);
                await this.datasetManager.getDatasetAsync(this.selectedYear, this.selectedSemester);
                this.renderModal();
            });
        }

        const btnUse = modalEl.querySelector('#btn-use-dataset');
        if (btnUse) {
            btnUse.addEventListener('click', async () => {
                const yr = Number(modalEl.querySelector('#dm-select-year')?.value || this.selectedYear);
                const sem = Number(modalEl.querySelector('#dm-select-semester')?.value || this.selectedSemester);
                this.selectedYear = yr;
                this.selectedSemester = sem;

                btnUse.disabled = true;
                btnUse.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengaktifkan...';
                let ds = await this.datasetManager.getDatasetAsync(yr, sem);
                if (ds) {
                    const targetId = ds.id || `social-${yr}-${sem}`;
                    await DbService.setActiveDataset(targetId);
                    this.datasetManager.markAsUsed(yr, sem);
                    if (typeof this.onDatasetSelect === 'function') {
                        this.onDatasetSelect(ds);
                    }
                    this.toggleModal(false);
                } else {
                    await DialogModal.alert({
                        title: 'Gagal Memuat Data',
                        message: `Tidak dapat memuat detail dataset untuk Tahun ${yr} Semester ${sem}.`,
                        type: 'error'
                    });
                    this.renderModal();
                }
            });
        }

        const btnDelete = modalEl.querySelector('#btn-delete-dataset');
        if (btnDelete) {
            btnDelete.addEventListener('click', async () => {
                const yr = Number(this.selectedYear);
                const sem = Number(this.selectedSemester);
                const key = `${yr}-${sem}`;
                const ds = this.datasetManager.getDataset(yr, sem);
                if (!ds) return;

                // Dynamic check against currently active dataset
                const activeEntry = Object.values(this.datasetManager.registry).find(d => Boolean(d.isActive === 1 || d.isActive === true || d.is_active === 1 || d.status === 'AKTIF'));
                const isDatasetActive = activeEntry 
                    ? (Number(activeEntry.year) === yr && Number(activeEntry.semester) === sem)
                    : Boolean(ds.isActive === 1 || ds.is_active === 1);

                if (isDatasetActive) {
                    await DialogModal.alert({
                        title: 'Dataset Sedang Aktif',
                        message: `Dataset Tahun ${yr} Semester ${sem} sedang aktif digunakan pada infografis live.\n\nUntuk alasan integritas data, aktifkan dataset periode lain terlebih dahulu sebelum menghapus dataset ini.`,
                        type: 'warning'
                    });
                    return;
                }

                const confirmed = await DialogModal.promptPin({
                    title: 'Konfirmasi Hapus Dataset',
                    periodInfo: `Tahun ${yr} Semester ${sem}`,
                    filename: ds.filename || ds.source_filename || 'Tersimpan di database',
                    requiredPin: 'disduk123'
                });

                if (!confirmed) return;

                btnDelete.disabled = true;
                btnDelete.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menghapus...';

                const targetId = ds.id || `social-${yr}-${sem}`;
                const ok = await DbService.deleteDataset(targetId);
                if (ok) {
                    delete this.datasetManager.registry[key];
                    this.datasetManager.saveRegistry();
                    await this.datasetManager.syncWithDatabase();
                    
                    await DialogModal.alert({
                        title: 'Penghapusan Berhasil',
                        message: `Dataset Tahun ${yr} Semester ${sem} telah berhasil dihapus secara permanen dari database SQLite.`,
                        type: 'success',
                        confirmText: 'Selesai'
                    });
                    
                    // Switch to remaining available years
                    const remainingYears = this.datasetManager.getAvailableYears();
                    if (remainingYears.length > 0) {
                        this.selectedYear = remainingYears[0];
                    }
                    this.renderModal();
                } else {
                    await DialogModal.alert({
                        title: 'Gagal Menghapus',
                        message: 'Gagal menghapus dataset dari SQLite. Pastikan dataset tidak sedang berstatus aktif.',
                        type: 'error'
                    });
                    this.renderModal();
                }
            });
        }

        const btnOpenDataEntry = modalEl.querySelector('#btn-open-data-entry-from-dm');
        if (btnOpenDataEntry) {
            btnOpenDataEntry.addEventListener('click', () => {
                this.toggleModal(false);
                this.onOpenDataEntry();
            });
        }

        const btnAddPlaceholder = modalEl.querySelector('#btn-add-new-dataset-placeholder');
        if (btnAddPlaceholder) {
            btnAddPlaceholder.addEventListener('click', () => {
                this.toggleModal(false);
                this.onOpenDataEntry();
            });
        }

        const btnCloseInfoOverlay = modalEl.querySelector('#btn-close-info-overlay');
        if (btnCloseInfoOverlay) {
            btnCloseInfoOverlay.addEventListener('click', () => {
                this.showInfoModal = false;
                this.renderModal();
            });
        }
    }

    toggleModal(open = true) {
        this.isOpen = open;
        if (!open) this.showInfoModal = false;
        this.renderModal();
    }
}
