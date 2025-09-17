# Release Notes (Automation Friendly)

## v0.2.5 (2025-09-17)

Highlights:
- Text-only zoom (0.8×–1.4×) with inverse scaling for charts & control bar.
- Chart base size selector (80/90/100) with persistence.
- Layered anti-clipping: dynamic safe zone, tiered internal right margins, transitional boost, adaptive post-render padding (+4→+8 only if needed), SVG overflow visible.
- Mobile UX: Collapsible control groups, Mobile Action Bar with haptics, Drawer scaffold.
- Utilities: haptics API, media query hook, lazy KaTeX loader, LTTB downsampling helpers.
- Regenerated sample artifacts (PDF / DOCX / TXT).

Fixes:
- Eliminated residual high-zoom title/caption clipping (≥1.35×).
- Prevented control bar wrapping at high zoom.

Technical:
- Anti-clipping pipeline: safeZonePx → rightSafe tiers → transitional boost → adaptive measurement → SVG overflow.

Compare: https://github.com/RocketMobster/warpcorereports/compare/v0.2.4...v0.2.5
Tag: v0.2.5

---
(Generated for CI/CD release automation consumption.)
