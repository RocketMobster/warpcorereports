# Contributing to Starfleet Engineering Report Generator

Thank you for your interest in contributing! This document provides technical guidance for developers working on the project.

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

The production build is automatically deployed to GitHub Pages when you push to `master`.

## Deployment Workflow

The site is automatically built (Vite) and deployed to GitHub Pages on every push to `master` (and can also be run manually via the workflow dispatch). The Vite `base` is set to `/warpcorereports/` in production so all assets resolve correctly under the project subpath. If you encounter a hard refresh 404 on a deep path, return to the root URL — the app is a single-page application served from `index.html`.

After merging new changes to `master`, expect the workflow to:
1. Install dependencies with `npm ci`
2. Build with `npm run build` (production, base path applied)
3. Upload `dist` as a Pages artifact
4. Deploy via `actions/deploy-pages`

Deployment usually completes within 1–2 minutes.

## LCARS Sound Effects Setup

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

## Recovery Playbook

If Git ever surprises you (rebase/reset/stash mishaps), see the PowerShell‑safe recovery steps documented below. This covers reflog-based recovery, turning stashes into branches, rescuing dangling commits, restoring single files, and recommended safer defaults.

### Common Recovery Scenarios

#### Recovering Lost Commits
```powershell
# View reflog to find lost commits
git reflog

# Create a branch from a lost commit
git branch recovery-branch <commit-hash>

# Or cherry-pick specific commits
git cherry-pick <commit-hash>
```

#### Recovering Stashed Work
```powershell
# List all stashes
git stash list

# Apply a specific stash
git stash apply stash@{0}

# Turn a stash into a branch
git stash branch recovery-branch stash@{0}
```

#### Restoring Single Files
```powershell
# Restore a file from a specific commit
git restore --source=<commit-hash> path/to/file

# Restore a file from the previous commit
git restore --source=HEAD~1 path/to/file
```

## Technical Architecture Notes

### Mobile Controls Restoration Incident (2025-09)

In mid‑September 2025 we discovered that the previously implemented mobile experience (collapsible control groups, floating mobile action bar, mobile zoom handling, and several responsive layout safeguards) had been unintentionally wiped out. The desktop feature work continued, but a merge/stash overwrite eliminated a large portion of the mobile‑specific logic and styles. Only fragments (some CSS helpers and structural vestiges) remained.

#### What Happened
- A prior recovery of lost zoom/figure sizing logic relied on re‑applying a stash that did not include the mobile controls refactor.
- A large patch (adding chart sizing experimentation + layout math changes) replaced `ReportPreview` and related components wholesale, overwriting earlier mobile conditional render blocks.
- Because mobile code lived inline (rather than isolated behind a dedicated `MobileControls` module) the overwrite removed functionality silently—no build errors occurred.

#### Impact
- Mobile action bar and drawers disappeared.
- Zoom & anti‑clipping protections regressed on small screens.
- Several touch affordances (larger tap targets and spacing logic) were lost.

#### Recovery Actions (Phase 1 – Complete)
1. Forensically restored text‑only zoom architecture and inverse chart isolation.
2. Re‑implemented adaptive right‑edge safety (safe zone + post‑render overflow measurement).
3. Rebuilt chart sizing as fixed visual width independent of zoom, eliminating content spill.
4. Added explicit Zoom Persistence toggle (desktop & mobile) with deterministic reset when disabled.
5. Added micro‑centering correction for minor rounding drift between zoom levels.

#### Still Pending (Phase 2 – To Be Rebuilt)
- Original mobile control cluster grouping & progressive disclosure.
- Enhanced mobile spacing/density adjustments beyond current compact density class.
- Gesture/haptic feedback layer (early prototype previously removed).
- Mobile help / reference overlay refinements.
- Full responsive audit of chart edit mode overlays.

#### Prevention / Hardening Recommendations
- Isolate mobile UI into dedicated components (`/components/mobile/`) to reduce blast radius of future rewrites.
- Add a lightweight Cypress or Playwright smoke test that asserts presence of mobile action bar at narrow viewport widths.
- Introduce a pre‑merge Git hook / CI check that runs a headless layout probe (e.g. screenshot diff or DOM presence assertions).
- Keep recovered or experimental layout logic in feature branches; avoid large "squash & replace" patches to core containers.
- Document critical architectural contracts (like text‑only zoom & chart isolation) in-code with short headers so accidental removals surface in code review.

If you notice missing mobile functionality: open an issue tagged `mobile-regression` so it can be tracked against Phase 2 restoration.

### Zoom & Chart System Architecture

The zoom system was refactored during recovery to prioritize stability and eliminate cumulative layout drift.

#### Design Goals
- Text scales smoothly (0.8×–1.4×) without charts visually resizing.
- Charts never clip the right edge at any supported zoom.
- Zero reliance on reflowing chart data; chart pixel width is stable.
- Persistence optional; disabling it always loads at 100%.

#### Implementation Layers
1. `report-zoom` container applies `transform: scale(var(--zoom))` and width compensation.
2. Each chart wrapper (`.chart-no-zoom`) applies inverse transform `scale(1 / var(--zoom))` so the net perceived chart size stays fixed.
3. Fixed chart width measured once (capped & narrowed) and applied to chart content; wrapper width no longer multiplies with zoom.
4. Adaptive safe zone + overflow measurement adds right padding only when needed.
5. Micro‑centering effect: a post‑layout measurement can nudge charts ±3px via translate to counter fractional rounding shifts between zoom levels.
6. Zoom persistence toggle (desktop header + mobile "More") controls whether `previewZoom` is saved; unchecking clears the stored value.

#### Why Not Pure CSS Zoom / Layout Reflow
Standard layout reflow approaches caused:
- Inconsistent chart aspect ratios at higher zooms.
- Right‑edge truncation when combined with flex/grid widths.
- Unwanted scaling of UI affordances (edit buttons, copy controls).

#### Tradeoffs & Known Minor Artifacts
- Sub‑pixel rounding can still produce ≤1px asymmetry on some zoom steps; micro‑centering keeps it imperceptible.
- Fixed chart width means extreme narrow mobile viewports may require a future responsive downscale (Phase 2 task).

#### Extension Points
- A future "Dynamic Chart Density" mode could allow optional responsive min() width for ultra‑narrow devices with a controlled lower bound.
- Per‑chart width override (edit mode) could be added without altering core zoom math if bounded before the inverse scale wrapper.

## Roadmap

Upcoming features and improvements planned for future versions:

### Short-term (v0.4.0)
- Add support for more starship classes with class-specific report templates
- Implement tabbed interface for viewing multiple reports simultaneously
- Add export to HTML format with interactive elements
- Enhance chart editing with more visualization options

### Medium-term (v0.5.0-v0.6.0)
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

## How to Contribute

1. **Report Issues**: Open an issue describing the bug or feature request
2. **Submit Pull Requests**: Fork the repo, create a feature branch, and submit a PR
3. **Test Your Changes**: Ensure your changes work across different browsers
4. **Follow Code Style**: Match the existing TypeScript/React patterns in the codebase
5. **Update Documentation**: Update README.md, CHANGELOG.md, or A11Y_NOTES.md as needed

### Accessibility Contributions

If you notice an accessibility gap, open an issue with the label `a11y` describing:
1. What you attempted (e.g., "Tabbing from Humor slider to Export button skips...").
2. Expected vs actual behavior.
3. Browser / OS / assistive tech (if relevant).

For the full accessibility implementation details, see `A11Y_NOTES.md`.

---

"Live long and prosper! 🖖"
