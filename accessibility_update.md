## Accessibility Summary (Public Overview)

This project actively invests in accessibility to ensure keyboard and assistive tech users can fully generate, review, and export reports. Below is a concise, user-facing snapshot of our current implementation status.

### Current Features
- **Enhanced Keyboard Navigation**: All interactive elements reachable via Tab with high-contrast focus indicators
- **Dialog Management**: Proper focus trapping, escape to close, focus restoration across modals and panels
- **Live Announcements**: Dual regions (assertive + polite) for status updates and structural changes
- **Interactive Controls**: Accessible sliders with contextual descriptions, labeled randomize buttons, and state announcements
- **Focus Management**: Consistent placement and return behavior for all interactive surfaces
- **Drag and Drop**: Accessible crew reordering with live announcements
- **High Contrast Support**: Toggle for enhanced visibility mode

### Implementation Status

Recently Completed:
- Live crew rank adjustment announcements
- Enhanced focus ring visibility
- Consistent CSS design tokens
- Improved contrast ratios
- Keyboard navigation feedback
- Unified status messaging
- Enhanced drag and drop accessibility

Temporarily Reverted:
- Background content inerting during modal display
- Aggressive pointer-events handling
- Complex z-index layer management

Future Plans:
- Skip to main content navigation
- Further color contrast refinements
- Reduced motion preference handling
- Message de-duplication improvements
- Enhanced seed lock toggle descriptions
- Status region consolidation evaluation

See `A11Y_NOTES.md` for complete technical details and implementation roadmap.