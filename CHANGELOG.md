# Starfleet Engineering Report Generator - Changelog

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
