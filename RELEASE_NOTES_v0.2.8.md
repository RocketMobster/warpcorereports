# Release v0.2.8 — Crew Manifest UX, Constraints, Mobile Stability

## Highlights
- Crew Manifest: filters, search, Shuffle, drag-to-reorder (pointer/touch/keyboard), inline role edit via datalist, per‑member Lock, Reset, and persistence.
- Coverage + Constraints: department coverage tooling and role–rank constraints enforced in generation and UI with safe auto‑corrections and a brief banner.
- Size Controls: Change Size with a clamp warning when below locked count; order preserved where possible.
- Diagnostics: global error toast with Copy/Report (mailto), throttling, and visible cooldown timer.
- Help & Docs: new "Crew Size Controls" and "Crew Panel" sections; standardized info icon linking directly to those sections. README badges and Live Demo link.
- Mobile Polish: improved spacing/density, two‑line names with tooltips, solid edit inputs, refined touch drag‑and‑drop stability.

## Upgrade Notes
- Existing persisted crew are auto‑normalized on load to satisfy role–rank rules; a brief banner is shown if any rank is adjusted.
- Locked members are preserved across regenerate and resize operations; target size may clamp up to locked count.

## Internal
- Single GitHub Pages workflow on Node 20. Version bumped to 0.2.8.

## Links
- Live Demo: https://rocketmobster.github.io/warpcorereports/
- Compare: https://github.com/RocketMobster/warpcorereports/compare/v0.2.7...v0.2.8