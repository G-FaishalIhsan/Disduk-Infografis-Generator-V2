# 📊 Disduk Infografis Generator V2

> **Generator Infografis Kependudukan & Pencatatan Sipil Modern**  
> Dinas Kependudukan dan Pencatatan Sipil (Disdukcapil) Kabupaten Tasikmalaya

Aplikasi web modern berbasis Node.js dan JavaScript murni (ES Modules) untuk memproses, memvisualisasikan, dan mengekspor data agregat kependudukan ke dalam format infografis resolusi tinggi (HiDPI) untuk media sosial maupun cetak secara instan, dinamis, dan akurat.

---

## 🌟 Fitur Utama

### 1. Dual Workspace Mandiri (Stateless & Terpisah)
* **Workspace 1: Full Infografis (Poster & Web Infographics)**
  * Menyajikan 3 pilihan template poster modern (*Clean Emerald*, *Vibrant Gradient*, dan *Compact Interactive Layout*).
  * Filter data fleksibel: Level **Kabupaten Tasikmalaya** atau spesifik per **39 Kecamatan**.
  * Dilengkapi *Auto-fitter Engine* untuk penyesuaian skala layout otomatis agar tidak meluap (*overflow-safe*).
  * Penggantian template dan kecamatan terjadi secara instan tanpa perlu reload.

* **Workspace 2: Social Media Carousel V2**
  * Format standar Carousel Instagram (rasio 4:5 / 1080x1350px).
  * **Dual-Slide Live Preview**:
    * **Slide 1:** Ringkasan Demografi Utama (Total Penduduk, Rasio Gender, Piramida Usia Muda-Produktif-Tua, dan Status Perkawinan).
    * **Slide 2:** Rincian Kepemilikan Dokumen Kependudukan (KTP-el, KK, KIA, Akta Lahir/Nikah), Pertumbuhan Alami & Netto, serta **Top 3 Kecamatan** dengan penduduk terbanyak.
  * Sinkronisasi tema visual dinamis (*Emerald Light & Dark Mode*).

---

### 2. Manajemen Dataset & Database SQLite Terintegrasi
* **Penyimpanan Lokal Andal:** Menggunakan SQLite (`database/app_database.sqlite`) dengan validasi integritas otomatis.
* **Unggah Data Excel / CSV:** Normalizer cerdas yang otomatis memetakan sinonim kolom data kependudukan.
* **Form Tambah Manual Cerdas (*Data Entry Modal*):**
  * Auto-kalkulasi persentase penduduk, rasio gender (*sex ratio*), migrasi netto, dan total mutasi secara *real-time*.
  * Fitur *Prefill Data Terakhir* untuk pengisian cepat.
* **Dialog Kustom Elegan:** Menggantikan popup bawaan browser dengan dialog modal kustom beranimasi halus yang tersinkronisasi penuh dengan tema aktif.

---

### 3. Engine Ekspor Resolusi Tinggi (HiDPI Puppeteer + Fallback Klien)
* **Pilihan Format Lengkap:** Mendukung ekspor **PNG**, **JPG**, **PDF**, dan **Paket ZIP Carousel**.
* **Chromium Native Backend:** Merender dokumen langsung pada ukuran cetak/asli untuk ketajaman teks dan grafik sempurna.
* **Export Queue Guard & Top Toast Notification (`z-[100001]`):**
  * Menampilkan notifikasi progres melayang di bagian atas layar tanpa menghalangi kanvas pratinjau.
  * Mengunci tombol ekspor saat proses berlangsung untuk mencegah penumpukan antrean ekspor (*anti-duplicate click*).
* **Image Waiter Resilient:** Dilengkapi perlindungan *timeout race* (2000ms) agar ekspor tidak pernah macet (*hang*) meskipun ada gambar yang lambat atau rusak.
* **Client-Side Fallback:** Tersedia mesin render cadangan berbasis HTML5 Canvas di sisi browser jika server backend tidak dapat dijangkau.

