# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Kadu is a 100% client-side Progressive Web App (PWA) that scans printed lists with a phone camera and turns them into structured, editable lists. There is no backend — the golden rule (see `ATTENDANCE_SCANNER_RULES.md`) is that everything must run as static files with all processing happening in the user's browser.

Every list has a **category** that changes how it behaves:
- **Padrão** — attendance list (people's names, present/absent) with per-person notes and quick-note chips ("Atrasado", "Falta justificada"…).
- **Mercado** — shopping list: items with quantity, unit price (typed or read from a shelf price tag with the camera), notes, and a running "no carrinho" / "estimado" total. Here `present` means "in the cart".

The UI text and user-facing strings are in Portuguese (pt-BR); keep new UI copy consistent with that.

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # tsc type-check, then vite build (production bundle to dist/)
npm run lint      # eslint . — currently fails: there is no eslint.config.js (ESLint 9 requires one)
npm run preview   # Serve the production build locally
```

There is no test suite configured in this project.

## Architecture

### Categories (`src/categories.ts`)

`CATEGORIES: Record<ListCategory, CategoryConfig>` is the single place that holds everything category-specific: labels/icons, feature flags (`features.notes`, `features.pricing`), note suggestions, the OCR scan prompt, and the line parsers for scanned and typed input. Components check **features**, not category ids — to add a category, add its id to `LIST_CATEGORIES` in `src/storage/db.ts` and an entry here.

The data model is a superset: every item may carry `note`, `priceCents`, `quantity`; the category only decides what is shown/edited. That's why switching a list's category (header pill in `AttendancePage`) is lossless.

### OCR pipeline

`ScannerPage` (list scan) and `PriceScanner` (price tag) both go through `runOcr` in `src/ocr/cloudOcr.ts`:

1. **Capture** — `useCameraStream` (`src/hooks/useCameraStream.ts`) owns `getUserMedia` start/stop/capture (stops the stream on unmount). `capture(region)` maps a CSS-pixel rectangle back to video pixels accounting for `object-cover` — `PriceScanner` uses it to crop only the framed area. `CameraInput` also supports gallery upload; `PriceScanner` falls back to `<input capture>` when `getUserMedia` is unavailable (non-HTTPS / permission denied).
2. **Prepare** — `prepareImageForOcr` (`src/vision/documentProcessor.ts`) sharpens the image/canvas. (`ATTENDANCE_SCANNER_RULES.md` describes an OpenCV.js warp + line-slicing pipeline; that was never implemented — there is no OpenCV dependency.)
3. **`runOcr({ image, prompt, parse, local })`** — if online, compresses the image once (`compressImageForApiAsync`) and tries cloud vision providers in order **Gemini → OpenAI → Groq**, skipping those without an API key. `parse(rawText)` returning `null` means "unusable, try the next provider". HTTP 400/401/403/429 marks the provider `error` via `setApiStatus` (shown as "Falha no uso" in Settings). If nothing usable comes back, `local` runs Tesseract.js (`src/ocr/ocrWorker.ts`: `recognizeText` for lists, `recognizePriceCandidates` for price tags — whitelist + lines ranked by bbox height, since the main price is the biggest text).
4. **Parse** — list lines go through the category's `parseScannedLine` (`src/parsing/cleanText.ts`: `cleanOcrText`/`isValidName` for Padrão, `parseMarketLine` for Mercado, which extracts leading/trailing quantities like "2 Leite" / "Leite x2" but treats "5kg arroz" as a name). Prices go through `extractPriceCandidates` (`src/parsing/priceText.ts`), whose expected LLM response format is defined by `PRICE_PROMPT` in the same file — keep them in sync.

### Data layer

- `src/storage/db.ts` — Dexie schema (currently v3). `attendance_lists` rows embed their `Participant[]` (no participants table); `settings` is a key/value store (API keys, per-provider status, last used category). Schema changes need a new `db.version(n)` with an `upgrade()` backfill.
- `src/storage/attendanceStore.ts` — all list/participant mutations. Participant changes go through `modifyParticipants` (Dexie `Collection.modify`), which is atomic — don't reintroduce read-then-`update` for participants, it loses writes on quick successive taps.
- Money is stored as **integer cents** (`priceCents`); formatting/totals live in `src/utils/money.ts` (`formatBRL`, `digitsToCents` for the ATM-style price input, `listTotals`).
- Reads are reactive: `useAttendanceStore` / `useAttendanceList(id)` (`src/hooks/useAttendanceStore.ts`) wrap `useLiveQuery`, so pages just write to the store and re-render — no manual local copies of list state.

### App shell

- Routing (`src/routes.tsx`): `/` (HomePage) → `/scan` (ScannerPage) → `/list/:id` (AttendancePage: rows in `NameReviewItem`, details bottom sheet `ItemSheet`, `MarketTotalsBar` for pricing categories) and `/settings` (API keys).
- `ModalContext` provides promise-based `confirm()`/`alert()` — use it instead of `window.confirm`.
- CSV export (`src/utils/exportUtils.ts`) uses `;` + decimal comma + UTF-8 BOM (what Excel pt-BR expects) and a Blob download.
- PWA config lives in `vite.config.ts` (`vite-plugin-pwa`, `registerType: 'autoUpdate'`); `vercel.json` rewrites all paths to `index.html`. Running `npm run dev` rewrites the tracked `dev-dist/sw.js` (revision hash only) — don't commit that noise.

## Working in this codebase

- **No backend, ever.** No server code, no server-held secrets. Cloud OCR API keys are entered by the user, stored in IndexedDB, and the browser calls Gemini/OpenAI/Groq directly.
- Tesseract.js's heavy parts (worker, wasm core, `por` traineddata) are fetched from the jsdelivr CDN when `createWorker` runs and are not cached by the service worker, so the offline OCR fallback only works after they were loaded once online.
- TypeScript is strict (see `tsconfig.json`); `npm run build` runs `tsc` before `vite build`, so type errors block the build.
- Mobile-first UI: keep touch targets ≥ 44px and follow the existing Tailwind style (rounded-2xl cards, `active:` states instead of `hover:`, blue-600 primary). `getUserMedia` needs HTTPS or localhost, so test camera flows on a phone via a deployed preview.
