# 📦 Materials Index

## LockSafe - Locksmith Partner | Google Play Submission Package

> Complete inventory of all files required for Google Play Store submission.

---

## Directory Structure

```
google-play-materials/
├── 📁 store-listing/
│   ├── 📁 graphics/
│   │   ├── app-icon.png
│   │   ├── feature-graphic.png
│   │   └── promo-graphic.png
│   ├── 📁 screenshots/
│   │   ├── 01-dashboard.png
│   │   ├── 02-job-details.png
│   │   ├── 03-earnings.png
│   │   ├── 04-profile.png
│   │   ├── 05-job-management.png
│   │   └── 06-notifications-map.png
│   └── 📁 text/
│       ├── APP_TITLE.txt
│       ├── SHORT_DESCRIPTION.txt
│       ├── FULL_DESCRIPTION.txt
│       ├── PROMOTIONAL_TEXT.txt
│       └── STORE_METADATA.json
├── 📁 release/
│   └── locksafe-v1.0.2-build12.aab
├── 📁 policies/
│   ├── PRIVACY_POLICY.md
│   └── PRIVACY_POLICY.pdf
├── 📁 submission-guides/
│   ├── SUBMISSION_CHECKLIST.md
│   ├── GOOGLE_PLAY_UPLOAD_GUIDE.md
│   ├── MATERIALS_INDEX.md          ← (this file)
│   ├── QUICK_REFERENCE.txt
│   └── GOOGLE_PLAY_PACKAGE_COMPLETE.md
├── GOOGLE_PLAY_LISTING_MATERIALS.md
├── GOOGLE_PLAY_LISTING_MATERIALS.pdf
├── VISUAL_ASSETS_SUMMARY.md
├── VISUAL_ASSETS_SUMMARY.pdf
├── RESEARCH_SUMMARY.md
└── RESEARCH_SUMMARY.pdf
```

---

## 1. Release Artifacts

| File | Path | Size | Format | Purpose |
|------|------|------|--------|---------|
| Production AAB | `release/locksafe-v1.0.2-build12.aab` | 51.7 MB | AAB | Android App Bundle for Play Console upload |

**Build Details:**
- Package name: `uk.locksafe.app`
- Version name: `1.0.2`
- Version code: `12`
- Max AAB size allowed: 200 MB

---

## 2. Visual Assets — Graphics

| File | Path | Dimensions | Size | Format | Google Play Requirement | Status |
|------|------|-----------|------|--------|------------------------|--------|
| App Icon | `store-listing/graphics/app-icon.png` | 512 × 512 px | 147 KB | PNG-32 (alpha) | 512 × 512 px, ≤1 MB | ✅ Ready |
| Feature Graphic | `store-listing/graphics/feature-graphic.png` | 1584 × 672 px | 1.1 MB | PNG-24 | 1024 × 500 px, ≤1 MB | ⚠️ Needs resize |
| Promo Graphic | `store-listing/graphics/promo-graphic.png` | 1264 × 848 px | 789 KB | PNG-24 | Deprecated (optional) | ℹ️ Optional |

### ⚠️ Action Required: Feature Graphic
The feature graphic must be resized to exactly **1024 × 500 px** before upload. Run:
```bash
convert store-listing/graphics/feature-graphic.png -resize 1024x500! store-listing/graphics/feature-graphic-1024x500.png
```

---

## 3. Visual Assets — Screenshots

| # | File | Path | Dimensions | Size | Screen Shown |
|---|------|------|-----------|------|-------------|
| 1 | `01-dashboard.png` | `store-listing/screenshots/` | 768 × 1376 px | 968 KB | Main dashboard with job leads |
| 2 | `02-job-details.png` | `store-listing/screenshots/` | 768 × 1376 px | 932 KB | Detailed job information view |
| 3 | `03-earnings.png` | `store-listing/screenshots/` | 768 × 1376 px | 841 KB | Earnings tracker & history |
| 4 | `04-profile.png` | `store-listing/screenshots/` | 768 × 1376 px | 826 KB | Locksmith partner profile |
| 5 | `05-job-management.png` | `store-listing/screenshots/` | 768 × 1376 px | 906 KB | Job workflow management |
| 6 | `06-notifications-map.png` | `store-listing/screenshots/` | 768 × 1376 px | 1.2 MB | Notifications & map view |