---

## 🛠️ Arsitektur & Teknologi

* **Frontend:**
  * Vanilla JavaScript (ES6+ Native Modules)
  * Tailwind CSS & Vanilla Custom CSS Tokens
  * FontAwesome 6 Pro Icons
  * Google Fonts (*Plus Jakarta Sans*)
  * Chart.js & HTML5 Canvas
* **Backend:**
  * Node.js & Express.js (REST API & SSE Progress Streaming)
  * Puppeteer (Chromium Headless Renderer)
  * SQLite3 / Better-SQLite3
  * Archiver (Kompresi ZIP Multi-Slide)

---

## 📁 Struktur Direktori

```text
├── database/                   # SQLite Database & Schema Migration
│   ├── app_database.sqlite     # Basis data lokal aktif
│   └── schema.sql              # Definisi tabel dataset & demografi
├── docs/                       # Dokumentasi Arsitektur & ADR
│   ├── ARCHITECTURE_V2.md      # Detail arsitektur pipeline data & export
│   └── DECISION_LOG.md         # Catatan keputusan arsitektural (ADR)
├── img/                        # Aset gambar, logo Disduk, dan favicon
├── server/                     # Express Server & Puppeteer Renderer
│   ├── server.js               # Titik masuk backend server
│   ├── data-routes.js          # REST API Dataset SQLite
│   ├── renderer.js             # Chromium Renderer Full Workspace
│   └── social-renderer.js      # Chromium Renderer Social Media Carousel V2
├── src/                        # Modul Utama Frontend (Client-Side)
│   ├── app.js                  # Koordinator utama alur aplikasi (State Manager)
│   ├── engine/                 # Loader, Data Binder, Fitter, dan Exporter
│   ├── excel/                  # Modul pembaca dan normalizer file Excel/CSV
│   ├── parsers/                # Parser JSON/PDF preset kependudukan
│   ├── services/               # Layanan HTTP Dataset API
│   └── ui/                     # Komponen UI, Sidebar, Modal Dialog, & Form Input
├── templates/                  # Template HTML Infografis
│   ├── template-1/             # Full Infografis Template 1
│   ├── template-2/             # Full Infografis Template 2
│   ├── template-3/             # Full Infografis Template 3
│   └── social/                 # Template Media Sosial V2 (Slide 1 & Slide 2)
│       ├── template-1/
│       ├── template-2/
│       └── template-3/
└── test/                       # Skrip Pengujian Otomatis & Regression Suite
```

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### Prasyarat
* [Node.js](https://nodejs.org/) (Versi 18.x atau yang lebih baru)
* [npm](https://www.npmjs.com/) (Bawaan Node.js)

### 1. Klon Repositori
```bash
git clone https://github.com/G-FaishalIhsan/Disduk-Infografis-Generator-V2.git
cd Disduk-Infografis-Generator-V2
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Jalankan Server Aplikasi
```bash
# Menjalankan Express & Chromium Export Server
npm start

# Atau menggunakan mode nodemon untuk pengembangan
npm run dev
```

Buka peramban (browser) dan akses:
👉 **`http://localhost:3000`**

---

## 🧪 Menjalankan Pengujian Otomatis (*Test Suite*)

Aplikasi ini dilengkapi pengujian end-to-end menyeluruh menggunakan Puppeteer:

```bash
# Menjalankan seluruh rangkaian uji regresi (Database, Bindings, Viewport, Exporter)
node test/full_regression_suite.mjs

# Menguji pergantian template dan kecamatan instan
node test/test-all-template-switching.js

# Menguji proteksi antrean ekspor & notifikasi melayang
node test/test-export-queue-blocking.js
```

---

## 📄 Lisensi & Hak Cipta

Dikembangkan untuk kebutuhan Dinas Kependudukan dan Pencatatan Sipil Kabupaten Tasikmalaya.  
Seluruh hak cipta dilindungi undang-undang.
