# Starfleet Engineering Report Generator

[![Live Demo](https://img.shields.io/badge/Live%20Demo-rocketmobster.github.io%2Fwarpcorereports-blue?logo=github)](https://rocketmobster.github.io/warpcorereports/)
[![Build Status](https://github.com/RocketMobster/warpcorereports/actions/workflows/deploy.yml/badge.svg)](https://github.com/RocketMobster/warpcorereports/actions/workflows/deploy.yml)
[![Latest Release](https://img.shields.io/github/v/release/RocketMobster/warpcorereports)](https://github.com/RocketMobster/warpcorereports/releases)

![v0.2.7 Demo](docs/media/v0.2.7-demo.gif)

A Star Trek-themed engineering report generator with LCARS UI styling, designed to create authentic-looking Starfleet engineering reports with dynamic content, interactive charts, and sharing capabilities.

## Live Demo

**Deployed at:** https://rocketmobster.github.io/warpcorereports/

The site is automatically built and deployed on every push to `master`.

This site is automatically built (Vite) and deployed to GitHub Pages on every push to `master` (and can also be run manually via the workflow dispatch). The Vite `base` is set to `/warpcorereports/` in production so all assets resolve correctly under the project subpath. If you encounter a hard refresh 404 on a deep path, return to the root URL — the app is a single-page application served from `index.html`.

After merging new changes to `master`, expect the workflow to:
1. Install dependencies with `npm ci`
2. Build with `npm run build` (production, base path applied)
3. Upload `dist` as a Pages artifact
4. Deploy via `actions/deploy-pages`

Deployment usually completes within 1–2 minutes.

## Getting Started (1 minute)
- Open the Live Demo and click "Produce Report" to generate your first report.
- Try "Reroll Current Report" to get a fresh variant while keeping the same settings.
- Explore presets (Diagnostic/Incident/Maintenance/Performance) or pick a Mission Template (Incident/Survey) for focused content.
- Add your name/rank and optionally check "Add Name to References" to include the signer in References.
- Use the ℹ️ buttons in the UI for quick help on Templates, Figure Bias, Presets, Produce vs Reroll, and References.

## Recently Added (0.2.7)

- Settings gear moved to the header (removed from the mobile bar) to make room for primary actions.
- Mobile floating action bar order and styling updated: Produce (amber), Reroll (purple), Edit (rose), Export (blue), Help.
- Consolidated action buttons inside Generation Options: Randomize All, Reset, Copy Settings Link, Preview Crew (compact single-row).
- Per-accordion LCARS colors: distinct rail/title accents for each section for scanability.
- Stardate Calculator visuals simplified; standardized blue info button and info panel.
- Help opens as a centered modal with scrolling to avoid bottom clipping on mobile.
- Crew preview panel and drawer themed pink to match the Preview Crew button; added a pink “×” close control.

## Recently Added (0.2.6)

- Mobile Export drawer (renamed from Print/Share) in the floating action bar.
- Mobile “Stardate” accordion with toggle and calculator.
- Mobile action bar styling tweaks (Produce orange/black, Reroll purple/black, Export blue/white) and larger Settings gear.
- Compact Density moved to Settings; top-of-app Sound controls removed (sounds live in Settings).
- Right-justified mobile action row (Randomize All, Reset, Copy Settings, Preview Crew) with LCARS accents.

## Recently Added (0.2.5)

- Text-only zoom: Report text scales smoothly (0.8×–1.4×) while charts and the zoom/control bar remain visually steady via inverse scaling wrappers.
- Chart base size selector (80/90/100%) with persistence across sessions.
- Multi-layer anti-clipping system: dynamic safe zone padding, tiered internal `rightSafe` margins, transitional margin boost, adaptive post-render measurement, and SVG `overflow: visible` to eliminate right-edge truncation at high zoom.
- Mobile collapsible control groups & mobile action bar with haptic feedback.
- Copy buttons now include icons and responsive labels.

See CHANGELOG 0.2.6 for the latest changes and details.

## Mobile Controls Restoration Incident (2025-09)

In mid‑September 2025 we discovered that the previously implemented mobile experience (collapsible control groups, floating mobile action bar, mobile zoom handling, and several responsive layout safeguards) had been unintentionally wiped out. The desktop feature work continued, but a merge/stash overwrite eliminated a large portion of the mobile‑specific logic and styles. Only fragments (some CSS helpers and structural vestiges) remained.

### What Happened
- A prior recovery of lost zoom/figure sizing logic relied on re‑applying a stash that did not include the mobile controls refactor.
- A large patch (adding chart sizing experimentation + layout math changes) replaced `ReportPreview` and related components wholesale, overwriting earlier mobile conditional render blocks.
- Because mobile code lived inline (rather than isolated behind a dedicated `MobileControls` module) the overwrite removed functionality silently—no build errors occurred.

### Impact
- Mobile action bar and drawers disappeared.
- Zoom & anti‑clipping protections regressed on small screens.
- Several touch affordances (larger tap targets and spacing logic) were lost.

### Recovery Actions (Phase 1 – Complete)
1. Forensically restored text‑only zoom architecture and inverse chart isolation.
2. Re‑implemented adaptive right‑edge safety (safe zone + post‑render overflow measurement).
3. Rebuilt chart sizing as fixed visual width independent of zoom, eliminating content spill.
4. Added explicit Zoom Persistence toggle (desktop & mobile) with deterministic reset when disabled.
5. Added micro‑centering correction for minor rounding drift between zoom levels.

### Still Pending (Phase 2 – To Be Rebuilt)
- Original mobile control cluster grouping & progressive disclosure.
- Enhanced mobile spacing/density adjustments beyond current compact density class.
- Gesture/haptic feedback layer (early prototype previously removed).
- Mobile help / reference overlay refinements.
- Full responsive audit of chart edit mode overlays.

### Prevention / Hardening Recommendations
- Isolate mobile UI into dedicated components (`/components/mobile/`) to reduce blast radius of future rewrites.
- Add a lightweight Cypress or Playwright smoke test that asserts presence of mobile action bar at narrow viewport widths.
- Introduce a pre‑merge Git hook / CI check that runs a headless layout probe (e.g. screenshot diff or DOM presence assertions).
- Keep recovered or experimental layout logic in feature branches; avoid large “squash & replace” patches to core containers.
- Document critical architectural contracts (like text‑only zoom & chart isolation) in-code with short headers so accidental removals surface in code review.

If you notice missing mobile functionality: open an issue tagged `mobile-regression` so it can be tracked against Phase 2 restoration.

## Updated Zoom & Chart System (Post‑Recovery)

The zoom system was refactored during recovery to prioritize stability and eliminate cumulative layout drift.

### Design Goals
- Text scales smoothly (0.8×–1.4×) without charts visually resizing.
- Charts never clip the right edge at any supported zoom.
- Zero reliance on reflowing chart data; chart pixel width is stable.
- Persistence optional; disabling it always loads at 100%.

### Implementation Layers
1. `report-zoom` container applies `transform: scale(var(--zoom))` and width compensation.
2. Each chart wrapper (`.chart-no-zoom`) applies inverse transform `scale(1 / var(--zoom))` so the net perceived chart size stays fixed.
3. Fixed chart width measured once (capped & narrowed) and applied to chart content; wrapper width no longer multiplies with zoom.
4. Adaptive safe zone + overflow measurement adds right padding only when needed.
5. Micro‑centering effect: a post‑layout measurement can nudge charts ±3px via translate to counter fractional rounding shifts between zoom levels.
6. Zoom persistence toggle (desktop header + mobile “More”) controls whether `previewZoom` is saved; unchecking clears the stored value.

### Why Not Pure CSS Zoom / Layout Reflow
Standard layout reflow approaches caused:
- Inconsistent chart aspect ratios at higher zooms.
- Right‑edge truncation when combined with flex/grid widths.
- Unwanted scaling of UI affordances (edit buttons, copy controls).

### Tradeoffs & Known Minor Artifacts
- Sub‑pixel rounding can still produce ≤1px asymmetry on some zoom steps; micro‑centering keeps it imperceptible.
- Fixed chart width means extreme narrow mobile viewports may require a future responsive downscale (Phase 2 task).

### Extension Points
- A future “Dynamic Chart Density” mode could allow optional responsive min() width for ultra‑narrow devices with a controlled lower bound.
- Per‑chart width override (edit mode) could be added without altering core zoom math if bounded before the inverse scale wrapper.

---

## Features

- **LCARS-Style Interface**: Authentic Star Trek UI design with iconic colors and layout
- **Dynamic Report Generation**: Create unique engineering reports with randomized but coherent technical content
- **Interactive Charts**: Visualize system statuses with LCARS-style charts and diagrams
- **Crew Manifest Integration**: Include crew references in your reports
- **Multiple Export Formats**: Download reports as PDF, DOCX, or TXT
- **Sharing Capabilities**: Share reports via email or shareable links
- **Customization Options**: Control report length, detail level, and humor level
- **Seed-Based Generation**: Use seeds for reproducible reports
- **LCARS Sound Effects**: Authentic Star Trek computer sounds for UI interactions
- **Chart Editing**: Modify charts and visualizations with interactive editing tools
- **Text-Only Zoom Architecture**: Scales typography while keeping charts a fixed visual size for stability
- **Adaptive Anti-Clipping**: Eliminates edge truncation at high zoom via layered safety margins and measurement
- **Footer**: LCARS-styled footer shows developer info, current app version, and a link to the GitHub repo. Version updates automatically on build.

## Quick Start
```bash
npm install
npm run dev
```
Open the URL shown in your terminal (usually http://localhost:5173).

## Building for Production
```bash
npm run build
npm run preview
```

## Usage Guide

### Zoom & Chart Size (since 0.2.5)

- Use the zoom controls at the top of the report body to scale text-only from 80%–140%.
- Charts maintain their visual footprint using an inverse scale wrapper (`.chart-no-zoom`) so axis alignment and legibility remain stable.
- Select a chart base size (80%, 90%, 100%) to generate charts at that intrinsic width; changing this triggers a re-measure pass.
- A dynamic right-side safe zone expands with zoom and adds internal tiered margins so the last character of titles/captions never clips.
- An adaptive post-render pass adds minimal extra padding only if actual or near-overflow is detected.

Technical layers: external safe zone → internal tiered `rightSafe` → transitional boost → adaptive measurement (incremental +4 / +8) → SVG overflow visibility.

### Basic Controls

1. **Vessel Selection**: Choose from classic Star Trek vessels
2. **Engineer Name**: Set the signing engineer's name and rank
3. **Problems Count**: Control how many engineering issues to include
4. **Detail Level**: Adjust the technical detail in each problem
5. **Graphs**: Toggle and control the number of data visualizations
6. **Generate Report**: Click "Produce Report" to create your report

### Produce vs Reroll

- **Produce Report**: Applies the controls above (problems, detail, graphs, vessel, signature, humor, figure bias, signature reference, and seed) to create a new report. If you enter or lock a seed, it will be used; otherwise a seed is generated for you.
- **Reroll Current Report**: Generates a new variation of the currently displayed report by creating a fresh seed (and stardate) while preserving the report’s existing settings (including Mission Template). Changes you make to the controls are NOT applied until you click Produce Report again.
- **What changes on Reroll**: Randomized content only — problem topics and summaries, chart data, references selection, and other generated flavor text.
- **What stays on Reroll**: The settings used to produce the currently displayed report — counts, detail level, graphs toggle/count, Mission Template, figure bias, vessel, signature info, humor level, and signature-reference choice.
- **Seed lock nuance**: Seed lock affects the Seed control for Produce Report. Reroll always uses a fresh seed regardless of the lock or what’s currently typed in the Seed field.

### Advanced Features

#### Reproducible Output
- Use the **Seed** field to get deterministic reports
- Same inputs + same seed = same report every time
- Lock the seed to maintain consistency across regenerations

#### Crew Manifest
- Click "Preview Crew Manifest" to see and edit crew members
- Crew members will be referenced in the report's content
- Regenerate random crew with the "Regenerate" button

#### Chart Editing
- Click "Edit Charts" to enter chart editing mode
- Hover over any chart and click the edit icon to modify it
- Change chart type, data values, titles, and other properties
- Changes are saved automatically when you exit edit mode

#### LCARS Sound Effects
- Toggle sounds on/off from the Settings panel
- Adjust volume using the slider in Settings
- Authentic LCARS UI sounds for button clicks, toggles, and notifications
- Sound preferences are saved between sessions

#### Chart Control
- **Figure Bias**: Choose from Auto, Warp, EPS, SIF, Deflector, Transporter, or Inertial to bias chart types
- Affects what kinds of systems are visualized in your reports

#### References & Canon Names
- **Add Name to References**: Guarantees the signing engineer is included in References.
- **Allow Canon Names in References**: Optionally include famous Star Trek names (curated for plausible ranks/titles).
- **Filter Canon Names by Era**: Limits canon names to those active during the vessel’s timeframe.
- **Famous Author Frequency**: How often famous canon names may appear: Off, Rare, Occasional, or Frequent. Humor and Mission Template can nudge frequency slightly.
- **Famous Rotation Memory**: Avoids reusing recently seen famous names (default 6; 0 disables rotation).
- **One-per-entry**: At most one famous author appears within a single reference entry.
- **Defaults**: Canon names allowed; era filter on; frequency "Occasional"; rotation memory 6.
- **Share keys**: Settings links encode these as `cn`, `ce`, `ff`, and `fm`.

### Presets vs Mission Templates vs Figure Bias

- **Presets**: One-click combinations that set numbers and toggles (problem count, detail level, graphs on/off and count, humor) and a default figure bias. You can tweak after selecting; the preset badge will show “Modified”.
- **Mission Templates**: Content bias without changing your numeric controls. Incident favors systems like Deflector, Shields, EPS, SIF, Transporters and nudges charts to status/impact (bar, gauge, step, etc.). Survey favors Sensors/Subspace/Bussard and nudges charts to trends/distributions (line, scatter, heatmap, pie, radar). Reroll keeps the chosen template. Settings links include the template. Phase 2: also biases header recipients (To/CC/Submitted To), narrative tone in Abstract/Conclusion, figure captions, and reference sources.
- **Figure Bias**: A global nudge for chart type selection (Warp/EPS/SIF/Deflector/etc.). If a Mission Template is set, its nudges apply first; figure bias further refines the choice. “Auto” lets the generator choose based on each problem’s system context.

### Sharing Your Report

#### Download Options
- **PDF**: High-quality formatted document with charts
- **DOCX**: Editable Word document format
- **TXT**: Plain text version for maximum compatibility

#### Share via Email
1. Click "Share Report" button
2. Select "Email" as the sharing method
3. Enter recipient's email address
4. Optionally select a file format to include
5. Click "Share Report" to open your email client

#### Share via Link
1. Click "Share Report" button
2. Select "Link" as the sharing method
3. Optionally select a file format
4. Click "Share Report" to generate and copy a link
5. Send the link to anyone you want to share with

## LCARS Sound Effects

The application includes authentic LCARS sound effects for a more immersive experience. To set up the sound files:

1. Start your development server:
```bash
npm run dev
```

2. Navigate to the sound generator tool in your browser:
```
http://localhost:5173/sound-generator.html
```

3. Use the interactive interface to preview the sounds and generate all sound files at once.

4. Download the generated MP3 files to your computer.

5. Move all the downloaded sound files to the `/public/sounds/` directory in your project.

6. Refresh your application - you should now hear authentic LCARS sounds when interacting with the UI!

You can customize the sound experience using the sound control panel in the application header.

## Repository Hygiene

The repository ignores accidental large artifacts and documents (e.g., screenshots, ZIP bundles, and large draft docs). If you need to share such assets, please attach them to releases rather than committing them to the repo.

## Randomize Controls

For quick exploration and fine-tuned randomness:

- "🎲" buttons appear beside many controls and will randomize just that field:
	- Problems, Problem Detail Level, Graphs On/Off, Graph Count, Starship, Signature (Engineer Name), Rank, Seed, and Humor Level
- "Randomize All" randomizes all controls at once (respects the seed lock if enabled)
- Tooltips on each "ðŸŽ²" button explain exactly what will be randomized

Tip: Lock the seed to keep results reproducible even when randomizing other controls.

## Stardate Calculator

- Access the Stardate controls from the mobile “Stardate” accordion.
- Convert Calendar Date ↔ Stardate using common TOS/TNG-era approximations.
- Enable "Use Stardate in Report" to apply the calculator’s stardate to generated reports.
- When enabled, the current override value is shown inline next to the toggle.
- Click the info icon to view formulas where available. Formulas are rendered with KaTeX for clarity, and you can copy them when supported.

## Browser Compatibility

- Chrome/Edge (Recommended)
- Firefox
- Safari
- Other modern browsers with ES6 support

## Privacy

All processing is done locally in your browser. No server backend is used for report generation, and no data is sent to external servers.

## Recent Fixes

- **Report Share Feature**: Fixed the error when generating DOCX files during report sharing. The application now properly generates DOCX files with charts, and falls back to a simplified version if chart rendering fails.
- **Report Regeneration**: Fixed an issue where regenerating reports or changing seeds didn't update the report content.
- **Footer**: Added LCARS-styled footer with developer info and auto-updating version.
- **Repo Cleanup**: Removed accidentally committed files (large PRD draft, screenshot, and ZIP bundle) and updated .gitignore to prevent future occurrences.

## Roadmap

Upcoming features and improvements planned for future versions:

### Short-term (v0.3.0)
- Add support for more starship classes with class-specific report templates
- Implement tabbed interface for viewing multiple reports simultaneously
- Add export to HTML format with interactive elements
- Enhance chart editing with more visualization options

### Medium-term (v0.4.0-v0.5.0)
- Create save/load functionality for reports
- Add custom section support for user-defined content
- Implement report templates system
- Add animation effects for LCARS interface elements

### Long-term (v1.0.0+)
- Server-side storage for shared reports to avoid URL length limitations
- Authentication system for accessing shared reports
- Support for embedding reports in other applications
- Mobile-responsive design for tablet and phone use
- Customizable sound themes for different starship classes

---

"Live long and prosper! 🖖"

