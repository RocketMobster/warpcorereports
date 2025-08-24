# Starfleet Engineering Report Generator

A Star Trek-themed engineering report generator with LCARS UI styling, designed to create authentic-looking Starfleet engineering reports with dynamic content, interactive charts, and sharing capabilities.

## Features

- **LCARS-Style Interface**: Authentic Star Trek UI design with iconic colors and layout
- **Dynamic Report Generation**: Create unique engineering reports with randomized but coherent technical content
- **Interactive Charts**: Visualize system statuses with LCARS-style charts and diagrams
- **Crew Manifest Integration**: Include crew references in your reports
- **Multiple Export Formats**: Download reports as PDF, DOCX, or TXT
- **Sharing Capabilities**: Share reports via email or shareable links
- **Customization Options**: Control report length, detail level, and humor level
- **Seed-Based Generation**: Use seeds for reproducible reports

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

### Basic Controls

1. **Vessel Selection**: Choose from classic Star Trek vessels
2. **Engineer Name**: Set the signing engineer's name and rank
3. **Problems Count**: Control how many engineering issues to include
4. **Detail Level**: Adjust the technical detail in each problem
5. **Graphs**: Toggle and control the number of data visualizations
6. **Generate Report**: Click "Produce Report" to create your report

### Advanced Features

#### Reproducible Output
- Use the **Seed** field to get deterministic reports
- Same inputs + same seed = same report every time
- Lock the seed to maintain consistency across regenerations

#### Crew Manifest
- Click "Preview Crew Manifest" to see and edit crew members
- Crew members will be referenced in the report's content
- Regenerate random crew with the "Regenerate" button

#### Chart Control
- **Figure Bias**: Choose from Auto, Warp, EPS, SIF, Deflector, Transporter, or Inertial to bias chart types
- Affects what kinds of systems are visualized in your reports

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

---

"Live long and prosper! 🖖"