**Screenshot Compliance:**
- Minimum required: 2 ✅ (6 provided)
- Maximum allowed: 8 ✅
- Min dimension per side: 320 px ✅
- Max dimension per side: 3,840 px ✅
- Max aspect ratio: 2:1 ✅ (current: ~1:1.79)
- Max file size each: 8 MB ✅

---

## 4. Text Content

| File | Path | Characters | Limit | Purpose | Status |
|------|------|-----------|-------|---------|--------|
| App Title | `store-listing/text/APP_TITLE.txt` | 27 | 30 | Play Store app name | ✅ Ready |
| Short Description | `store-listing/text/SHORT_DESCRIPTION.txt` | 66 | 80 | Search result preview | ✅ Ready |
| Full Description | `store-listing/text/FULL_DESCRIPTION.txt` | 3,402 | 4,000 | Full store listing | ✅ Ready |
| Promotional Text | `store-listing/text/PROMOTIONAL_TEXT.txt` | 159 | 170 | Promotional banner text | ✅ Ready |
| Store Metadata | `store-listing/text/STORE_METADATA.json` | — | — | Category, tags, config data | ✅ Ready |

---

## 5. Policy & Legal Documents

| File | Path | Size | Format | Purpose |
|------|------|------|--------|---------|
| Privacy Policy (MD) | `policies/PRIVACY_POLICY.md` | 8.8 KB | Markdown | Source document |
| Privacy Policy (PDF) | `policies/PRIVACY_POLICY.pdf` | 31 KB | PDF | Printable version |

**Required Action:** Host the privacy policy at a publicly accessible URL (e.g., `https://www.locksafe.uk/privacy`) and enter the URL in Play Console.

---

## 6. Reference Documents

| File | Path | Size | Format | Purpose |
|------|------|------|--------|---------|
| Listing Materials Guide | `GOOGLE_PLAY_LISTING_MATERIALS.md` | 5.3 KB | Markdown | Consolidated listing copy |
| Listing Materials (PDF) | `GOOGLE_PLAY_LISTING_MATERIALS.pdf` | 78 KB | PDF | Printable listing reference |
| Visual Assets Summary | `VISUAL_ASSETS_SUMMARY.md` | 11 KB | Markdown | Asset specs and details |
| Visual Assets (PDF) | `VISUAL_ASSETS_SUMMARY.pdf` | 66 KB | PDF | Printable asset reference |
| Research Summary | `RESEARCH_SUMMARY.md` | 4.1 KB | Markdown | Market research findings |
| Research Summary (PDF) | `RESEARCH_SUMMARY.pdf` | 22 KB | PDF | Printable research report |

---

## 7. Submission Guides

| File | Path | Purpose |
|------|------|---------|
| Submission Checklist | `submission-guides/SUBMISSION_CHECKLIST.md` | Pre-upload verification checklist |
| Upload Guide | `submission-guides/GOOGLE_PLAY_UPLOAD_GUIDE.md` | Step-by-step upload instructions |
| Materials Index | `submission-guides/MATERIALS_INDEX.md` | This file — full inventory |
| Quick Reference | `submission-guides/QUICK_REFERENCE.txt` | One-page key information summary |
| Package Summary | `submission-guides/GOOGLE_PLAY_PACKAGE_COMPLETE.md` | Final comprehensive summary |

---

## Summary Statistics

| Category | Count | Total Size |
|----------|-------|-----------|
| App Bundle (AAB) | 1 | 51.7 MB |
| Graphics (icon + feature + promo) | 3 | 2.0 MB |
| Screenshots | 6 | 5.5 MB |
| Text files | 5 | 4.8 KB |
| Policy documents | 2 | 39.8 KB |
| Reference documents | 6 | 181 KB |
| Submission guides | 5 | — |
| **Total files** | **28** | **~59.5 MB** |

---

*Last updated: 18 April 2026*
*Document: MATERIALS_INDEX.md*
