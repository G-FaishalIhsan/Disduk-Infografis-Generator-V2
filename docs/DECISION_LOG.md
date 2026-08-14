# 📐 DECISION LOG (ARCHITECTURAL DECISIONS)

## ADR-001: Minimal Change Architecture & Zero Breaking Changes
- **Date**: 2026-07-26 (Amended: 2026-08-14)
- **Status**: Approved & Active
- **Context**: Project V1 already runs stably in production. V2 requires additional features for social media carousels and dynamic dataset management.
- **Decision**: All V2 development must be purely ADDITIVE. 
  - Core template assets, indexes, and legacy routes (`/api/export/png`, `/api/export/jpg`, `/api/export/pdf`) remain 100% backward compatible.
  - *Amendment (2026-08-14)*: `server/server.js` is extended in an additive, non-breaking manner with SQLite dataset routers (`/api/data/*`) and Social Media Puppeteer capture endpoints (`/api/export/social/*`), preserving existing V1 export functionality untouched.
- **Consequences**: V1 functions continue to work with 100% backward compatibility while enabling dynamic database-driven V2 workflows.

---

## ADR-002: Template 3 Future Compatibility & Workspace Separation
- **Date**: 2026-07-26 (Updated: 2026-08-14)
- **Status**: Approved & Updated
- **Context**: 
  - **Infografis Lengkap (Workspace 1)**: Template 3 (Compact Layout) berstatus **Active** dan 100% dapat digunakan.
  - **Media Sosial (Workspace 2)**: Template 3 V2 berstatus **Active / Plug & Play Ready** pada struktur `templates/social/template-3/`.
- **Decision**: 
  1. The V2 architecture is designed using a **Plug-and-Play Template Registry Pattern** (`templates-manifest.json`).
  2. All V2 templates consume a standardized, normalized JSON data payload contract.
  3. Template 3 V2 resides in `templates/social/template-3/` with slide HTML files and manifest integration.
  4. **Adding or updating templates in Workspace 2 does NOT require major refactoring, engine changes, route rewrites, or structural breaking changes to V1 or V2.**
- **Consequences**: Seamless future extensibility without maintenance risk.

---

## ADR-003: Storage Directory Isolation
- **Date**: 2026-07-26
- **Status**: Approved
- **Context**: Preparation for future dataset caching, export temporary buffers, and server logging.
- **Decision**: Create a dedicated `storage/` directory with `datasets/`, `exports/`, and `logs/` subdirectories. Keep these folders empty and prepared without modifying any current V1 file paths.
- **Consequences**: Clean separation of dynamic runtime data from application source code.
