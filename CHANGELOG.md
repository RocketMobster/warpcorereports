# Changelog

All notable changes to this project will be documented in this file.

## [0.2.7] - 2025-09-20

### Changed
- Header Settings gear restored and moved from mobile bar to the header for more space on mobile.
- Mobile floating action bar reordered and refined: Produce (amber), Reroll (purple), Edit (rose), Export (blue), Help.
- Mobile controls reorganization: moved Randomize All, Reset, Copy Settings Link, and Preview Crew into the Generation Options accordion (compact single-row where possible).
- Per-accordion LCARS theming: distinct rail/title colors for each section (e.g., amber/purple/cyan/pink/blue).
- Stardate Calculator visuals simplified: removed outer card/rail; standardized blue info button and accent panel.
- Help now uses a centered modal with scrollable body (replaces mobile bottom drawer to avoid clipping).
- Crew preview panel and drawer themed to match Preview Crew button (pink) with light panel background and pink accents.

### Added
- Close “×” control on the inline Crew preview panel; wired `onClose` so it appears in both inline and drawer contexts.

### Fixed
- Removed duplicate/non-functional Reset badge and fixed the working Reset; consolidated actions to eliminate confusion.
- Footer now has extra bottom padding to avoid overlap with the floating action bar.
- Improved device gating to ensure mobile accordions show only on touch/coarse pointers at narrow widths (with Force Mobile override).

### Notes
- Desktop remains the original 3-column LCARS layout; accordions are mobile-only.
- Settings: Force Mobile, Persist Zoom, and Density live in the Settings drawer accessible from the header gear.

## [0.2.6] - 2025-09-19

### Added
- Mobile Export drawer (renamed from Print/Share) accessible from the bottom action bar.
- Dedicated Stardate accordion in mobile controls with toggle and calculator.
- LCARS accents for mobile accordions (amber rail, shadows) and right-aligned action row.

### Changed
- Mobile action bar restyled: Produce (orange/black), Reroll (purple/black), Export (blue/white), enlarged Settings gear.
- Force-mobile and Persist Zoom remain in Settings; moved Compact Density to Settings (removed from top header).
- Reorganized mobile action row: Randomize All, Reset, Copy Settings Link, Preview Crew; right-justified for alignment.
- Moved Copy Settings Link and Reset outside of the previous Advanced/Misc and into the main action group.

### Removed
- Top-of-app Sound controls (now only in Settings panel).
- Duplicate stardate controls below the controls area; stardate is only inside the Stardate accordion on mobile.
- Visible Produce/Reroll buttons in the mobile controls; Produce is triggered via the floating menu (hidden button retained for programmatic click).

### Fixed
- Reliable mobile gating and UI layout improvements to prevent accidental desktop view on mobile.
- Spacing below mobile buttons to avoid report header touching the action row.

## [0.2.5] - 2025-09-xx
- Recovery of text-only zoom, inverse chart scaling, anti-clipping, and persistence.
- Reinstated LCARS desktop 3-column controls and desktop button bar.
- Device gating via width + pointer detection with force-mobile override.
- Initial reintroduction of mobile accordions and bottom action bar.

[0.2.6]: https://github.com/RocketMobster/warpcorereports/compare/v0.2.5...v0.2.6# Starfleet Engineering Report Generator - Changelog

## Version 0.2.5 - September 17, 2025

### Zoom & Anti-Clipping Architecture
- Implemented text-only zoom: report body scales; charts and control bar remain visually steady using inverse scale wrappers (`.chart-no-zoom`, `.controls-no-zoom`).
- Added chart base size selector (80%, 90%, 100%) with persistence (`wcr_chart_base_scale`).
- Introduced dynamic right-edge safe zone (`safeZonePx`) with zoom-proportional expansion and conditional bump for large charts at high zoom.
- Added internal `rightSafe` tiered margins (+10 at ≥1.3×, +2 at ≥1.35× plus transitional +4 when crossing threshold) to prevent late glyph clipping.
- Adaptive post-render measurement for figure title/caption adds incremental `adaptivePad` (+4 then +8 only if needed) to eliminate residual single-character truncation at 1.3–1.4×.
- SVG roots now `overflow: visible` to avoid stroke cropping.

### Mobile & UX Enhancements
- New `Collapsible` component groups controls on mobile with persisted open state.
- Added `MobileActionBar` with Produce / Reroll / Share / Help / Stardate / Crew / More actions and haptic feedback.
- Drawer component scaffold for future slide-in panels.
- Improved sound controls (responsive layout, accessible labels, smaller text on mobile).
- Header and section copy buttons now include icons and hide text labels on narrow viewports for space efficiency.

### Utilities & Infrastructure
- Haptics utility (`haptics.ts`) with light/medium/heavy/success/error vibration patterns respecting `prefers-reduced-motion`.
- Media query hook (`useMediaQuery`).
- Lazy KaTeX loader with math presence detection (`lazyKatex.ts`).
- LTTB downsampling utilities (`chartDownsample.ts`) for future high-density chart optimization.
- Sample export scripts & generated sample artifacts (PDF, DOCX, TXT) for distribution demo.

### Fixes
- Resolved final high-zoom (≥1.35×) edge-case clipping of last 1–2 characters in figure titles/captions.
- Prevented control bar button wrapping/clipping at elevated zoom levels.

### Technical Notes
The anti-clipping solution layers: (1) dynamic container safe zone, (2) tiered internal margins, (3) adaptive DOM measurement with minimal incremental padding, (4) inverse-scaling strategy to avoid reflow/measurement instability in SVG charts.

---

## Version 0.2.4 - September 14, 2025

