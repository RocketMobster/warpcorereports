# Starfleet Engineering Report Generator

[![Live Demo](https://img.shields.io/badge/Live%20Demo-rocketmobster.github.io%2Fwarpcorereports-blue?logo=github)](https://rocketmobster.github.io/warpcorereports/)
[![Build Status](https://github.com/RocketMobster/warpcorereports/actions/workflows/deploy.yml/badge.svg)](https://github.com/RocketMobster/warpcorereports/actions/workflows/deploy.yml)
[![Latest Release](https://img.shields.io/github/v/release/RocketMobster/warpcorereports)](https://github.com/RocketMobster/warpcorereports/releases)
[![Pages Status](https://img.shields.io/github/deployments/RocketMobster/warpcorereports/github-pages?label=Pages&logo=github)](https://github.com/RocketMobster/warpcorereports/deployments/github-pages)

![v0.2.7 Demo](docs/media/v0.2.7-demo.gif)

A Star Trek-themed engineering report generator with LCARS UI styling, designed to create authentic-looking Starfleet engineering reports with dynamic content, interactive charts, and sharing capabilities.

## Live Demo

**Try it now:** https://rocketmobster.github.io/warpcorereports/

Open the app and click "Produce Report" to generate your first report. Try "Reroll Current Report" to get a fresh variant while keeping the same settings. Explore presets (Diagnostic/Incident/Maintenance/Performance) or pick a Mission Template (Incident/Survey) for focused content.

## Features

- **LCARS-Style Interface**: Authentic Star Trek UI design with iconic colors and layout
- **Dynamic Report Generation**: Create unique engineering reports with randomized but coherent technical content
- **Interactive Charts**: Visualize system statuses with LCARS-style charts and diagrams
- **Crew Manifest Integration**: Include crew references in your reports with drag-and-drop reordering
- **Multiple Export Formats**: Download reports as PDF, DOCX, or TXT
- **Sharing Capabilities**: Share reports via email or shareable links
- **Customization Options**: Control report length, detail level, and humor level
- **Seed-Based Generation**: Use seeds for reproducible reports
- **LCARS Sound Effects**: Authentic Star Trek computer sounds for UI interactions
- **Chart Editing**: Modify charts and visualizations with interactive editing tools
- **Text-Only Zoom**: Scales typography (0.8ז1.4�) while keeping charts visually stable
- **Mission Templates**: Choose Incident or Survey templates to bias content and chart types
- **Presets**: One-click combinations for common report scenarios
- **Accessibility Features**: Full keyboard navigation, screen reader support, high contrast mode, and verbose announcement controls
- **Privacy-First**: All processing happens locally in your browser�no data sent to external servers

## Usage Guide

### Basic Controls

1. **Vessel Selection**: Choose from classic Star Trek vessels
2. **Engineer Name**: Set the signing engineer's name and rank
3. **Problems Count**: Control how many engineering issues to include
4. **Detail Level**: Adjust the technical detail in each problem
5. **Graphs**: Toggle and control the number of data visualizations
6. **Generate Report**: Click "Produce Report" to create your report

### Produce vs Reroll

- **Produce Report**: Applies the controls above (problems, detail, graphs, vessel, signature, humor, figure bias, signature reference, and seed) to create a new report. If you enter or lock a seed, it will be used; otherwise a seed is generated for you.
- **Reroll Current Report**: Generates a new variation of the currently displayed report by creating a fresh seed (and stardate) while preserving the report's existing settings (including Mission Template). Changes you make to the controls are NOT applied until you click Produce Report again.
- **What changes on Reroll**: Randomized content only � problem topics and summaries, chart data, references selection, and other generated flavor text.
- **What stays on Reroll**: The settings used to produce the currently displayed report � counts, detail level, graphs toggle/count, Mission Template, figure bias, vessel, signature info, humor level, and signature-reference choice.
- **Seed lock nuance**: Seed lock affects the Seed control for Produce Report. Reroll always uses a fresh seed regardless of the lock or what's currently typed in the Seed field.

### Advanced Features

#### Reproducible Output
- Use the **Seed** field to get deterministic reports
- Same inputs + same seed = same report every time
- Lock the seed to maintain consistency across regenerations

#### Crew Manifest
- Click "Preview Crew Manifest" to see and edit crew members
- Crew members will be referenced in the report's content
- Regenerate random crew with the "Regenerate" button
- Drag and drop to reorder crew members
- Lock individual crew members to prevent changes during regeneration

#### Chart Editing
- Click "Edit Charts" to enter chart editing mode
- Hover over any chart and click the edit icon to modify it
- Change chart type, data values, titles, and other properties
- Changes are saved automatically when you exit edit mode

#### Zoom & Chart Size
- Use the zoom controls at the top of the report body to scale text from 80%�140%
- Charts maintain their visual footprint using inverse scaling for stability
- Select a chart base size (80%, 90%, 100%) to adjust intrinsic chart width
- Dynamic safe zones prevent text clipping at any zoom level

#### LCARS Sound Effects
- Toggle sounds on/off from the Settings panel (gear icon)
- Adjust volume using the slider in Settings
- Authentic LCARS UI sounds for button clicks, toggles, and notifications
- Sound preferences are saved between sessions

#### Presets vs Mission Templates vs Figure Bias

- **Presets**: One-click combinations that set numbers and toggles (problem count, detail level, graphs on/off and count, humor) and a default figure bias. You can tweak after selecting; the preset badge will show "Modified".
- **Mission Templates**: Content bias without changing your numeric controls. Incident favors systems like Deflector, Shields, EPS, SIF, Transporters and nudges charts to status/impact (bar, gauge, step, etc.). Survey favors Sensors/Subspace/Bussard and nudges charts to trends/distributions (line, scatter, heatmap, pie, radar). Reroll keeps the chosen template.
- **Figure Bias**: A global nudge for chart type selection (Warp/EPS/SIF/Deflector/etc.). If a Mission Template is set, its nudges apply first; figure bias further refines the choice. "Auto" lets the generator choose based on each problem's system context.

#### References & Canon Names
- **Add Name to References**: Guarantees the signing engineer is included in References
- **Allow Canon Names in References**: Optionally include famous Star Trek names (curated for plausible ranks/titles)
- **Filter Canon Names by Era**: Limits canon names to those active during the vessel's timeframe
- **Famous Author Frequency**: How often famous canon names may appear: Off, Rare, Occasional, or Frequent
- **Famous Rotation Memory**: Avoids reusing recently seen famous names (0�20, default 6). Higher values reduce repetition; set to 0 to disable rotation tracking

#### Randomize Controls

For quick exploration and fine-tuned randomness:
- "??" buttons appear beside many controls and will randomize just that field
- "Randomize All" randomizes all controls at once (respects the seed lock if enabled)
- Lock the seed to keep results reproducible even when randomizing other controls

#### Stardate Calculator

- Access the Stardate controls from the mobile "Stardate" accordion or desktop controls
- Convert Calendar Date ? Stardate using common TOS/TNG-era approximations
- Enable "Use Stardate in Report" to apply the calculator's stardate to generated reports
- Click the info icon to view formulas (rendered with KaTeX for clarity)

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

## Browser Compatibility

- Chrome/Edge (Recommended)
- Firefox
- Safari
- Other modern browsers with ES6 support

## Privacy

All processing is done locally in your browser. No server backend is used for report generation, and no data is sent to external servers.

## Accessibility

This project actively invests in accessibility so keyboard and assistive tech users can fully generate, review, and export reports.

### Key Features
- **Keyboard Navigation**: All interactive elements reachable by Tab with consistent high-contrast focus rings
- **Screen Reader Support**: Polite live regions announce UI changes; assertive regions for errors
- **Escape to Close**: All dialogs, drawers, and panels support Escape key
- **Focus Management**: Proper focus trapping and return in modal surfaces
- **High Contrast Mode**: Toggle available in Settings for enhanced visibility
- **Verbose Announcements**: Control the level of detail in screen reader announcements
- **Accessible Charts**: Interactive chart editing with full keyboard support
- **DEV Mode Overlay**: Developer-only structural overlay to visualize announcements (Ctrl+Alt+L)

### Reporting Accessibility Issues

If you notice an accessibility gap, open an issue with the label `a11y` describing:
1. What you attempted (e.g., "Tabbing from Humor slider to Export button skips...")
2. Expected vs actual behavior
3. Browser / OS / assistive tech (if relevant)

For detailed accessibility implementation notes, see [A11Y_NOTES.md](A11Y_NOTES.md).

## Recent Updates

### v0.3.0 (October 2025)
- **Added**: DEV mode structural overlay with keyboard shortcut (Ctrl+Alt+L)
- **Added**: Verbose Announcements toggle to control announcement detail level
- **Added**: Unified Settings drawer accessible from both desktop and mobile
- **Added**: Enhanced role dropdown with 23 canonical Star Trek roles
- **Added**: Complete drag-and-drop announcements including cancel events
- **Fixed**: Desktop Settings gear icon freeze issue
- **Fixed**: Duplicate React key warnings
- **Changed**: Settings drawer now renders outside inert regions for universal access

See [CHANGELOG.md](CHANGELOG.md) for complete version history.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development setup and building instructions
- Technical architecture notes
- Recovery playbook for Git issues
- Roadmap and planned features
- Guidelines for submitting pull requests

## License

This project is open source and available under the MIT License.

---

"Live long and prosper! 🖖"
