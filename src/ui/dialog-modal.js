/**
 * Custom Government App Dialog & Modal Component (Disdukcapil Infografis)
 * Replaces native browser alert(), confirm(), and prompt() with premium styled UI modals.
 * Supports: alert, confirm, promptPin, and toast notifications.
 */

export class DialogModal {
    static _ensureContainer() {
        let container = document.querySelector('#custom-dialog-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'custom-dialog-container';
            document.body.appendChild(container);
        }
        container.className = 'fixed inset-0 z-[100000] flex items-center justify-center p-4 pointer-events-none transition-all duration-200';
        return container;
    }

    /**
     * Shows a custom Alert Modal
     * @param {Object} options { title, message, type: 'info'|'success'|'warning'|'error', confirmText }
     * @returns {Promise<void>}
     */
    static alert(options = {}) {
        return new Promise((resolve) => {
            const {
                title = 'Pemberitahuan',
                message = '',
                type = 'info',
                confirmText = 'Mengerti'
            } = typeof options === 'string' ? { message: options } : options;

            const iconMap = {
                success: { icon: 'fa-circle-check', bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', btn: 'bg-emerald-600 hover:bg-emerald-500 text-white' },
                warning: { icon: 'fa-triangle-exclamation', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20', btn: 'bg-amber-600 hover:bg-amber-500 text-white' },
                error: { icon: 'fa-circle-xmark', bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20', btn: 'bg-rose-600 hover:bg-rose-500 text-white' },
                info: { icon: 'fa-circle-info', bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', btn: 'bg-indigo-600 hover:bg-indigo-500 text-white' }
            };

            const cfg = iconMap[type] || iconMap.info;
            const container = this._ensureContainer();
            container.innerHTML = '';
            container.classList.remove('pointer-events-none');

            const backdrop = document.createElement('div');
            backdrop.className = 'fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200 opacity-0';

            const modalBox = document.createElement('div');
            modalBox.className = 'relative w-full max-w-md rounded-2xl border shadow-2xl p-6 transition-all duration-200 transform scale-95 opacity-0 z-10';
            modalBox.style.backgroundColor = 'var(--color-bg-surface, #ffffff)';
            modalBox.style.borderColor = 'var(--color-border-subtle, #e2e8f0)';

            modalBox.innerHTML = `
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center border text-xl flex-shrink-0 ${cfg.bg}">
                        <i class="fa-solid ${cfg.icon}"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="text-sm font-black tracking-wide uppercase mb-1.5" style="color: var(--color-text-main, #0f172a);">${title}</h3>
                        <div class="text-xs leading-relaxed font-medium whitespace-pre-line" style="color: var(--color-text-muted, #64748b);">${message}</div>
                    </div>
                </div>
                <div class="mt-6 flex justify-end">
                    <button id="btn-dialog-ok" class="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider ${cfg.btn} transition shadow-md active:scale-95">
                        ${confirmText}
                    </button>
                </div>
            `;

            container.appendChild(backdrop);
            container.appendChild(modalBox);

            requestAnimationFrame(() => {
                backdrop.classList.remove('opacity-0');
                backdrop.classList.add('opacity-100');
                modalBox.classList.remove('opacity-0', 'scale-95');
                modalBox.classList.add('opacity-100', 'scale-100');
            });

            const close = () => {
                backdrop.classList.add('opacity-0');
                modalBox.classList.add('opacity-0', 'scale-95');
                setTimeout(() => {
                    if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
                    if (modalBox.parentNode) modalBox.parentNode.removeChild(modalBox);
                    if (container.children.length === 0) {
                        container.classList.add('pointer-events-none');
                    }
                    resolve();
                }, 200);
            };

            modalBox.querySelector('#btn-dialog-ok').addEventListener('click', close);
        });
    }

    /**
     * Shows a custom Confirmation Modal
     * @param {Object} options { title, message, type: 'warning'|'danger'|'info', confirmText, cancelText, details }
     * @returns {Promise<boolean>}
     */
    static confirm(options = {}) {
        return new Promise((resolve) => {
            const {
                title = 'Konfirmasi Tindakan',
                message = '',
                type = 'warning',
                confirmText = 'Ya, Lanjutkan',
                cancelText = 'Batal',
                details = []
            } = options;

            const iconMap = {
                danger: { icon: 'fa-triangle-exclamation', bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20', btn: 'bg-rose-600 hover:bg-rose-500 text-white' },
                warning: { icon: 'fa-triangle-exclamation', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20', btn: 'bg-amber-600 hover:bg-amber-500 text-white' },
                info: { icon: 'fa-circle-question', bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', btn: 'bg-indigo-600 hover:bg-indigo-500 text-white' }
            };

            const cfg = iconMap[type] || iconMap.warning;
            const container = this._ensureContainer();
            container.innerHTML = '';
            container.classList.remove('pointer-events-none');

            const backdrop = document.createElement('div');
            backdrop.className = 'fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200 opacity-0';

            const modalBox = document.createElement('div');
            modalBox.className = 'relative w-full max-w-md rounded-2xl border shadow-2xl p-6 transition-all duration-200 transform scale-95 opacity-0 z-10';
            modalBox.style.backgroundColor = 'var(--color-bg-surface, #ffffff)';
            modalBox.style.borderColor = 'var(--color-border-subtle, #e2e8f0)';

            let detailsHtml = '';
            if (details && details.length > 0) {
                detailsHtml = `
                    <div class="mt-3 p-3 rounded-xl border space-y-1.5 text-[11px] font-mono"
                         style="background-color: var(--color-bg-surface-elevated, #f1f5f9); border-color: var(--color-border-subtle, #e2e8f0);">
                        ${details.map(d => `
                            <div class="flex items-center justify-between">
                                <span class="font-sans" style="color: var(--color-text-muted, #64748b);">${d.label}:</span>
                                <span class="font-bold truncate max-w-[220px]" style="color: var(--color-text-main, #0f172a);">${d.value}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            modalBox.innerHTML = `
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center border text-xl flex-shrink-0 ${cfg.bg}">
                        <i class="fa-solid ${cfg.icon}"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="text-sm font-black tracking-wide uppercase mb-1.5" style="color: var(--color-text-main, #0f172a);">${title}</h3>
                        <div class="text-xs leading-relaxed font-medium whitespace-pre-line" style="color: var(--color-text-muted, #64748b);">${message}</div>
                        ${detailsHtml}
                    </div>
                </div>
                <div class="mt-6 flex items-center justify-end gap-2.5">
                    <button id="btn-dialog-cancel" class="px-4 py-2.5 rounded-xl text-xs font-bold border transition active:scale-95"
                            style="background-color: var(--color-bg-surface, #ffffff); border-color: var(--color-border-strong, #cbd5e1); color: var(--color-text-main, #0f172a);">
                        ${cancelText}
                    </button>
                    <button id="btn-dialog-confirm" class="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider ${cfg.btn} transition shadow-md active:scale-95">
                        ${confirmText}
                    </button>
                </div>
            `;

            container.appendChild(backdrop);
            container.appendChild(modalBox);

            requestAnimationFrame(() => {
                backdrop.classList.remove('opacity-0');
                backdrop.classList.add('opacity-100');
                modalBox.classList.remove('opacity-0', 'scale-95');
                modalBox.classList.add('opacity-100', 'scale-100');
            });

            const cleanup = (result) => {
                backdrop.classList.add('opacity-0');
                modalBox.classList.add('opacity-0', 'scale-95');
                setTimeout(() => {
                    if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
                    if (modalBox.parentNode) modalBox.parentNode.removeChild(modalBox);
                    if (container.children.length === 0) {
                        container.classList.add('pointer-events-none');
                    }
                    resolve(result);
                }, 200);
            };

            modalBox.querySelector('#btn-dialog-cancel').addEventListener('click', () => cleanup(false));
            modalBox.querySelector('#btn-dialog-confirm').addEventListener('click', () => cleanup(true));
        });
    }

    /**
     * Shows a custom Operator PIN Authentication Modal for Permanent Deletion
     * @param {Object} options { title, periodInfo, filename, requiredPin }
     * @returns {Promise<boolean>} Resolves to true if PIN is correct, false if cancelled
     */
    static promptPin(options = {}) {
        return new Promise((resolve) => {
            const {
                title = 'Otorisasi Penghapusan Dataset',
                periodInfo = 'Tahun 2025 Semester 2',
                filename = 'dataset.xlsx',
                requiredPin = 'disduk123'
            } = options;

            const container = this._ensureContainer();
            container.innerHTML = '';
            container.classList.remove('pointer-events-none');

            const backdrop = document.createElement('div');
            backdrop.className = 'fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200 opacity-0';

            const modalBox = document.createElement('div');
            modalBox.className = 'relative w-full max-w-md rounded-2xl border shadow-2xl p-6 transition-all duration-200 transform scale-95 opacity-0 z-10';
            modalBox.style.backgroundColor = 'var(--color-bg-surface, #ffffff)';
            modalBox.style.borderColor = 'var(--color-border-subtle, #e2e8f0)';

            modalBox.innerHTML = `
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center border text-xl flex-shrink-0 bg-rose-500/10 text-rose-500 border-rose-500/20">
                        <i class="fa-solid fa-trash-can"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="text-sm font-black tracking-wide uppercase mb-1" style="color: var(--color-text-main, #0f172a);">${title}</h3>
                        <p class="text-xs leading-relaxed font-medium" style="color: var(--color-text-muted, #64748b);">
                            Anda akan menghapus dataset ini secara permanen dari database SQLite.
                        </p>
                    </div>
                </div>

                <!-- TARGET DATASET SUMMARY -->
                <div class="mt-4 p-3.5 rounded-xl border text-xs space-y-2"
                     style="background-color: var(--color-bg-surface-elevated, #f1f5f9); border-color: var(--color-border-subtle, #e2e8f0);">
                    <div class="flex items-center justify-between">
                        <span class="font-semibold" style="color: var(--color-text-muted, #64748b);">Periode Data:</span>
                        <span class="font-black text-rose-500">${periodInfo}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="font-semibold" style="color: var(--color-text-muted, #64748b);">Nama File:</span>
                        <span class="font-bold truncate max-w-[200px]" style="color: var(--color-text-main, #0f172a);" title="${filename}">${filename}</span>
                    </div>
                </div>

                <!-- PIN INPUT FORM -->
                <div class="mt-4 space-y-2">
                    <label class="block text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5" style="color: var(--color-text-muted, #64748b);">
                        <i class="fa-solid fa-key text-amber-500"></i> Masukkan PIN Otorisasi Operator
                    </label>
                    <div class="relative">
                        <input id="input-pin-auth" type="password" placeholder="Ketik PIN..." autocomplete="off"
                               class="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono tracking-widest border transition focus:outline-none focus:ring-2 focus:ring-rose-500"
                               style="background-color: var(--color-bg-surface-elevated, #f1f5f9); border-color: var(--color-border-strong, #cbd5e1); color: var(--color-text-main, #0f172a);" />
                        <button id="btn-toggle-pin-visibility" type="button" class="absolute right-3 top-2.5 transition" style="color: var(--color-text-muted, #64748b);" title="Lihat PIN">
                            <i class="fa-solid fa-eye text-xs"></i>
                        </button>
                    </div>
                    <div id="pin-error-msg" class="hidden text-[11px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                        <i class="fa-solid fa-circle-exclamation"></i> <span>PIN salah! Silakan coba lagi.</span>
                    </div>
                </div>

                <!-- ACTION BUTTONS -->
                <div class="mt-6 flex items-center justify-end gap-2.5">
                    <button id="btn-pin-cancel" class="px-4 py-2.5 rounded-xl text-xs font-bold border transition active:scale-95"
                            style="background-color: var(--color-bg-surface, #ffffff); border-color: var(--color-border-strong, #cbd5e1); color: var(--color-text-main, #0f172a);">
                        Batal
                    </button>
                    <button id="btn-pin-submit" class="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 transition shadow-md active:scale-95 flex items-center gap-1.5">
                        <i class="fa-solid fa-trash-can"></i> Hapus Permanen
                    </button>
                </div>
            `;

            container.appendChild(backdrop);
            container.appendChild(modalBox);

            const inputPin = modalBox.querySelector('#input-pin-auth');
            const errorMsg = modalBox.querySelector('#pin-error-msg');
            const btnToggle = modalBox.querySelector('#btn-toggle-pin-visibility');

            btnToggle.addEventListener('click', () => {
                if (inputPin.type === 'password') {
                    inputPin.type = 'text';
                    btnToggle.innerHTML = '<i class="fa-solid fa-eye-slash text-xs"></i>';
                } else {
                    inputPin.type = 'password';
                    btnToggle.innerHTML = '<i class="fa-solid fa-eye text-xs"></i>';
                }
            });

            requestAnimationFrame(() => {
                backdrop.classList.remove('opacity-0');
                backdrop.classList.add('opacity-100');
                modalBox.classList.remove('opacity-0', 'scale-95');
                modalBox.classList.add('opacity-100', 'scale-100');
                inputPin.focus();
            });

            const cleanup = (result) => {
                backdrop.classList.add('opacity-0');
                modalBox.classList.add('opacity-0', 'scale-95');
                setTimeout(() => {
                    if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
                    if (modalBox.parentNode) modalBox.parentNode.removeChild(modalBox);
                    if (container.children.length === 0) {
                        container.classList.add('pointer-events-none');
                    }
                    resolve(result);
                }, 200);
            };

            modalBox.querySelector('#btn-pin-cancel').addEventListener('click', () => cleanup(false));

            const verifyPin = () => {
                const val = inputPin.value.trim();
                if (val === requiredPin) {
                    errorMsg.classList.add('hidden');
                    cleanup(true);
                } else {
                    errorMsg.classList.remove('hidden');
                    inputPin.style.borderColor = '#f43f5e';
                    inputPin.value = '';
                    inputPin.focus();
                }
            };

            modalBox.querySelector('#btn-pin-submit').addEventListener('click', verifyPin);
            inputPin.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') verifyPin();
                if (e.key === 'Escape') cleanup(false);
            });
        });
    }
}