### UI / Docs
- **Help modal**: Added a scrollable help body and a dedicated “References & Canon Names” section with anchors for direct linking.
- **Info button**: New ℹ️ in Controls next to “Allow Canon Names in References” opens Help directly to References.
- **Anchors wired**: Existing ℹ️ buttons (Figure Bias, Templates, Presets, Produce vs Reroll) jump to their sections; added `references` target support.
- **README**: Synced labels and behavior with in-app Help, including one‑per‑entry behavior, defaults, and share keys (`cn`, `ce`, `ff`, `fm`).

### Notes
- No generator behavior changes in this patch; this is a UX/documentation improvement.

## Version 0.2.3 - September 14, 2025

### Fixes
- Signing Engineer reference is now always included in References when "Add Name to References" is enabled. The entry is prepended deterministically and reference IDs are renumbered accordingly.
- Removed bracket prefixes from reference text to avoid double numbering with the ordered list in the UI and DOCX export.
- Cleaned up legacy reference generation code to prevent confusion.

## Version 0.2.2 - September 14, 2025

### UI
- **Footer**: Added LCARS-styled footer showing RocketMobster Software, current app version, and link to the GitHub repository.
- **Auto version display**: Footer version is injected at build time from `package.json` using a Vite define.

### Repository Cleanup
- Removed accidentally committed files:
	- `Starfleet_Engineering_Report_Mega_PRD_FULL.md`
	- `Screenshot 2025-08-21 103644.png`
	- `Starfleet_Engineering_Report_Bundle_bias_and_manifest.zip`
- Updated `.gitignore` to prevent similar artifacts from being committed in the future.

## Version 0.2.1 - September 14, 2025

### Stardate Calculator Enhancements
- **Info panel with formulas**: Added an info icon to the Stardate Calculator that reveals the exact formulas used for conversions (pre‑TNG and TNG-era).
- **KaTeX-rendered equations**: Formulas are rendered via KaTeX for crisp, readable math.
- **Copy formulas**: One-click button to copy readable formulas to the clipboard.
- **Improved spacing**: Increased vertical spacing for formula blocks to avoid tiny vertical scroll arrows.

## Version 0.2.0 - September 5, 2025

### LCARS Sound Effects System
- **Added sound effects engine**: Implemented a comprehensive sound effects system with Web Audio API
- **Created sound controls**: Added UI controls for toggling sounds and adjusting volume
- **Added sound persistence**: Sound preferences are now saved between sessions
- **Added sound generator tool**: Created an interactive tool for generating authentic LCARS sounds
- **Added fallback sounds**: Implemented synthetic sound generation when audio files aren't available
- **Added context-specific sounds**: Different UI actions now have appropriate sound effects

### UI/UX Improvements
- **Added floating controls**: Implemented a floating button bar for chart editing mode
- **Enhanced chart editing**: Added notifications and better user feedback during chart editing
- **Improved visual feedback**: Added better visual cues for interactive elements
- **Added sound indicators**: Visual indicators for sound status in the UI

### Technical Improvements
- **Sound utility module**: Created a centralized sound management system
- **Enhanced React components**: Improved component structure for better maintainability
- **Added audio file handling**: Implemented proper audio file loading with error handling
- **Improved documentation**: Updated README with comprehensive sound system documentation

## Version 0.1.0 - August 24, 2025

### Email Sharing Improvements
- **Fixed email body content**: Added comprehensive email body content with report summary when sharing via email
- **Fixed vessel name consistency**: Ensured consistent vessel name usage across email subject, report title, and file names
- **Added email client warning**: Added warning message about browser security limitations for file attachments
- **Improved email client handling**: Enhanced detection of when email clients fail to open

### UI Enhancements
- **Replaced error indicators**: Changed green "[Chart unavailable]" messages with more visible orange caution triangles
- **Added format switching UI**: Added format selection buttons to the share dialog for easy switching between formats
- **Added visual feedback**: Added notification when a link is copied to clipboard
- **Added format indicators**: Highlighted currently selected format in the share dialog
- **Added completion status**: Added visual indicator when sharing process is complete

### File Format Generation
- **Fixed format switching**: Fixed issue where clicking format buttons didn't generate the correct format until clicking a different button
- **Fixed PDF generation**: Ensured PDF files are correctly generated with proper formatting
- **Fixed DOCX generation**: Ensured DOCX files are correctly generated with proper formatting
- **Fixed TXT generation**: Ensured TXT files are correctly generated with proper formatting

### Share Link Functionality
- **Complete overhaul**: Rebuilt the share link feature to properly regenerate the exact same report when shared
- **Added URL routing**: Implemented hash-based routing for shared report links
- **Added report data encoding**: Enhanced link generation to include critical report data in encoded format
- **Added seed persistence**: Store and reuse the original random seed to ensure shared reports display the same content
- **Added visual indicator**: Added blue banner notification when viewing a shared report
- **Added format handling**: Added support for automatically opening requested format when specified in shared URL

### Bug Fixes
- **Fixed format buttons**: Fixed issue where format selection buttons would not trigger immediate file generation
- **Fixed email subject**: Fixed inconsistent vessel name in email subject lines
- **Fixed race conditions**: Fixed timing issues with React state updates during file generation

### Technical Improvements
- **Improved code structure**: Enhanced component structure for better maintainability
- **Added error handling**: Improved error handling for file generation and sharing processes
- **Improved type safety**: Enhanced TypeScript type definitions for better code safety
- **Reduced state issues**: Fixed React state update race conditions in ShareDialog component

## Future Considerations
- Implement server-side storage for shared reports to avoid URL length limitations
- Add support for downloading shared reports directly from URL without regeneration
- Implement authentication for accessing shared reports
- Add support for embedding reports in other applications
- Expand LCARS sound library with more interaction sounds
- Create customizable sound themes for different starship classes
