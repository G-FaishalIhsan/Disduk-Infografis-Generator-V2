# 📜 CHANGELOG

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-08-14
### Added
- **Social Media Carousel Workspace**: Instagram 4:5 aspect ratio (1080x1350px) 2-slide carousel generator with live preview and Emerald theme switcher.
- **Plug-and-Play Social Templates**: Template 1, Template 2, and Template 3 V2 in `templates/social/`.
- **SQLite Database Architecture**: Local SQLite persistence with WAL mode via `better-sqlite3`, repositories pattern, migrations, and seeders.
- **Smart Dataset Manager**: Excel/CSV automatic importer with column synonym mapping and semester/year auto-detection.
- **Manual Data Entry System**: Guided modal form for custom district and aggregate data creation with automatic ratio & percentage computations.
- **High-Resolution Chromium Puppeteer Exporter**: Server-side rendering for PNG, JPG, PDF, and ZIP bundles.
- **SSE Real-Time Progress**: Live progress streaming for multi-slide ZIP carousel exports.
- **Reliability & Anti-Hang Protections**: Image waiter timeout race condition fallback, anti-duplicate export button locks, and sanitized UI error dialogs.
- **E2E Test Suite**: Comprehensive Puppeteer regression test suite covering template switching, database operations, export engine, and data binding.

## [2.0.0-phase1] - 2026-07-26
### Added
- Created `docs/` folder with complete V1 documentation & V2 placeholders (`PRD_V2.md`, `ARCHITECTURE_V2.md`, `CHANGELOG.md`, `DECISION_LOG.md`).
- Created `storage/` directory structure (`storage/datasets/`, `storage/exports/`, `storage/logs/`).
- Documented Template 3 Future Compatibility & Plug-and-Play Template Registry Architecture in `docs/DECISION_LOG.md`.

### Unchanged (Stable Core Frozen)
- All V1 production files, backend API, Puppeteer engine, PDF parsers, UI markup, and assets remain 100% untouched.

## [1.0.0] - Baseline Release
- Initial stable release of Disdukcapil Infographic Generator V1 (Templates 1, 2, 3).

